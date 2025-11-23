// Scripts for firebase and firebase messaging
importScripts(
  'https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js'
);

// Initialize the Firebase app in the service worker by passing the generated config
var firebaseConfig = {
  apiKey: 'AIzaSyCsJQMhxz-av8Dyl2l-jduR2zDJK1mv_rs',
  authDomain: 'sit-integrated-proj-2025.firebaseapp.com',
  projectId: 'sit-integrated-proj-2025',
  storageBucket: 'sit-integrated-proj-2025.appspot.com',
  messagingSenderId: '527846305912',
  appId: '1:527846305912:web:5647f4f27c7d66719a7d8d',
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
