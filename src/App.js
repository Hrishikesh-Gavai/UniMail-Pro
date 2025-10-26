import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ComposeEmail from './components/ComposeEmail';
import EmailRecords from './components/EmailRecords';
import Footer from './components/Footer'; // Add this import
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('compose');
  const [theme, setTheme] = useState('dark');
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('unimail-theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('unimail-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div className="App">
      <div className="background"></div>
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        toggleTheme={toggleTheme}
        theme={theme}
      />
      
      <main className="main-content">
        <div className="container">
          {currentPage === 'compose' && <ComposeEmail />}
          {currentPage === 'records' && <EmailRecords />}
        </div>
      </main>
      
      <Footer /> {/* Add Footer here */}
    </div>
  );
}

export default App;
