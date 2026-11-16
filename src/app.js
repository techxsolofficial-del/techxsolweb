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
const apiRouter = express.Router();

// Health & System status
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'online',
    database: db.getIsConnected() ? 'Neon PostgreSQL (Connected)' : 'Server Active',
    timestamp: new Date().toISOString()
  });
});

// Authentication
apiRouter.post('/auth/login', authController.login);
apiRouter.get('/auth/me', authMiddleware, authController.getMe);

// User Management (Admin only)
apiRouter.get('/users', authMiddleware, authController.getUsers);
apiRouter.post('/users', authMiddleware, authController.createUser);
apiRouter.delete('/users/:id', authMiddleware, authController.deleteUser);

// Image Upload Endpoint
apiRouter.post('/upload', (req, res) => {
  try {
    const { image } = req.body || {};
    if (!image) {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }

    let base64Data = image;
    let ext = 'webp';
    if (image.startsWith('data:image/')) {
      const parts = image.split(';base64,');
      const mime = parts[0].replace('data:', '');
      ext = mime.split('/')[1] || 'webp';
      if (ext === 'jpeg') ext = 'jpg';
      base64Data = parts[1];
    }

    const uploadsDir = path.resolve(__dirname, '../public/assets/uploads');
    const rootUploadsDir = path.resolve(__dirname, '../assets/uploads');

    try {
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      if (!fs.existsSync(rootUploadsDir)) fs.mkdirSync(rootUploadsDir, { recursive: true });
    } catch {}

    const cleanFilename = `cover-${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`;
    const filePath = path.join(uploadsDir, cleanFilename);
    const rootFilePath = path.join(rootUploadsDir, cleanFilename);

    try {
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, buffer);
      try {
        if (fs.existsSync(rootUploadsDir)) {
          fs.writeFileSync(rootFilePath, buffer);
        }
      } catch {}
      const sizeKB = Math.round(buffer.length / 1024);
      return res.json({
        success: true,
        url: `/assets/uploads/${cleanFilename}`,
        sizeKB
      });
    } catch (writeErr) {
      const sizeKB = Math.round((image.length * 3) / 4 / 1024);
      return res.json({
        success: true,
        url: image,
        sizeKB
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Blog Articles
apiRouter.get('/blogs', blogController.getBlogs);
apiRouter.get('/blogs/:idOrSlug', blogController.getBlogByIdOrSlug);
apiRouter.post('/blogs', authMiddleware, blogController.createBlog);
apiRouter.put('/blogs/:id', authMiddleware, blogController.updateBlog);
apiRouter.patch('/blogs/:id/status', authMiddleware, blogController.toggleStatus);
apiRouter.delete('/blogs/:id', authMiddleware, blogController.deleteBlog);

// Stats Overview
apiRouter.get('/stats', blogController.getStats);

// Settings (Blog display preferences & Admin settings)
apiRouter.get('/settings', async (req, res) => {
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

apiRouter.post('/settings', async (req, res) => {
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
    } else {
      if (typeof db.saveLocalData === 'function') {
        db.saveLocalData();
      }
    }

    return res.json({ success: true, settings: db.memoryStore.settings });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Interactive Tools Metadata
apiRouter.get('/tools', (req, res) => {
  res.json({
    success: true,
    tools: [
      {
        slug: 'html-designer',
        title: 'Visual HTML Page Designer',
        description: 'Design single HTML pages visually with drag-and-drop, real-time styling, animation engine, and instant HTML & ZIP export.',
        icon: 'fa-solid fa-wand-magic-sparkles',
        badge: 'Studio Suite'
      },
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

app.use('/api', apiRouter);
app.use('/', apiRouter);

// Clean HTML Routing for direct URL access & refresh
app.get(['/tools/html-page-designer', '/html-page-designer', '/html-designer', '/html-designer.html', '/designer', '/tools/html-designer'], (req, res) => {
  const filePath = fs.existsSync(path.join(publicPath, 'html-designer.html')) ? path.join(publicPath, 'html-designer.html') : path.join(rootPath, 'html-designer.html');
  res.sendFile(filePath);
});

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
