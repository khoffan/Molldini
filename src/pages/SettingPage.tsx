import { useState } from 'react';
import { User, Bell, Lock, Store, Save } from 'lucide-react'; // แนะนำให้ลง lucide-react หรือใช้ SVG แทนได้ครับ
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { UserRole } from '../interface/userInterface';

export default function SettingPage() {
    const [activeTab, setActiveTab] = useState('general');

    const { user } = useSelector((state: RootState) => state.user);
    console.log("user", user);
    const isMerchant = user?.role === UserRole.MERCHANT;
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

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500">Manage your account settings and preferences.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Tabs */}
                <aside className="w-full md:w-64 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </aside>

                {/* Settings Content */}
                <main className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6">
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                                    <p className="text-sm text-gray-500">Update your personal details.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">Display Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="Your name"
                                            value={user?.displayName}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                                        <input
                                            type="email"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 outline-none"
                                            disabled
                                            value={user?.email}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                                    <p className="text-sm text-gray-500">Choose what updates you want to receive.</p>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { title: 'Email Notifications', desc: 'Get updates about your orders via email.' },
                                        { title: 'Merchant Updates', desc: 'New features and tips for your shop.' },
                                        { title: 'Stock Alerts', desc: 'Notify when products are low in stock.' }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between py-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                                                <p className="text-xs text-gray-500">{item.desc}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked={idx === 0} />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                                    <h3 className="text-lg font-medium text-gray-900">Store Details</h3>
                                    <p className="text-sm text-gray-500">Configure your public store profile.</p>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">Store Name</label>
                                        <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="My Awesome Shop" value={merchant?.name} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">Business Address</label>
                                        <textarea className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="123 Store St..." value={merchant?.address?.detail} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Action */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm">
                            <Save size={18} />
                            <span>Save Changes</span>
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}