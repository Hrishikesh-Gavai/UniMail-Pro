import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ComposeEmail from './components/ComposeEmail';
import EmailRecords from './components/EmailRecords';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import { EmailProvider } from './context/EmailContext';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('compose');
  const [isLoading, setIsLoading] = useState(false);
  
  const handlePageChange = (page) => {
    setIsLoading(true);
    setCurrentPage(page);
    setTimeout(() => setIsLoading(false), 200);
  };

  return (
    <EmailProvider>
      <div className="App">
        <div className="background-gradient"></div>
        
        <Header 
          currentPage={currentPage} 
          setCurrentPage={handlePageChange}
        />
        
        <main className="main-content">
          <div className="container">
            {isLoading ? (
              <LoadingScreen />
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
    </EmailProvider>
  );
}

export default App;
