import { initializeApp } from 'firebase/app';
import { onBackgroundMessage } from "firebase/messaging/sw";
import { getMessaging, getToken } from 'firebase/messaging'

const firebaseApp = initializeApp()

const messaging = getMessaging(firebaseApp);
onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
})