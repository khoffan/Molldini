import axios from "axios";
import { auth } from "../firebase/firebaseConfig";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    // baseURL: '',
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// คุณสามารถทำ Interceptors เพื่อจัดการ Error ส่วนกลางได้ที่นี่
api.interceptors.response.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken(true);
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
},
    (error) => {
        console.log("error", error);
        if (error.response?.status === 401) {
            // เช่น ถ้า Token หมดอายุ ให้เด้งไปหน้า Login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
export default api;