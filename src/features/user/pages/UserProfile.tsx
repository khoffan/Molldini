import {
    Package,
    MapPin,
    CreditCard,
    Settings,
    LogOut,
    ChevronRight,
    Camera
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../store';
import { Link, useNavigate } from 'react-router';
import { logoutAction } from '../../auth/service/authService';
import { useEffect } from 'react';
import { fetchUser } from '../services/userService';
import LoadingCircularSkelition from '../../../common/components/loadingComponent/LoadingCircularSkelition';

function UserProfile() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user, loading } = useSelector((state: RootState) => state.user);


    const handleLogout = () => {
        dispatch(logoutAction());
        navigate("/");
    }

    useEffect(() => {
        dispatch(fetchUser());
    }, [dispatch])

    const menuItems = [
        { icon: <Package size={20} />, label: "คำสั่งซื้อของฉัน", desc: "ติดตามสถานะสินค้าและประวัติการซื้อ", link: "/profile/orders" },
        { icon: <MapPin size={20} />, label: "ที่อยู่ในการจัดส่ง", desc: "จัดการที่อยู่สำหรับรับสินค้า", link: "/profile/address" },
        { icon: <CreditCard size={20} />, label: "ช่องทางการชำระเงิน", desc: "จัดการบัตรเครดิตและวอลเล็ต", link: '/payments' },
        { icon: <Settings size={20} />, label: "ตั้งค่าบัญชี", desc: "เปลี่ยนรหัสผ่านและการแจ้งเตือน", link: '/settings' },
    ];

    if (loading) {
        return <LoadingCircularSkelition />;
    }

    return (
        <div className="bg-main min-h-screen pb-20">
            {/* Header Blue Section */}
            <div className="bg-primary h-48 w-full relative">
                <div className="max-w-4xl mx-auto px-4 h-full flex items-end pb-8">
                    <h1 className="text-white text-2xl font-bold">บัญชีของฉัน</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-4">
                {/* Main Profile Card */}
                <div className="bg-surface rounded-3xl shadow-sm border border-border-main p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative">
                        {user?.image?.url ? (
                            <img src={user?.image?.url} alt="" className="h-32 w-32 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary transition-all" />
                        ) : (
                            <div className="h-32 w-32 rounded-full bg-primary flex items-center justify-center text-white text-5xl font-bold ring-2 ring-transparent group-hover:ring-primary">
                                {user?.displayName?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <button className="absolute bottom-1 right-1 bg-surface p-2 rounded-full shadow-lg border border-border-main text-primary hover:bg-primary-light transition-colors">
                            <Camera size={16} />
                        </button>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl font-black text-content">{user?.displayName}</h2>
                        <p className="text-muted font-medium">{user?.email}</p>
                        <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="bg-primary-light px-4 py-2 rounded-xl">
                                <p className="text-xs text-primary/70 uppercase font-bold tracking-wider">คะแนนสะสม</p>
                            </div>
                            <div className="bg-main px-4 py-2 rounded-xl border border-border-main">
                                <p className="text-xs text-muted uppercase font-bold tracking-wider">สมาชิกตั้งแต่</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menu Section */}
                <div className="mt-8 grid grid-cols-1 gap-4">
                    <h3 className="text-sm font-bold text-muted uppercase ml-2 mb-2 tracking-widest">การจัดการ</h3>

                    {menuItems.map((item, index) => (
                        <Link
                            to={item.link}
                            key={index}
                            className="group flex items-center gap-4 bg-surface p-4 rounded-2xl border border-border-main shadow-sm hover:border-primary/30 hover:shadow-md transition-all text-left"
                        >
                            <div className="bg-primary-light p-3 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                {item.icon}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-content">{item.label}</p>
                                <p className="text-sm text-muted">{item.desc}</p>
                            </div>
                            <ChevronRight size={20} className="text-muted group-hover:text-primary transition-colors" />
                        </Link>
                    ))}

                    {/* Logout Button */}
                    <button onClick={handleLogout} className="mt-4 flex items-center justify-center gap-2 w-full py-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-colors">
                        <LogOut size={20} />
                        ออกจากระบบ
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UserProfile;
