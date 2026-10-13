import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [toastVisible, setToastVisible] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tech X Sol - High-Performance Digital Solutions',
          text: 'Check out Tech X Sol - Web Development, Software & Digital Solutions',
          url: url
        });
      } catch (err) {
        copyFallback(url);
      }
    } else {
      copyFallback(url);
    }
  };

  const copyFallback = (url) => {
    navigator.clipboard?.writeText(url).then(() => {
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2400);
    }).catch(() => {
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2400);
    });
  };

  return (
    <>
      <footer>
        <div className="footer-container">
          <Link to="/" className="logo-brand">
            <div className="logo-svg-wrapper">
              <img src="/techxsol logo.png" alt="Tech X Sol Logo" />
            </div>
          </Link>

          <div className="footer-socials">
            <a href="https://web.facebook.com/profile.php?id=61595036870450" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a href="https://www.instagram.com/techxsol/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a href="https://www.linkedin.com/in/techxsol/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <i className="fa-brands fa-linkedin-in"></i>
            </a>
            <a href="https://www.tiktok.com/@techxsol" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <i className="fa-brands fa-tiktok"></i>
            </a>
          </div>

          <div className="footer-copy">
            &copy; 2026 Tech X Sol. All Rights Reserved. Built with Precision & Care.
            <Link to="/admin" className="secret-admin-trigger" title="Portal System">•</Link>
          </div>
        </div>
      </footer>

      {/* Floating Share Button */}
      <button
        className="floating-share"
        id="shareButton"
        type="button"
        aria-label="Share Tech X Sol"
        title="Share Tech X Sol"
        onClick={handleShare}
      >
        <i className="fa-solid fa-share-nodes"></i>
      </button>

      <div className={`share-toast ${toastVisible ? 'active' : ''}`} id="shareToast">
        Link copied!
      </div>
    </>
  );
}
