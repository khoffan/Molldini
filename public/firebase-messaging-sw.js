// 1. Import Firebase scripts สำหรับ Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// 2. ตั้งค่า Firebase (ใช้ Config ชุดเดียวกับหน้าบ้าน)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
  measurementId: import.meta.env.VITE_FB_MEASUREMENT_ID
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