import React from 'react';
import { Mail, Database } from 'lucide-react';

const Header = ({ currentPage, setCurrentPage }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoClick = () => {
    setCurrentPage('compose');
    scrollToTop();
  };

  const handleNavClick = (page) => {
    setCurrentPage(page);
    scrollToTop();
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-logo" onClick={handleLogoClick}>
          <div className="logo-icon">
            <Mail size={24} />
          </div>
          <div className="logo-text">
            <h1>UniMail</h1>
          </div>
        </div>

        <nav className="header-nav">
          <button
            className={`nav-button ${currentPage === 'compose' ? 'active' : ''}`}
            onClick={() => handleNavClick('compose')}
          >
            <Mail size={18} />
            <span>Compose</span>
          </button>
          <button
            className={`nav-button ${currentPage === 'records' ? 'active' : ''}`}
            onClick={() => handleNavClick('records')}
          >
            <Database size={18} />
            <span>Records</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
