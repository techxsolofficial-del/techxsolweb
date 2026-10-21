/**
 * Tech X Sol - Neon Serverless PostgreSQL Database Connector
 * Connects to Neon PostgreSQL using standard pg connection pool with SSL
 * Supports automatic table provisioning and fallback storage
 */

const { Pool } = require('pg');
require('dotenv').config();

const seedBlogs = require('./seedBlogs');

let pool = null;
let isConnected = false;

// Fallback in-memory store pre-populated with 3 premium SEO articles
const memoryStore = {
  users: [
    { id: 'usr-admin', username: 'admin', password: 'admin123', name: 'Super Admin', role: 'admin' },
    { id: 'usr-wahid', username: 'wahid', password: 'wahid123', name: 'Abdul Wahid', role: 'author' }
  ],
  blogs: [...seedBlogs],
  settings: {
    showAuthor: true
  }
};

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
    console.log('[Database] Running in Fallback Mode (Add DATABASE_URL from Neon to .env to persist in PostgreSQL).');
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

    // Ensure default admin user exists
    const adminCheck = await client.query('SELECT * FROM users WHERE username = $1', ['admin']);
    if (adminCheck.rows.length === 0) {
      await client.query(
        'INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4)',
        ['admin', 'admin123', 'Super Admin', 'admin']
      );
    }

    // Seed default featured blogs if table is empty
    const blogCount = await client.query('SELECT count(*) FROM blogs');
    if (parseInt(blogCount.rows[0].count, 10) === 0) {
      for (const blog of seedBlogs) {
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
          blog.imageSizeKB,
          JSON.stringify(blog.tags),
          blog.published,
          blog.featured,
          blog.author,
          blog.authorRole,
          blog.createdAt
        ]);
      }
      console.log('[Neon DB] Seeded 3 premium articles successfully!');
    }

    client.release();
    isConnected = true;
    console.log('[Neon DB] Connected successfully to Neon Serverless PostgreSQL!');
  } catch (err) {
    console.warn('[Neon DB] Connection failed, falling back to local store:', err.message);
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
  getIsConnected: () => isConnected
};

