import { getMessaging, getToken } from 'firebase/messaging';
import { message } from '@/lib/firebase.ts';
import TokenApi from '@/features/emergency/api/token.api.ts';
import config from '@/features/emergency/config/env';

const getFCMToken = async () => {
  try {
    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js'
    );
    console.log('Register: ', registration);

    const token = await getToken(message, {
      vapidKey: config.FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    console.log('Token: ', token);
    await TokenApi.storeToken(token);
    return token;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export { getFCMToken, message };
