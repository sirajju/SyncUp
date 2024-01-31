// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
    apiKey: "AIzaSyCLS6PVZ1u_OdBmr1BGL3qZr8vjGpVWK24",
    authDomain: "syncup-408617.firebaseapp.com",
    projectId: "syncup-408617",
    storageBucket: "syncup-408617.appspot.com",
    messagingSenderId: "682630855398",
    appId: "1:682630855398:web:c10b8e314858c254659927",
    measurementId: "G-YPBXTBNP9R"
  };
firebase.initializeApp(firebaseConfig);


const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
    console.log('Received background message ', payload);
  
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
    };
  
    self.registration.showNotification(notificationTitle,
      notificationOptions);
  });