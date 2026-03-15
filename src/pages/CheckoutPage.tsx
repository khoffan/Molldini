/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { MapPin, Plus, CreditCard, ChevronRight, CheckCircle2, Truck, Package, Lock } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { useNavigate, useParams } from 'react-router';
import Swal from 'sweetalert2';
import { checkoutOrder, fetchOrderLocalCheckout, updateDataOrder } from '../service/orderService';
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
    console.log(payments);
    useEffect(() => {
        dispatch(fetchPayment());
        dispatch(fetchShipping());
        dispatch(fetchOrderLocalCheckout());
    }, [dispatch])
    // 1. ประกาศ State เริ่มต้นเป็นค่าว่างไว้ก่อน
    const [paymentMethod, setPaymentMethod] = useState<string>("");
    const [selectedBank, setSelectedBank] = useState<string>("");
    const [selectedShippingId, setSelectedShippingId] = useState<string>("");

    // สำหรับ Payment Method
    useEffect(() => {
        // ถ้าข้อมูลมาแล้ว และยังไม่มีการเลือกค่า (State ยังว่าง)
        if (payments && payments.length > 0 && !paymentMethod) {
            const defaultPayment = payments.find(p => p.method === 'truemoney_jumpapp');
            if (defaultPayment) {
                setPaymentMethod(defaultPayment.method);
            } else if (payments[0]) {
                // กรณีหา truemoney ไม่เจอ ให้เลือกตัวแรกเป็น default กันพลาด
                setPaymentMethod(payments[0].method);
            }
        }
    }, [payments]); // Watch แค่ payments ก็พอ เพื่อให้รันเฉพาะตอนข้อมูลเปลี่ยน

    // สำหรับ Shipping Method
    useEffect(() => {
        if (shippings && shippings.length > 0 && !selectedShippingId) {
            const standardShipping = shippings.find(s =>
                s.name.toLowerCase().includes('standard')
            );
            if (standardShipping) {
                setSelectedShippingId(standardShipping.id);
            } else if (shippings[0]) {
                // ถ้าไม่เจอคำว่า standard ให้เลือกเจ้าแรกที่มี
                setSelectedShippingId(shippings[0].id);
            }
        }
    }, [shippings]);

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

    const paymentSections = payments;

    const amount = order?.totalPrice || 0;
    const shippingMethod = shippings.find(m => m.id === selectedShippingId);
    const isFree = shippingMethod?.freeShippingThreshold && amount >= shippingMethod.freeShippingThreshold;
    const shippingCost = isFree ? 0 : shippingMethod?.price || 0;
    const total = amount + shippingCost;


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
                console.log("total =>", total);
                console.log("🚀 ~ handleSubmit ~ source:", source)
                Swal.close();
                const chargeResult = await dispatch(checkoutOrder({ source: source.id, orderId: resultOrder.id, shippingId: selectedShippingId })).unwrap();
                if (chargeResult.redirectUrl) {
                    window.location.href = chargeResult.redirectUrl;
                    return;
                } else {
                    const code = chargeResult.code
                    navigate("/checkout/qr", {
                        state: {
                            qrUri: code,
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






    if (loading) {
        return <LoadingSkelition />
    }

    return (
        <div className="bg-bg min-h-screen py-10 font-sans grid">
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
                            <div className="max-w-4xl mx-auto w-full px-2 sm:px-4">
                                <div className="flex flex-col gap-4">
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
                                                        {/* ใช้ icon จาก DB ถ้ามี ถ้าไม่มีให้แสดง emoji ตาม method */}
                                                        {section.icon?.url || (
                                                            section.method === 'promptpay' ? '🎯' :
                                                                section.method === 'mobile_banking' ? '📱' :
                                                                    section.method.includes('truemoney') ? '🔸' : '💳'
                                                        )}
                                                    </div>
                                                    <div className="text-left">
                                                        <span className="block font-semibold text-content text-lg">
                                                            {section.label}
                                                        </span>
                                                        <span className="text-xs text-muted uppercase tracking-wider">
                                                            Secure Payment
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Radio Indicator */}
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === section.method ? 'border-primary bg-primary' : 'border-muted'
                                                    }`}>
                                                    {paymentMethod === section.method && (
                                                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-in zoom-in-50" />
                                                    )}
                                                </div>
                                            </button>

                                            {/* Expandable Content Section */}
                                            {paymentMethod === section.method && (
                                                <div className="p-6 border-t border-border-main bg-main/30 animate-in fade-in slide-in-from-top-4 duration-300">
                                                    <div className="max-w-md mx-auto">

                                                        {/* 1. PromptPay Logic */}
                                                        {/* {section.method === 'promptpay' && (
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
                                                        )} */}

                                                        {/* 2. Mobile Banking Logic */}
                                                        {section.method === 'mobile_banking' && (
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
                                                                        {selectedBank === bank.method && (
                                                                            <div className="absolute top-2 right-2 animate-in zoom-in duration-200">
                                                                                <div className="bg-primary rounded-full p-0.5">
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                    </svg>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        <div className="w-10 h-10 rounded-lg mb-2 flex items-center justify-center bg-main text-[10px] font-bold">
                                                                            LOGO
                                                                        </div>
                                                                        <span className="text-xs text-center leading-tight">{bank.label}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* 3. TrueMoney JumpApp Logic */}
                                                        {section.method === 'truemoney_jumpapp' && (
                                                            <div className="space-y-4 bg-surface p-5 rounded-2xl border border-border-main shadow-sm">
                                                                <div className="flex items-center space-x-3 mb-2">
                                                                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-lg">📱</div>
                                                                    <span className="text-sm font-semibold text-content">TrueMoney JumpApp</span>
                                                                </div>
                                                                <p className="text-xs text-muted leading-relaxed">
                                                                    ระบบจะนำคุณไปยังแอป TrueMoney เพื่อยืนยันการชำระเงินโดยอัตโนมัติ
                                                                </p>
                                                                <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                                                                    <p className="text-[11px] text-orange-700">ไม่ต้องกรอกเบอร์โทรศัพท์ ระบบจะเชื่อมต่อกับแอปของคุณทันที</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* 4. Rabbit Line Pay & Others */}
                                                        {(section.method === 'rabbit_linepay' || section.method === 'truemoney_qr') && (
                                                            <div className="text-center py-6 bg-surface rounded-2xl border border-border-main">
                                                                <div className="text-3xl mb-2">💳</div>
                                                                <p className="text-sm font-medium">ชำระผ่าน {section.label}</p>
                                                                <p className="text-xs text-muted mt-1">กดปุ่มชำระเงินเพื่อดำเนินการต่อ</p>
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
                        <div className="
                                /* Mobile: Sticky/Fixed Bottom Sheet */
                                fixed bottom-0 left-0 right-0 z-50 
                                bg-surface border-t border-border-main shadow-[0_-10px_40px_rgba(0,0,0,0.15)]
                                rounded-t-[24px] transition-all duration-300
                                
                                /* Desktop: Normal Sticky Sidebar */
                                lg:relative lg:bottom-auto lg:z-20 
                                lg:rounded-2xl lg:border lg:p-6 lg:shadow-sm lg:sticky lg:top-8 lg:bg-surface
                            ">
                            {/* Handle bar สำหรับ Mobile ให้ดูเหมือนแผ่นที่ดึงขึ้นมาได้ */}
                            <div className="w-12 h-1.5 bg-border-main rounded-full mx-auto my-3 lg:hidden" />

                            <div className="p-4 lg:p-0">
                                <h2 className="text-lg font-bold text-content mb-4 flex items-center gap-2">
                                    <Package className="text-primary" size={20} />
                                    สรุปคำสั่งซื้อ
                                </h2>

                                {/* สถาพรายการสินค้า: แสดงผลทั้ง Mobile และ Desktop */}
                                <div className="
                                        space-y-3 mb-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200
                                        /* Mobile: จำกัดความสูงให้เตี้ยลงหน่อยจะได้ไม่บังจอทั้งหมด */
                                        max-h-[160px] 
                                        /* Desktop: ขยายความสูงได้เต็มที่ */
                                        lg:max-h-[400px]
                                    ">
                                    {order?.subOrders?.flatMap((sub) => sub.orderItems || []).map((item) => (
                                        <div key={item.id} className="flex gap-3 py-2 border-b border-border-main/50 last:border-0">
                                            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-main rounded-lg border border-border-main shrink-0 overflow-hidden">
                                                <img src={item.image} className="w-full h-full object-contain mix-blend-multiply" alt={item.title} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-content truncate">{item.title}</p>
                                                <div className="flex justify-between items-center mt-1">
                                                    <p className="text-xs text-muted font-medium">จำนวน {item.quantity}</p>
                                                    <p className="text-sm font-bold text-content">฿{item.price.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* ส่วนสรุปราคาสุดท้าย */}
                                <div className="pt-4 border-t border-border-main space-y-4">

                                    {/* 1. Desktop Price Breakdown (ซ่อนใน Mobile เพื่อความกะทัดรัด) */}
                                    <div className="hidden lg:flex flex-col gap-2">
                                        <div className="flex justify-between text-sm text-muted">
                                            <span>ราคารวมสินค้า</span>
                                            <span className="font-medium text-content">฿{amount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-muted">
                                            <span>ค่าจัดส่ง</span>
                                            <span className="text-emerald-600 font-medium">฿{shippingCost.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* 2. Main Action Area: เปลี่ยน Layout ตามหน้าจอ */}
                                    <div className="
        /* Mobile: แถวแนวนอน ยอดเงินซ้าย ปุ่มขวา */
        flex flex-row items-center justify-between gap-4
        /* Desktop: แถวแนวตั้ง ทุกอย่างเต็มความกว้าง */
        lg:flex-col lg:items-stretch lg:gap-4
    ">

                                        {/* ส่วนแสดงราคาสุทธิ */}
                                        <div className="flex flex-col">
                                            <span className="text-[10px] lg:text-xs text-muted uppercase font-black tracking-widest">
                                                ยอดชำระสุทธิ
                                            </span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-sm lg:text-base font-bold text-primary">฿</span>
                                                <span className="text-2xl lg:text-3xl font-black text-primary leading-none">
                                                    {total.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* ปุ่มยืนยันการสั่งซื้อ */}
                                        <button
                                            type="submit"
                                            className="
                /* Mobile: กว้างพอเหมาะ */
                px-6 py-3.5 
                /* Desktop: กว้างเต็ม Column */
                lg:w-full lg:py-4 lg:mt-2
                
                bg-primary text-white rounded-xl lg:rounded-2xl
                font-bold text-base lg:text-lg
                transition-all duration-200
                shadow-[0_10px_20px_-10px_rgba(var(--primary-rgb),0.5)]
                hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]
                flex items-center justify-center gap-2 group
            "
                                        >
                                            <span className="whitespace-nowrap">ยืนยันการสั่งซื้อ</span>
                                            <ChevronRight size={20} className="transition-transform group-hover:translate-x-1" />
                                        </button>
                                    </div>

                                    {/* 3. Desktop Security Note (ซ่อนใน Mobile) */}
                                    <div className="hidden lg:flex items-center justify-center gap-2 pt-2 text-[11px] text-muted font-bold uppercase tracking-tighter">
                                        <Lock size={12} className="text-emerald-500" />
                                        <span>Secure Checkout</span>
                                        <span className="mx-1">•</span>
                                        <span>Buyer Protection</span>
                                    </div>
                                </div>

                                <div className="hidden lg:flex mt-4 items-center justify-center gap-2 text-[10px] text-muted uppercase tracking-widest font-bold">
                                    <CheckCircle2 size={12} />
                                    <span>Secure SSL Encryption</span>
                                </div>
                            </div>
                        </div>

                        {/* ส่วนที่สำคัญมาก: Spacer สำหรับ Mobile เพื่อไม่ให้เนื้อหาหลักโดนทับตายตัว */}
                        <div className="h-[320px] lg:hidden" />
                    </div>
                </form>
            </div>
        </div>
    );
}