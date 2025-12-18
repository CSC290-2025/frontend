import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { getFCMToken, message } from '@/features/emergency/config/firebase.ts';
import FCMApi from '@/features/emergency/api/fcm.api.ts';
import { onMessage } from 'firebase/messaging';
import { toast } from 'sonner';
import TokenApi from '@/features/emergency/api/token.api.ts';
import { apiClient } from '@/lib/apiClient.ts';

type Message = {
  title: string;
  body: string;
  timestamp?: number;
};

type NotificationState = {
  isLoading: boolean;
  sendAllNotification: (title: string, body: string) => Promise<void>;
  msgLocal: Message[];
};

const NotificationContext = createContext<NotificationState | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [fcmToken, setFcmToken] = useState('');
  const [notificationAccess, setNotificationAccess] = useState(false);

  const expireTime = 7 * 60 * 60 * 1000;

  const keyMsg = 'Message';
  const [msgLocal, setMsgLocal] = useState<Message[]>(() => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }

    const persistedValue = window.localStorage.getItem(keyMsg);
    return persistedValue !== null ? JSON.parse(persistedValue) : [];
  });

  async function requestNotificationAccess() {
    if (typeof window === 'undefined') return;

    try {
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') return;

      const token = await getFCMToken();
      if (token) {
        setFcmToken(token);
        const me = await apiClient.get('/auth/me');
        await TokenApi.storeToken(token, me.data.data.userId);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function sendAllNotification(
    title: string,
    body: string
  ): Promise<void> {
    setIsLoading(true);
    try {
      await FCMApi.sendAllNotification({
        title,
        body,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function sendTokenNotification(
    title: string,
    body: string,
    userId: string
  ): Promise<void> {
    setIsLoading(true);
    try {
      const findToken = await TokenApi.getTokensById(userId);
      if (!findToken) return;

      await FCMApi.sendTokenNotification({
        token: findToken.data.token,
        notification: {
          title,
          body,
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const isDuplicate = (list: Message[], msg: Message) => {
    return list.some((m) => m.title === msg.title && m.body === msg.body);
  };

  useEffect(() => {
    requestNotificationAccess();

    return onMessage(message, (payload) => {
      const newMsg: Message = {
        title: payload.notification?.title || '',
        body: payload.notification?.body || '',
        timestamp: Date.now(),
      };
      toast(`${newMsg.title}`, {
        description: newMsg.body,
        position: 'bottom-right',
      });

      setMsgLocal((prev) =>
        isDuplicate(prev, newMsg) ? prev : [...prev, newMsg]
      );
    });
  }, []);

  useEffect(() => {
    if (msgLocal.length === 0) return;

    const time = setInterval(() => {
      const now = Date.now();
      const arr = msgLocal.filter((a) => {
        return a.timestamp !== undefined && a.timestamp >= now - expireTime;
      });

      if (arr.length !== msgLocal.length) {
        setMsgLocal(arr);
      }
      localStorage.setItem(keyMsg, JSON.stringify(msgLocal));
    }, 500);
    return () => clearInterval(time);
  }, [msgLocal, expireTime]);

  return (
    <NotificationContext.Provider
      value={{
        isLoading,
        msgLocal,
        sendAllNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error('useNotification must be used within NotificationProvider');
  return context;
};
