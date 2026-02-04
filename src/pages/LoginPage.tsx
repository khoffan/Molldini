// src/components/LoginPage.tsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { auth, provider } from '../firebase/firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { Navigate } from 'react-router';
import { loginSuccess } from '../actions/userAction';
import type { RootState, AppDispatch } from '../store';

const LoginPage: React.FC = () => {
  // กำหนด Type ให้ State เป็น User หรือ null
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const [localLoading, setLocalLoading] = useState<boolean>(false);

  const handleGoogleLogin = async (): Promise<void> => {
    setLocalLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      dispatch(loginSuccess(result.user))
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
      setLocalLoading(false);
    }
  };

  if (user) {
    return <Navigate to="/" replace />
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
          disabled={localLoading || loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg transition-all shadow-sm disabled:opacity-50"
        >
          <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-5 h-5" alt="google" />
          {localLoading || loading ? 'Connecting...' : 'Continue with Google'}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;