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
    <div class="notification-icon">${icons[type] || icons.info}</div>
    <div class="notification-content">
      <div class="notification-title">${typeLabels[type] || typeLabels.info}</div>
      <div class="notification-message">${message}</div>
    </div>
  `;

  // Add to body
  document.body.appendChild(notification);

  // Auto remove after duration
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.style.animation = 'slideOutRight 0.3s ease-in-out forwards';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          notification.remove();
        }
      }, 300);
    }
  }, duration);

  // Add slide out animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  if (!document.querySelector('#notification-animations')) {
    style.id = 'notification-animations';
    document.head.appendChild(style);
  }
};

// Promise-based notification for async operations
export const showPromiseNotification = async (
  promise,
  messages = {
    loading: 'Processing...',
    success: 'Operation completed successfully!',
    error: 'Operation failed'
  }
) => {
  // Show loading notification
  showNotification(messages.loading, 'info', 999999);

  try {
    const result = await promise;
    showNotification(messages.success, 'success');
    return result;
  } catch (error) {
    showNotification(messages.error, 'error');
    throw error;
  }
};

// Export both functions
export default {
  showNotification,
  showPromiseNotification
};
