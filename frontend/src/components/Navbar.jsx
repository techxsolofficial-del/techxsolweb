import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className={scrolled ? 'scrolled' : ''}>
      <nav className="nav-container">
        <Link to="/" className="logo-brand" onClick={closeMenu}>
          <div className="logo-svg-wrapper">
            <img src="/techxsol logo.png" alt="Tech X Sol Logo" />
          </div>
        </Link>

        <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`} id="navLinks">
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={closeMenu}>Home</Link>
          </li>
          <li>
            <a href="/#services" onClick={closeMenu}>Services</a>
          </li>
          <li>
            <Link to="/tools" className={location.pathname === '/tools' ? 'active' : ''} onClick={closeMenu}>Tools</Link>
          </li>
          <li>
            <Link to="/blog" className={location.pathname === '/blog' ? 'active' : ''} onClick={closeMenu}>Blog</Link>
          </li>
          <li>
            <a href="/#founders" onClick={closeMenu}>Leadership</a>
          </li>
          <li>
            <a href="/#community" onClick={closeMenu}>Community</a>
          </li>
          <li>
            <a href="/#contact" onClick={closeMenu}>Contact</a>
          </li>
        </ul>

        <div className="nav-actions">
          <a href="/#contact" className="btn-cta">
            Get Free Consultation <i className="fa-solid fa-arrow-right"></i>
          </a>
          <button
            className="mobile-toggle"
            id="mobileToggle"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>
      </nav>
    </header>
  );
}
