import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import ComposeEmail from './components/ComposeEmail';
import EmailRecords from './components/EmailRecords';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [currentPage, setCurrentPage] = useState('compose');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial app loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Show loading for 1.5 seconds

    return () => clearTimeout(timer);
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Show loading screen on initial load
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="App">
      <Header currentPage={currentPage} setCurrentPage={handlePageChange} />
      
      <main className="main-content">
        <div className="container">
          {currentPage === 'compose' ? (
            <ComposeEmail />
          ) : (
            <EmailRecords />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
