import axios from "axios";
import { auth } from "../firebase/firebaseConfig";

const api = axios.create({
    baseURL: import.meta.env.VITE_DEV === 'true' ? '' : import.meta.env.VITE_API_URL,
    // baseURL: '',
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// เปลี่ยนจาก response เป็น request
api.interceptors.request.use(async (config) => {
    // ดักก่อนส่ง Request ออกไป
    const user = auth.currentUser;
    if (user) {
        // ดึง Token ล่าสุด (true คือการบังคับ refresh ถ้าจำเป็น)
        const token = await user.getIdToken(true);
        // ฉีดเข้าไปใน Header
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// ส่วนของ response เอาไว้จัดการ Error 401 อย่างเดียวพอ
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token อาจจะหมดอายุ หรือไม่มีสิทธิ์
            console.warn("Unauthorized! Redirecting to login...");
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);
export default api;