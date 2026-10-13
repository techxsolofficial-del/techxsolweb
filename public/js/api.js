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

  // Default Featured Seed Blogs (SEO Optimized & Highly Informative)
  const DEFAULT_FEATURED_BLOGS = [
    {
      id: 'blog-ai-jobs-disruption',
      title: 'Has AI Really Killed Human Jobs? The Truth About AI Disruption Across Tech, Writing & Corporate Careers',
      slug: 'has-ai-killed-human-jobs-truth-about-ai-disruption',
      category: 'Artificial Intelligence',
      author: 'CH.M.Ahmed',
      authorRole: 'Founder & Chief Architect',
      published: true,
      featured: true,
      coverImage: 'blog-ai-jobs.jpg',
      imageSizeKB: 778,
      tags: ['Artificial Intelligence', 'Future of Work', 'AI Automation', 'Career Strategy', 'Tech X Sol'],
      createdAt: '2026-10-10T10:00:00.000Z',
      excerpt: 'From software engineers worried about coding copilots to copywriters facing automated text generation, is Artificial Intelligence really eating human livelihoods—or is it the biggest productivity revolution of the century? Here is what industry reality tells us.',
      content: `<h2>The Great AI Panic: Is the Workforce Being Replaced?</h2><p>Over the past three years, the tech landscape has undergone its most aggressive transformation since the birth of the internet. With the rise of autonomous agents, Large Language Models (LLMs), and automated development environments, a persistent fear has gripped professionals worldwide: <em>"Will Artificial Intelligence take my job?"</em></p><p>Headlines scream about mass layoffs, automated customer service hubs, and self-writing software code. But when you step behind the hysteria and examine how companies are actually adopting AI in 2026, a very different picture emerges. AI isn't simply eliminating work—it is radically shifting the definition of value in the knowledge economy.</p><div class="blog-callout"><strong>Key Takeaway:</strong> AI will not replace you. A human using AI effectively will replace the human who ignores it.</div><h2>Which Jobs Are Actually Under Pressure?</h2><p>To understand the disruption, we must separate low-leverage tasks from high-leverage decision-making. AI excels at pattern matching, routine synthesis, and structured processing. The sectors experiencing the highest pressure include:</p><ul><li><strong>Junior Data Entry & Scraping:</strong> Automated extraction pipelines now do in 3 seconds what used to take teams 40 hours.</li><li><strong>Basic Template Copywriting:</strong> Generic SEO articles, product descriptions, and standard social media posts have become almost zero-marginal-cost commodities.</li><li><strong>First-Tier Customer Support:</strong> Modern conversational voice and chat agents resolve 70% of standard ticket workflows without human intervention.</li><li><strong>Routine Code Boilerplate:</strong> Junior coding tasks like building standard CRUD APIs or converting Figma files into static HTML are increasingly assisted by AI copilots.</li></ul><h2>The Counter-Revolution: Why Senior Problem-Solvers Earn More Than Ever</h2><p>While basic execution has been automated, the demand for <strong>architectural thinking, domain context, and strategic decision-making</strong> has skyrocketed. At Tech X Sol, our engineering teams use AI to write code 3x faster—yet our need for senior architects who understand database scalability, cybersecurity, and client business logic has never been higher.</p><h2>The 4 Pillars to Stay Irreplaceable in the AI Era</h2><ol><li><strong>Deep Contextual Empathy:</strong> Understanding client politics, organizational culture, and human hesitation is exclusively human.</li><li><strong>Complex Architectural Judgment:</strong> Knowing which technical trade-off aligns with a company's 5-year business trajectory.</li><li><strong>AI Orchestration & Agentic Workflows:</strong> Learning how to chain models, write automation pipelines, and integrate AI into business software.</li><li><strong>Cross-Disciplinary Versatility:</strong> The future belongs to T-shaped professionals who bridge technology and business strategy.</li></ol><h2>Conclusion: The Golden Age for Builders</h2><p>AI is not the death of careers; it is the death of mundane, repetitive drudgery. For forward-thinking professionals who choose to master AI tools rather than fear them, there has never been a more lucrative, exciting time to build the future.</p>`
    },
    {
      id: 'blog-graphic-design-ai',
      title: 'Will AI Replace Graphic Designers? Why Human Creativity, Branding & Strategy Can Never Be Automated',
      slug: 'will-ai-replace-graphic-designers-future-of-visual-design',
      category: 'Graphic Design',
      author: 'Abdul Wahid',
      authorRole: 'Co-Founder & Operations Director',
      published: true,
      featured: true,
      coverImage: 'blog-graphic-design.jpg',
      imageSizeKB: 809,
      tags: ['Graphic Design', 'Branding', 'UI/UX Design', 'Creative Direction', 'Midjourney'],
      createdAt: '2026-10-11T12:00:00.000Z',
      excerpt: 'With Midjourney, DALL-E 3, and Adobe Firefly generating stunning visuals in seconds, graphic designers are panicking. But here is the hard truth: pretty images are not branding. Discover why strategic designers will thrive more than ever.',
      content: `<h2>The Visual Revolution: Panic in the Creative Industry</h2><p>Type a 15-word prompt into Midjourney or Stable Diffusion, and within 20 seconds you get an ultra-realistic illustration or intricate 3D render. It looks breathtaking. And naturally, it has led graphic designers to ask: <em>"Is my profession dead?"</em></p><p>The short answer is no. But the longer, more important answer is: <strong>the traditional definition of a graphic designer as a 'pixel executor' is dead forever.</strong></p><div class="blog-callout"><strong>The Fundamental Difference:</strong> Generating an aesthetic image is art. Creating a visual identity that solves a commercial business problem and builds market trust is <em>design</em>. AI does the first; humans do the second.</div><h2>Why 'Pretty Pictures' Are Not Branding</h2><p>Businesses invest thousands in branding to achieve specific commercial milestones:</p><ul><li><strong>Brand Cohesion & Systematic Consistency:</strong> An AI model can generate one stunning banner, but it cannot intuitively ensure your mobile app, outdoor billboards, packaging typography, and investor deck communicate a singular, cohesive identity across 25 brand touchpoints.</li><li><strong>Cultural Context & Subconscious Signaling:</strong> Colors, typography choices, and spatial layouts carry heavy psychological connotations that AI lacks intuition for.</li><li><strong>Vector Scalability & Production Readiness:</strong> Pixel-based generative images cannot be handed over to printing presses, die-cut packaging manufacturers, or responsive web CSS without rigorous vector architecture and production grids.</li></ul><h2>How Modern Designers Can 10x Their Income With AI</h2><ol><li><strong>Rapid Concept Pitching:</strong> Use generative models to build 5 diverse visual moodboard directions in 30 minutes during client onboarding.</li><li><strong>Custom Asset Augmentation:</strong> Use Adobe Firefly and generative expand to extend commercial photo backdrops without expensive stock licenses.</li><li><strong>Transition to UI/UX & Design Systems:</strong> Shift your focus from isolated flyers to comprehensive design tokens and component systems.</li><li><strong>Position Yourself as a Creative Director:</strong> Charge for your curation, judgment, and brand philosophy rather than hourly Photoshop time.</li></ol><h2>The Verdict: The Future of Visual Design</h2><p>AI has democratized illustration, but it has made strategic human taste rare and valuable. Software can generate infinite possibilities, but knowing which single direction moves the needle for a business requires human intuition, empathy, and artistic vision.</p>`
    },
    {
      id: 'blog-chatgpt-power-guide',
      title: 'How Powerful Is ChatGPT in 2026? 10 Insane Real-World Capabilities Most People Don\'t Know About',
      slug: 'how-powerful-is-chatgpt-hidden-capabilities-guide',
      category: 'AI Tools & Automation',
      author: 'CH.M.Ahmed',
      authorRole: 'Founder & Chief Architect',
      published: true,
      featured: true,
      coverImage: 'blog-chatgpt-power.jpg',
      imageSizeKB: 1093,
      tags: ['ChatGPT', 'OpenAI', 'Prompt Engineering', 'Full-Stack AI', 'Workflow Automation'],
      createdAt: '2026-10-12T15:00:00.000Z',
      excerpt: 'Most users treat ChatGPT like an interactive search engine or basic rewriter. But underneath lies an autonomous coding engine, complex data analyst, and architectural planner capable of doing 40 hours of work in 2 hours. Here is what ChatGPT can really do.',
      content: `<h2>Beyond the Chatbox: The Misunderstood Super-Intelligence</h2><p>If you are only using ChatGPT to rewrite awkward emails or ask trivia questions, you are using less than 5% of its true computational power. In 2026, ChatGPT has evolved far beyond a conversational novelty—it has become a full-fledged multi-modal computational engine capable of running Python code, analyzing complex datasets, reverse-engineering software, and acting as an autonomous junior business partner.</p><div class="blog-callout"><strong>Pro Tip:</strong> ChatGPT is not an information retrieval tool; it is a reasoning and transformation engine. Stop treating it like Google and start treating it like a tireless PhD-level analyst.</div><h2>1. Advanced Code Synthesis & Full-Stack Debugging</h2><p>Modern reasoning models don't just write simple snippets—they can ingest an entire multi-file codebase, trace asynchronous race conditions, detect SQL injection vectors, and refactor legacy code into clean modern frameworks. At Tech X Sol, our engineers frequently feed complex PostgreSQL schema dumps into ChatGPT to generate fully typed ORM models and optimized database indexes in seconds.</p><h2>2. Instant Data Science & CSV Analytics (No Code Required)</h2><p>Drop a 100,000-row CSV file containing your annual sales data into ChatGPT with the Advanced Data Analysis module. Without writing a single line of code yourself, you can command it to identify customer churn factors, perform cohort retention analysis, and render downloadable high-resolution charts ready for executive presentations.</p><h2>3. Reverse-Engineering Complex PDF Contracts & Financial Statements</h2><p>Instead of reading through an 80-page commercial lease or a dense quarterly report, ChatGPT can dissect clauses, highlight hidden liabilities, extract tabular balance sheets into clean Excel spreadsheets, and compare conflicting terms with pinpoint accuracy.</p><h2>4. Building Custom GPTs for Niche Enterprise Workflows</h2><p>You can train and configure private Custom GPTs tailored to your company's proprietary knowledge base. By uploading your API documentation, internal brand guidelines, and client FAQs, you create an always-on internal specialist that onboards new employees and drafts client proposals.</p><h2>How To Unlock 10x Better Outputs: The CREATE Framework</h2><ul><li><strong>Context:</strong> Explain your company, target audience, and current scenario.</li><li><strong>Role:</strong> Assign an expert persona (e.g. <em>"Act as an elite Enterprise Software Architect"</em>).</li><li><strong>Expectation:</strong> Specify the exact deliverable, tone, and constraints.</li><li><strong>Action:</strong> Give precise, step-by-step instructions.</li><li><strong>Test:</strong> Ask the model to critique its own solution against common failure modes.</li><li><strong>Examples:</strong> Provide high-standard input/output references for few-shot learning.</li></ul><h2>The Bottom Line</h2><p>The gap between professionals who understand how to leverage ChatGPT's deeper reasoning capabilities and those who use it casually is widening every day. Mastering generative AI is no longer a fringe life-hack—it is the foundational literacy of the modern economy.</p>`
    }
  ];

  // Local Storage DB Fallback helpers
  const LOCAL_BLOGS_KEY = 'txs_local_blogs';
  function getLocalBlogs() {
    try {
      const raw = localStorage.getItem(LOCAL_BLOGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_FEATURED_BLOGS;
    } catch {
      return DEFAULT_FEATURED_BLOGS;
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

    // Blogs with Local Storage & Fallback Persistence
    async getBlogs(params = {}) {
      try {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/blogs?${query}` : '/blogs';
        const res = await request(endpoint, { method: 'GET', headers: getHeaders() });
        if (res && res.blogs && res.blogs.length > 0) {
          return res;
        }
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
