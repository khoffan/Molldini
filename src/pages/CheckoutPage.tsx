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
    // 📍 State สำหรับเลือกที่อยู่ (Default เลือกอันที่เป็น isDefault)
    const [selectedAddressId, setSelectedAddressId] = useState<string>(
        user?.addresses?.find(addr => addr.isDefault)?.id || user?.addresses?.[0]?.id || ""
    );

    const [paymentMethod, setPaymentMethod] = useState<string>("promptpay");
    const [selectedShippingId, setSelectedShippingId] = useState<string>(""); // [id, setSelectedShippingId]

    const total = order?.totalPrice || 0;

    console.log("order data => ", order)

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
            <div className="max-w-[1240px] mx-auto px-4">
                <header className="mb-10 text-center lg:text-left">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Checkout</h1>
                    <p className="text-gray-500 mt-2">กรุณาตรวจสอบข้อมูลการจัดส่งและเลือกช่องทางชำระเงิน</p>
                </header>

                <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-12 lg:gap-x-8 lg:items-start xl:gap-x-12">
                    {/* Left Column: Main Content */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-6">

                        {/* 1. Address Section */}
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <MapPin className="text-blue-600" size={20} />
                                    ที่อยู่จัดส่ง
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => navigate('/profile/address/add')}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                                >
                                    <Plus size={16} /> เพิ่มที่อยู่ใหม่
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {user?.addresses?.map((addr) => (
                                    <div
                                        key={addr.id}
                                        onClick={() => setSelectedAddressId(addr.id)}
                                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${selectedAddressId === addr.id
                                            ? 'border-blue-600 bg-blue-50/30 ring-1 ring-blue-600'
                                            : 'border-gray-100 hover:border-gray-300 hover:shadow-sm'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-gray-900">{addr.receiverName}</span>
                                            {selectedAddressId === addr.id && (
                                                <CheckCircle2 className="text-blue-600" size={18} />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 leading-relaxed mb-2">
                                            {addr.detail} {addr.subDistrict} {addr.district} {addr.province} {addr.postcode}
                                        </p>
                                        <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                            {addr.phone}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 2. Shipping Method Section */}
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                                <Truck className="text-blue-600" size={20} />
                                ตัวเลือกการจัดส่ง
                            </h2>
                            <div className="space-y-3">
                                {mockShippingMethods
                                    .filter(method => total >= method.minOrderAmount)
                                    .sort((a, b) => a.sortOrder - b.sortOrder)
                                    .map((method) => (
                                        <div
                                            key={method.id}
                                            onClick={() => setSelectedShippingId(method.id)}
                                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${selectedShippingId === method.id
                                                ? 'border-blue-600 bg-blue-50/30'
                                                : 'border-gray-100 hover:border-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xs font-black text-gray-500 border border-gray-100">
                                                    {method.provider}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{method.name}</p>
                                                    <p className="text-xs text-gray-500">{method.description} • {method.estimatedDays}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-blue-600">
                                                    {method.freeShippingThreshold && total >= method.freeShippingThreshold
                                                        ? "FREE"
                                                        : `฿${method.price}`
                                                    }
                                                </p>
                                                {selectedShippingId === method.id && (
                                                    <div className="flex justify-end mt-1">
                                                        <CheckCircle2 className="text-blue-600" size={16} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </section>

                        {/* 3. Payment Section */}
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                                <CreditCard className="text-blue-600" size={20} />
                                ช่องทางชำระเงิน
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { id: 'PROMPTPAY', label: 'PromptPay', icon: '🏧', method: "promptpay" },
                                    { id: 'TRUEMONEY', label: 'TrueMoney', icon: '💰', method: "truemoney_jumpapp" },
                                    { id: 'CREDIT_CARD', label: 'Credit Card', icon: '💳', method: "credit_card" },
                                    { id: 'COD', label: 'เก็บเงินปลายทาง', icon: '🚚', method: "cod" }
                                ].map((method) => (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => setPaymentMethod(method.method)}
                                        className={`relative p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200 h-28 ${paymentMethod === method.method
                                            ? 'border-blue-600 bg-blue-50/30 text-blue-700'
                                            : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-2xl filter grayscale-[0.5]">{method.icon}</span>
                                        <span className="text-xs font-bold text-center">{method.label}</span>
                                        {paymentMethod === method.method && (
                                            <div className="absolute top-2 right-2">
                                                <CheckCircle2 size={16} className="text-blue-600" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="mt-8 lg:mt-0 lg:col-span-5 xl:col-span-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Package className="text-blue-600" size={20} />
                                สรุปคำสั่งซื้อ
                            </h2>

                            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                                {order?.subOrders?.flatMap((sub) => sub.orderItems || []).map((item) => (
                                    <div key={item.id} className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
                                        <div className="w-14 h-14 bg-gray-50 rounded-lg border border-gray-100 flex-shrink-0 overflow-hidden">
                                            <img src={item.image} className="w-full h-full object-contain mix-blend-multiply" alt={item.title} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-xs text-gray-500">x{item.quantity}</p>
                                                <p className="text-sm font-bold text-gray-900">฿{item.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>ราคารวมสินค้า</span>
                                    <span>฿{total.toLocaleString()}</span>
                                </div>
                                {/* <div className="flex justify-between text-sm text-gray-500">
                                    <span>ค่าจัดส่ง</span>
                                    <span>฿0</span>
                                </div> */}
                                <div className="flex justify-between items-end pt-3 border-t border-gray-100">
                                    <span className="text-base font-bold text-gray-900">ยอดสุทธิ</span>
                                    <span className="text-2xl font-black text-blue-600">฿{total.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-base mt-6 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 group active:scale-[0.98]"
                            >
                                ยืนยันการสั่งซื้อ <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                                <CheckCircle2 size={12} />
                                <span>Secure SSL Encryption</span>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}