import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import ComposeEmail from './components/ComposeEmail';
import EmailRecords from './components/EmailRecords';

function App() {
  const [currentPage, setCurrentPage] = useState('compose');

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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
