import { useEffect, useState } from 'react';
import {
  getFCMToken,
  messaging,
} from '@/features/emergency/config/firebase.ts';
import { onMessage } from 'firebase/messaging';
import FCMApi from '@/features/emergency/api/fcm.ts';
import { toast } from 'sonner';

export default function NotificationPage() {
  const [notificationAccess, setNotificationAccess] = useState(false);
  const [fcmToken, setFcmToken] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [topic, setTopic] = useState('');
  const [subscriptionTopic, setSubscriptionTopic] = useState('');

  const requestNotificationAccess = () => {
    if (typeof window !== 'undefined') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          setNotificationAccess(true);
          console.log('Notification permission granted.');
          getFCMToken((token: string) => {
            setFcmToken(token);
          });
        } else {
          setNotificationAccess(false);
          console.log('Unable to get permission to notify.');
        }
      });
    }
  };

  const sendAllNotification = async () => {
    try {
      const response = await FCMApi.sendAllNotification({
        title,
        body,
      });
      console.log(response);
    } catch (error) {
      console.error(error);
      alert('Error sending notification');
    }
  };

  // const sendTokenNotification = async () => {
  //     if (!notificationAccess) return alert('Please allow notifications');
  //     if (!fcmToken) return alert('Please get FCM token first');
  //
  //     try {
  //         const response = await FCMApi.sendNotificationToToken(fcmToken, {
  //             title,
  //             body,
  //         });
  //         console.log(response);
  //     } catch (error) {
  //         console.error(error);
  //         alert('Error sending notification');
  //     }
  // };

  // const sendTopicNotification = async () => {
  //     if (!topic) return alert('Please enter topic');
  //     try {
  //         const response = await FCMApi.sendNotificationToTopic(topic, {
  //             title,
  //             body,
  //         });
  //         console.log(response);
  //     } catch (error) {
  //         console.error(error);
  //         alert('Error sending notification');
  //     }
  // };
  //
  // const subscribeToTopic = async () => {
  //     if (!subscriptionTopic) return alert('Please enter topic');
  //     if (!fcmToken) return alert('Please get FCM token first');
  //
  //     try {
  //         const response = await FCMApi.subscribeToTopic(
  //             fcmToken,
  //             subscriptionTopic
  //         );
  //         if (response.success) {
  //             alert('Subscribed to topic');
  //         }
  //         console.log(response);
  //     } catch (error) {
  //         console.error(error);
  //     }
  // };
  //
  // const unSubscribeToTopic = async () => {
  //     if (!subscriptionTopic) return alert('Please enter topic');
  //     if (!fcmToken) return alert('Please get FCM token first');
  //     try {
  //         const response = await FCMApi.unSubscribeToTopic(
  //             fcmToken,
  //             subscriptionTopic
  //         );
  //         if (response.success) {
  //             alert('Unsubscribed to topic');
  //         }
  //         console.log(response);
  //     } catch (error) {
  //         console.error(error);
  //     }
  // };

  useEffect(() => {
    requestNotificationAccess();
  }, []);

  onMessage(messaging, (payload) => {
    console.log('Received Foreground message ', payload);
    toast(`${payload.notification?.title}`, {
      description: payload.notification?.body,
      position: 'top-right',
    });
  });

  return (
    <>
      <div className="m-4 flex min-h-screen w-full flex-col items-center">
        <h1 className="m-0 w-fit rounded-lg border-2 border-black bg-black p-4 text-center text-4xl font-bold text-white">
          Notification Api Test
        </h1>
        <h1 className="mt-10 text-2xl font-bold">
          {notificationAccess
            ? 'Notification Access Granted'
            : 'Notification Access Denied'}
        </h1>
        <div className="mt-10 flex w-full max-w-2xl flex-col items-center rounded-lg bg-white p-5">
          <h1 className="mb-10 text-center text-2xl font-bold">
            Send Notification
          </h1>
          <input
            type="text"
            placeholder="Enter Title"
            className="h-14 w-full rounded-lg border-2 border-black bg-gray-100 p-5 text-xl focus:outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Enter Body"
            rows={5}
            className="mt-5 w-full rounded-lg border-2 border-black bg-gray-100 p-5 text-xl focus:outline-none"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter Topic"
            className="mt-5 h-14 w-full rounded-lg border-2 border-black bg-gray-100 p-5 text-xl focus:outline-none"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <div className="mt-5 flex w-full flex-row items-center gap-5">
            <button
              className="w-full rounded-lg bg-black p-3 text-xl font-bold text-white"
              onClick={sendAllNotification}
            >
              Send to Everyone
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
