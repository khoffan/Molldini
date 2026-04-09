/* eslint-disable @typescript-eslint/no-explicit-any */

import { useParams, useNavigate } from 'react-router';
import {
    ArrowLeft,
    CreditCard,
    Package,
    Receipt,
    Truck,
    Clock,
    CheckCircle2,
    ExternalLink,
    XCircle
} from 'lucide-react';
import type { OrderResponse } from '../interface/orderInterface';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { useEffect, useMemo, useState } from 'react';
import { fetchOrderById } from '../service/orderService';
import LoadingSkelition from '../components/loadingComponent/LoadingShrinkBoxSkelition';
// import Swal from 'sweetalert2';

Omise.setPublicKey(import.meta.env.VITE_OMISE_PUBLIC_KEY);

export default function OrderDetailPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState<OrderResponse | null>(null)

    const [loading, setLoading] = useState<boolean>(false);
    useEffect(() => {
        setLoading(true);
        const fetchOrderDetail = async () => {
            try {
                if (id) {
                    const result = await dispatch(fetchOrderById(id)).unwrap();
                    setOrder(result);
                }
            } catch (e: unknown) {
                console.error("Error fetching order detail:", e);
            } finally {
                setLoading(false);
            }
        }

        if (id) fetchOrderDetail();
    }, [id, dispatch])

    // Mock status สำหรับทำ UI (ในงานจริงใช้จาก orderData.status)
    const status = order?.status || 'UNPAID';
    const allProducts = useSelector((state: RootState) => state.product.items);

    // Flatten all orderItems from subOrders
    const allOrderItems = useMemo(() => {
        if (!order?.subOrders) return [];
        return order.subOrders.flatMap(sub => sub.orderItems || []);
    }, [order?.subOrders]);

    const variantList = useMemo(() => {
        if (!allOrderItems.length) return []
        return allOrderItems.map(item => {
            for (const product of allProducts) {
                const variant = product.variants.find(v => v.id === item.productVariantId);
                if (variant) return variant;
            }
            return null;
        }).filter(v => v !== null);
    }, [allOrderItems, allProducts]);

    // const createSource = (amount: number, method: string): Promise<any> => {
    //     return new Promise((resolve, reject) => {
    //         const totalAmout = Math.round(amount * 100);

    //         Omise.createSource(method, {
    //             amount: totalAmout,
    //             currency: "THB",
    //         }, (statusCode: number, response: any) => {
    //             if (statusCode !== 200) {
    //                 return reject(response);
    //             }
    //             return resolve(response);
    //         })
    //     })
    // }

    // const handleSubmitPay = async (e: React.MouseEvent<HTMLButtonElement>) => {
    //     e.preventDefault();
    //     if (!order) return;
    //     Swal.fire({
    //         title: 'กำลังสร้างคำสั่งซื้อ...',
    //         allowOutsideClick: false,
    //         didOpen: () => Swal.showLoading(),
    //     });
    //     try {
    //         const source = await createSource(order.invoice.amount, order.invoice.paymentMethod);
    //         Swal.close();
    //         const chargeResult = await dispatch(checkoutOrder({ source: source.id, orderId: order.id as string })).unwrap();
    //         console.log("🚀 ~ handleSubmitPay ~ chargeResult:", chargeResult)
    //         if (chargeResult.redirectUrl) {
    //             window.location.href = chargeResult.redirectUrl;
    //             return;
    //         } else {
    //             const code = chargeResult.code
    //             navigate("/checkout/qr", {
    //                 state: {
    //                     qrUri: code.image.download_uri,
    //                     orderId: order.id,
    //                     amount: order.invoice.amount,
    //                     expiredAt: chargeResult.expiredAt
    //                 }
    //             });
    //         }
    //     } catch (error) {
    //         console.error('Error creating source:', error);
    //     }
    // }

    if (loading && !order) return <LoadingSkelition />;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header & Back Button */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-muted hover:text-content transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    <span>Back to Orders</span>
                </button>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted">Order ID:</span>
                    <span className="text-sm font-mono font-medium text-content">{id}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Order Info & Items */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Status Card */}
                    <div className="bg-surface rounded-2xl p-6 border border-border-main shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-content">Order Status</h2>
                            <StatusBadge status={status} />
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted">
                            <div className="flex items-center">
                                <Clock size={16} className="mr-1" />
                                {new Date().toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                                <Package size={16} className="mr-1" />
                                {allOrderItems.length} Items
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="bg-surface rounded-2xl overflow-hidden border border-border-main shadow-sm">
                        <div className="p-6 border-b border-border-main">
                            <h3 className="font-semibold text-content">Items Summary</h3>
                        </div>
                        <div className="divide-y divide-border-main">
                            {order?.subOrders?.map((subOrder) => (
                                <div key={subOrder.id}>
                                    {/* Merchant Header */}
                                    <div className="px-6 py-3 bg-main">
                                        <p className="text-xs font-bold text-muted uppercase tracking-wider">
                                            ร้าน: {subOrder.merchantName || 'Unknown'}
                                        </p>
                                    </div>
                                    {subOrder.orderItems?.map((item) => {
                                        const variantData = variantList.find((variant) => variant.id === item.productVariantId);
                                        return (
                                            <div key={item.id} className="p-6 flex items-center space-x-4">
                                                <img src={item.image} alt={item.title} className="w-16 h-16 bg-main rounded-lg shrink-0" />
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-content">{item.title}</h4>
                                                    <p className="text-xs text-muted">{variantData?.variantName}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-content">฿{item.price}</p>
                                                    <p className="text-xs text-muted">x{item.quantity}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Payment & Actions */}
                <div className="space-y-6">
                    {/* Summary Card */}
                    <div className="bg-surface rounded-2xl p-6 border border-border-main shadow-sm space-y-4">
                        <h3 className="font-semibold text-content mb-4">Price Summary</h3>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted">Subtotal</span>
                            <span className="text-content font-medium">{order?.totalPrice}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted">Shipping</span>
                            <span className="text-content font-medium">฿40</span>
                        </div>
                        <div className="pt-4 border-t border-border-main flex justify-between items-end">
                            <span className="text-base font-semibold text-content">Total</span>
                            <span className="text-2xl font-bold text-primary">฿{order?.invoice.amount}</span>
                        </div>

                        {/* Action Button: Conditional Rendering */}
                        <div className="pt-4">
                            {status === 'UNPAID' ? (
                                <button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg">
                                    <CreditCard size={18} />
                                    <span>Pay Now</span>
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <button className="w-full bg-surface border border-border-main hover:bg-surface-hover text-content font-medium py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2">
                                        <Receipt size={18} />
                                        <span>View Invoice</span>
                                    </button>
                                    {order?.invoice && (
                                        <a
                                            href={order.invoice.paymentMethod}
                                            target="_blank"
                                            className="w-full text-primary text-sm font-medium flex items-center justify-center hover:underline"
                                        >
                                            <ExternalLink size={14} className="mr-1" />
                                            View Payment Slip
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Shipping Info Card (Optional) */}
                    <div className="bg-main rounded-2xl p-6 border border-dashed border-border-main">
                        <div className="flex items-center space-x-2 mb-3 text-content font-medium">
                            <Truck size={18} />
                            <span>Shipping Address</span>
                        </div>
                        <p className="text-sm text-muted leading-relaxed">
                            {order?.shippingAddress}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-component สำหรับ Badge Status
const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case "PAID":
            return (
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1">
                    <CheckCircle2 size={12} /> จ่ายแล้ว
                </span>
            );
        case "CANCELLED":
            return (
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-gray-50 text-gray-500 border border-gray-200 flex items-center gap-1">
                    <XCircle size={12} /> ยกเลิกแล้ว
                </span>
            );
        default: // คือ PENDING หรือสถานะอื่นๆ ที่ยังไม่ได้จ่าย
            return (
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-500 border border-red-100 flex items-center gap-1">
                    <Clock size={12} /> รอชำระเงิน
                </span>
            );
    }
}