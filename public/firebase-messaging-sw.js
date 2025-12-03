importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
    apiKey: "AIzaSyDW6ctFsIkjqH3ROZuWxpcRYCHzrbSu_M4", // Using dev key for now, should be dynamic or prod
    authDomain: "copiloto-crmgit-66582830-eaf41.firebaseapp.com",
    projectId: "copiloto-crmgit-66582830-eaf41",
    storageBucket: "copiloto-crmgit-66582830-eaf41.appspot.com",
    messagingSenderId: "34243186092",
    appId: "1:34243186092:web:f826ca386fa549f24c7e09"
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
