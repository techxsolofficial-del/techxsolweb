/**
 * Tech X Sol - Blog Articles Controller
 * Connects to Neon PostgreSQL for real persistence or memory store fallback
 */

const db = require('../db/neon');

exports.getBlogs = async (req, res) => {
  const { category, featured, all, limit } = req.query;

  try {
    if (db.getIsConnected()) {
      let queryStr = 'SELECT id, title, slug, category, excerpt, content, cover_image as "coverImage", image_size_kb as "imageSizeKB", tags, published, featured, author, author_role as "authorRole", created_at as "createdAt" FROM blogs WHERE 1=1';
      const params = [];

      if (all !== 'true') {
        queryStr += ' AND published = true';
      }
      if (category && category !== 'All') {
        params.push(category);
        queryStr += ` AND LOWER(category) = LOWER($${params.length})`;
      }
      if (featured === 'true') {
        queryStr += ' AND featured = true';
      }

      queryStr += ' ORDER BY created_at DESC';

      if (limit) {
        params.push(parseInt(limit, 10));
        queryStr += ` LIMIT $${params.length}`;
      }

      const result = await db.query(queryStr, params);
      return res.json({ success: true, blogs: result.rows });
    } else {
      // Memory Store Fallback
      let list = [...db.memoryStore.blogs];
      if (all !== 'true') {
        list = list.filter(b => b.published !== false);
      }
      if (category && category !== 'All') {
        list = list.filter(b => (b.category || '').toLowerCase() === category.toLowerCase());
      }
      if (featured === 'true') {
        list = list.filter(b => b.featured);
      }
      if (limit) {
        list = list.slice(0, parseInt(limit, 10));
      }
      return res.json({ success: true, blogs: list });
    }
  } catch (err) {
    console.error('[Blog Fetch Error]:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getBlogByIdOrSlug = async (req, res) => {
  const { idOrSlug } = req.params;

  try {
    if (db.getIsConnected()) {
      const result = await db.query(
        'SELECT id, title, slug, category, excerpt, content, cover_image as "coverImage", image_size_kb as "imageSizeKB", tags, published, featured, author, author_role as "authorRole", created_at as "createdAt" FROM blogs WHERE id = $1 OR slug = $1',
        [idOrSlug]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Article not found' });
      }
      return res.json({ success: true, blog: result.rows[0] });
    } else {
      const found = db.memoryStore.blogs.find(b => b.id === idOrSlug || b.slug === idOrSlug);
      if (!found) {
        return res.status(404).json({ success: false, error: 'Article not found' });
      }
      return res.json({ success: true, blog: found });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.createBlog = async (req, res) => {
  const { title, category, excerpt, content, coverImage, imageSizeKB, tags, published, featured } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, error: 'Title and content are required' });
  }

  const id = 'blog-' + Date.now();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(Math.random() * 1000);
  const author = req.user ? req.user.name || req.user.username : 'Tech X Sol';
  const authorRole = req.user ? req.user.role : 'admin';

  try {
    if (db.getIsConnected()) {
      const queryStr = `
        INSERT INTO blogs (id, title, slug, category, excerpt, content, cover_image, image_size_kb, tags, published, featured, author, author_role)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id, title, slug, category, excerpt, content, cover_image as "coverImage", image_size_kb as "imageSizeKB", tags, published, featured, author, author_role as "authorRole", created_at as "createdAt"
      `;
      const values = [
        id,
        title,
        slug,
        category || 'Tech',
        excerpt || '',
        content,
        coverImage || null,
        imageSizeKB || 0,
        JSON.stringify(Array.isArray(tags) ? tags : []),
        published !== undefined ? published : true,
        featured !== undefined ? featured : false,
        author,
        authorRole
      ];
      const result = await db.query(queryStr, values);
      return res.status(201).json({ success: true, blog: result.rows[0] });
    } else {
      const newBlog = {
        id,
        title,
        slug,
        category: category || 'Tech',
        excerpt: excerpt || '',
        content,
        coverImage: coverImage || null,
        imageSizeKB: imageSizeKB || 0,
        tags: Array.isArray(tags) ? tags : [],
        published: published !== undefined ? published : true,
        featured: featured !== undefined ? featured : false,
        author,
        authorRole,
        createdAt: new Date().toISOString()
      };
      db.memoryStore.blogs.unshift(newBlog);
      return res.status(201).json({ success: true, blog: newBlog });
    }
  } catch (err) {
    console.error('[Create Blog Error]:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateBlog = async (req, res) => {
  const { id } = req.params;
  const { title, category, excerpt, content, coverImage, imageSizeKB, tags, published, featured } = req.body;

  try {
    if (db.getIsConnected()) {
      const queryStr = `
        UPDATE blogs SET
          title = COALESCE($1, title),
          category = COALESCE($2, category),
          excerpt = COALESCE($3, excerpt),
          content = COALESCE($4, content),
          cover_image = COALESCE($5, cover_image),
          image_size_kb = COALESCE($6, image_size_kb),
          tags = COALESCE($7, tags),
          published = COALESCE($8, published),
          featured = COALESCE($9, featured),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING id, title, slug, category, excerpt, content, cover_image as "coverImage", image_size_kb as "imageSizeKB", tags, published, featured, author, author_role as "authorRole", created_at as "createdAt"
      `;
      const values = [
        title,
        category,
        excerpt,
        content,
        coverImage,
        imageSizeKB,
        tags ? JSON.stringify(tags) : null,
        published,
        featured,
        id
      ];
      const result = await db.query(queryStr, values);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Article not found' });
      }
      return res.json({ success: true, blog: result.rows[0] });
    } else {
      const idx = db.memoryStore.blogs.findIndex(b => b.id === id);
      if (idx === -1) {
        return res.status(404).json({ success: false, error: 'Article not found' });
      }
      db.memoryStore.blogs[idx] = { ...db.memoryStore.blogs[idx], ...req.body, updatedAt: new Date().toISOString() };
      return res.json({ success: true, blog: db.memoryStore.blogs[idx] });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.toggleStatus = async (req, res) => {
  const { id } = req.params;
  const { published, featured } = req.body;

  try {
    if (db.getIsConnected()) {
      const queryStr = `
        UPDATE blogs SET
          published = COALESCE($1, published),
          featured = COALESCE($2, featured),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING id, title, slug, published, featured
      `;
      const result = await db.query(queryStr, [published, featured, id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Article not found' });
      }
      return res.json({ success: true, blog: result.rows[0] });
    } else {
      const idx = db.memoryStore.blogs.findIndex(b => b.id === id);
      if (idx === -1) {
        return res.status(404).json({ success: false, error: 'Article not found' });
      }
      if (published !== undefined) db.memoryStore.blogs[idx].published = published;
      if (featured !== undefined) db.memoryStore.blogs[idx].featured = featured;
      return res.json({ success: true, blog: db.memoryStore.blogs[idx] });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteBlog = async (req, res) => {
  const { id } = req.params;

  try {
    if (db.getIsConnected()) {
      await db.query('DELETE FROM blogs WHERE id = $1', [id]);
    } else {
      db.memoryStore.blogs = db.memoryStore.blogs.filter(b => b.id !== id);
    }
    return res.json({ success: true, message: 'Article deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    if (db.getIsConnected()) {
      const totalRes = await db.query('SELECT COUNT(*) FROM blogs');
      const pubRes = await db.query('SELECT COUNT(*) FROM blogs WHERE published = true');
      const featRes = await db.query('SELECT COUNT(*) FROM blogs WHERE featured = true AND published = true');
      const userRes = await db.query('SELECT COUNT(*) FROM users');

      return res.json({
        success: true,
        stats: {
          totalBlogs: parseInt(totalRes.rows[0].count, 10),
          publishedBlogs: parseInt(pubRes.rows[0].count, 10),
          featuredBlogs: parseInt(featRes.rows[0].count, 10),
          totalUsers: parseInt(userRes.rows[0].count, 10)
        }
      });
    } else {
      return res.json({
        success: true,
        stats: {
          totalBlogs: db.memoryStore.blogs.length,
          publishedBlogs: db.memoryStore.blogs.filter(b => b.published !== false).length,
          featuredBlogs: db.memoryStore.blogs.filter(b => b.featured).length,
          totalUsers: db.memoryStore.users.length
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

