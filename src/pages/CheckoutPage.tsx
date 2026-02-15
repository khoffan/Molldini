/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { MapPin, Plus, CreditCard, ChevronRight, CheckCircle2, Truck, Package } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { useNavigate, useParams } from 'react-router';
import Swal from 'sweetalert2';
import { checkoutOrder, updateDataOrder } from '../service/orderService';
import LoadingSkelition from '../components/LoadingSkelition';
import { clearCart } from '../service/cartService';

Omise.setPublicKey(import.meta.env.VITE_OMISE_PUBLIC_KEY);

export default function CheckoutPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    // ดึงข้อมูล User และ Saved Addresses
    const { user } = useSelector((state: RootState) => state.user);
    const { order, loading } = useSelector((state: RootState) => state.order);
    console.log("🚀 ~ CheckoutPage ~ user:", user)
    // 📍 State สำหรับเลือกที่อยู่ (Default เลือกอันที่เป็น isDefault)
    const [selectedAddressId, setSelectedAddressId] = useState<string>(
        user?.addresses?.find(addr => addr.isDefault)?.id || user?.addresses?.[0]?.id || ""
    );

    const [paymentMethod, setPaymentMethod] = useState<string>("promptpay");
    const [selectedShippingId, setSelectedShippingId] = useState<string>(""); // [id, setSelectedShippingId]

    const total = order?.totalPrice || 0;

    const createSource = (amount: number, method: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const totalAmout = Math.round(amount * 100);

            Omise.createSource(method, {
                amount: totalAmout,
                currency: "THB",
            }, (statusCode: number, response: any) => {
                if (statusCode !== 200) {
                    return reject(response);
                }
                return resolve(response);
            })
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAddressId) {
            return Swal.fire('กรุณาเลือกที่อยู่', 'คุณยังไม่ได้เลือกที่อยู่จัดส่ง', 'warning');
        }

        // 2. ถามความสมัครใจในการชำระเงิน
        const { value: paymentChoice } = await Swal.fire({
            title: 'ยืนยันการสั่งซื้อ',
            text: 'คุณต้องการชำระเงินทันทีเลยหรือไม่?',
            icon: 'question',
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: 'ชำระเงินทันที',
            denyButtonText: 'ชำระเงินภายหลัง',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#2563eb', // สีน้ำเงิน (Pay Now)
            denyButtonColor: '#6b7280',    // สีเทา (Pay Later)
        });

        // ถ้ากด "ยกเลิก" ให้หยุดทำงาน
        if (paymentChoice === undefined || paymentChoice === null) return;

        const address = user?.addresses?.find(a => a.id === selectedAddressId);

        Swal.fire({
            title: 'กำลังสร้างคำสั่งซื้อ...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            const orderAddress = address?.detail + ", " + address?.subDistrict + ", " + address?.district + ", " + address?.province + ", " + address?.postcode;
            const firstName = address?.receiverName?.split(" ")[0];
            const lastName = address?.receiverName?.split(" ")[1];
            // ใช้ Logic เดิมในการส่งข้อมูลไป Backend
            const resultOrder = await dispatch(updateDataOrder({
                cartId: id || '',
                reciveAddress: {
                    address: orderAddress,
                    city: address?.province ?? "",
                    zipCode: address?.postcode ?? ""
                },
                reciveInfo: {
                    firstName: firstName ?? "",
                    lastName: lastName ?? "",
                    phone: address?.phone ?? "",
                },
                paymentMethod: paymentMethod,
            })).unwrap();

            dispatch(clearCart());

            if (paymentChoice === true && paymentMethod !== "cod") {
                console.log("resultOrder: ", resultOrder);
                const source = await createSource(total, paymentMethod);
                console.log("🚀 ~ handleSubmit ~ source:", source)
                Swal.close();
                const chargeResult = await dispatch(checkoutOrder({ source: source.id, orderId: resultOrder.id })).unwrap();
                if (chargeResult.redirectUrl) {
                    window.location.href = chargeResult.redirectUrl;
                    return;
                } else {
                    const code = chargeResult.code
                    navigate("/checkout/qr", {
                        state: {
                            qrUri: code.image.download_uri,
                            orderId: resultOrder.id,
                            amount: total,
                            expiredAt: chargeResult.expiredAt
                        }
                    });
                }
            } else {
                await Swal.fire({
                    icon: 'success',
                    title: 'สั่งซื้อสำเร็จ!',
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/profile/orders'); // ไปหน้าประวัติการสั่งซื้อ
            }



        } catch (err: unknown) {
            if (err instanceof Error) {
                Swal.fire('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถสั่งซื้อได้', 'error');
            } else {
                Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถสั่งซื้อได้', 'error');
            }
        }
    };

    const mockShippingMethods = [
        {
            id: "s1",
            name: "Standard Delivery",
            provider: "FLASH",
            description: "จัดส่งธรรมดา ราคาประหยัด",
            price: 35,
            estimatedDays: "2-3 วัน",
            minOrderAmount: 0,
            freeShippingThreshold: 1000,
            sortOrder: 10
        },
        {
            id: "s2",
            name: "Express Delivery",
            provider: "KERRY",
            description: "จัดส่งด่วนพิเศษ ได้รับไว",
            price: 70,
            estimatedDays: "1-2 วัน",
            minOrderAmount: 200, // ต้องซื้อครบ 200 ถึงจะขึ้นตัวเลือกนี้
            freeShippingThreshold: 2000,
            sortOrder: 20
        },
        {
            id: "s3",
            name: "Lalamove Express",
            provider: "LALAMOVE",
            description: "ส่งด่วนด้วยรถมอเตอร์ไซค์ (เฉพาะพื้นที่)",
            price: 150,
            estimatedDays: "ภายใน 3 ชม.",
            minOrderAmount: 500,
            freeShippingThreshold: null,
            sortOrder: 30
        }
    ];



    if (loading) {
        return <LoadingSkelition />
    }

    return (
        <div className="bg-[#F8FAFC] min-h-screen py-10 font-sans grid">
            <div className="max-w-6xl mx-auto px-4">
                <header className="mb-10 text-center lg:text-left">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Checkout</h1>
                    <p className="text-gray-500 mt-2">กรุณาตรวจสอบข้อมูลการจัดส่งและเลือกช่องทางชำระเงิน</p>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

                    {/* ==========================================
                        SECTION 1: Address (Mobile Order: 1)
                    ========================================== */}
                    <div className="lg:col-span-8 order-1 space-y-6">
                        <section className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-3">
                                    <MapPin className="text-blue-600" size={24} />
                                    ที่อยู่จัดส่ง
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => navigate('/profile/address/add')}
                                    className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline"
                                >
                                    <Plus size={16} /> เพิ่มที่อยู่ใหม่
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {user?.addresses?.map((addr) => (
                                    <div
                                        key={addr.id}
                                        onClick={() => setSelectedAddressId(addr.id)}
                                        className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.id
                                            ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-50'
                                            : 'border-gray-100 hover:border-gray-200'
                                            }`}
                                    >
                                        {selectedAddressId === addr.id && (
                                            <CheckCircle2 className="absolute top-4 right-4 text-blue-600" size={20} />
                                        )}
                                        <p className="font-bold text-gray-900 mb-1">{addr.receiverName}</p>
                                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                            {addr.detail} {addr.subDistrict} {addr.district} {addr.province} {addr.postcode}
                                        </p>
                                        <p className="text-sm font-medium text-gray-700 mt-3">{addr.phone}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 🚚 แทรกลำดับ 1.5: Shipping Methods (สำหรับ Desktop จะต่อท้ายที่อยู่) */}
                        <section className="hidden lg:block bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
                                <Truck className="text-blue-600" size={24} />
                                ตัวเลือกการจัดส่ง
                            </h2>
                            {/* ส่วนนี้คือ Shipping Cards ที่เราคุยกันตอนแรก */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {mockShippingMethods
                                    // กรองเฉพาะตัวที่ยอดสั่งซื้อถึงเกณฑ์ขั้นต่ำ
                                    .filter(method => total >= method.minOrderAmount)
                                    // เรียงลำดับตาม sortOrder
                                    .sort((a, b) => a.sortOrder - b.sortOrder)
                                    .map((method) => (
                                        <div
                                            key={method.id}
                                            onClick={() => setSelectedShippingId(method.id)}
                                            className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${selectedShippingId === method.id
                                                ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-50'
                                                : 'border-gray-100 hover:border-gray-200 bg-white'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">
                                                        {method.provider}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{method.name}</p>
                                                        <p className="text-[10px] text-gray-400">{method.estimatedDays}</p>
                                                    </div>
                                                </div>
                                                {selectedShippingId === method.id && (
                                                    <CheckCircle2 className="text-blue-600" size={18} />
                                                )}
                                            </div>

                                            <div className="mt-4 flex justify-between items-end">
                                                <p className="text-[10px] text-gray-500 max-w-[120px] leading-tight">
                                                    {method.description}
                                                </p>
                                                <p className="font-black text-blue-600">
                                                    {/* Logic ส่งฟรี: ถ้ายอดถึง Threshold ให้เป็น 0 หรือคำว่า "ฟรี" */}
                                                    {method.freeShippingThreshold && total >= method.freeShippingThreshold
                                                        ? "FREE"
                                                        : `฿${method.price}`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </section>
                    </div>

                    {/* ==========================================
                        SECTION 2: Order Summary (Mobile Order: 2)
                    ========================================== */}
                    <div className="lg:col-span-4 order-2 lg:order-1">
                        <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-gray-100 sticky top-10">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <Package className="text-blue-600 lg:hidden" size={24} />
                                สรุปคำสั่งซื้อ
                            </h2>

                            <div className="max-h-60 overflow-y-auto mb-6 pr-2 space-y-4">
                                {order?.items?.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-100 flex-shrink-0">
                                            <img src={item.image} className="w-full h-full object-contain mix-blend-multiply" alt={item.title} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">{item.title}</p>
                                            <p className="text-xs text-gray-400">จำนวน: {item.quantity}</p>
                                            <p className="text-sm font-black text-blue-600">฿{item.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-6 border-t border-gray-50 text-sm">
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>ราคารวมสินค้า</span>
                                    <span>฿{total.toLocaleString()}</span>
                                </div>
                                {/* <div className="flex justify-between text-gray-500 font-medium">
                                    <span>ค่าจัดส่ง</span>
                                    <span>฿{shippingFee.toLocaleString()}</span>
                                </div> */}
                                <div className="flex justify-between items-end pt-2 border-t border-gray-100">
                                    <span className="text-gray-900 font-bold">ยอดสุทธิ</span>
                                    <span className="text-3xl font-black text-blue-600 tracking-tight">
                                        ฿{(total).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* ปุ่มนี้จะแสดงเฉพาะบน Desktop เท่านั้น */}
                            <button
                                type="submit"
                                className="hidden lg:flex w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg mt-8 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 items-center justify-center gap-2 group"
                            >
                                สั่งซื้อตอนนี้ <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* ==========================================
                        SECTION 3: Payment (Mobile Order: 3)
                    ========================================== */}
                    <div className="lg:col-span-8 order-3 lg:order-2 space-y-6">
                        {/* Shipping Methods สำหรับ Mobile (ย้ายมาโชว์ก่อนจ่ายเงิน) */}
                        <section className="lg:hidden bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
                                <Truck className="text-blue-600" size={24} />
                                ตัวเลือกการจัดส่ง
                            </h2>
                            {/* Shipping Cards... */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {mockShippingMethods
                                    // กรองเฉพาะตัวที่ยอดสั่งซื้อถึงเกณฑ์ขั้นต่ำ
                                    .filter(method => total >= method.minOrderAmount)
                                    // เรียงลำดับตาม sortOrder
                                    .sort((a, b) => a.sortOrder - b.sortOrder)
                                    .map((method) => (
                                        <div
                                            key={method.id}
                                            onClick={() => setSelectedShippingId(method.id)}
                                            className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${selectedShippingId === method.id
                                                ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-50'
                                                : 'border-gray-100 hover:border-gray-200 bg-white'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">
                                                        {method.provider}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{method.name}</p>
                                                        <p className="text-[10px] text-gray-400">{method.estimatedDays}</p>
                                                    </div>
                                                </div>
                                                {selectedShippingId === method.id && (
                                                    <CheckCircle2 className="text-blue-600" size={18} />
                                                )}
                                            </div>

                                            <div className="mt-4 flex justify-between items-end">
                                                <p className="text-[10px] text-gray-500 max-w-[120px] leading-tight">
                                                    {method.description}
                                                </p>
                                                <p className="font-black text-blue-600">
                                                    {/* Logic ส่งฟรี: ถ้ายอดถึง Threshold ให้เป็น 0 หรือคำว่า "ฟรี" */}
                                                    {method.freeShippingThreshold && total >= method.freeShippingThreshold
                                                        ? "FREE"
                                                        : `฿${method.price}`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </section>

                        <section className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
                                <CreditCard className="text-blue-600" size={24} />
                                ช่องทางชำระเงิน
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-3 gap-4">
                                {[
                                    { id: 'PROMPTPAY', label: 'PromptPay', icon: '🏧', method: "promptpay" },
                                    { id: 'TRUEMONEY', label: 'True money', icon: '🏧', method: "truemoney_jumpapp" },
                                    { id: 'CREDIT_CARD', label: 'Credit Card', icon: '💳', method: "" },
                                    { id: 'CASH_ON_DELIVERY', label: 'ปลายทาง', icon: '🚚', method: "cod" }
                                ].map((method) => (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => setPaymentMethod(method.method)}
                                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === method.method
                                            ? 'border-blue-600 bg-blue-50 text-blue-600 font-bold'
                                            : 'border-gray-50 text-gray-400 hover:border-gray-200'
                                            }`}
                                    >
                                        <span className="text-2xl">{method.icon}</span>
                                        <span className="text-xs lg:text-sm">{method.label}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* ปุ่มสั่งซื้อสำหรับ Mobile - จะอยู่ล่างสุดของหน้าจอเสมอ */}
                        <div className="lg:hidden pb-10">
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
                            >
                                ยืนยันคำสั่งซื้อ ฿{(total).toLocaleString()}
                            </button>
                            <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-bold">
                                🔒 Secure SSL Checkout
                            </p>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}