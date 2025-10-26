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
        <div className="logo" onClick={handleLogoClick}>
          <Mail size={24} />
          UniMail Pro
        </div>
        
        <nav className="nav">
          <div className="nav-tabs">
            <button 
              className={`nav-tab ${currentPage === 'compose' ? 'active' : ''}`}
              onClick={() => handleNavClick('compose')}
            >
              <Mail size={18} />
              Compose Email
            </button>
            <button 
              className={`nav-tab ${currentPage === 'records' ? 'active' : ''}`}
              onClick={() => handleNavClick('records')}
            >
              <Database size={18} />
              Email Records
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
