import { useEffect, useState } from 'react';
import { User, Bell, Lock, Store, Save, Phone, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { UserRole } from '../interface/userInterface';
import { setupNotifications } from '../service/notificationService';
import { fetchUser, updateUser } from '../service/userService';
import LoadingCircularSkelition from '../components/loadingSkeleton/LoadingCircularSkelition';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { showToast } from '../utils/Toast';

interface generalForm {
    displayName: string;
    phoneNumber: string;
}


export default function SettingPage() {
    const dispatch = useDispatch<AppDispatch>();

    const [activeTab, setActiveTab] = useState('general');
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [verifySent, setVerifySent] = useState(false);
    const [verifyError, setVerifyError] = useState<string | null>(null);

    const handleSendVerification = async () => {
        if (!auth.currentUser) return;
        setVerifyLoading(true);
        setVerifyError(null);
        try {
            await sendEmailVerification(auth.currentUser);
            setVerifySent(true);
        } catch {
            setVerifyError('Failed to send verification email. Please try again later.');
        } finally {
            setVerifyLoading(false);
        }
    };



    const { user, loading } = useSelector((state: RootState) => state.user);
    const { permissionStatus } = useSelector((state: RootState) => state.noti)
    const isMerchant = user?.role === UserRole.MERCHANT;
    const [formData, setFormData] = useState<generalForm>({
        displayName: user?.displayName || '',
        phoneNumber: user?.phoneNumber || '',
    });
    let merchant = null;
    if (isMerchant) {
        merchant = user?.merchant
    }
    const tabs = [
        { id: 'general', label: 'General', icon: <User size={18} /> },
        ...(isMerchant ? [{ id: 'store', label: 'Store Settings', icon: <Store size={18} /> }] : []),
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
        { id: 'security', label: 'Security', icon: <Lock size={18} /> },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const saveUpdateProfile = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        console.log(formData, verifySent)

        const displayName = formData.displayName.trim();
        const phoneNumber = formData.phoneNumber.trim();


        if (!/^\d{10}$/.test(phoneNumber)) {
            showToast({
                icon: 'error',
                title: 'Phone number must be exactly 10 digits.'
            });
            return;
        }



        dispatch(updateUser({ displayName, emailVerify: verifySent, phoneNumber }))

    }

    useEffect(() => {
        dispatch(fetchUser())
    }, [dispatch]);


    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName,
                phoneNumber: user?.phoneNumber || '',
            })
        }

    }, [user]);

    if (loading) {
        return <LoadingCircularSkelition />
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-content">Settings</h1>
                <p className="text-muted">Manage your account settings and preferences.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Tabs */}
                <aside className="w-full md:w-64 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                                ? 'bg-primary-light text-primary'
                                : 'text-muted hover:bg-surface-hover'
                                }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </aside>

                {/* Settings Content */}
                <main className="flex-1 bg-surface rounded-xl shadow-sm border border-border-main overflow-hidden">
                    <div className="p-6">
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-content">Profile Information</h3>
                                    <p className="text-sm text-muted">Update your personal details.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-content">Display Name</label>
                                        <input
                                            type="text"
                                            name="displayName"
                                            className="w-full px-4 py-2 border border-border-main rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                            placeholder="Your name"
                                            value={formData.displayName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-content">Email Address</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                className="w-full px-4 py-2 pr-10 border border-border-main rounded-lg bg-main text-muted outline-none"
                                                disabled
                                                value={user?.email}

                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                {user?.emailVerified ? (
                                                    <CheckCircle size={18} className="text-green-500" />
                                                ) : (
                                                    <AlertCircle size={18} className="text-amber-500" />
                                                )}
                                            </div>
                                        </div>
                                        {/* Email Verification Banner */}
                                        {!user?.emailVerified && (
                                            <div className="mt-2 flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Mail size={16} className="text-amber-600 shrink-0" />
                                                    <p className="text-xs text-amber-700">
                                                        {verifySent
                                                            ? 'Verification email sent! Check your inbox.'
                                                            : 'Your email is not verified yet.'}
                                                    </p>
                                                </div>
                                                {!verifySent && (
                                                    <button
                                                        onClick={handleSendVerification}
                                                        disabled={verifyLoading}
                                                        className="shrink-0 px-3 py-1.5 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        {verifyLoading ? 'Sending...' : 'Verify Email'}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        {verifyError && (
                                            <p className="mt-1 text-xs text-red-500">{verifyError}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-content">Phone Number</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Phone size={16} className="text-muted" />
                                            </div>
                                            <input
                                                type="tel"
                                                name='phoneNumber'
                                                className="w-full pl-10 pr-4 py-2 border border-border-main rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                                placeholder="+66 812345678"
                                                value={formData.phoneNumber}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-content">Notifications</h3>
                                    <p className="text-sm text-muted">Choose what updates you want to receive.</p>
                                </div>

                                {/* 🔔 ส่วนเพิ่ม: Web Push Notification Status */}
                                <div className="p-4 bg-primary-light border border-primary/20 rounded-xl mb-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-full ${permissionStatus === 'granted' ? 'bg-green-100 text-green-600' : 'bg-primary-light text-primary'}`}>
                                                <Bell size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-content">Browser Push Notifications</p>
                                                <p className="text-xs text-muted">
                                                    {permissionStatus === 'granted' ? 'Status: Active' : 
                                                     permissionStatus === 'denied' ? 'Status: Blocked' : 
                                                     'Enable to get real-time alerts'}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => dispatch(setupNotifications())}
                                            disabled={permissionStatus === 'granted' || permissionStatus === 'denied'}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                permissionStatus === 'granted'
                                                ? 'bg-green-500 text-white cursor-default'
                                                : permissionStatus === 'denied'
                                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                                : 'bg-primary text-white hover:bg-primary/90 shadow-sm'
                                                }`}
                                        >
                                            {permissionStatus === 'granted' ? 'ON' : permissionStatus === 'denied' ? 'BLOCKED' : 'ENABLE'}
                                        </button>
                                    </div>

                                    {/* กรณีโดนบล็อก แสดงคำแนะนำที่นี่ */}
                                    {permissionStatus === 'denied' && (
                                        <p className="mt-3 text-[10px] text-red-500 bg-red-50 p-2 rounded border border-red-100">
                                            ⚠️ <strong>Permission Blocked:</strong> Please click the tune/lock icon in your browser address bar to allow notifications for Molldini.
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { id: 'email', title: 'Email Notifications', desc: 'Get updates about your orders via email.' },
                                        { id: 'merchant', title: 'Merchant Updates', desc: 'New features and tips for your shop.' },
                                        { id: 'stock', title: 'Stock Alerts', desc: 'Notify when products are low in stock.' }
                                    ].map((item) => (
                                        <div key={item.id} className="flex items-center justify-between py-3 border-b border-border-main last:border-0">
                                            <div>
                                                <p className="text-sm font-medium text-content">{item.title}</p>
                                                <p className="text-xs text-muted">{item.desc}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                // ในอนาคตใช้ value จาก DB: defaultChecked={userSettings[item.id]} 
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 2. แสดง Content Store เฉพาะเมื่อเป็น Merchant เท่านั้น */}
                        {activeTab === 'store' && isMerchant && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-content">Store Details</h3>
                                    <p className="text-sm text-muted">Configure your public store profile.</p>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-content">Store Name</label>
                                        <input type="text" className="w-full px-4 py-2 border border-border-main rounded-lg outline-none focus:ring-2 focus:ring-primary" placeholder="My Awesome Shop" value={merchant?.name} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-content">Business Address</label>
                                        <textarea className="w-full px-4 py-2 border border-border-main rounded-lg outline-none focus:ring-2 focus:ring-primary" rows={3} placeholder="123 Store St..." value={merchant?.address?.detail} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Action */}
                    <div className="px-6 py-4 bg-main border-t border-border-main flex justify-end">
                        <button onClick={saveUpdateProfile} className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm">
                            <Save size={18} />
                            <span>Save Changes</span>
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}