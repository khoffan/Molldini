import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { CheckCircle2, Package, ShoppingBag, ReceiptText } from 'lucide-react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import { fetchOrderById } from '../service/orderService';

// สมมติ Interface สำหรับข้อมูลที่จะแสดง
interface OrderSummary {
    id: string | null;
    totalPrice: number;
    receiverName: string;
    shippingAddress: string;
}

export default function SuccessCheckoutPage() {
    const dispath = useDispatch<AppDispatch>();
    const { id } = useParams();
    const [order, setOrder] = useState<OrderSummary | null>(null);

    useEffect(() => {
        // TODO: Fetch order detail โดยใช้ orderId
        // fetchOrder(orderId).then(data => setOrder(data));
        const result = async () => {
            try {
                if (!id) return;
                const orderData = await dispath(fetchOrderById(id)).unwrap();
                const orderSum: OrderSummary = {
                    id: orderData.id,
                    totalPrice: orderData.totalPrice,
                    receiverName: orderData.receiverName!,
                    shippingAddress: orderData.shippingAddress!
                }
                setOrder(orderSum);
            } catch (error) {
                console.error(error);
            }
        }
        result()
    }, [dispath, id]);

    console.log(order)

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
                {/* Top Success Banner */}
                <div className="bg-green-500 p-8 flex flex-col items-center">
                    <div className="bg-white/20 p-3 rounded-full mb-4 animate-bounce">
                        <CheckCircle2 size={48} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white text-center">
                        Order Successful!
                    </h1>
                    <p className="text-green-100 text-sm mt-2">
                        Thank you for your purchase.
                    </p>
                </div>

                <div className="p-8">
                    {/* Order Info Details */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                            <span className="text-gray-500 text-sm font-medium">Order ID</span>
                            <span className="text-gray-900 font-mono font-bold text-sm bg-gray-100 px-3 py-1 rounded-lg">
                                #{id?.slice(-8).toUpperCase()}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                                <Package size={16} className="mr-2 text-blue-500" />
                                Shipping Information
                            </h3>
                            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 leading-relaxed">
                                <p className="font-bold text-gray-800 mb-1">{order?.receiverName || 'Loading...'}</p>
                                <p>{order?.shippingAddress || 'Fetching address details...'}</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center py-4">
                            <span className="text-gray-900 font-semibold uppercase tracking-wider text-xs">Total Amount</span>
                            <span className="text-2xl font-black text-blue-600">
                                ฿{order?.totalPrice?.toLocaleString() || '0.00'}
                            </span>
                        </div>
                    </div>

                    <hr className="my-6 border-dashed border-gray-200" />

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 gap-3">
                        <Link
                            to={`/profile/orders/${id}`}
                            className="w-full bg-gray-900 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                        >
                            <ReceiptText size={18} className="mr-2" />
                            View Order Details
                        </Link>

                        <Link
                            to="/"
                            className="w-full bg-white border border-gray-200 text-gray-600 font-semibold py-3.5 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-all"
                        >
                            <ShoppingBag size={18} className="mr-2" />
                            Continue Shopping
                        </Link>
                    </div>

                    {/* Support Info */}
                    <p className="text-center text-xs text-gray-400 mt-8 leading-relaxed">
                        A confirmation email has been sent to your inbox.<br />
                        Need help? <Link to="/contact" className="text-blue-500 font-medium hover:underline">Contact Support</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}