/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { MapPin, Plus, CreditCard, ChevronRight, CheckCircle2, Truck, Package, Lock, Clock, Store, Receipt, AlertTriangle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { useNavigate, useParams } from 'react-router';
import Swal from 'sweetalert2';
import { checkoutOrder, fetchOrderLocalCheckout, updateDataOrder } from '../service/orderService';
import LoadingSkelition from '../components/loadingComponent/LoadingShrinkBoxSkelition';
import { formatCurrency, formatDate, getTimeUntilExpiry, getOrderStatusConfig, getInvoiceStatusConfig } from '../utils/formatOrder';

Omise.setPublicKey(import.meta.env.VITE_OMISE_PUBLIC_KEY);

// ─── Sub-Components ──────────────────────────────────────────────

/** Status Badge — color-coded pill based on order status */
const OrderStatusBadge = ({ status }: { status: string }) => {
    const config = getOrderStatusConfig(status);
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} animate-pulse`} />
            {config.label}
        </span>
    );
};

/** Invoice Status Badge */
const InvoiceStatusBadge = ({ status }: { status: string }) => {
    const config = getInvoiceStatusConfig(status);
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
            {config.label}
        </span>
    );
};

/** Expiry Countdown — only renders when order is PENDING and expiredAt exists */
const ExpiryCountdown = ({ expiredAt, status }: { expiredAt?: string | Date; status: string }) => {
    if (status?.toUpperCase() !== 'PENDING' || !expiredAt) return null;

    const timeLeft = getTimeUntilExpiry(expiredAt);
    if (!timeLeft) return null;

    const isExpired = timeLeft === 'หมดอายุแล้ว';

    return (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border ${isExpired
            ? 'bg-red-50 text-red-600 border-red-100'
            : 'bg-amber-50 text-amber-700 border-amber-100'
            }`}>
            {isExpired ? <AlertTriangle size={14} /> : <Clock size={14} className="animate-pulse" />}
            <span>{isExpired ? 'คำสั่งซื้อหมดอายุแล้ว' : `ชำระภายใน ${timeLeft}`}</span>
        </div>
    );
};

