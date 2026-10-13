/**
 * Tech X Sol - Main Frontend Application Script
 * Dynamic blogs loader, tools loader, interactive cursor, and secret admin shortcut
 */

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initScrollReveal();
  initMobileMenu();
  initShareButton();
  initSecretAdminShortcut();
  loadFeaturedBlogs();
  loadHomepageTools();
});

// Custom Dual Cursor
function initCursor() {
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorOutline = document.querySelector('.cursor-outline');

  if (!cursorDot || !cursorOutline) return;

  window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    cursorOutline.animate({
      left: `${posX}px`,
      top: `${posY}px`
    }, { duration: 240, fill: 'forwards' });
  });

  const interactiveElements = 'a, button, input, textarea, .service-card, .founder-card, .blog-card, .tool-card';
  document.querySelectorAll(interactiveElements).forEach(elem => {
    elem.addEventListener('mouseenter', () => {
      cursorOutline.style.width = '48px';
      cursorOutline.style.height = '48px';
      cursorOutline.style.borderColor = 'var(--accent-glow)';
    });
    elem.addEventListener('mouseleave', () => {
      cursorOutline.style.width = '32px';
      cursorOutline.style.height = '32px';
      cursorOutline.style.borderColor = 'var(--accent-cyan)';
    });
  });
}

// Scroll Reveal
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('active');
        }, index * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  reveals.forEach(reveal => revealObserver.observe(reveal));
}

// Mobile Menu
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-active');
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-active');
      });
    });
  }
}

// Single Floating Share Button
function initShareButton() {
  const shareBtn = document.getElementById('shareButton');
  const toast = document.getElementById('shareToast');

  if (!shareBtn || !toast) return;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  shareBtn.addEventListener('click', async () => {
    const shareData = {
      title: document.title,
      text: 'Explore Tech X Sol - Smart Web, Software & Digital Solutions',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Website link copied!');
      } else {
        showToast('Link ready in your address bar.');
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        showToast('Action cancelled.');
      }
    }
  });
}

// Stealth / Secret Admin Portal Key Shortcut: Ctrl + Shift + A
function initSecretAdminShortcut() {
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      const adminPath = window.location.pathname.includes('/frontend/') ? 'admin.html' : '/admin';
      window.location.href = adminPath;
    }
  });
}

// Load Top 3 Featured Blogs for Homepage
async function loadFeaturedBlogs() {
  const container = document.getElementById('featured-blogs-container');
  if (!container) return;

  const renderEmptyBlogs = () => {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px 20px; background: #FFFFFF; border: 1px dashed var(--border-color); border-radius: 16px;">
        <div style="width: 52px; height: 52px; border-radius: 50%; background: rgba(0, 168, 232, 0.08); color: var(--accent-cyan); display: flex; align-items: center; justify-content: center; font-size: 22px; margin: 0 auto 12px;">
          <i class="fa-solid fa-newspaper"></i>
        </div>
        <h4 style="margin-bottom: 6px; font-size: 18px;">No Articles Published Yet</h4>
        <p style="color: var(--text-muted); font-size: 14px; margin: 0;">Articles will automatically appear here once published from the admin panel.</p>
      </div>
    `;
  };

  try {
    const [res, settings] = await Promise.all([
      window.API.getBlogs({ featured: 'true', limit: 3 }),
      window.API.getSettings().catch(() => ({ showAuthor: true }))
    ]);
    const blogs = (res && res.blogs) ? res.blogs : [];
    window.siteShowAuthorSetting = settings.showAuthor !== false;

    if (blogs.length === 0) {
      renderEmptyBlogs();
      return;
    }

    const globalShowAuthor = (typeof window.siteShowAuthorSetting === 'boolean')
      ? window.siteShowAuthorSetting
      : window.API.getShowAuthorPreference();

    container.innerHTML = blogs.map(blog => {
      const coverUrl = blog.coverImage 
        ? (blog.coverImage.startsWith('http') || blog.coverImage.startsWith('data:') ? blog.coverImage : `${window.API.UPLOADS_BASE}${blog.coverImage}`)
        : 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80';

      const dateStr = new Date(blog.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      const blogUrl = `blog.html?id=${blog.id}`;
      const showAuthorForThisCard = globalShowAuthor && (blog.showAuthor !== false);

      const footerLeftHtml = showAuthorForThisCard ? `
        <div class="blog-author">
          <div class="author-avatar-tiny">${(blog.author || 'TXS').substring(0, 2).toUpperCase()}</div>
          <span>${blog.author || 'Tech X Sol'}</span>
        </div>
      ` : `
        <div class="blog-date-footer">
          <i class="fa-regular fa-calendar"></i>
          <span>${dateStr}</span>
        </div>
      `;

      const topMetaHtml = showAuthorForThisCard ? `
        <span><i class="fa-regular fa-calendar"></i> ${dateStr}</span>
      ` : `
        <span><i class="fa-regular fa-clock"></i> 5 min read</span>
      `;

      return `
        <article class="blog-card reveal active">
          <div class="blog-image-wrap">
            <img src="${coverUrl}" alt="${blog.title}" loading="lazy">
            <span class="blog-badge-category">${blog.category || 'Tech'}</span>
            ${blog.featured ? '<span class="blog-badge-featured"><i class="fa-solid fa-star"></i> Featured</span>' : ''}
          </div>
          <div class="blog-content">
            <div class="blog-meta">
              ${topMetaHtml}
              ${blog.imageSizeKB ? `<span><i class="fa-solid fa-image"></i> ${blog.imageSizeKB}KB</span>` : ''}
            </div>
            <h3 class="blog-title">${blog.title}</h3>
            <p class="blog-excerpt">${blog.excerpt || 'Explore insightful analysis and modern technology perspectives.'}</p>
            <div class="blog-footer">
              ${footerLeftHtml}
              <a href="${blogUrl}" class="blog-read-link">Read More <i class="fa-solid fa-arrow-right"></i></a>
            </div>
          </div>
        </article>
      `;
    }).join('');

  } catch (err) {
    console.warn('Could not load featured blogs:', err.message);
    renderEmptyBlogs();
  }
}

// Ensure 3 Core Tools are loaded on Homepage
async function loadHomepageTools() {
  const container = document.getElementById('homepage-tools-container');
  if (!container) return;
  // Preserves pre-rendered 3 core tools (Digit Tool, CGPA Calculator, Percentage Calculator)
}

// Listen to real-time settings change across tabs
window.addEventListener('storage', (e) => {
  if (e.key === 'txs_settings') {
    try {
      const s = JSON.parse(e.newValue);
      window.siteShowAuthorSetting = s.showAuthor !== false;
      loadFeaturedBlogs();
    } catch {}
  }
});
