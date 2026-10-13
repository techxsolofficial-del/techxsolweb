import React, { useState, useEffect } from 'react';

export default function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem('techxsol_token') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState('articles'); // 'articles', 'editor', 'users'

  // Data State
  const [articles, setArticles] = useState([]);
  const [users, setUsers] = useState([]);
  const [dbStatus, setDbStatus] = useState('Checking...');

  // Article Form State
  const [editingId, setEditingId] = useState(null);
  const [artTitle, setArtTitle] = useState('');
  const [artCategory, setArtCategory] = useState('Engineering');
  const [artExcerpt, setArtExcerpt] = useState('');
  const [artCover, setArtCover] = useState('');
  const [artContent, setArtContent] = useState('');

  // User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('editor');

  // Check health on mount
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setDbStatus(data.database || 'Online'))
      .catch(() => setDbStatus('Offline / Fallback'));
  }, []);

  // Fetch admin data when logged in
  useEffect(() => {
    if (token) {
      loadArticles();
      loadUsers();
    }
  }, [token]);

  const loadArticles = () => {
    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.blogs)) {
          setArticles(data.blogs);
        }
      })
      .catch(() => {});
  };

  const loadUsers = () => {
    fetch('/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.users)) {
          setUsers(data.users);
        }
      })
      .catch(() => {});
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('techxsol_token', data.token);
        setToken(data.token);
      } else {
        setLoginError(data.error || 'Invalid credentials.');
      }
    } catch (err) {
      setLoginError('Server connection error. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('techxsol_token');
    setToken('');
  };

  // Inline Image Inserter Toolbar
  const insertImageAtCursor = () => {
    const url = prompt('Enter Image URL (e.g. https://... or /image.png):');
    if (!url) return;
    const caption = prompt('Enter Image Caption (optional):') || '';
    const imgHtml = `\n<figure class="article-inline-image" style="margin: 24px 0; text-align: center;">\n  <img src="${url}" alt="${caption}" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08);" />\n  ${caption ? `<figcaption style="font-size: 13px; color: #64748B; margin-top: 6px; font-style: italic;">${caption}</figcaption>` : ''}\n</figure>\n`;
    setArtContent(prev => prev + imgHtml);
  };

  const handleSaveArticle = async (e) => {
    e.preventDefault();
    const payload = {
      title: artTitle,
      category: artCategory,
      excerpt: artExcerpt,
      cover_image: artCover,
      content: artContent,
      status: 'published'
    };

    const endpoint = editingId ? `/api/blogs/${editingId}` : '/api/blogs';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert(editingId ? 'Article updated successfully!' : 'Article published successfully!');
        setEditingId(null);
        setArtTitle('');
        setArtExcerpt('');
        setArtCover('');
        setArtContent('');
        loadArticles();
        setActiveTab('articles');
      } else {
        alert(data.error || 'Failed to save article.');
      }
    } catch (err) {
      alert('Network error while saving article.');
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadArticles();
    } catch (e) {}
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: newUsername, password: newPassword, role: newUserRole })
      });
      const data = await res.json();
      if (data.success) {
        alert('User created successfully!');
        setNewUsername('');
        setNewPassword('');
        loadUsers();
      } else {
        alert(data.error || 'Failed to create user');
      }
    } catch (e) {
      alert('Error creating user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadUsers();
    } catch (e) {}
  };

  // If NOT logged in, show Login Form
  if (!token) {
    return (
      <div style={{ paddingTop: '120px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ maxWidth: '420px', width: '100%', background: '#FFFFFF', padding: '36px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-soft)', color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '12px' }}>
              <i className="fa-solid fa-lock"></i>
            </div>
            <h2 style={{ fontSize: '22px' }}>Admin Portal</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Sign in to manage Tech X Sol systems</p>
          </div>

          {loginError && (
            <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Username</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter username"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
              Sign In <i className="fa-solid fa-arrow-right"></i>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div style={{ paddingTop: '100px', minHeight: '80vh', maxWidth: '1100px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px', paddingBottom: '80px' }}>
      
      {/* Admin Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '26px' }}>Management Control Center</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>
            Database: <strong style={{ color: 'var(--accent-cyan)' }}>{dbStatus}</strong>
          </p>
        </div>
        <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 18px', fontSize: '13px', color: '#EF4444' }}>
          <i className="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          className={`tool-filter-btn ${activeTab === 'articles' ? 'active' : ''}`}
          onClick={() => setActiveTab('articles')}
          style={{ padding: '8px 18px', fontSize: '13.5px' }}
        >
          <i className="fa-solid fa-newspaper"></i> Articles ({articles.length})
        </button>
        <button
          className={`tool-filter-btn ${activeTab === 'editor' ? 'active' : ''}`}
          onClick={() => { setEditingId(null); setActiveTab('editor'); }}
          style={{ padding: '8px 18px', fontSize: '13.5px' }}
        >
          <i className="fa-solid fa-pen-to-square"></i> New Article
        </button>
        <button
          className={`tool-filter-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
          style={{ padding: '8px 18px', fontSize: '13.5px' }}
        >
          <i className="fa-solid fa-users"></i> User Accounts
        </button>
      </div>

      {/* Tab 1: Articles List */}
      {activeTab === 'articles' && (
        <div>
          {articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
              <p style={{ color: 'var(--text-muted)' }}>No articles found. Click "New Article" to publish your first post.</p>
              <button onClick={() => setActiveTab('editor')} className="btn-primary" style={{ marginTop: '14px' }}>
                <i className="fa-solid fa-plus"></i> Create First Article
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '14px' }}>
              {articles.map(art => (
                <div key={art.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>{art.title}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{art.category} • {new Date(art.created_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setEditingId(art.id);
                        setArtTitle(art.title);
                        setArtCategory(art.category || 'Engineering');
                        setArtExcerpt(art.excerpt || '');
                        setArtCover(art.cover_image || '');
                        setArtContent(art.content || '');
                        setActiveTab('editor');
                      }}
                      className="btn-secondary"
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                    >
                      <i className="fa-solid fa-pen"></i> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteArticle(art.id)}
                      className="btn-secondary"
                      style={{ padding: '6px 14px', fontSize: '12px', color: '#EF4444' }}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Article Editor */}
      {activeTab === 'editor' && (
        <div style={{ background: '#FFFFFF', padding: '28px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>
            {editingId ? 'Edit Article' : 'Compose New Technical Article'}
          </h3>

          <form onSubmit={handleSaveArticle}>
            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Article Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Scaling Real-Time Systems with Neon PostgreSQL"
                required
                value={artTitle}
                onChange={e => setArtTitle(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label style={{ fontSize: '13px', fontWeight: 600 }}>Category</label>
                <select
                  className="form-control"
                  value={artCategory}
                  onChange={e => setArtCategory(e.target.value)}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Development">Development</option>
                  <option value="Tools">Tools</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '13px', fontWeight: 600 }}>Cover Image URL</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://... or /cover.png"
                  value={artCover}
                  onChange={e => setArtCover(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Short Excerpt</label>
              <input
                type="text"
                className="form-control"
                placeholder="Brief 1-2 sentence preview for search & cards"
                value={artExcerpt}
                onChange={e => setArtExcerpt(e.target.value)}
              />
            </div>

            {/* Toolbar for inserting inline image */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>Article Body (HTML / Markdown)</label>
                <button
                  type="button"
                  onClick={insertImageAtCursor}
                  className="btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  <i className="fa-solid fa-image" style={{ color: 'var(--accent-cyan)', marginRight: '6px' }}></i>
                  + Insert Image After Text
                </button>
              </div>
              <textarea
                className="form-control"
                style={{ minHeight: '260px', fontFamily: 'monospace', fontSize: '13.5px' }}
                placeholder="Write your article body here. You can use standard HTML like <p>, <h3>, <code> or use the Insert Image button above..."
                required
                value={artContent}
                onChange={e => setArtContent(e.target.value)}
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn-primary">
                <i className="fa-solid fa-cloud-arrow-up"></i> {editingId ? 'Update Article' : 'Publish Article'}
              </button>
              <button type="button" onClick={() => setActiveTab('articles')} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Users Management */}
      {activeTab === 'users' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Create User Form */}
          <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Add Administrative User</h3>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label style={{ fontSize: '13px', fontWeight: 600 }}>Username</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="New username"
                  required
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '13px', fontWeight: 600 }}>Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Min 6 characters"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '13px', fontWeight: 600 }}>Role</label>
                <select
                  className="form-control"
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value)}
                >
                  <option value="editor">Editor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <i className="fa-solid fa-user-plus"></i> Create Account
              </button>
            </form>
          </div>

          {/* User List */}
          <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Existing Accounts</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {users.map(u => (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <strong>{u.username}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>({u.role})</span>
                  </div>
                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
