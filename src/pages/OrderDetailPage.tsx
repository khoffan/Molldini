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
    ExternalLink
} from 'lucide-react';
import type { OrderResponse } from '../interface/orderInterface';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { useEffect, useMemo, useState } from 'react';
import { fetchOrderById } from '../service/orderService';
import LoadingSkelition from '../components/LoadingSkelition';


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
    const status = order?.invoice.status || 'UNPAID';
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

    if (loading && !order) return <LoadingSkelition />;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header & Back Button */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    <span>Back to Orders</span>
                </button>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Order ID:</span>
                    <span className="text-sm font-mono font-medium text-gray-900">{id}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Order Info & Items */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Status Card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>
                            <StatusBadge status={status} />
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                        <div className="p-6 border-b border-gray-50">
                            <h3 className="font-semibold text-gray-900">Items Summary</h3>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {order?.subOrders?.map((subOrder) => (
                                <div key={subOrder.id}>
                                    {/* Merchant Header */}
                                    <div className="px-6 py-3 bg-gray-50">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            ร้าน: {subOrder.merchantName || 'Unknown'}
                                        </p>
                                    </div>
                                    {subOrder.orderItems?.map((item) => {
                                        const variantData = variantList.find((variant) => variant.id === item.productVariantId);
                                        return (
                                            <div key={item.id} className="p-6 flex items-center space-x-4">
                                                <img src={item.image} alt={item.title} className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0" />
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                                                    <p className="text-xs text-gray-500">{variantData?.variantName}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-gray-900">฿{item.price}</p>
                                                    <p className="text-xs text-gray-500">x{item.quantity}</p>
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
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                        <h3 className="font-semibold text-gray-900 mb-4">Price Summary</h3>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="text-gray-900 font-medium">{order?.totalPrice}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Shipping</span>
                            <span className="text-gray-900 font-medium">฿40</span>
                        </div>
                        <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                            <span className="text-base font-semibold text-gray-900">Total</span>
                            <span className="text-2xl font-bold text-blue-600">฿{order?.invoice.amount}</span>
                        </div>

                        {/* Action Button: Conditional Rendering */}
                        <div className="pt-4">
                            {status === 'UNPAID' ? (
                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-100">
                                    <CreditCard size={18} />
                                    <span>Pay Now</span>
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <button className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2">
                                        <Receipt size={18} />
                                        <span>View Invoice</span>
                                    </button>
                                    {order?.invoice && (
                                        <a
                                            href={order.invoice.paymentMethod}
                                            target="_blank"
                                            className="w-full text-blue-600 text-sm font-medium flex items-center justify-center hover:underline"
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
                    <div className="bg-gray-50 rounded-2xl p-6 border border-dashed border-gray-200">
                        <div className="flex items-center space-x-2 mb-3 text-gray-900 font-medium">
                            <Truck size={18} />
                            <span>Shipping Address</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
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
    const configs: Record<string, { label: string, classes: string, icon: any }> = {
        UNPAID: {
            label: 'Waiting for Payment',
            classes: 'bg-amber-50 text-amber-600 border-amber-100',
            icon: <Clock size={14} />
        },
        PAID: {
            label: 'Paid',
            classes: 'bg-blue-50 text-blue-600 border-blue-100',
            icon: <CheckCircle2 size={14} />
        },
    };

    const config = configs[status] || configs.UNPAID;

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1.5 ${config.classes}`}>
            {config.icon}
            <span>{config.label}</span>
        </span>
    );
};