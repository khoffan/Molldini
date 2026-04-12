import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { ChevronLeft, User, Home } from 'lucide-react';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store';
import type { Address } from '../interface/addressInterface';
import { fetchAddressById } from '../service/addressService';
import { updateAddressData, updateAddressUser } from '../../user/services/userService';

// 1. กำหนด Interface ตาม Model (ไม่รวม Relation)
interface AddressForm {
    receiverName: string;
    phone: string;
    detail: string;
    subDistrict: string;
    district: string;
    province: string;
    postcode: string;
    isDefault: boolean;
}

export default function AddAddressUserPage() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.user);

    // 2. Initial State
    const [formData, setFormData] = useState<AddressForm>({
        receiverName: '',
        phone: '',
        detail: '',
        subDistrict: '',
        district: '',
        province: '',
        postcode: '',
        isDefault: false,
    });

    useEffect(() => {
        if (user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                receiverName: user.displayName,
                phone: user.phoneNumber || '',
                detail: '',
                subDistrict: '',
                district: '',
                province: '',
                postcode: '',
                isDefault: false,
            })
        }
    }, [user,])

    useEffect(() => {
        const fetchAddress = async () => {
            if (location.state.address) {
                const addr: Address = location.state.address;
                setFormData({
                    receiverName: addr.receiverName || '',
                    phone: addr.phone || '',
                    detail: addr.detail || '',
                    subDistrict: addr.subDistrict || '',
                    district: addr.district || '',
                    province: addr.province || '',
                    postcode: addr.postcode || '',
                    isDefault: addr.isDefault || false,
                }); // Spread ข้อมูลใส่ได้เลยถ้า fields ตรงกัน
                return;
            }

            if (id) {
                try {
                    const result = await dispatch(fetchAddressById(id)).unwrap();
                    setFormData({
                        receiverName: result.receiverName || '',
                        phone: result.phone || '',
                        detail: result.detail || '',
                        subDistrict: result.subDistrict || '',
                        district: result.district || '',
                        province: result.province || '',
                        postcode: result.postcode || '',
                        isDefault: result.isDefault || false
                    })
                } catch (e: unknown) {
                    if (e instanceof Error) {
                        Swal.fire('Error', 'ไม่พบข้อมูลที่อยู่', 'error');
                        console.error("Error fetching address:", e.message);
                        navigate('/profile/address');
                    }
                    console.error("Error fetching address:", e);
                }
            }
        }
        fetchAddress()
    }, [id, location.state, dispatch, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (id) {
                console.log("update address user by ", id)
                await dispatch(updateAddressData({
                    addressId: id,
                    userAddress: formData
                })).unwrap();
            } else {
                console.log("add address user")
                await dispatch(updateAddressUser(formData)).unwrap();
            }

            await Swal.fire({
                icon: 'success',
                title: 'บันทึกสำเร็จ',
                timer: 1500,
                showConfirmButton: false
            });
            navigate('/profile/address');
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error("Error saving address:", err.message);
            }
            Swal.fire('Error', 'ไม่สามารถบันทึกที่อยู่ได้', 'error');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-surface-hover rounded-full transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-2xl font-black text-content">เพิ่มที่อยู่ใหม่</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Section 1: ข้อมูลผู้รับ */}
                <div className="bg-surface p-6 rounded-3xl border border-border-main shadow-sm space-y-4">
                    <h2 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                        <User size={16} /> ข้อมูลผู้รับ
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-content">ชื่อ-นามสกุล</label>
                            <input
                                required
                                name="receiverName"
                                value={formData.receiverName}
                                onChange={handleChange}
                                placeholder="ชื่อผู้รับสินค้า"
                                className="w-full px-4 py-3 rounded-xl border border-border-main focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-content">เบอร์โทรศัพท์</label>
                            <input
                                required
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="08X-XXX-XXXX"
                                className="w-full px-4 py-3 rounded-xl border border-border-main focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: รายละเอียดที่อยู่ */}
                <div className="bg-surface p-6 rounded-3xl border border-border-main shadow-sm space-y-4">
                    <h2 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                        <Home size={16} /> รายละเอียดที่อยู่
                    </h2>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-content">ที่อยู่ (เลขที่บ้าน, อาคาร, ถนน)</label>
                        <textarea
                            required
                            name="detail"
                            value={formData.detail}
                            onChange={handleChange}
                            rows={2}
                            placeholder="เช่น 123/45 หมู่บ้าน..."
                            className="w-full px-4 py-3 rounded-xl border border-border-main focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-content">แขวง / ตำบล</label>
                            <input required name="subDistrict" value={formData.subDistrict} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border-main outline-none focus:border-primary transition-all" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-content">เขต / อำเภอ</label>
                            <input required name="district" value={formData.district} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border-main outline-none focus:border-primary transition-all" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-content">จังหวัด</label>
                            <input required name="province" value={formData.province} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border-main outline-none focus:border-primary transition-all" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-content">รหัสไปรษณีย์</label>
                            <input required name="postcode" value={formData.postcode} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border-main outline-none focus:border-primary transition-all" />
                        </div>
                    </div>
                </div>

                {/* Setting Default */}
                <div className="flex items-center gap-3 px-2">
                    <input
                        type="checkbox"
                        id="isDefault"
                        name="isDefault"
                        checked={formData.isDefault}
                        onChange={handleChange}
                        className="w-5 h-5 rounded-md border-border-main text-primary focus:ring-primary"
                    />
                    <label htmlFor="isDefault" className="text-content font-medium">ตั้งเป็นที่อยู่หลัก</label>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98]"
                >
                    บันทึกข้อมูลที่อยู่
                </button>
            </form>
        </div>
    );
}
