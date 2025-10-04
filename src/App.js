import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ComposeEmail from './components/ComposeEmail';
import EmailRecords from './components/EmailRecords';
import StarBackground from './components/StarBackground';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('compose');
  const [theme, setTheme] = useState('dark');
  
  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('unimail-theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);
  
  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('unimail-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div className="App">
      <StarBackground />
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        toggleTheme={toggleTheme}
        theme={theme}
      />
      
      <div className="container">
        {currentPage === 'compose' && (
          <ComposeEmail />
        )}
        
        {currentPage === 'records' && (
          <EmailRecords />
        )}
      </div>
    </div>
  );
}

export default App;
