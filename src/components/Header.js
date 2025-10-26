import React from 'react';

const Header = ({ currentPage, setCurrentPage, toggleTheme, theme }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <i className="fas fa-paper-plane"></i>
          UniMail Pro
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="nav-tabs">
            <button 
              className={`nav-tab ${currentPage === 'compose' ? 'active' : ''}`}
              onClick={() => setCurrentPage('compose')}
            >
              <i className="fas fa-edit"></i> Compose
            </button>
            <button 
              className={`nav-tab ${currentPage === 'records' ? 'active' : ''}`}
              onClick={() => setCurrentPage('records')}
            >
              <i className="fas fa-database"></i> Records
            </button>
          </div>
          
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
