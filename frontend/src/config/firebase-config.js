// Firebase configuration for CampusEats
// Replace these values with your Firebase project config from:
// Firebase Console -> Project Settings -> General -> Your apps -> Web app
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: "AIzaSyDakuxScGMyhVm7qCZ9JwnwOvxP8teVHPQ",
    authDomain: "campuseats-f3c66.firebaseapp.com",
    projectId: "campuseats-f3c66",
    storageBucket: "campuseats-f3c66.firebasestorage.app",
    messagingSenderId: "963309307069",
    appId: "1:963309307069:web:bd917eebec23247fcba3d4",
    measurementId: "G-53H4N4RNNW"
};

// VAPID key for web push - get this from:
// Firebase Console -> Project Settings -> Cloud Messaging -> Web configuration -> Key pair
export const VAPID_KEY = "BFfIb248KZc4NlXX-JayjBstOrMhIJAJJLB2Z4F_8EIgGijtJEdutQgUZAPoDLl0xOSyF_dypvh6W9uZ7ZDXt6Y";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
let messaging = null;
try {
    messaging = getMessaging(app);
} catch (error) {
    console.warn('Firebase Messaging not supported in this browser:', error.message);
}

export { messaging, getToken, onMessage };
export default app;
