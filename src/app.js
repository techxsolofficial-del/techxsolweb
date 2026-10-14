/**
 * Tech X Sol - Backend Express Application
 * Serves frontend static files and API endpoints
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();

const db = require('./db/neon');
const authController = require('./controllers/authController');
const blogController = require('./controllers/blogController');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve frontend static files
const publicPath = path.resolve(__dirname, '../public');
const rootPath = path.resolve(__dirname, '..');
const fs = require('fs');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}
app.use(express.static(rootPath));


// Initialize Neon Database schema
db.initDb();

// ===================
// API ROUTES
// ===================

// Health & System status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: db.getIsConnected() ? 'Neon PostgreSQL (Connected)' : 'Local Storage Fallback',
    timestamp: new Date().toISOString()
  });
});

// Authentication
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', authMiddleware, authController.getMe);

// User Management (Admin only)
app.get('/api/users', authMiddleware, authController.getUsers);
app.post('/api/users', authMiddleware, authController.createUser);
app.delete('/api/users/:id', authMiddleware, authController.deleteUser);

// Blog Articles
app.get('/api/blogs', blogController.getBlogs);
app.get('/api/blogs/:idOrSlug', blogController.getBlogByIdOrSlug);
app.post('/api/blogs', authMiddleware, blogController.createBlog);
app.put('/api/blogs/:id', authMiddleware, blogController.updateBlog);
app.patch('/api/blogs/:id/status', authMiddleware, blogController.toggleStatus);
app.delete('/api/blogs/:id', authMiddleware, blogController.deleteBlog);

// Stats Overview
app.get('/api/stats', blogController.getStats);

// Settings (Blog display preferences & Admin settings)
app.get('/api/settings', async (req, res) => {
  try {
    if (db.getIsConnected()) {
      const result = await db.query('SELECT value FROM site_settings WHERE key = $1', ['general']);
      if (result && result.rows.length > 0) {
        return res.json({ success: true, settings: result.rows[0].value });
      }
    }
    return res.json({
      success: true,
      settings: (db.memoryStore && db.memoryStore.settings) ? db.memoryStore.settings : { showAuthor: true }
    });
  } catch (err) {
    return res.json({
      success: true,
      settings: (db.memoryStore && db.memoryStore.settings) ? db.memoryStore.settings : { showAuthor: true }
    });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const payload = req.body || {};
    if (!db.memoryStore.settings) {
      db.memoryStore.settings = { showAuthor: true };
    }
    db.memoryStore.settings = { ...db.memoryStore.settings, ...payload };

    if (db.getIsConnected()) {
      await db.query(`
        INSERT INTO site_settings (key, value, updated_at)
        VALUES ('general', $1, CURRENT_TIMESTAMP)
        ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP
      `, [JSON.stringify(db.memoryStore.settings)]);
    }

    return res.json({ success: true, settings: db.memoryStore.settings });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Interactive Tools Metadata
app.get('/api/tools', (req, res) => {
  res.json({
    success: true,
    tools: [
      {
        slug: 'digit-tool',
        title: 'Smart Digital & Digit Calculator',
        description: 'Count digits, analyze digit frequency, extract numbers, or perform instant digital calculations.',
        icon: 'fa-solid fa-calculator',
        badge: 'Digit & Math'
      },
      {
        slug: 'cgpa-calculator',
        title: 'CGPA & GPA Calculator',
        description: 'Accurately calculate semester GPA and cumulative CGPA across university credit hours.',
        icon: 'fa-solid fa-graduation-cap',
        badge: 'Academic Suite'
      },
      {
        slug: 'percentage-calculator',
        title: 'Percentage & Marks Calculator',
        description: 'Convert exam marks to percentages, find grade divisions, and calculate percentage differences.',
        icon: 'fa-solid fa-percent',
        badge: 'Marks & Ratios'
      }
    ]
  });
});

// Clean HTML Routing for direct URL access & refresh
app.get(['/blogs', '/blog', '/blogs/:slug', '/blog/:slug'], (req, res) => {
  const filePath = fs.existsSync(path.join(publicPath, 'blog.html')) ? path.join(publicPath, 'blog.html') : path.join(rootPath, 'blog.html');
  res.sendFile(filePath);
});

app.get(['/tools', '/tools/:slug'], (req, res) => {
  const filePath = fs.existsSync(path.join(publicPath, 'tools.html')) ? path.join(publicPath, 'tools.html') : path.join(rootPath, 'tools.html');
  res.sendFile(filePath);
});

app.get('/admin', (req, res) => {
  const filePath = fs.existsSync(path.join(publicPath, 'admin.html')) ? path.join(publicPath, 'admin.html') : path.join(rootPath, 'admin.html');
  res.sendFile(filePath);
});

module.exports = app;
