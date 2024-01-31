import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken as getFirebaseToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyCLS6PVZ1u_OdBmr1BGL3qZr8vjGpVWK24",
    authDomain: "syncup-408617.firebaseapp.com",
    projectId: "syncup-408617",
    storageBucket: "syncup-408617.appspot.com",
    messagingSenderId: "682630855398",
    appId: "1:682630855398:web:c10b8e314858c254659927",
    measurementId: "G-YPBXTBNP9R"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const analytics = getAnalytics(app);

export const GetToken = () => {

    const fetchToken = async () => {
        try {
            const currentToken = await getFirebaseToken(messaging, {
                vapidKey: 'AAAAnu_4OuY:APA91bFzwm4KRZWlqko_ndvvVJ4eeAFa97opZDPkYe4TecbEAy_QsZxfMIrunhvSDk2NpI_bFAJanzxq6FnnM3KRsUGkusYW8dS7DjMpgSZlHn8UKlF9h9H2HbYcuDiGJKKzF5lHVlFr'
            });

            if (currentToken) {
                console.log('Current token for client:', currentToken);
                console.log(true);
            } else {
                console.log('No registration token available. Request permission to generate one.');
                console.log(false);
            }
        } catch (err) {
            console.log('An error occurred while retrieving token. ', err);
        }
    };

    fetchToken();

};
