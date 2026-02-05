import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// คุณสามารถทำ Interceptors เพื่อจัดการ Error ส่วนกลางได้ที่นี่
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // เช่น ถ้า Token หมดอายุ ให้เด้งไปหน้า Login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
export default api;