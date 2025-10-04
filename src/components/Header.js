import React from 'react'

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
              <i className="fas fa-edit"></i> Compose Email
            </button>
            <button 
              className={`nav-tab ${currentPage === 'records' ? 'active' : ''}`}
              onClick={() => setCurrentPage('records')}
            >
              <i className="fas fa-database"></i> Email Records
            </button>
          </div>
          
          {/* Theme Toggle Button */}
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  )
}

<<<<<<< HEAD
export default Header
=======
export default Header
>>>>>>> f4af213 (Mail automation and integration done successfully)
