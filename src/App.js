import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ComposeEmail from './components/ComposeEmail';
import EmailRecords from './components/EmailRecords';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('compose');
  const [loading, setLoading] = useState(false);
  
  // Handle page changes with loading state
  const handlePageChange = (page) => {
    setLoading(true);
    setCurrentPage(page);
    // Simulate loading for better UX
    setTimeout(() => setLoading(false), 300);
  };

  return (
    <div className="App">
      <div className="app-background"></div>
      
      <Header 
        currentPage={currentPage} 
        setCurrentPage={handlePageChange} 
      />
      
      <main className="main-content">
        <div className="container">
          {loading ? (
            <div className="loading-screen">
              <div className="loading-spinner"></div>
              <p>Loading...</p>
            </div>
          ) : (
            <>
              {currentPage === 'compose' && <ComposeEmail />}
              {currentPage === 'records' && <EmailRecords />}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
