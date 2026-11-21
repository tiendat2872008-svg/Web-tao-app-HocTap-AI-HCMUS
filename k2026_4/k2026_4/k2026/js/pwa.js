// Service workers require a secure origin: HTTPS in production or localhost for development.
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .catch(error => console.warn('Không thể đăng ký service worker:', error));
  });
}
