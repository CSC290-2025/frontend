import {
  createContext,
  type ReactNode,
  useState,
  useEffect,
  useContext,
} from 'react';
import { getFCMToken, message } from '@/features/emergency/config/firebase.ts';
import FCMApi from '@/features/emergency/api/fcm.api.ts';
import { onMessage } from 'firebase/messaging';
import { toast } from 'sonner';

type Message = {
  title: string;
  body: string;
  timestamp?: number;
};

type NotificationState = {
  isLoading: boolean;
  sendAllNotification: (title: string, body: string) => void;
  msgLocal: Message[];
};

const NotificationContext = createContext<NotificationState | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [fcmToken, setFcmToken] = useState('');
  const [notificationAccess, setNotificationAccess] = useState(false);

  const expireTime = 8 * 60 * 60 * 1000;

  const keyMsg = 'Message';
  const [msgLocal, setMsgLocal] = useState<Message[]>(() => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }

    const persistedValue = window.localStorage.getItem(keyMsg);

    return persistedValue !== null ? JSON.parse(persistedValue) : [];
  });

  async function requestNotificationAccess() {
    if (typeof window !== 'undefined') {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        setNotificationAccess(true);
        console.log('Notification permission granted.');

        const token = await getFCMToken();
        if (token) setFcmToken(token);
      } else {
        setNotificationAccess(false);
        console.log('Unable to get permission to notify.');
      }
    }
  }

  async function sendAllNotification(title: string, body: string) {
    setIsLoading(true);
    try {
      console.log(title, body);
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

  useEffect(() => {
    requestNotificationAccess();
    const unsubscribe = onMessage(message, (payload) => {
      const newMsg: Message = {
        title: payload.notification?.title || '',
        body: payload.notification?.body || '',
        timestamp: Date.now(),
      };
      toast(`${newMsg.title}`, {
        description: newMsg.body,
        position: 'bottom-right',
      });

      setMsgLocal((prev) => {
        let existItem = false;
        prev.forEach((p) => {
          if (p.title === newMsg.title && p.body === newMsg.body) {
            existItem = true;
          }
        });

        if (!existItem) {
          return [...prev, newMsg];
        }
        return prev;
      });
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const now = Date.now();
    const arr = msgLocal.filter((a) => {
      return a.timestamp !== undefined && a.timestamp >= now - expireTime;
    });

    if (arr.length !== msgLocal.length) {
      setMsgLocal(arr);
    }
    localStorage.setItem(keyMsg, JSON.stringify(arr));
  }, [msgLocal]);

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
