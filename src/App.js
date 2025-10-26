import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import ComposeEmail from './components/ComposeEmail';
import EmailRecords from './components/EmailRecords';
import LoadingScreen from './components/LoadingScreen';
import { Toaster } from 'react-hot-toast';  // ADD THIS

function App() {
  const [currentPage, setCurrentPage] = useState('compose');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="App">
      <Toaster position="top-right" />  {/* ADD THIS */}
      
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
