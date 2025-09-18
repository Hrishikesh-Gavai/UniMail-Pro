import React, { useState } from 'react'
import Header from './components/Header'
import ComposeEmail from './components/ComposeEmail'
import EmailRecords from './components/EmailRecords'
import StarBackground from './components/StarBackground';
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('compose')

  return (
    <div className="App">
      <StarBackground />
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="container">
        {currentPage === 'compose' && (
          <ComposeEmail />
        )}
        
        {currentPage === 'records' && (
          <EmailRecords />
        )}
      </div>
    </div>
  )
}

export default App