import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router';
import type { RootState } from '../store'; // ปรับ path ตามโปรเจกต์คุณ

const GuestRoute = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    // ถ้ามี User อยู่ใน State (ล็อกอินแล้ว) ให้ดีดไปหน้าแรกทันที
    if (user) {
        return <Navigate to="/" replace />;
    }

    // ถ้าไม่มี User ให้แสดงหน้า Login ปกติ
    return <Outlet />;
};

export default GuestRoute;