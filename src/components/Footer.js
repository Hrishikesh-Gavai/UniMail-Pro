import React from 'react';
import { Mail, Database, Github, ExternalLink, Heart, Code } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-grid">
          {/* About Section */}
          <div className="footer-section">
            <h3>UniMail</h3>
            <p>
              A professional email management system with multi-language support,
              built to streamline your communication workflow.
            </p>
            <p style={{ 
              marginTop: 'var(--space-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.875rem',
            }}>
              Made with <Heart size={14} style={{ color: '#ef4444' }} /> using React & CSS
            </p>
          </div>

          {/* Features */}
          <div className="footer-section">
            <h3>Features</h3>
            <ul className="footer-links">
              <li>✓ Multi-language Translation</li>
              <li>✓ PDF Attachment Support</li>
              <li>✓ Excel Export</li>
              <li>✓ Search & Filter Records</li>
              <li>✓ Gmail Integration</li>
              <li>✓ Mobile Responsive</li>
            </ul>
          </div>

          {/* Developers */}
          <div className="footer-section">
            <h3>Developers</h3>
            <ul className="footer-links">
              <li>
                <a href="https://github.com/Hrishikesh-Gavai" target="_blank" rel="noopener noreferrer">
                  <Github size={16} />
                  Hrishikesh Gavai
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://github.com/Dhruvesh05" target="_blank" rel="noopener noreferrer">
                  <Github size={16} />
                  Dhruvesh Patil
                  <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>
            © {currentYear} UniMail. All rights reserved.
          </p>
          <p style={{ 
            marginTop: '8px', 
            fontSize: '0.8rem', 
            opacity: 0.8,
          }}>
            Built with modern web technologies for optimal performance
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
