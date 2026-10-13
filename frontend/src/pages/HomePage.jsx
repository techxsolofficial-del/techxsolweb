import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Hero3D from '../components/Hero3D';

export default function HomePage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formSent, setFormSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSent(true);
    alert('Thank you! Your message has been received. Our team will contact you shortly.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="hero-section" id="hero">
        <div className="hero-container">
          <div className="hero-content">
            <span className="badge">
              <i className="fa-solid fa-bolt"></i> Next-Gen Digital Solutions
            </span>
            <h1>
              Engineering High-Performance <span className="highlight">Digital Solutions</span> for Tomorrow
            </h1>
            <p>
              We build modern, scalable web platforms, high-speed mobile apps, enterprise systems, and bespoke digital experiences designed for rapid business growth.
            </p>
            <div className="hero-cta">
              <a href="#services" className="btn-primary">
                Explore Services <i className="fa-solid fa-arrow-down"></i>
              </a>
              <a href="#contact" className="btn-secondary">
                Schedule Consultation <i className="fa-solid fa-calendar"></i>
              </a>
            </div>
          </div>

          <div className="hero-visual">
            <div className="canvas-wrapper">
              <Hero3D />
              
              {/* Floating Stat Badges */}
              <div className="stat-pill pill-top">
                <i className="fa-solid fa-shield-halved"></i>
                <span><strong>99.9%</strong> Uptime Architecture</span>
              </div>
              <div className="stat-pill pill-bottom">
                <i className="fa-solid fa-rocket"></i>
                <span><strong>50+</strong> Projects Delivered</span>
              </div>
              <div className="stat-pill pill-right">
                <i className="fa-solid fa-code"></i>
                <span><strong>24/7</strong> Enterprise Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section" id="services">
        <div className="section-title">
          <span className="section-tag">Capabilities</span>
          <h2>Precision-Engineered Digital Solutions</h2>
          <p>From conception to deployment, we deliver robust solutions across the software lifecycle.</p>
        </div>

        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon"><i className="fa-solid fa-laptop-code"></i></div>
            <h3>Web Application Architecture</h3>
            <p>Scalable, modern, reactive full-stack web applications constructed with cutting-edge frameworks, microservices, and robust cloud backends.</p>
          </div>

          <div className="service-card">
            <div className="service-icon"><i className="fa-solid fa-microchip"></i></div>
            <h3>Custom Enterprise Software</h3>
            <p>Tailored ERPs, administrative CRMs, and automated high-throughput management platforms engineered specifically for your organizational workflow.</p>
          </div>

          <div className="service-card">
            <div className="service-icon"><i className="fa-solid fa-mobile-screen-button"></i></div>
            <h3>Mobile App Development</h3>
            <p>Smooth, cross-platform Android and iOS applications with fluid 60FPS UI rendering, native performance, and offline-first data capabilities.</p>
          </div>

          <div className="service-card">
            <div className="service-icon"><i className="fa-solid fa-cloud"></i></div>
            <h3>Cloud & DevOps Engineering</h3>
            <p>Serverless architectures, CI/CD automated deployment pipelines, Docker orchestration, and database scaling on Neon, AWS, and Vercel.</p>
          </div>

          <div className="service-card">
            <div className="service-icon"><i className="fa-solid fa-pen-ruler"></i></div>
            <h3>UI/UX & Systems Design</h3>
            <p>Interactive prototypes, accessible user experience research, design system libraries, and high-conversion aesthetic brand interfaces.</p>
          </div>

          <div className="service-card">
            <div className="service-icon"><i className="fa-solid fa-shield-halved"></i></div>
            <h3>Cybersecurity & Optimization</h3>
            <p>Code audits, web speed performance optimization (Sub-second Core Web Vitals), SSL architecture, and penetration defense implementations.</p>
          </div>
        </div>
      </section>

      {/* Featured Interactive Tools Section */}
      <section className="tools-preview-section" id="tools">
        <div className="section-title">
          <span className="section-tag">Productivity & Utilities</span>
          <h2>Free Engineering & Utility Tools</h2>
          <p>Precision calculating utilities built directly in the browser for developers, students, and engineers.</p>
        </div>

        <div className="tools-grid">
          {/* Tool 1 */}
          <div className="tool-card">
            <div className="tool-header">
              <div className="tool-icon">
                <i className="fa-solid fa-calculator"></i>
              </div>
              <span className="tool-badge">Digit & Math</span>
            </div>
            <h3>Smart Digital & Digit Calculator</h3>
            <p>Count digits, analyze digit frequency, extract numbers from complex text, or perform instant digital calculations.</p>
            <Link to="/tools?tool=digit" className="tool-action-btn">
              Use Digit Tool <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>

          {/* Tool 2 */}
          <div className="tool-card">
            <div className="tool-header">
              <div className="tool-icon">
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
              <span className="tool-badge">Academic Suite</span>
            </div>
            <h3>CGPA & GPA Calculator</h3>
            <p>Calculate your semester GPA and cumulative CGPA across university credit hours with standard 4.0 grading scales.</p>
            <Link to="/tools?tool=cgpa" className="tool-action-btn">
              Calculate CGPA <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>

          {/* Tool 3 */}
          <div className="tool-card">
            <div className="tool-header">
              <div className="tool-icon">
                <i className="fa-solid fa-percent"></i>
              </div>
              <span className="tool-badge">Marks & Ratios</span>
            </div>
            <h3>Percentage & Marks Calculator</h3>
            <p>Quickly convert exam marks to percentages & letter grades, find proportion percentages, and calculate increase/decrease ratios.</p>
            <Link to="/tools?tool=percentage" className="tool-action-btn">
              Calculate Percentage <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Link to="/tools" className="btn-primary">
            Explore All Tools <i className="fa-solid fa-wrench"></i>
          </Link>
        </div>
      </section>

      {/* Founders & Leadership Section */}
      <section className="founders-section" id="founders">
        <div className="section-title">
          <span className="section-tag">Leadership</span>
          <h2>Founders & Visionaries</h2>
          <p>Driven by architects passionate about engineering impactful digital products.</p>
        </div>

        <div className="founders-grid">
          <div className="founder-card">
            <div className="founder-avatar">CA</div>
            <div className="founder-name">CH.M.Ahmed</div>
            <div className="founder-role">Founder & Chief Architect</div>
            <div className="founder-bio">Specializing in Full-Stack Web Development, Desktop App Development, Mobile Apps, UI/UX Systems, and Enterprise Software Architecture.</div>
            
            <div className="founder-socials">
              <a href="https://www.linkedin.com/in/ch-m-ahmad/" target="_blank" rel="noopener noreferrer" title="LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>
              <a href="https://github.com/ahmadcode15-glitch" target="_blank" rel="noopener noreferrer" title="GitHub"><i className="fa-brands fa-github"></i></a>
              <a href="https://www.instagram.com/chahmad.dev/" target="_blank" rel="noopener noreferrer" title="Instagram"><i className="fa-brands fa-instagram"></i></a>
            </div>
          </div>

          <div className="founder-card">
            <div className="founder-avatar">AW</div>
            <div className="founder-name">Abdul Wahid</div>
            <div className="founder-role">Co-Founder & Operations Director</div>
            <div className="founder-bio">Leading Strategic Growth, Client Operations, and Digital Product Management across global client portfolios.</div>
            
            <div className="founder-socials">
              <a href="https://www.linkedin.com/in/techxsol/" target="_blank" rel="noopener noreferrer" title="LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>
              <a href="https://github.com/techxsolofficial-del" target="_blank" rel="noopener noreferrer" title="GitHub"><i className="fa-brands fa-github"></i></a>
              <a href="https://www.instagram.com/abdul.wahid10910/" target="_blank" rel="noopener noreferrer" title="Instagram"><i className="fa-brands fa-instagram"></i></a>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Community Section */}
      <section className="community-section" id="community">
        <h2>Join Tech X Sol Learning Hub</h2>
        <p>Connect with expert developers, learn tech skills, get free project guidance, and innovate together inside our WhatsApp Community.</p>
        <a href="https://chat.whatsapp.com/EgsYKdeN0Ev5C0sTUdrict" className="btn-whatsapp" target="_blank" rel="noopener noreferrer">
          <i className="fa-brands fa-whatsapp" style={{ fontSize: '22px' }}></i> Join WhatsApp Community
        </a>
      </section>

      {/* Contact Us Section */}
      <section className="contact-section" id="contact">
        <div className="contact-container">
          <div className="contact-info">
            <h3>Let's Build Something <span style={{ color: 'var(--accent-cyan)' }}>Great</span> Together</h3>
            <p>Have a project in mind, need custom software, or want to discuss a partnership? Get in touch with our team today.</p>

            <div className="contact-details">
              <div className="contact-item">
                <div className="contact-icon"><i className="fa-solid fa-envelope"></i></div>
                <div>
                  <h4>Email Us</h4>
                  <p>techxsol.official@gmail.com</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon"><i className="fa-solid fa-phone"></i></div>
                <div>
                  <h4>Call / WhatsApp</h4>
                  <p>+92 300 1277042</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon"><i className="fa-solid fa-location-dot"></i></div>
                <div>
                  <h4>Location</h4>
                  <p>Sargodha / Punjab, Pakistan</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your full name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Your Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email address"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Project Details / Message</label>
                <textarea
                  className="form-control"
                  placeholder="Tell us about your project requirements..."
                  required
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                ></textarea>
              </div>
              <button type="submit" className="btn-submit">
                Send Message <i className="fa-solid fa-paper-plane" style={{ marginLeft: '6px' }}></i>
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
