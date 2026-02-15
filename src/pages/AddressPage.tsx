import { MapPin, Plus, Phone, Edit2, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import type { AppDispatch, RootState } from '../store';
import { useEffect } from 'react';
import { fetchUser } from '../service/userService';
import type { Address } from '../interface/addressInterface';
import { deletedAddressById } from '../service/addressService';
import Swal from 'sweetalert2';

export default function AddressPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.user);

    useEffect(() => {
        dispatch(fetchUser());
    }, [dispatch])
    const userAddresses = user?.user?.addresses || [];

    const handleEditAddress = (e: React.MouseEvent<HTMLButtonElement>, address: Address) => {
        e.preventDefault();
        navigate(`/profile/address/edit/${address.id}`, {
            state: {
                address
            }
        });
    }

    const handleDeletedAddress = async (e: React.MouseEvent<HTMLButtonElement>, addrId: string) => {
        e.preventDefault();

        const result = await Swal.fire({
            title: 'ยืนยันการลบ?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ลบเลย'
        });
        if (result.isConfirmed) {
            await dispatch(deletedAddressById(addrId));
            await dispatch(fetchUser());
            Swal.fire('ลบสำเร็จ!', '', 'success');
        }

    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-4xl mx-auto">

                {/* Header Section */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">ที่อยู่ของฉัน</h1>
                        <p className="text-gray-500 text-sm">จัดการที่อยู่สำหรับจัดส่งสินค้าของคุณ</p>
                    </div>
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all shadow-sm">
                        <Link to={"/profile/address/add"}>
                            <Plus size={20} />
                        </Link>
                        <Link to={"/profile/address/add"}>
                            <span className="hidden sm:inline">เพิ่มที่อยู่ใหม่</span>
                        </Link>
                    </button>
                </div>

                {/* 1. กรณีไม่มีข้อมูล (Empty State) */}
                {userAddresses.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300">
                        <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MapPin className="text-blue-500" size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">ยังไม่มีที่อยู่จัดส่ง</h3>
                        <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                            คุณยังไม่ได้เพิ่มที่อยู่สำหรับจัดส่งสินค้า กรุณาเพิ่มที่อยู่เพื่อให้เราส่งสินค้าถึงมือคุณได้รวดเร็วขึ้น
                        </p>
                        <Link to={"/profile/address/add"} className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-2xl transition-all">
                            <Plus size={20} />
                            เพิ่มที่อยู่ตอนนี้
                        </Link>
                    </div>
                ) : (
                    /* 2. กรณีมีข้อมูล (Address List) */
                    <div className="grid gap-4">
                        {userAddresses.map((addr) => (
                            <div
                                key={addr.id}
                                className={`bg-white p-6 rounded-2xl border-2 transition-all ${addr.isDefault ? 'border-blue-600 shadow-md' : 'border-white hover:border-gray-200'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-lg text-gray-900">{addr.receiverName}</span>
                                            {addr.isDefault && (
                                                <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                                                    ค่าเริ่มต้น
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-start gap-2 text-gray-600">
                                            <MapPin size={18} className="mt-1 flex-shrink-0" />
                                            <p className="text-sm leading-relaxed">
                                                {addr.detail} {addr.subDistrict} {addr.district} <br />
                                                {addr.province} {addr.postcode}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Phone size={16} />
                                            <span className="text-sm">{addr.phone}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={(e) => handleEditAddress(e, addr)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-colors">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={(e) => handleDeletedAddress(e, addr.id)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-600 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}