/** Merchant Items Group — renders one SubOrder (merchant header + items) */
const MerchantItemsGroup = ({ merchantName, items }: { merchantName: string; items: any[] }) => (
    <div className="mb-3 last:mb-0">
        {/* Merchant Header */}
        <div className="flex items-center gap-1.5 mb-2">
            <Store size={12} className="text-muted" />
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider truncate">
                {merchantName || 'Unknown Shop'}
            </span>
        </div>
        {/* Items */}
        <div className="space-y-0">
            {items.map((item) => (
                <div key={item.id} className="flex gap-3 py-2.5 border-b border-border-main/40 last:border-0">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 bg-main rounded-lg border border-border-main shrink-0 overflow-hidden">
                        <img
                            src={item.image}
                            className="w-full h-full object-contain mix-blend-multiply"
                            alt={item.title}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-content truncate">{item.title}</p>
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-muted font-medium">x{item.quantity}</p>
                            <p className="text-sm font-bold text-content">{formatCurrency(item.price)}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

/** Invoice Summary Row */
const InvoiceSummarySection = ({ invoice }: { invoice: any }) => {
    if (!invoice) return null;

    return (
        <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-main/40 border border-border-main/50">
            <div className="flex items-center gap-2">
                <Receipt size={14} className="text-muted" />
                <span className="text-xs font-semibold text-muted">Invoice</span>
            </div>
            <InvoiceStatusBadge status={invoice.status} />
        </div>
    );
};


// ─── Main Component ──────────────────────────────────────────────

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

    useEffect(() => {
        dispatch(fetchOrderLocalCheckout());
    }, [dispatch])

    // 🟢 1. จัดการ Payment Method
    const [paymentMethod, setPaymentMethod] = useState<string>(() => {
        const defaultPayment = payments?.find(p => p.method === 'truemoney_jumpapp');
        return defaultPayment?.method || payments?.[0]?.method || "";
    });

    // 🟢 2. จัดการ Shipping Method
    const [selectedShippingId, setSelectedShippingId] = useState<string>(() => {
        const standardShipping = shippings?.find(s =>
            s.name.toLowerCase().includes('standard')
        );
        return standardShipping?.id || shippings?.[0]?.id || "";
    });

    // 🟢 3. จัดการ Selected Bank (ถ้ามีเงื่อนไขเริ่มต้น)
    const [selectedBank, setSelectedBank] = useState<string>("");

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
                const source = await createSource(total, method);
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

    // ─── Derived values for the summary ──────────────
    const orderStatus = order?.status || 'PENDING';
    const statusConfig = getOrderStatusConfig(orderStatus);
    const orderId = order?.id;
    const shortOrderId = orderId ? `#${orderId.slice(0, 8).toUpperCase()}` : '';
    const totalItemCount = order?.subOrders?.reduce((acc, sub) => acc + (sub.orderItems?.length || 0), 0) || 0;

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

                    {/* ═══════════════════════════════════════════════════════════
                        Right Column: Enhanced Order Summary Sidebar
                    ═══════════════════════════════════════════════════════════ */}
                    <div className="mt-8 lg:mt-0 lg:col-span-5 xl:col-span-4">
                        <div className="
                                fixed bottom-0 left-0 right-0 z-50 
                                bg-surface border-t border-border-main shadow-[0_-10px_40px_rgba(0,0,0,0.15)]
                                rounded-t-[24px] transition-all duration-300
                                lg:relative lg:bottom-auto lg:z-20 
                                lg:rounded-2xl lg:border lg:p-6 lg:shadow-sm lg:sticky lg:top-8 lg:bg-surface
                            ">
                            {/* Handle bar สำหรับ Mobile */}
                            <div className="w-12 h-1.5 bg-border-main rounded-full mx-auto my-3 lg:hidden" />

                            <div className="p-4 lg:p-0">

                                {/* ── Order Header with Status ────────────── */}
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-content flex items-center gap-2">
                                        <Package className="text-primary" size={20} />
                                        สรุปคำสั่งซื้อ
                                    </h2>
                                    <OrderStatusBadge status={orderStatus} />
                                </div>

                                {/* ── Short Order ID & Date (Desktop only) ── */}
                                {orderId && (
                                    <div className="hidden lg:flex items-center justify-between mb-3 pb-3 border-b border-border-main/60">
                                        <span className="text-xs text-muted font-mono font-semibold">{shortOrderId}</span>
                                        {order?.createdAt && (
                                            <span className="text-[11px] text-muted">{formatDate(order.createdAt)}</span>
                                        )}
                                    </div>
                                )}

                                {/* ── Expiry Countdown (Conditional) ────── */}
                                <div className="hidden lg:block mb-3">
                                    <ExpiryCountdown expiredAt={order?.expiredAt} status={orderStatus} />
                                </div>

                                {/* ── Merchant-grouped Items List ────────── */}
                                <div className="
                                        space-y-1 mb-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200
                                        max-h-[160px] lg:max-h-[350px]
                                    ">
                                    {order?.subOrders?.map((sub) => (
                                        <MerchantItemsGroup
                                            key={sub.id}
                                            merchantName={sub.merchantName || 'Unknown'}
                                            items={sub.orderItems || []}
                                        />
                                    ))}
                                </div>

                                {/* ── Item Count Summary ─────────────────── */}
                                <div className="hidden lg:flex items-center gap-2 mb-3 text-xs text-muted">
                                    <Package size={12} />
                                    <span>ทั้งหมด {totalItemCount} รายการ จาก {order?.subOrders?.length || 0} ร้านค้า</span>
                                </div>

                                {/* ── Price Breakdown ────────────────────── */}
                                <div className="pt-4 border-t border-border-main space-y-4">

                                    {/* Desktop Price Breakdown */}
                                    <div className="hidden lg:flex flex-col gap-2">
                                        <div className="flex justify-between text-sm text-muted">
                                            <span>ราคารวมสินค้า</span>
                                            <span className="font-medium text-content">{formatCurrency(amount)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-muted">
                                            <span>ค่าจัดส่ง</span>
                                            <span className={`font-medium ${shippingCost === 0 ? 'text-emerald-600' : 'text-content'}`}>
                                                {shippingCost === 0 ? 'ฟรี' : formatCurrency(shippingCost)}
                                            </span>
                                        </div>
                                        {/* Future: Discount line — shown in green only when discount exists */}
                                        {/* {discount > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-emerald-600 font-medium">ส่วนลด</span>
                                                <span className="text-emerald-600 font-bold">-{formatCurrency(discount)}</span>
                                            </div>
                                        )} */}
                                    </div>

                                    {/* Invoice Status (Desktop only) */}
                                    <div className="hidden lg:block">
                                        <InvoiceSummarySection invoice={order?.invoice} />
                                    </div>

                                    {/* Main Action Area */}
                                    <div className="
                                            flex flex-row items-center justify-between gap-4
                                            lg:flex-col lg:items-stretch lg:gap-4
                                        ">

                                        {/* Net Total */}
                                        <div className="flex flex-col">
                                            <span className="text-[10px] lg:text-xs text-muted uppercase font-black tracking-widest">
                                                ยอดชำระสุทธิ
                                            </span>
                                            <div className="flex items-baseline gap-1">
                                                <span className={`text-2xl lg:text-3xl font-black leading-none ${statusConfig.textColor === 'text-amber-600' ? 'text-primary' : statusConfig.textColor}`}>
                                                    {formatCurrency(total)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            className="
                                                px-6 py-3.5 lg:w-full lg:py-4 lg:mt-2
                                                bg-primary text-white rounded-xl lg:rounded-2xl
                                                font-bold text-base lg:text-lg
                                                transition-all duration-200
                                                shadow-[0_10px_20px_-10px_rgba(var(--primary-rgb),0.5)]
                                                hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]
                                                flex items-center justify-center gap-2 group
                                            ">
                                            <span className="whitespace-nowrap">ยืนยันการสั่งซื้อ</span>
                                            <ChevronRight size={20} className="transition-transform group-hover:translate-x-1" />
                                        </button>
                                    </div>

                                    {/* Desktop Security Note */}
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

                        {/* Spacer สำหรับ Mobile */}
                        <div className="h-[320px] lg:hidden" />
                    </div>
                </form>
            </div>
        </div>
    );
}