/**
 * Tech X Sol - Neon Serverless PostgreSQL Database Connector
 * Connects to Neon PostgreSQL using standard pg connection pool with SSL
 * Supports automatic table provisioning, file persistence, and fallback storage
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const seedBlogs = require('./seedBlogs');

let pool = null;
let isConnected = false;

// Persistent Local File Fallback Storage (supports both project data/ and serverless /tmp/data)
const dataDir = path.resolve(__dirname, '../../data');
const tmpDataDir = path.join('/tmp', 'data');

function getActiveDataDir() {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    return dataDir;
  } catch {
    try {
      if (!fs.existsSync(tmpDataDir)) {
        fs.mkdirSync(tmpDataDir, { recursive: true });
      }
      return tmpDataDir;
    } catch {
      return dataDir;
    }
  }
}

const blogsFile = path.join(dataDir, 'blogs.json');
const usersFile = path.join(dataDir, 'users.json');
const settingsFile = path.join(dataDir, 'settings.json');
const tmpBlogsFile = path.join(tmpDataDir, 'blogs.json');
const tmpUsersFile = path.join(tmpDataDir, 'users.json');
const tmpSettingsFile = path.join(tmpDataDir, 'settings.json');

function initLocalFiles() {
  try {
    const dir = getActiveDataDir();
    const bf = path.join(dir, 'blogs.json');
    const uf = path.join(dir, 'users.json');
    const sf = path.join(dir, 'settings.json');

    if (!fs.existsSync(bf)) {
      fs.writeFileSync(bf, JSON.stringify(seedBlogs, null, 2), 'utf-8');
    }
    if (!fs.existsSync(uf)) {
      fs.writeFileSync(uf, JSON.stringify([
        { id: 'usr-admin', username: 'admin', password: 'admin123', name: 'Super Admin', role: 'admin', active: true, createdAt: '2026-10-01T00:00:00.000Z' },
        { id: 'usr-wahid', username: 'wahid', password: 'wahid123', name: 'Abdul Wahid', role: 'author', active: true, createdAt: '2026-10-01T00:00:00.000Z' }
      ], null, 2), 'utf-8');
    }
    if (!fs.existsSync(sf)) {
      fs.writeFileSync(sf, JSON.stringify({ showAuthor: true }, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('[Storage] Notice initializing local data files:', err.message);
  }
}

initLocalFiles();

function readLocalJson(filePath, fallbackPath, defaultVal) {
  try {
    if (fallbackPath && fs.existsSync(fallbackPath)) {
      const content = fs.readFileSync(fallbackPath, 'utf-8');
      return JSON.parse(content);
    }
  } catch {}
  try {
    if (filePath && fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch {}
  return defaultVal;
}

const loadedBlogs = readLocalJson(blogsFile, tmpBlogsFile, seedBlogs);
const loadedUsers = readLocalJson(usersFile, tmpUsersFile, [
  { id: 'usr-admin', username: 'admin', password: 'admin123', name: 'Super Admin', role: 'admin', active: true, createdAt: '2026-10-01T00:00:00.000Z' },
  { id: 'usr-wahid', username: 'wahid', password: 'wahid123', name: 'Abdul Wahid', role: 'author', active: true, createdAt: '2026-10-01T00:00:00.000Z' }
]);
const loadedSettings = readLocalJson(settingsFile, tmpSettingsFile, { showAuthor: true });

// Fallback in-memory store backed by persistent files
const memoryStore = {
  users: Array.isArray(loadedUsers) && loadedUsers.length > 0 ? loadedUsers : [
    { id: 'usr-admin', username: 'admin', password: 'admin123', name: 'Super Admin', role: 'admin', active: true, createdAt: '2026-10-01T00:00:00.000Z' },
    { id: 'usr-wahid', username: 'wahid', password: 'wahid123', name: 'Abdul Wahid', role: 'author', active: true, createdAt: '2026-10-01T00:00:00.000Z' }
  ],
  blogs: Array.isArray(loadedBlogs) && loadedBlogs.length > 0 ? loadedBlogs : [...seedBlogs],
  settings: loadedSettings || { showAuthor: true }
};

function saveLocalData() {
  const data = JSON.stringify(memoryStore.blogs, null, 2);
  const users = JSON.stringify(memoryStore.users, null, 2);
  const settings = JSON.stringify(memoryStore.settings, null, 2);

  // Try writing to project data/ directory first
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(blogsFile, data, 'utf-8');
    fs.writeFileSync(usersFile, users, 'utf-8');
    fs.writeFileSync(settingsFile, settings, 'utf-8');
  } catch (err) {
    // Fallback writing to /tmp/data for read-only serverless lambdas
    try {
      if (!fs.existsSync(tmpDataDir)) fs.mkdirSync(tmpDataDir, { recursive: true });
      fs.writeFileSync(tmpBlogsFile, data, 'utf-8');
      fs.writeFileSync(tmpUsersFile, users, 'utf-8');
      fs.writeFileSync(tmpSettingsFile, settings, 'utf-8');
    } catch (tmpErr) {
      console.warn('[Storage] Notice on persistent storage write:', tmpErr.message);
    }
  }
}

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  } catch (err) {
    console.warn('[Neon DB] Pool initialization warning:', err.message);
  }
}

async function initDb() {
  if (!pool || !process.env.DATABASE_URL) {
    console.log('[Database] Running with Persistent Local File Store (Add DATABASE_URL from Neon to .env to also sync PostgreSQL).');
    return;
  }

  try {
    const client = await pool.connect();
    
    // Create Users and Blogs tables if they do not exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        role VARCHAR(50) DEFAULT 'author',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS blogs (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        category VARCHAR(100),
        excerpt TEXT,
        content TEXT NOT NULL,
        cover_image TEXT,
        image_size_kb NUMERIC DEFAULT 0,
        tags JSONB DEFAULT '[]',
        published BOOLEAN DEFAULT true,
        featured BOOLEAN DEFAULT false,
        author VARCHAR(100) DEFAULT 'Tech X Sol',
        author_role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        key VARCHAR(100) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure default team users exist
    await client.query(`
      INSERT INTO users (username, password, name, role)
      VALUES ('admin', 'admin123', 'Super Admin', 'admin')
      ON CONFLICT (username) DO NOTHING;
      INSERT INTO users (username, password, name, role)
      VALUES ('wahid', 'wahid123', 'Abdul Wahid', 'author')
      ON CONFLICT (username) DO NOTHING;
    `);

    // Ensure all seed blogs exist in database
    for (const blog of (memoryStore.blogs || seedBlogs)) {
      await client.query(`
        INSERT INTO blogs (id, title, slug, category, excerpt, content, cover_image, image_size_kb, tags, published, featured, author, author_role, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO NOTHING
      `, [
        blog.id,
        blog.title,
        blog.slug,
        blog.category,
        blog.excerpt,
        blog.content,
        blog.coverImage,
        blog.imageSizeKB || 0,
        JSON.stringify(Array.isArray(blog.tags) ? blog.tags : []),
        blog.published !== undefined ? blog.published : true,
        blog.featured !== undefined ? blog.featured : false,
        blog.author || 'Tech X Sol',
        blog.authorRole || 'admin',
        blog.createdAt || new Date().toISOString()
      ]);
    }

    client.release();
    isConnected = true;
    console.log('[Neon DB] Connected successfully to Neon Serverless PostgreSQL!');
  } catch (err) {
    console.warn('[Neon DB] Connection failed, falling back to local persistent store:', err.message);
    isConnected = false;
  }
}

// Query helper with fallback
async function query(text, params = []) {
  if (pool && isConnected) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.warn('[Neon DB] Query error:', err.message);
      throw err;
    }
  }
  return null;
}

module.exports = {
  pool,
  query,
  initDb,
  memoryStore,
  saveLocalData,
  getIsConnected: () => isConnected
};
