// utils/notifications.js
export const showNotification = (message, type = 'info', duration = 5000) => {
  // Remove any existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => {
    if (document.body.contains(notification)) {
      notification.remove();
    }
  });

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.setAttribute('role', 'alert');
  notification.setAttribute('aria-live', 'polite');
  
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const typeLabels = {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information'
  };

  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-icon" aria-hidden="true">${icons[type] || icons.info}</div>
      <div class="notification-text">
        <div class="notification-type">${typeLabels[type] || 'Notification'}</div>
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close" aria-label="Close notification">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      <div class="notification-progress"></div>
    </div>
  `;
  
  document.body.appendChild(notification);

  // Add entrance animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  // Handle close button
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    removeNotification(notification);
  });

  // Auto-remove after duration
  let autoRemoveTimeout = setTimeout(() => {
    removeNotification(notification);
  }, duration);

  // Progress bar animation
  const progressBar = notification.querySelector('.notification-progress');
  progressBar.style.animation = `progressShrink ${duration}ms linear forwards`;

  // Pause on hover
  notification.addEventListener('mouseenter', () => {
    clearTimeout(autoRemoveTimeout);
    progressBar.style.animationPlayState = 'paused';
  });

  notification.addEventListener('mouseleave', () => {
    const remainingTime = (progressBar.offsetWidth / progressBar.parentElement.offsetWidth) * duration;
    autoRemoveTimeout = setTimeout(() => {
      removeNotification(notification);
    }, remainingTime);
    progressBar.style.animationPlayState = 'running';
  });

  // Accessibility: auto-focus close button for screen readers
  setTimeout(() => {
    closeBtn.focus();
  }, 100);
};

const removeNotification = (notification) => {
  notification.classList.remove('show');
  notification.classList.add('hide');
  
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  }, 300);
};

// Multiple notifications support
export const showMultipleNotifications = (notifications) => {
  notifications.forEach((notification, index) => {
    setTimeout(() => {
      showNotification(notification.message, notification.type, notification.duration);
    }, index * 300); // Stagger notifications
  });
};

// Promise-based notification
export const showPromiseNotification = (promise, options) => {
  const { loading, success, error } = options;
  
  showNotification(loading, 'info', 0); // No auto-close for loading
  
  return promise
    .then((result) => {
      // Remove loading notification
      const notifications = document.querySelectorAll('.notification');
      if (notifications.length > 0) {
        notifications[0].remove();
      }
      showNotification(success, 'success');
      return result;
    })
    .catch((err) => {
      // Remove loading notification
      const notifications = document.querySelectorAll('.notification');
      if (notifications.length > 0) {
        notifications[0].remove();
      }
      showNotification(error || err.message, 'error');
      throw err;
    });
};

// Add CSS for enhanced notifications
const notificationStyles = `
@keyframes notificationSlideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes notificationSlideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

@keyframes progressShrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  min-width: 320px;
  max-width: 400px;
  background: var(--bg-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border-light);
  border-left: 4px solid var(--border-medium);
  z-index: 10000;
  transform: translateX(100%);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification.show {
  transform: translateX(0);
  opacity: 1;
}

.notification.hide {
  transform: translateX(100%);
  opacity: 0;
}

.notification.success {
  border-left-color: var(--success);
}

.notification.error {
  border-left-color: var(--error);
}

.notification.warning {
  border-left-color: var(--warning);
}

.notification.info {
  border-left-color: var(--info);
}

.notification-content {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem 1rem 1rem;
}

.notification-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
  font-size: 0.75rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.notification.success .notification-icon {
  background: var(--success);
  color: white;
}

.notification.error .notification-icon {
  background: var(--error);
  color: white;
}

.notification.warning .notification-icon {
  background: var(--warning);
  color: white;
}

.notification.info .notification-icon {
  background: var(--info);
  color: white;
}

.notification-text {
  flex: 1;
  min-width: 0;
}

.notification-type {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
  color: var(--text-muted);
}

.notification-message {
  color: var(--text-primary);
  font-size: 0.9rem;
  line-height: 1.4;
  word-wrap: break-word;
}

.notification-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: var(--border-radius);
  transition: var(--transition);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.notification-close:focus {
  outline: 2px solid var(--primary);
  outline-offset: 1px;
}

.notification-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: currentColor;
  border-radius: 0 0 0 var(--border-radius-lg);
  opacity: 0.3;
}

.notification.success .notification-progress {
  background: var(--success);
}

.notification.error .notification-progress {
  background: var(--error);
}

.notification.warning .notification-progress {
  background: var(--warning);
}

.notification.info .notification-progress {
  background: var(--info);
}

/* Stack multiple notifications */
.notification:nth-child(1) { top: 20px; }
.notification:nth-child(2) { top: 100px; }
.notification:nth-child(3) { top: 180px; }
.notification:nth-child(4) { top: 260px; }

@media (max-width: 768px) {
  .notification {
    left: 1rem;
    right: 1rem;
    min-width: auto;
    max-width: none;
    top: 1rem !important;
  }
  
  .notification-content {
    padding: 0.875rem 1rem 0.875rem 0.875rem;
  }
}

@media (max-width: 480px) {
  .notification {
    left: 0.5rem;
    right: 0.5rem;
  }
}
`;

// Inject styles
if (!document.querySelector('#notification-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'notification-styles';
  styleSheet.textContent = notificationStyles;
  document.head.appendChild(styleSheet);
}
