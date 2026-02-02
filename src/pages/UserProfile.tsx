import {
    Package,
    MapPin,
    CreditCard,
    Settings,
    LogOut,
    ChevronRight,
    Camera
} from 'lucide-react';

function UserProfile() {
    // Mock Data
    const user = {
        name: "Dini Molldini",
        email: "contact@molldini.design",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dini",
        memberSince: "มกราคม 2024",
        totalOrders: 12,
        points: 450
    };

    const menuItems = [
        { icon: <Package size={20} />, label: "คำสั่งซื้อของฉัน", desc: "ติดตามสถานะสินค้าและประวัติการซื้อ" },
        { icon: <MapPin size={20} />, label: "ที่อยู่ในการจัดส่ง", desc: "จัดการที่อยู่สำหรับรับสินค้า" },
        { icon: <CreditCard size={20} />, label: "ช่องทางการชำระเงิน", desc: "จัดการบัตรเครดิตและวอลเล็ต" },
        { icon: <Settings size={20} />, label: "ตั้งค่าบัญชี", desc: "เปลี่ยนรหัสผ่านและการแจ้งเตือน" },
    ];

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header Blue Section */}
            <div className="bg-blue-600 h-48 w-full relative">
                <div className="max-w-4xl mx-auto px-4 h-full flex items-end pb-8">
                    <h1 className="text-white text-2xl font-bold">บัญชีของฉัน</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-4">
                {/* Main Profile Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-blue-100">
                            <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                        </div>
                        <button className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-lg border border-gray-100 text-blue-600 hover:bg-blue-50 transition-colors">
                            <Camera size={16} />
                        </button>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl font-black text-gray-900">{user.name}</h2>
                        <p className="text-gray-500 font-medium">{user.email}</p>
                        <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="bg-blue-50 px-4 py-2 rounded-xl">
                                <p className="text-xs text-blue-400 uppercase font-bold tracking-wider">คะแนนสะสม</p>
                                <p className="text-lg font-black text-blue-600">{user.points} <span className="text-xs font-normal">Points</span></p>
                            </div>
                            <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">สมาชิกตั้งแต่</p>
                                <p className="text-sm font-bold text-gray-700">{user.memberSince}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menu Section */}
                <div className="mt-8 grid grid-cols-1 gap-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase ml-2 mb-2 tracking-widest">การจัดการ</h3>

                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            className="group flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all text-left"
                        >
                            <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                {item.icon}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-900">{item.label}</p>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                            <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                        </button>
                    ))}

                    {/* Logout Button */}
                    <button className="mt-4 flex items-center justify-center gap-2 w-full py-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-colors">
                        <LogOut size={20} />
                        ออกจากระบบ
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UserProfile;