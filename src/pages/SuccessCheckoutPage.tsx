import { useEffect, useState } from 'react';
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

    return (
        <div className="min-h-screen bg-main flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-surface rounded-3xl shadow-xl overflow-hidden border border-border-main">
                {/* Top Success Banner */}
                <div className="bg-green-500 p-8 flex flex-col items-center">
                    <div className="bg-white/20 p-3 rounded-full mb-4 animate-bounce">
                        <CheckCircle2 size={48} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white text-center">
                        คำสั่งซื้อสำเร็จ!
                    </h1>
                    <p className="text-green-100 text-sm mt-2">
                        ขอบคุณสำหรับการสั่งซื้อ
                    </p>
                </div>

                <div className="p-8">
                    {/* Order Info Details */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-border-main pb-4">
                            <span className="text-muted text-sm font-medium">Order ID</span>
                            <span className="text-content font-mono font-bold text-sm bg-main px-3 py-1 rounded-lg">
                                #{id?.slice(-8).toUpperCase()}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-content flex items-center">
                                <Package size={16} className="mr-2 text-primary" />
                                Shipping Information
                            </h3>
                            <div className="bg-main rounded-xl p-4 text-sm text-muted leading-relaxed">
                                <p className="font-bold text-content mb-1">{order?.receiverName || 'Loading...'}</p>
                                <p>{order?.shippingAddress || 'Fetching address details...'}</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center py-4">
                            <span className="text-content font-semibold uppercase tracking-wider text-xs">Total Amount</span>
                            <span className="text-2xl font-black text-primary">
                                ฿{order?.totalPrice?.toLocaleString() || '0.00'}
                            </span>
                        </div>
                    </div>

                    <hr className="my-6 border-dashed border-border-main" />

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 gap-3">
                        <Link to="/orders" className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg">
                            <ReceiptText size={18} />
                            ดูคำสั่งซื้อ
                        </Link>
                        <Link to="/" className="flex-1 flex items-center justify-center gap-2 bg-surface border border-border-main hover:bg-surface-hover text-content font-bold py-3 px-6 rounded-2xl transition-all">
                            <ShoppingBag size={18} className="mr-2" />
                            Continue Shopping
                        </Link>
                    </div>

                    {/* Support Info */}
                    <p className="text-center text-xs text-muted mt-8 leading-relaxed">
                        A confirmation email has been sent to your inbox.<br />
                        Need help? <Link to="/contact" className="text-primary font-medium hover:underline">Contact Support</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}