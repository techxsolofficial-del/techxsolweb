/**
 * Tech X Sol - API Client
 * Automatically connects to Express backend or falls back gracefully
 */

const API = (() => {
  // Determine API Base URL (Relative /api for Vercel production & local port 5000)
  const isFileProtocol = window.location.protocol === 'file:';
  const BASE_URL = isFileProtocol ? 'http://localhost:5000/api' : '/api';
  const UPLOADS_BASE = '';

  // Token management
  const TOKEN_KEY = 'txs_auth_token';
  const USER_KEY = 'txs_auth_user';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function getCurrentUser() {
    const raw = localStorage.getItem(USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function getHeaders(isFormData = false) {
    const headers = {};
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  // Request wrapper
  async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    try {
      const res = await fetch(url, options);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}: Request failed`);
      }
      return data;
    } catch (err) {
      console.warn(`[API] Error on ${endpoint}:`, err.message);
      throw err;
    }
  }

  // Local Storage DB Fallback helpers
  const LOCAL_BLOGS_KEY = 'txs_local_blogs';
  function getLocalBlogs() {
    try {
      const raw = localStorage.getItem(LOCAL_BLOGS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  function saveLocalBlogs(list) {
    try {
      localStorage.setItem(LOCAL_BLOGS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }

  return {
    BASE_URL,
    UPLOADS_BASE,
    getToken,
    getCurrentUser,
    setSession,
    clearSession,

    // Auth with local fallback
    async login(username, password) {
      try {
        const res = await request('/auth/login', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ username, password })
        });
        if (res.token && res.user) {
          setSession(res.token, res.user);
        }
        return res;
      } catch (err) {
        // Local fallback: authenticate admin or author
        if ((username === 'admin' && password === 'admin123') || (username === 'author' && password === 'author123')) {
          const user = {
            id: username === 'admin' ? 'usr-1' : 'usr-2',
            username: username,
            name: username === 'admin' ? 'Super Admin' : 'Tech Author',
            role: username === 'admin' ? 'admin' : 'author'
          };
          const token = 'txs_token_' + Date.now();
          setSession(token, user);
          return { success: true, token, user };
        }
        throw new Error('Invalid credentials. (Hint: admin / admin123 or author / author123)');
      }
    },

    async getMe() {
      try {
        return await request('/auth/me', { method: 'GET', headers: getHeaders() });
      } catch {
        const u = getCurrentUser();
        if (u) return { success: true, user: u };
        throw new Error('Not authenticated');
      }
    },

    // Users (Admin Only)
    async getUsers() {
      try {
        return await request('/users', { method: 'GET', headers: getHeaders() });
      } catch {
        return {
          users: [
            { id: 'usr-1', username: 'admin', name: 'Super Admin', role: 'admin', active: true, createdAt: new Date().toISOString() },
            { id: 'usr-2', username: 'author', name: 'Tech Author', role: 'author', active: true, createdAt: new Date().toISOString() }
          ]
        };
      }
    },

    async createUser(userData) {
      try {
        return await request('/users', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(userData)
        });
      } catch {
        return { success: true, user: { ...userData, id: 'usr-' + Date.now() } };
      }
    },

    async deleteUser(userId) {
      try {
        return await request(`/users/${userId}`, { method: 'DELETE', headers: getHeaders() });
      } catch {
        return { success: true };
      }
    },

    // Blogs with Local Storage Persistence
    async getBlogs(params = {}) {
      try {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/blogs?${query}` : '/blogs';
        return await request(endpoint, { method: 'GET', headers: getHeaders() });
      } catch {
        let list = getLocalBlogs();
        if (params.featured === 'true') {
          list = list.filter(b => b.featured && b.published);
        } else if (!params.all) {
          list = list.filter(b => b.published !== false);
        }
        if (params.limit) {
          list = list.slice(0, parseInt(params.limit, 10));
        }
        return { success: true, blogs: list };
      }
    },

    async getBlog(idOrSlug) {
      try {
        return await request(`/blogs/${idOrSlug}`, { method: 'GET', headers: getHeaders() });
      } catch {
        const list = getLocalBlogs();
        const found = list.find(b => b.id === idOrSlug || b.slug === idOrSlug);
        if (found) return { success: true, blog: found };
        throw new Error('Blog not found');
      }
    },

    async createBlog(blogData) {
      try {
        const res = await request('/blogs', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(blogData)
        });
        // Also sync local
        const list = getLocalBlogs();
        if (res.blog) list.unshift(res.blog);
        saveLocalBlogs(list);
        return res;
      } catch {
        const list = getLocalBlogs();
        const newBlog = {
          id: 'blog-' + Date.now(),
          ...blogData,
          slug: (blogData.title || 'post').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          published: blogData.published !== undefined ? blogData.published : true,
          createdAt: new Date().toISOString()
        };
        list.unshift(newBlog);
        saveLocalBlogs(list);
        return { success: true, blog: newBlog };
      }
    },

    async updateBlog(id, blogData) {
      try {
        const res = await request(`/blogs/${id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(blogData)
        });
        const list = getLocalBlogs();
        const idx = list.findIndex(b => b.id === id);
        if (idx !== -1 && res.blog) {
          list[idx] = res.blog;
          saveLocalBlogs(list);
        }
        return res;
      } catch {
        const list = getLocalBlogs();
        const idx = list.findIndex(b => b.id === id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...blogData, updatedAt: new Date().toISOString() };
          saveLocalBlogs(list);
          return { success: true, blog: list[idx] };
        }
        throw new Error('Blog not found');
      }
    },

    async toggleBlogStatus(id, statusData) {
      try {
        const res = await request(`/blogs/${id}/status`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify(statusData)
        });
        const list = getLocalBlogs();
        const idx = list.findIndex(b => b.id === id);
        if (idx !== -1 && res.blog) {
          list[idx] = res.blog;
          saveLocalBlogs(list);
        }
        return res;
      } catch {
        const list = getLocalBlogs();
        const idx = list.findIndex(b => b.id === id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...statusData };
          saveLocalBlogs(list);
          return { success: true, blog: list[idx] };
        }
        throw new Error('Blog not found');
      }
    },

    async deleteBlog(id) {
      try {
        await request(`/blogs/${id}`, { method: 'DELETE', headers: getHeaders() });
      } catch {}
      const list = getLocalBlogs().filter(b => b.id !== id);
      saveLocalBlogs(list);
      return { success: true };
    },

    // Image Upload (< 500KB)
    async uploadImage(file) {
      if (file.size > 500 * 1024) {
        throw new Error(`File is ${(file.size / 1024).toFixed(1)} KB. Maximum allowed size is 500 KB!`);
      }
      try {
        const formData = new FormData();
        formData.append('image', file);
        return await request('/upload', {
          method: 'POST',
          headers: getHeaders(true),
          body: formData
        });
      } catch {
        // Fallback: return as data URL
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve({
            success: true,
            url: e.target.result,
            sizeKB: (file.size / 1024).toFixed(1)
          });
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
    },

    // Tools
    async getTools() {
      return {
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
      };
    },

    // Stats
    async getStats() {
      try {
        return await request('/stats', { method: 'GET', headers: getHeaders() });
      } catch {
        const list = getLocalBlogs();
        return {
          stats: {
            totalBlogs: list.length,
            publishedBlogs: list.filter(b => b.published !== false).length,
            featuredBlogs: list.filter(b => b.featured && b.published !== false).length,
            totalUsers: 2
          }
        };
      }
    }
  };
})();

window.API = API;
