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

  return (
    <header className="header">
      <div className="header-content">
        <a className="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <Mail size={24} />
          UniMail Pro
        </a>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="nav-tabs">
            <button 
              className={`nav-tab ${currentPage === 'compose' ? 'active' : ''}`}
              onClick={() => {
                setCurrentPage('compose');
                scrollToTop();
              }}
            >
              <Mail size={18} />
              Compose
            </button>
            <button 
              className={`nav-tab ${currentPage === 'records' ? 'active' : ''}`}
              onClick={() => {
                setCurrentPage('records');
                scrollToTop();
              }}
            >
              <Database size={18} />
              Records
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
