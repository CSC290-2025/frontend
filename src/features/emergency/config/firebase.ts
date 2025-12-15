import { getToken } from 'firebase/messaging';
import { message } from '@/lib/firebase.ts';
import TokenApi from '@/features/emergency/api/token.api.ts';
import config from '@/features/emergency/config/env';
import { apiClient } from '@/lib/apiClient';

const getMe = () => {
  return apiClient.get('/auth/me');
};

const getFCMToken = async () => {
  try {
    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js'
    );

    const token = await getToken(message, {
      vapidKey: config.FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    const me = await getMe();

    await TokenApi.storeToken(token, me.data.data.userId);
    return token;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export { getFCMToken, message };
