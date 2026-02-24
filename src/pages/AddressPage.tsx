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

    console.log("user address => ", userAddresses);

    return (
        <div className="min-h-screen bg-main py-10 px-4">
            <div className="max-w-4xl mx-auto">

                {/* Header Section */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-content">ที่อยู่ของฉัน</h1>
                        <p className="text-muted text-sm">จัดการที่อยู่สำหรับจัดส่งสินค้าของคุณ</p>
                    </div>
                    <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl transition-all shadow-sm">
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
                    <div className="bg-surface rounded-3xl p-12 text-center border border-dashed border-border-main">
                        <div className="bg-primary-light w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MapPin className="text-primary" size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-content mb-2">ยังไม่มีที่อยู่จัดส่ง</h3>
                        <p className="text-muted mb-8 max-w-xs mx-auto">
                            คุณยังไม่ได้เพิ่มที่อยู่สำหรับจัดส่งสินค้า กรุณาเพิ่มที่อยู่เพื่อให้เราส่งสินค้าถึงมือคุณได้รวดเร็วขึ้น
                        </p>
                        <Link to={"/profile/address/add"} className="inline-flex items-center gap-2 bg-content hover:bg-content/90 text-surface px-8 py-3 rounded-2xl transition-all">
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
                                className={`bg-surface p-6 rounded-2xl border-2 transition-all ${addr.isDefault ? 'border-primary shadow-md' : 'border-surface hover:border-border-main'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-lg text-content">{addr.receiverName}</span>
                                            {addr.isDefault && (
                                                <span className="bg-primary-light text-primary text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                                                    ค่าเริ่มต้น
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-start gap-2 text-muted">
                                            <MapPin size={18} className="mt-1 shrink-0" />
                                            <p className="text-sm leading-relaxed">
                                                {addr.detail} {addr.subDistrict} {addr.district} <br />
                                                {addr.province} {addr.postcode}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 text-muted">
                                            <Phone size={16} />
                                            <span className="text-sm">{addr.phone}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={(e) => handleEditAddress(e, addr)} className="p-2 hover:bg-surface-hover rounded-lg text-muted hover:text-primary transition-colors">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={(e) => handleDeletedAddress(e, addr.id)} className="p-2 hover:bg-surface-hover rounded-lg text-muted hover:text-red-600 transition-colors">
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