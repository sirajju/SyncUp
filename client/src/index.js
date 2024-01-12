import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux'
import { store } from './Context/userContext'
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId='682630855398-5la44mk32656m2jak6b0t02785nn0ku1.apps.googleusercontent.com'>
    <Provider store={store}>
      <Toaster />
      <App />
    </Provider>
  </GoogleOAuthProvider>
);
