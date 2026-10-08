importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp(Object.fromEntries(new URL(self.location).searchParams));
firebase.messaging();

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const requestedPath = event.notification?.data?.FCM_MSG?.data?.path;
  const path = typeof requestedPath === 'string' && requestedPath.startsWith('/') ? requestedPath : '/app';
  const destination = new URL(path, self.location.origin).href;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const current = windows.find((client) => client.url.startsWith(self.location.origin));
      if (current) return current.focus().then(() => current.navigate(destination));
      return clients.openWindow(destination);
    }),
  );
});
