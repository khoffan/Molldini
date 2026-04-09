/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { MapPin, Plus, CreditCard, CheckCircle2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { useNavigate, useParams } from 'react-router';
import Swal from 'sweetalert2';
import { checkoutOrder, fetchOrderLocalCheckout, updateDataOrder } from '../service/orderService';
import LoadingSkelition from '../components/loadingComponent/LoadingShrinkBoxSkelition';

// NEW Checkout Imports
import CheckoutItemsList from '../components/checkout/CheckoutItemsList';
import OrderSummarySidebar from '../components/checkout/OrderSummarySidebar';
import {
    initializeCheckout,
    selectOrderSummary,
    selectValidateCheckout,
} from '../service/checkoutService';

Omise.setPublicKey(import.meta.env.VITE_OMISE_PUBLIC_KEY);

export default function CheckoutPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    // User & Order Data
    const { user } = useSelector((state: RootState) => state.user);
    const { orderData, order, loading } = useSelector((state: RootState) => state.order);
    const { payments } = useSelector((state: RootState) => state.payment);
    const { shippings } = useSelector((state: RootState) => state.shipping);

    // Checkout Redux State
    const checkoutSummary = useSelector(selectOrderSummary);
    const isValidCheckout = useSelector(selectValidateCheckout);
    const { items: checkoutItems } = useSelector((state: RootState) => state.checkout);

    // Address State
    const [selectedAddressId, setSelectedAddressId] = useState<string>(
        user?.addresses?.find(addr => addr.isDefault)?.id || user?.addresses?.[0]?.id || ""
    );

    // Initial Fetch
    useEffect(() => {
        dispatch(fetchOrderLocalCheckout());
    }, [dispatch]);

    // Initialize Checkout Items & Shipping
    useEffect(() => {
        if (order && shippings.length > 0) {
            dispatch(initializeCheckout({ order, shippings }));
        }
    }, [dispatch, order, shippings]);

    // Payment State
    const [paymentMethod, setPaymentMethod] = useState<string>(() => {
        const defaultPayment = payments?.find(p => p.method === 'truemoney_jumpapp');
        return defaultPayment?.method || payments?.[0]?.method || "";
    });
    const [selectedBank, setSelectedBank] = useState<string>("");

    // Omise Helper
    const createSource = (amount: number, method: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const totalAmout = Math.round(amount * 100);
            Omise.createSource(method, {
                amount: totalAmout,
                currency: "THB",
            }, (statusCode: number, response: any) => {
                if (statusCode !== 200) return reject(response);
                return resolve(response);
            });
        });
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

        if (!isValidCheckout) {
            return Swal.fire('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกช่องทางการจัดส่งให้ครบทุกรายการ', 'warning');
        }

        const { value: paymentChoice } = await Swal.fire({
            title: 'ยืนยันการสั่งซื้อ',
            text: 'คุณต้องการชำระเงินทันทีเลยหรือไม่?',
            icon: 'question',
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: 'ชำระเงินทันที',
            denyButtonText: 'ชำระเงินภายหลัง',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#2563eb',
            denyButtonColor: '#6b7280',
        });

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

            // Derive a single shipping ID for legacy API compatibility.
            // In a full per-item shipping world, the backend would accept an array of [{productId, shippingId}]
            const dominantShippingId = checkoutItems.find(i => i.selectedShipping)?.selectedShipping?.id || (shippings[0]?.id ?? '');

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

            if (paymentChoice === true && method !== "cod") {
                const source = await createSource(checkoutSummary.grandTotal, method);
                Swal.close();
                const chargeResult = await dispatch(checkoutOrder({
                    source: source.id,
                    orderId: resultOrder.id,
                    shippingId: dominantShippingId
                })).unwrap();

                if (chargeResult.redirectUrl) {
                    window.location.href = chargeResult.redirectUrl;
                    return;
                } else {
                    const code = chargeResult.code
                    navigate("/checkout/qr", {
                        state: {
                            qrUri: code,
                            orderId: resultOrder.id,
                            amount: checkoutSummary.grandTotal,
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
                navigate('/profile/orders');
            }

        } catch (err: unknown) {
            if (err instanceof Error) {
                Swal.fire('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถสั่งซื้อได้', 'error');
            } else {
                Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถสั่งซื้อได้', 'error');
            }
        }
    };

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

                        {/* 2. Items & Shipping Section (Integrated Hybrid Component) */}
                        <CheckoutItemsList />

                        {/* 3. Payment Section */}
                        <section className="bg-surface rounded-2xl shadow-sm border border-border-main p-6">
                            <h2 className="text-lg font-bold text-content flex items-center gap-2 mb-6">
                                <CreditCard className="text-primary" size={20} />
                                ช่องทางชำระเงิน
                            </h2>
                            <div className="max-w-4xl mx-auto w-full px-2 sm:px-4">
                                <div className="flex flex-col gap-4">
                                    {payments?.map((section) => (
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

                                                        {/* Mobile Banking Logic */}
                                                        {section.method === 'mobile_banking' && (
                                                            <div className="grid grid-cols-2 gap-3">
                                                                {section.paymentChilds?.map(bank => (
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

                                                        {/* TrueMoney JumpApp Logic */}
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

                                                        {/* Rabbit Line Pay & Others */}
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

                    {/* Right Column: Order Summary Sidebar */}
                    <div className="mt-8 lg:mt-0 lg:col-span-5 xl:col-span-4">
                        <div className="
                                fixed bottom-0 left-0 right-0 z-50 
                                bg-surface border-t border-border-main shadow-[0_-10px_40px_rgba(0,0,0,0.15)]
                                rounded-t-[24px] transition-all duration-300
                                lg:relative lg:bottom-auto lg:z-20 
                                lg:rounded-2xl lg:border lg:shadow-sm lg:sticky lg:top-8 lg:bg-surface
                            ">
                            {/* Handle bar สำหรับ Mobile */}
                            <div className="w-12 h-1.5 bg-border-main rounded-full mx-auto my-3 lg:hidden" />

                            <OrderSummarySidebar
                                orderStatus={orderData?.status || 'PENDING'}
                                orderId={orderData?.id ?? undefined}
                                createdAt={orderData?.createdAt}
                                expiredAt={orderData?.expiredAt}
                                invoice={orderData?.invoice}
                            />
                        </div>

                        {/* Spacer สำหรับ Mobile */}
                        <div className="h-[320px] lg:hidden" />
                    </div>
                </form>
            </div>
        </div>
    );
}