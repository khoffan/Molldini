/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { MapPin, Plus, CreditCard, ChevronRight, CheckCircle2, Truck, Package } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { useNavigate, useParams } from 'react-router';
import Swal from 'sweetalert2';
import { checkoutOrder, updateDataOrder } from '../service/orderService';
import LoadingSkelition from '../components/loadingSkeleton/LoadingShrinkBoxSkelition';
import { fetchPayment } from '../service/paymentService';
import { fetchShipping } from '../service/shippingService';

Omise.setPublicKey(import.meta.env.VITE_OMISE_PUBLIC_KEY);

export default function CheckoutPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    // ดึงข้อมูล User และ Saved Addresses
    const { user } = useSelector((state: RootState) => state.user);
    const { order, loading } = useSelector((state: RootState) => state.order);
    const { payments } = useSelector((state: RootState) => state.payment);
    const { shippings } = useSelector((state: RootState) => state.shipping);
    // 📍 State สำหรับเลือกที่อยู่ (Default เลือกอันที่เป็น isDefault)
    const [selectedAddressId, setSelectedAddressId] = useState<string>(
        user?.addresses?.find(addr => addr.isDefault)?.id || user?.addresses?.[0]?.id || ""
    );

    const [paymentMethod, setPaymentMethod] = useState<string>("truemoney_jumpapp");
    const [selectedBank, setSelectedBank] = useState<string>("");
    const [selectedShippingId, setSelectedShippingId] = useState<string>("s1"); // [id, setSelectedShippingId]

    useEffect(() => {
        dispatch(fetchPayment());
        dispatch(fetchShipping());
    }, [dispatch])


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

    const handleSelectPayment = (e: React.MouseEvent<HTMLButtonElement>, method: string) => {
        e.preventDefault();
        e.stopPropagation();
        setPaymentMethod(method);
    }

    const handleSelectBankMethod = (e: React.MouseEvent<HTMLButtonElement>, method: string) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedBank(method);
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
        // const shippingMethod = mockShippingMethods.find(m => m.id === selectedShippingId);

        Swal.fire({
            title: 'กำลังสร้างคำสั่งซื้อ...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            const orderAddress = address?.detail + ", " + address?.subDistrict + ", " + address?.district + ", " + address?.province + ", " + address?.postcode;
            const firstName = address?.receiverName?.split(" ")[0];
            const lastName = address?.receiverName?.split(" ")[1];
            let method = '';
            if (paymentMethod === 'mobile_banking') {
                method = selectedBank
            } else {
                method = paymentMethod
            }
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
                paymentMethod: method,
            })).unwrap();

            // dispatch(clearCart());

            if (paymentChoice === true && method !== "cod") {
                console.log("resultOrder: ", resultOrder);
                const source = await createSource(total, method);
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

    const paymentSections = payments;

    // const mockShippingMethods = [
    //     {
    //         id: "s1",
    //         name: "Standard Delivery",
    //         provider: "FLASH",
    //         description: "จัดส่งธรรมดา ราคาประหยัด",
    //         price: 35,
    //         estimatedDays: "2-3 วัน",
    //         minOrderAmount: 0,
    //         freeShippingThreshold: 1000,
    //         sortOrder: 10,
    //         image: "https://cdn.brandfetch.io/idzqDyW4sQ/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1700855441017"
    //     },
    //     {
    //         id: "s2",
    //         name: "Express Delivery",
    //         provider: "KERRY",
    //         description: "จัดส่งด่วนพิเศษ ได้รับไว",
    //         price: 70,
    //         estimatedDays: "1-2 วัน",
    //         minOrderAmount: 200, // ต้องซื้อครบ 200 ถึงจะขึ้นตัวเลือกนี้
    //         freeShippingThreshold: 4000,
    //         sortOrder: 20,
    //         image: "https://cdn.brandfetch.io/idWh9MmD5j/w/236/h/53/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1732604587406"
    //     },
    //     {
    //         id: "s3",
    //         name: "Standard Delivery",
    //         provider: "J&T Express",
    //         description: "จัดส่งด่วนพิเศษ ได้รับไว",
    //         price: 70,
    //         estimatedDays: "1-2 วัน",
    //         minOrderAmount: 100, // ต้องซื้อครบ 200 ถึงจะขึ้นตัวเลือกนี้
    //         freeShippingThreshold: 6000,
    //         sortOrder: 20,
    //         image: "https://cdn.brandfetch.io/idJ7kFPKaZ/w/521/h/521/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1768878791269"
    //     },
    //     {
    //         id: "s4",
    //         name: "Lalamove Express",
    //         provider: "LALAMOVE",
    //         description: "ส่งด่วนด้วยรถมอเตอร์ไซค์ (เฉพาะพื้นที่)",
    //         price: 150,
    //         estimatedDays: "ภายใน 3 ชม.",
    //         minOrderAmount: 500,
    //         freeShippingThreshold: null,
    //         sortOrder: 30,
    //         image: "https://cdn.brandfetch.io/idUoPQNwIr/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1767342240419"
    //     }
    // ];

    const amount = order?.totalPrice || 0;
    const shippingMethod = shippings.find(m => m.id === selectedShippingId);
    const isFree = shippingMethod?.freeShippingThreshold && amount >= shippingMethod.freeShippingThreshold;
    const shippingCost = isFree ? 0 : shippingMethod?.price || 0;
    const total = amount + shippingCost;



    if (loading) {
        return <LoadingSkelition />
    }

    return (
        <div className="bg-[#F8FAFC] min-h-screen py-10 font-sans grid">
            <div className="max-w-[1240px] mx-auto px-4">
                <header className="mb-10 text-center lg:text-left">
                    <h1 className="text-4xl font-black text-content tracking-tight">Checkout</h1>
                    <p className="text-muted mt-2">กรุณาตรวจสอบข้อมูลการจัดส่งและเลือกช่องทางชำระเงิน</p>
                </header>

                <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-12 lg:gap-x-8 lg:items-start xl:gap-x-12">
                    {/* Left Column: Main Content */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-6">

                        {/* 1. Address Section */}
                        <section className="bg-surface rounded-2xl shadow-sm border border-border-main p-6 overflow-hidden order-1">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-content flex items-center gap-2">
                                    <MapPin className="text-primary" size={20} />
                                    ที่อยู่จัดส่ง
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => navigate('/profile/address/add')}
                                    className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
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
                                            ? 'border-primary bg-primary-light/30 ring-1 ring-primary'
                                            : 'border-border-main hover:border-content/30 hover:shadow-sm'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-content">{addr.receiverName}</span>
                                            {selectedAddressId === addr.id && (
                                                <CheckCircle2 className="text-primary" size={18} />
                                            )}
                                        </div>
                                        <p className="text-sm text-muted leading-relaxed mb-2">
                                            {addr.detail} {addr.subDistrict} {addr.district} {addr.province} {addr.postcode}
                                        </p>
                                        <p className="text-sm font-medium text-content flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-muted"></span>
                                            {addr.phone}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 2. Shipping Method Section */}
                        <section className="bg-surface rounded-2xl shadow-sm border border-border-main p-6">
                            <h2 className="text-lg font-bold text-content flex items-center gap-2 mb-6">
                                <Truck className="text-primary" size={20} />
                                ตัวเลือกการจัดส่ง
                            </h2>
                            <div className="space-y-3">
                                {shippings
                                    .filter(method => total >= method.minOrderAmount)
                                    .sort((a, b) => a.sortOrder - b.sortOrder)
                                    .map((method) => (
                                        <div
                                            key={method.id}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                setSelectedShippingId(method.id)
                                            }}
                                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${selectedShippingId === method.id
                                                ? 'border-primary bg-primary-light/30'
                                                : 'border-border-main hover:border-content/30'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-surface-hover flex items-center justify-center text-xs font-black text-muted border border-border-main">
                                                    <img src={method.image?.url} alt={method.name} className="w-full h-full object-contain" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-content text-sm">{method.name}</p>
                                                    <p className="text-xs text-muted">{method.description} • {method.estimatedDays}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-primary">
                                                    {method.freeShippingThreshold && total >= method.freeShippingThreshold
                                                        ? "FREE"
                                                        : `฿${method.price}`
                                                    }
                                                </p>
                                                {selectedShippingId === method.id && (
                                                    <div className="flex justify-end mt-1">
                                                        <CheckCircle2 className="text-primary" size={16} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </section>

                        {/* 3. Payment Section */}
                        <section className="bg-surface rounded-2xl shadow-sm border border-border-main p-6">
                            <h2 className="text-lg font-bold text-content flex items-center gap-2 mb-6">
                                <CreditCard className="text-primary" size={20} />
                                ช่องทางชำระเงิน
                            </h2>
                            {/* Container หลัก: บนจอใหญ่จะจำกัดความกว้างไว้ตรงกลางเพื่อให้ดูไม่ใหญ่จนเกินไป */}
                            <div className="max-w-4xl mx-auto w-full px-2 sm:px-4">
                                <div className="flex flex-col gap-4"> {/* ใช้ flex-col เพื่อให้เรียงลงมาทั้ง mobile และ desktop */}
                                    {paymentSections.map((section) => (
                                        <div
                                            key={section.id}
                                            className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm ${paymentMethod === section.method
                                                ? 'border-primary ring-1 ring-primary ring-opacity-50'
                                                : 'border-border-main hover:border-content/30'
                                                }`}
                                        >
                                            {/* Header Section */}
                                            <button
                                                onClick={(e) => handleSelectPayment(e, section.method)}
                                                className={`w-full flex items-center justify-between p-5 sm:p-6 transition-colors ${paymentMethod === section.method ? 'bg-primary-light/50' : 'bg-surface'
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className={`p-3 rounded-xl text-3xl shadow-sm ${paymentMethod === section.method ? 'bg-surface' : 'bg-main'
                                                        }`}>
                                                        {section.icon?.url}
                                                    </div>
                                                    <div className="text-left">
                                                        <span className="block font-semibold text-content text-lg">
                                                            {section.label}
                                                        </span>
                                                        <span className="text-xs text-muted uppercase tracking-wider">
                                                            Secure Payment {paymentMethod}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Radio Indicator */}
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === section.method
                                                    ? 'border-primary bg-primary'
                                                    : 'border-muted'
                                                    }`}>
                                                    {paymentMethod === section.method && (
                                                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-in zoom-in-50" />
                                                    )}
                                                </div>
                                            </button>

                                            {/* Expandable Content Section */}
                                            {paymentMethod === section.method && (
                                                <div className="p-6 border-t border-border-main bg-main/30 animate-in fade-in slide-in-from-top-4 duration-300">
                                                    <div className="max-w-md mx-auto"> {/* จำกัดความกว้าง Form ภายในให้พอดีสายตา */}

                                                        {section.id === 'PROMPTPAY' && (
                                                            <div className="text-center py-6 bg-surface rounded-2xl border border-border-main shadow-inner">
                                                                <p className="text-sm font-medium text-muted mb-4">สแกนจ่ายผ่านแอปธนาคารทุกธนาคาร</p>
                                                                <div className="mx-auto w-48 h-48 bg-main flex items-center justify-center rounded-xl border-2 border-dashed border-border-main">
                                                                    <div className="text-center">
                                                                        <span className="block text-3xl mb-2">📸</span>
                                                                        <span className="text-xs text-muted">QR Code จะปรากฏที่นี่</span>
                                                                    </div>
                                                                </div>
                                                                <p className="mt-4 text-[11px] text-muted italic">* QR Code มีอายุการใช้งาน 15 นาที</p>
                                                            </div>
                                                        )}

                                                        {section.id === 'MOBILE_BANKING' && (
                                                            <div className="grid grid-cols-2 gap-3">
                                                                {section.paymentChilds.map(bank => (
                                                                    <button
                                                                        key={bank.id}
                                                                        onClick={(e) => handleSelectBankMethod(e, bank.method)}
                                                                        className={`relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 font-medium shadow-sm border-2 ${selectedBank === bank.method
                                                                            ? 'border-primary bg-primary-light text-primary shadow-md'
                                                                            : 'border-border-main bg-surface text-content hover:border-primary/30 hover:bg-surface-hover'
                                                                            }`}
                                                                    >
                                                                        {/* 🟢 แสดงเครื่องหมายถูกที่มุมขวาบนเมื่อถูกเลือก */}
                                                                        {selectedBank === bank.method && (
                                                                            <div className="absolute top-2 right-2 animate-in zoom-in duration-200">
                                                                                <div className="bg-blue-500 rounded-full p-0.5">
                                                                                    <svg
                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                        className="h-3 w-3 text-white"
                                                                                        viewBox="0 0 20 20"
                                                                                        fill="currentColor"
                                                                                    >
                                                                                        <path
                                                                                            fillRule="evenodd"
                                                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                                            clipRule="evenodd"
                                                                                        />
                                                                                    </svg>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* ส่วนของโลโก้จำลอง */}
                                                                        <div className={`w-12 h-12 rounded-lg mb-2 flex items-center justify-center text-xs font-bold uppercase transition-colors ${selectedBank === bank.method ? 'bg-surface text-primary' : 'bg-surface-hover'
                                                                            }`}>
                                                                            {bank.label.substring(0, 2)}
                                                                        </div>

                                                                        <span className="text-sm tracking-tight">{bank.label}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {section.id === 'CREDIT_CARD' && (
                                                            <div className="space-y-4 bg-surface p-5 rounded-2xl border border-border-main shadow-sm">
                                                                <div>
                                                                    <label className="text-xs font-bold text-muted uppercase mb-1 block">Card Number</label>
                                                                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full p-3 bg-main border border-border-main rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all" />
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <label className="text-xs font-bold text-muted uppercase mb-1 block">Expiry Date</label>
                                                                        <input type="text" placeholder="MM/YY" className="w-full p-3 bg-main border border-border-main rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-xs font-bold text-muted uppercase mb-1 block">CVV</label>
                                                                        <input type="password" placeholder="***" className="w-full p-3 bg-main border border-border-main rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {section.id === 'TRUEMONEY' && (
                                                            <div className="space-y-4 bg-surface p-5 rounded-2xl border border-border-main shadow-sm">
                                                                <div className="flex items-center space-x-3 mb-2">
                                                                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">📱</div>
                                                                    <span className="text-sm font-semibold text-content">TrueMoney Wallet</span>
                                                                </div>
                                                                <input
                                                                    type="tel"
                                                                    placeholder="08X-XXX-XXXX"
                                                                    className="w-full p-3 bg-main border border-border-main rounded-xl focus:ring-2 focus:ring-orange-400 outline-none transition-all"
                                                                />
                                                                <p className="text-[11px] text-muted leading-relaxed">
                                                                    กรุณาตรวจสอบยอดเงินคงเหลือใน Wallet ก่อนทำรายการ ระบบจะส่งคำขอหักเงินไปยังแอป TrueMoney ของคุณ
                                                                </p>
                                                            </div>
                                                        )}

                                                        {section.id === 'COD' && (
                                                            <div className="text-center py-4 bg-green-50 rounded-2xl border border-green-100">
                                                                <div className="text-4xl mb-2">🏠</div>
                                                                <p className="text-sm text-green-700 font-semibold uppercase tracking-wide">Cash on Delivery Available</p>
                                                                <p className="text-xs text-green-600 mt-1">เตรียมเงินสดให้พอดีกับยอดชำระเมื่อพนักงานไปถึง</p>
                                                            </div>
                                                        )}

                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="mt-8 lg:mt-0 lg:col-span-5 xl:col-span-4">
                        <div className="bg-surface rounded-2xl shadow-sm border border-border-main p-6 sticky top-8">
                            <h2 className="text-lg font-bold text-content mb-6 flex items-center gap-2">
                                <Package className="text-primary" size={20} />
                                สรุปคำสั่งซื้อ
                            </h2>

                            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                                {order?.subOrders?.flatMap((sub) => sub.orderItems || []).map((item) => (
                                    <div key={item.id} className="flex gap-3 py-2 border-b border-border-main last:border-0">
                                        <div className="w-14 h-14 bg-main rounded-lg border border-border-main shrink-0 overflow-hidden">
                                            <img src={item.image} className="w-full h-full object-contain mix-blend-multiply" alt={item.title} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-content truncate">{item.title}</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-xs text-muted">x{item.quantity}</p>
                                                <p className="text-sm font-bold text-content">฿{item.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-4 border-t border-border-main">
                                <div className="flex justify-between text-sm text-muted">
                                    <span>ราคารวมสินค้า</span>
                                    <span>฿{total.toLocaleString()}</span>
                                </div>
                                {/* <div className="flex justify-between text-sm text-muted">
                                    <span>ค่าจัดส่ง</span>
                                    <span>฿0</span>
                                </div> */}
                                <div className="flex justify-between items-end pt-3 border-t border-border-main">
                                    <span className="text-base font-bold text-content">ยอดสุทธิ</span>
                                    <span className="text-2xl font-black text-primary">฿{total.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary text-white py-4 rounded-xl font-bold text-base mt-6 hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center gap-2 group active:scale-[0.98]"
                            >
                                ยืนยันการสั่งซื้อ <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
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