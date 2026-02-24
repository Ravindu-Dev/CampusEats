// Firebase Messaging Service Worker
// This handles background push notifications (when the app is not in focus)

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Replace with your Firebase config (same values as firebase-config.js)
firebase.initializeApp({
    apiKey: "AIzaSyDakuxScGMyhVm7qCZ9JwnwOvxP8teVHPQ",
    authDomain: "campuseats-f3c66.firebaseapp.com",
    projectId: "campuseats-f3c66",
    storageBucket: "campuseats-f3c66.firebasestorage.app",
    messagingSenderId: "963309307069",
    appId: "1:963309307069:web:bd917eebec23247fcba3d4",
    measurementId: "G-53H4N4RNNW"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'CampusEats';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new update!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: payload.data?.orderId || 'order-update',
        data: payload.data,
        vibrate: [200, 100, 200],
        actions: [
            { action: 'view', title: 'View Order' }
        ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click:', event);
    event.notification.close();

    const orderId = event.notification.data?.orderId;
    const urlToOpen = orderId ? `/orders` : '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If there's already an open window, focus it and navigate
            for (const client of clientList) {
                if (client.url.includes(self.location.origin)) {
                    client.focus();
                    client.navigate(urlToOpen);
                    return;
                }
            }
            // Otherwise, open a new window
            return clients.openWindow(urlToOpen);
        })
    );
});
