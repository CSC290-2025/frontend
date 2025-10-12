import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';
import TokenApi from '@/features/emergency/api/token.ts';
import config from '@/features/emergency/config/env';

const firebaseConfig = {
  apiKey: config.FIREBASE_API_KEY,
  authDomain: config.FIREBASE_AUTH_DOMAIN,
  projectId: config.FIREBASE_PROJECT_ID,
  storageBucket: config.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID,
  appId: config.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const getFCMToken = async (cb: (token: string) => void) => {
  try {
    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js'
    );
    console.log('Register: ', registration);

    const token = await getToken(messaging, {
      vapidKey: config.FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    cb(token);
    console.log('Token: ', token);
    await TokenApi.storeToken(token);
  } catch (error) {
    console.error(error);
    return null;
  }
};

export { getFCMToken, messaging };
