/**
 * Tech X Sol - Authentication Controller
 * Supports Neon PostgreSQL and fallback store
 */

const jwt = require('jsonwebtoken');
const db = require('../db/neon');

const JWT_SECRET = process.env.JWT_SECRET || 'techxsol_secret_jwt_token_2026';

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required' });
  }

  try {
    let user = null;

    if (db.getIsConnected()) {
      const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
      if (result && result.rows.length > 0) {
        const row = result.rows[0];
        if (row.password === password) {
          user = { id: row.id.toString(), username: row.username, name: row.name, role: row.role };
        }
      }
    } else {
      // Memory fallback
      const found = db.memoryStore.users.find(u => u.username === username && u.password === password);
      if (found) {
        user = { id: found.id, username: found.username, name: found.name, role: found.role };
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ success: true, token, user });

  } catch (err) {
    console.error('[Auth Error]:', err);
    return res.status(500).json({ success: false, error: 'Server authentication error' });
  }
};

exports.getMe = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  return res.json({ success: true, user: req.user });
};

exports.getUsers = async (req, res) => {
  try {
    if (db.getIsConnected()) {
      const result = await db.query('SELECT id, username, name, role, created_at as "createdAt" FROM users ORDER BY id ASC');
      return res.json({ success: true, users: result.rows });
    } else {
      return res.json({ success: true, users: db.memoryStore.users });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.createUser = async (req, res) => {
  const { username, password, name, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required' });
  }

  const cleanUser = username.trim();
  const cleanPass = password.trim();

  try {
    if (db.getIsConnected()) {
      const check = await db.query('SELECT id FROM users WHERE LOWER(username) = LOWER($1)', [cleanUser]);
      if (check && check.rows.length > 0) {
        return res.status(400).json({ success: false, error: `Username "${cleanUser}" already exists` });
      }

      const result = await db.query(
        'INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, username, name, role, created_at',
        [cleanUser, cleanPass, name || cleanUser, role || 'author']
      );
      return res.json({ success: true, user: result.rows[0] });
    } else {
      const exists = db.memoryStore.users.some(u => (u.username || '').toLowerCase() === cleanUser.toLowerCase());
      if (exists) {
        return res.status(400).json({ success: false, error: `Username "${cleanUser}" already exists` });
      }

      const newUser = {
        id: String(Date.now()),
        username: cleanUser,
        password: cleanPass,
        name: name || cleanUser,
        role: role || 'author',
        createdAt: new Date().toISOString()
      };
      db.memoryStore.users.push(newUser);
      return res.json({ success: true, user: newUser });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (db.getIsConnected()) {
      const check = await db.query('SELECT username FROM users WHERE id = $1', [id]);
      if (check && check.rows.length > 0 && check.rows[0].username.toLowerCase() === 'admin') {
        return res.status(400).json({ success: false, error: 'Cannot delete primary admin account' });
      }
      await db.query('DELETE FROM users WHERE id = $1', [id]);
    } else {
      const cleanId = String(id).trim().toLowerCase();
      const target = db.memoryStore.users.find(u => String(u.id).toLowerCase() === cleanId || (u.username || '').toLowerCase() === cleanId);
      if (target && (target.username || '').toLowerCase() === 'admin') {
        return res.status(400).json({ success: false, error: 'Cannot delete primary admin account' });
      }
      db.memoryStore.users = db.memoryStore.users.filter(u => String(u.id).toLowerCase() !== cleanId && (u.username || '').toLowerCase() !== cleanId);
    }
    return res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

