export const showNotification = (message, type) => {
  // Remove any existing notifications
  const existingNotifications = document.querySelectorAll('.notification')
  existingNotifications.forEach(notification => notification.remove())
  
  // Create notification element
  const notification = document.createElement('div')
  notification.className = `notification ${type}`
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    ${message}
  `
  
  document.body.appendChild(notification)
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'notificationSlideOut 0.3s ease'
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 300)
  }, 3000)
}