import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import RegistrationForm from '../components/RegistrationForm';
import MerchantDashboard from '../components/MerchantDashboard';
import { useEffect } from 'react';
import { fetchMyMerchant } from '../actions/merchantAction';
// สมมติว่าคุณมี action ในการดึงข้อมูล merchant
// import { fetchMyMerchant } from '../store/slices/merchantSlice';

function MerchantPage() {

    // 1. ดึงข้อมูลจาก Redux Store
    const { merchant, loading } = useSelector((state: RootState) => state.merchant);
    console.log("merchant", merchant);
    const { user } = useSelector((state: RootState) => state.auth);
    // 2. แสดงผล Loading ระหว่างรอข้อมูล
    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

                {merchant ? (
                    // ✅ Case 1: มีข้อมูล Merchant แล้ว (โชว์ Dashboard)
                    <div className="space-y-6">
                        <header className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Welcome, {merchant.name}</h1>
                                <p className="text-gray-500">Manage your store and products here.</p>
                            </div>
                            {merchant.logoUrl && (
                                <img src={merchant.logoUrl} alt="Logo" className="h-16 w-16 rounded-full object-cover border" />
                            )}
                        </header>

                        <MerchantDashboard merchant={merchant} />
                    </div>
                ) : (
                    // ❌ Case 2: ยังไม่มีร้านค้า (โชว์ Form สมัคร)
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Become a Merchant</h1>
                            <p className="text-gray-600 mt-2">Start selling your products on MOLLdini today.</p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <RegistrationForm userId={user?.uid} />
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default MerchantPage;