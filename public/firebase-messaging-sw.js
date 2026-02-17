// 1. Import Firebase scripts สำหรับ Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// 2. ตั้งค่า Firebase (ใช้ Config ชุดเดียวกับหน้าบ้าน)
const firebaseConfig = {
  apiKey: '__FB_API_KEY__',
  authDomain: '__FB_AUTH_DOMAIN__',
  projectId: '__FB_PROJECT_ID__',
  storageBucket: '__FB_STORAGE_BUCKET__',
  messagingSenderId: '__FB_MESSAGING_SENDER_ID__',
  appId: '__FB_APP_ID__',
  measurementId: '__FB_MEASUREMENT_ID__'
};

// 3. Initialize Firebase
firebase.initializeApp(firebaseConfig);

// 4. ดึง Messaging instance มาใช้
const messaging = firebase.messaging();

// 5. จัดการเมื่อได้รับ Notification ตอนปิดหน้าเว็บ (Background Handler)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png' // ใส่ Path รูป Icon ของเว็บคุณ
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});