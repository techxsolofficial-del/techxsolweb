import React, { useState, useEffect } from 'react';

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.blogs)) {
          setBlogs(data.blogs);
        }
      })
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredBlogs = category === 'All'
    ? blogs
    : blogs.filter(b => b.category?.toLowerCase() === category.toLowerCase());

  return (
    <div style={{ paddingTop: '100px', minHeight: '80vh', maxWidth: '1100px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px', paddingBottom: '80px' }}>
      <div className="section-title">
        <span className="section-tag">Insights & Research</span>
        <h2>Tech X Sol Engineering Journal</h2>
        <p>Expert articles on software architecture, full-stack systems, performance, and digital innovation.</p>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
        {['All', 'Development', 'Architecture', 'Engineering', 'Tools'].map(cat => (
          <button
            key={cat}
            className={`tool-filter-btn ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: 'var(--accent-cyan)', marginBottom: '12px' }}></i>
          <p>Loading published articles...</p>
        </div>
      ) : filteredBlogs.length > 0 ? (
        <div className="services-grid">
          {filteredBlogs.map(blog => (
            <div key={blog.id} className="service-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedBlog(blog)}>
              {blog.cover_image && (
                <img src={blog.cover_image} alt={blog.title} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '10px', marginBottom: '16px' }} />
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span className="tool-badge">{blog.category || 'Engineering'}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(blog.created_at || Date.now()).toLocaleDateString()}</span>
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>{blog.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{blog.excerpt || (blog.content ? blog.content.slice(0, 120) + '...' : '')}</p>
              <div style={{ marginTop: '16px', color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '14px' }}>
                Read Article <i className="fa-solid fa-arrow-right" style={{ marginLeft: '6px' }}></i>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: '#F8FAFC',
          borderRadius: '16px',
          border: '1px dashed var(--border-color)',
          maxWidth: '650px',
          margin: '0 auto'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--accent-soft)',
            color: 'var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            margin: '0 auto 18px'
          }}>
            <i className="fa-solid fa-newspaper"></i>
          </div>
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No Articles Published Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '420px', margin: '0 auto' }}>
            Our architects and engineers are currently compiling in-depth technical case studies and articles. Check back soon!
          </p>
        </div>
      )}

      {/* Modal for viewing article */}
      {selectedBlog && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '750px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedBlog(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#F1F5F9',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <span className="tool-badge" style={{ marginBottom: '12px', display: 'inline-block' }}>{selectedBlog.category || 'Article'}</span>
            <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>{selectedBlog.title}</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Published by {selectedBlog.author || 'Tech X Sol Architect'} • {new Date(selectedBlog.created_at || Date.now()).toLocaleDateString()}
            </p>

            {selectedBlog.cover_image && (
              <img src={selectedBlog.cover_image} alt="" style={{ width: '100%', borderRadius: '12px', marginBottom: '24px' }} />
            )}

            <div
              style={{ fontSize: '15px', lineHeight: '1.8', color: 'var(--text-main)' }}
              dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
