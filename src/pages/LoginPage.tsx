// src/components/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { auth, provider } from '../firebase/firebaseConfig';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import type {User} from 'firebase/auth';
import {FirebaseError} from 'firebase/app';

const LoginPage: React.FC = () => {
  // กำหนด Type ให้ State เป็น User หรือ null
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async (): Promise<void> => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("User:", result.user);
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
      // ตรงนี้ TypeScript จะรู้แล้วว่า error คือ FirebaseError
      // และจะแนะนำ property อย่าง .code หรือ .message ให้เราอัตโนมัติ
      console.error("Firebase Error Code:", error.code);
      console.error("Message:", error.message);
      
      if (error.code === 'auth/popup-closed-by-user') {
        alert("คุณปิดหน้าต่างก่อนล็อกอินสำเร็จ");
      }
    } else {
      // เผื่อเป็น error จากอย่างอื่นที่ไม่ใช่ Firebase
      console.error("An unexpected error occurred:", error);
    }
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center">
          <img src={user.photoURL || ''} alt="profile" className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-blue-500" />
          <h2 className="text-xl font-bold">สวัสดี, {user.displayName}</h2>
          <p className="text-gray-500 mb-6">{user.email}</p>
          <button 
            onClick={() => signOut(auth)}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800">Sign In</h1>
          <p className="text-gray-500 mt-2">Use your Google account to continue</p>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg transition-all shadow-sm disabled:opacity-50"
        >
          <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-5 h-5" alt="google" />
          {loading ? 'Connecting...' : 'Continue with Google'}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;