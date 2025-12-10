importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
// NOTE: Firebase frontend API keys are designed to be public. 
// Security is enforced through Firebase Security Rules, not the API key.
firebase.initializeApp({
    apiKey: "AIzaSyBJQhE2KfGhSBKv7xXl0y5Q4aNL8xNqZgE",
    authDomain: "copiloto-crm-1764216245.firebaseapp.com",
    projectId: "copiloto-crm-1764216245",
    storageBucket: "copiloto-crm-1764216245.firebasestorage.app",
    messagingSenderId: "1053361705271",
    appId: "1:1053361705271:web:0c458c56b2f0da4c8c5e1a"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/assets/icon-192.png' // Ensure this icon exists
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
