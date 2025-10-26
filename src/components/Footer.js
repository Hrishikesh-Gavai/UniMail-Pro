import React from 'react';
import { Mail, Database, Github, ExternalLink } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleNavClick = (page) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>
            <Mail size={24} />
            UniMail Pro
          </h3>
          <p>Professional email management system designed for educational institutions. Streamline your communication with multi-language support and organized record keeping.</p>
        </div>
        
        <div className="footer-section">
          <h4>
            <Database size={20} />
            Quick Navigation
          </h4>
          <ul>
            <li>
              <a href="#compose" onClick={() => handleNavClick('compose')}>
                <Mail size={16} />
                Compose Email
              </a>
            </li>
            <li>
              <a href="#records" onClick={() => handleNavClick('records')}>
                <Database size={16} />
                Email Records
              </a>
            </li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>
            <Github size={20} />
            Development Team
          </h4>
          <p>Built with modern web technologies for seamless email management.</p>
          <div className="github-links">
            <a 
              href="https://github.com/Hrishikesh-Gavai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="github-link"
            >
              <Github size={18} />
              Hrishikesh Gavai
              <ExternalLink size={14} />
            </a>
            <a 
              href="https://github.com/Dhruvesh05" 
              target="_blank" 
              rel="noopener noreferrer"
              className="github-link"
            >
              <Github size={18} />
              Dhruvesh Patil
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} UniMail Pro. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
