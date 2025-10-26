import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>UniMail Pro</h3>
          <p>Professional email management system for educational institutions</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#compose">Compose Email</a></li>
            <li><a href="#records">Email Records</a></li>
            <li><a href="#help">Help & Support</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: support@unimailpro.com</p>
          <p>Phone: +1 (555) 123-4567</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} UniMail Pro. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;