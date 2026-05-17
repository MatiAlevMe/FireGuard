/**
 * FireGuard — Service Worker Registration
 */
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered:', registration.scope);
      } catch (error) {
        console.warn('⚠️ Service Worker registration failed:', error);
      }
    });
  }
}
