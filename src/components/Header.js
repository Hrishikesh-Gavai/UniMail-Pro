import React from 'react'

const Header = ({ currentPage, setCurrentPage }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <i className="fas fa-paper-plane"></i>
          UniMail Pro
        </div>
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
      </div>
    </header>
  )
}

export default Header