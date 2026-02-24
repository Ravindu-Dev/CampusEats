import { messaging, getToken, onMessage, VAPID_KEY } from '../config/firebase-config';
import api from './api';

const FCM_TOKEN_KEY = 'fcm_token';

const notificationService = {

    /**
     * Request notification permission from the user
     */
    requestPermission: async () => {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('Notification permission granted');
                return true;
            } else {
                console.log('Notification permission denied');
                return false;
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    },

    /**
     * Get FCM token for the current device
     */
    getFCMToken: async () => {
        try {
            if (!messaging) {
                console.warn('Firebase Messaging not available');
                return null;
            }

            // Register service worker
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('Service Worker registered:', registration);

            const token = await getToken(messaging, {
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: registration
            });

            if (token) {
                console.log('FCM Token obtained:', token.substring(0, 20) + '...');
                return token;
            } else {
                console.log('No FCM token available. Request permission first.');
                return null;
            }
        } catch (error) {
            console.error('Error getting FCM token:', error);
            return null;
        }
    },

    /**
     * Register FCM token with the backend
     */
    registerToken: async (token) => {
        try {
            await api.post('/fcm/register', { token });
            localStorage.setItem(FCM_TOKEN_KEY, token);
            console.log('FCM token registered with backend successfully');
            return true;
        } catch (error) {
            console.error('Error registering FCM token:', error);
            return false;
        }
    },

    /**
     * Unregister FCM token from the backend (call on logout)
     */
    unregisterToken: async () => {
        try {
            const token = localStorage.getItem(FCM_TOKEN_KEY);
            if (token) {
                await api.delete('/fcm/unregister', { data: { token } });
                localStorage.removeItem(FCM_TOKEN_KEY);
                console.log('FCM token unregistered successfully');
            }
        } catch (error) {
            console.error('Error unregistering FCM token:', error);
        }
    },

    /**
     * Main setup function - call after user login
     * Requests permission, gets token, and registers with backend
     */
    setupNotifications: async () => {
        try {
            // Check if notifications are supported
            if (!('Notification' in window)) {
                console.warn('This browser does not support push notifications');
                return false;
            }

            if (!('serviceWorker' in navigator)) {
                console.warn('Service Workers not supported');
                return false;
            }

            // Request permission
            const permissionGranted = await notificationService.requestPermission();
            if (!permissionGranted) {
                return false;
            }

            // Get FCM token
            const token = await notificationService.getFCMToken();
            if (!token) {
                return false;
            }

            // Register token with backend
            const registered = await notificationService.registerToken(token);
            return registered;

        } catch (error) {
            console.error('Error setting up notifications:', error);
            return false;
        }
    },

    /**
     * Listen for foreground messages (when app is open/focused)
     * Returns an unsubscribe function
     */
    onForegroundMessage: (callback) => {
        if (!messaging) {
            console.warn('Firebase Messaging not available');
            return () => { };
        }

        return onMessage(messaging, (payload) => {
            console.log('Foreground message received:', payload);
            callback(payload);
        });
    }
};

export default notificationService;
