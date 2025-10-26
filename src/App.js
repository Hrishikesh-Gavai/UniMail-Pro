import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ComposeEmail from './components/ComposeEmail';
import EmailRecords from './components/EmailRecords';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen'; // Make sure this import is correct
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('compose');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Simulate initial app loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handlePageChange = (page) => {
    setLoading(true);
    setCurrentPage(page);
    setTimeout(() => setLoading(false), 500);
  };

  // Show initial loading screen
  if (initialLoad) {
    return (
      <LoadingScreen 
        type="general"
        message="Welcome to UniMail Pro"
        subtitle="Loading your professional email management system"
      />
    );
  }

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
            <LoadingScreen 
              type={currentPage === 'compose' ? 'email' : 'database'}
              message={currentPage === 'compose' ? "Loading Composer" : "Loading Records"}
              subtitle={currentPage === 'compose' ? "Preparing email composition tools" : "Fetching your email history"}
            />
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
