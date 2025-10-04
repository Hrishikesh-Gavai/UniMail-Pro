import React from 'react'

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-logo">UniMail Pro</div>
      <div className="loading-spinner"></div>
      <div className="loading-text">Initializing System...</div>
      <div className="loading-progress">
        <div className="loading-bar"></div>
      </div>
    </div>
  )
}

export default LoadingScreen