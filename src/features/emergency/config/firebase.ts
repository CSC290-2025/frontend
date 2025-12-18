import { getToken } from 'firebase/messaging';
import { message } from '@/lib/firebase.ts';
import config from '@/features/emergency/config/env';

const getFCMToken = async () => {
  try {
    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js'
    );

    return await getToken(message, {
      vapidKey: config.FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
  } catch (error) {
    console.error(error);
    return null;
  }
};

export { getFCMToken, message };
