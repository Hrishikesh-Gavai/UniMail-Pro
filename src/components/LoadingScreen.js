// components/LoadingScreen.js
import React from 'react';
import { Loader2, Mail, Database, Clock } from 'lucide-react';

const LoadingScreen = ({ 
  message = "Loading...", 
  subtitle = "Please wait while we process your request",
  type = "default",
  progress = null 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'email':
        return <Mail size={48} className="loading-icon email" />;
      case 'database':
        return <Database size={48} className="loading-icon database" />;
      case 'general':
        return <Clock size={48} className="loading-icon general" />;
      default:
        return <Loader2 size={48} className="loading-icon default" />;
    }
  };

  const getLoadingText = () => {
    switch (type) {
      case 'email':
        return {
          message: "Processing Email...",
          subtitle: "Composing and translating your email content"
        };
      case 'database':
        return {
          message: "Loading Records...",
          subtitle: "Fetching your email records from database"
        };
      case 'general':
        return {
          message: "Please Wait...",
          subtitle: "Processing your request"
        };
      default:
        return { message, subtitle };
    }
  };

  const { message: loadingMessage, subtitle: loadingSubtitle } = getLoadingText();

  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="loading-animation">
          <div className="loading-spinner-wrapper">
            {getIcon()}
            <div className="loading-spinner-overlay">
              <Loader2 size={24} className="spinner-icon" />
            </div>
          </div>
          
          {progress !== null && (
            <div className="loading-progress-container">
              <div className="loading-progress-bar">
                <div 
                  className="loading-progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="loading-progress-text">{Math.round(progress)}%</div>
            </div>
          )}
        </div>
        
        <div className="loading-content">
          <h3 className="loading-title">{loadingMessage}</h3>
          <p className="loading-subtitle">{loadingSubtitle}</p>
          
          {progress === null && (
            <div className="loading-dots">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          )}
        </div>
        
        <div className="loading-background">
          <div className="loading-shape shape-1"></div>
          <div className="loading-shape shape-2"></div>
          <div className="loading-shape shape-3"></div>
        </div>
      </div>
    </div>
  );
};

// Inline loading component for buttons and small areas
export const InlineLoading = ({ size = "medium", text = "Loading..." }) => {
  const sizeClass = `inline-loading-${size}`;
  
  return (
    <div className={`inline-loading ${sizeClass}`}>
      <Loader2 size={size === "small" ? 16 : 20} className="inline-spinner" />
      <span className="inline-loading-text">{text}</span>
    </div>
  );
};

// Skeleton loading for content
export const SkeletonLoader = ({ type = "card", count = 1 }) => {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <div key={index} className={`skeleton ${type}`}>
      {type === 'card' && (
        <>
          <div className="skeleton-header">
            <div className="skeleton-circle"></div>
            <div className="skeleton-line medium"></div>
          </div>
          <div className="skeleton-content">
            <div className="skeleton-line long"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
          </div>
        </>
      )}
      {type === 'table' && (
        <div className="skeleton-table-row">
          <div className="skeleton-table-cell"></div>
          <div className="skeleton-table-cell"></div>
          <div className="skeleton-table-cell"></div>
          <div className="skeleton-table-cell"></div>
        </div>
      )}
      {type === 'text' && (
        <div className="skeleton-text">
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>
      )}
    </div>
  ));

  return <>{skeletons}</>;
};

export default LoadingScreen;

// Add CSS for enhanced loading components
const loadingStyles = `
/* Main Loading Screen */
.loading-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
  background: transparent;
}

.loading-container {
  text-align: center;
  position: relative;
  max-width: 400px;
  width: 100%;
}

.loading-animation {
  margin-bottom: 2rem;
  position: relative;
}

.loading-spinner-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 1.5rem;
}

.loading-icon {
  color: var(--primary-light);
  opacity: 0.7;
}

.loading-icon.email { color: var(--primary); }
.loading-icon.database { color: var(--secondary); }
.loading-icon.general { color: var(--info); }

.loading-spinner-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.spinner-icon {
  animation: spin 1.5s linear infinite;
  color: var(--primary);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Progress Bar */
.loading-progress-container {
  margin-top: 1.5rem;
}

.loading-progress-bar {
  width: 100%;
  height: 6px;
  background: var(--bg-lighter);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.loading-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  border-radius: 3px;
  transition: width 0.3s ease;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.loading-progress-text {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 600;
}

/* Loading Content */
.loading-content {
  margin-bottom: 1rem;
}

.loading-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.loading-subtitle {
  font-size: 1rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

/* Loading Dots */
.loading-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary);
  animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
.dot:nth-child(3) { animation-delay: 0s; }

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Background Animation */
.loading-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  overflow: hidden;
}

.loading-shape {
  position: absolute;
  border-radius: 50%;
  background: var(--primary-ultralight);
  animation: float 6s infinite ease-in-out;
}

.shape-1 {
  width: 80px;
  height: 80px;
  top: -20px;
  left: -20px;
  animation-delay: 0s;
}

.shape-2 {
  width: 60px;
  height: 60px;
  bottom: -10px;
  right: 30px;
  animation-delay: -2s;
}

.shape-3 {
  width: 40px;
  height: 40px;
  top: 50%;
  right: -10px;
  animation-delay: -4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.1;
  }
}

/* Inline Loading */
.inline-loading {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
}

.inline-loading-small {
  font-size: 0.875rem;
}

.inline-loading-medium {
  font-size: 1rem;
}

.inline-spinner {
  animation: spin 1s linear infinite;
}

.inline-loading-text {
  font-weight: 500;
}

/* Skeleton Loading */
.skeleton {
  background: var(--bg-white);
  border-radius: var(--border-radius);
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid var(--border-light);
}

.skeleton-card {
  animation: skeleton-pulse 1.5s infinite;
}

.skeleton-table {
  animation: skeleton-pulse 1.5s infinite;
}

.skeleton-text {
  animation: skeleton-pulse 1.5s infinite;
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.skeleton-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-lighter);
}

.skeleton-line {
  height: 12px;
  background: var(--bg-lighter);
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.skeleton-line.medium {
  width: 60%;
}

.skeleton-line.long {
  width: 80%;
}

.skeleton-line.short {
  width: 40%;
}

.skeleton-content {
  margin-top: 1rem;
}

.skeleton-table-row {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-light);
}

.skeleton-table-cell {
  flex: 1;
  height: 16px;
  background: var(--bg-lighter);
  border-radius: 4px;
}

.skeleton-table-cell:nth-child(2) {
  flex: 2;
}

.skeleton-table-cell:nth-child(3) {
  flex: 3;
}

@keyframes skeleton-pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .loading-screen {
    min-height: 50vh;
    padding: 1rem;
  }
  
  .loading-title {
    font-size: 1.25rem;
  }
  
  .loading-subtitle {
    font-size: 0.9rem;
  }
  
  .loading-icon {
    width: 36px;
    height: 36px;
  }
  
  .spinner-icon {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 480px) {
  .loading-container {
    max-width: 280px;
  }
  
  .loading-title {
    font-size: 1.125rem;
  }
  
  .loading-subtitle {
    font-size: 0.875rem;
  }
}
`;

// Inject loading styles
if (!document.querySelector('#loading-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'loading-styles';
  styleSheet.textContent = loadingStyles;
  document.head.appendChild(styleSheet);
}
