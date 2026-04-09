import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store'; // ปรับตาม path จริงของคุณ
import { Package, Clock, CheckCircle2, ChevronRight, ReceiptText, CreditCard, XCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { OrderResponse } from '../interface/orderInterface';
import type React from 'react';
import { useEffect } from 'react';
import { fetchOrderUser } from '../service/orderService';
import { convertDateUtctoTimezone } from '../utils/convertDateUtctoTimezone';
// import { fetchProducts } from '../service/productService';
// import type { Product } from '../interface/productInterface';

export default function OrderUserPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    // const dispatch = useDispatch<AppDispatch>();
    // ดึงข้อมูล orders จาก state.user.user.orders ตามที่คุณระบุ
    const { listOrderUser } = useSelector((state: RootState) => state.order);
    const orders = listOrderUser || [];
    console.log("listOrderUser => ", orders);

    useEffect(() => {
        dispatch(fetchOrderUser());
    }, [dispatch])

    // ฟังก์ชันจัดการสีของ Status
    // const getStatusStyle = (status: string) => {
    //     switch (status) {
    //         case 'SUCCESS': return 'bg-green-100 text-green-600 border-green-200';
    //         case 'PENDING': return 'bg-amber-100 text-amber-600 border-amber-200';
    //         case 'CANCELLED': return 'bg-red-100 text-red-600 border-red-200';
    //         default: return 'bg-gray-100 text-gray-600 border-gray-200';
    //     }
    // };

    const handleOrderDetail = (e: React.MouseEvent<HTMLButtonElement>, order: OrderResponse) => {
        e.preventDefault();
        navigate(`/profile/orders/${order.id}`);
    }

    // const getProductData = async (order: OrderResponse) => {
    //     const productData: Product[] = await dispatch(fetchProducts()).unwrap();
    //     const productVariant = productData.flatMap((product) => product.variants);
    //     const filterProduct = order.items.map((item) => {
    //         return productVariant.find((variant) => variant.id === item.productId)
    //     });
    //     return filterProduct;
    // };

    return (
        <div className="max-w-4xl mx-auto py-10">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-black text-content flex items-center gap-3">
                    <Package className="text-primary" size={28} />
                    คำสั่งซื้อของฉัน
                </h1>
                <p className="text-muted text-sm mt-1">ติดตามและดูประวัติการสั่งซื้อทั้งหมดของคุณ</p>
            </div>

            {/* 1. กรณีไม่มีคำสั่งซื้อ (Empty State) */}
            {orders.length === 0 ? (
                <div className="bg-surface rounded-3xl p-16 text-center border border-dashed border-border-main">
                    <div className="bg-main w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ReceiptText className="text-muted" size={40} />
                    </div>
                    <h3 className="text-lg font-bold text-content">ยังไม่มีรายการสั่งซื้อ</h3>
                    <p className="text-muted mb-6">เริ่มช้อปปิ้งเพื่อสร้างคำสั่งซื้อแรกของคุณ!</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg"
                    >
                        ไปหน้าสินค้า
                    </button>
                </div>
            ) : (
                /* 2. รายการคำสั่งซื้อ (Order List) */
                <div className="space-y-4">
                    {orders.map((order: OrderResponse) => {
                        // const filterProduct = getProductData(order);

                        return (
                            <div
                                key={order.id}
                                className="bg-surface rounded-3xl border border-border-main shadow-sm hover:shadow-md transition-all overflow-hidden group"
                            >
                                <div className="p-5 md:p-6">
                                    {/* Upper Part: Order ID & Date */}
                                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b border-border-main">
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-muted uppercase tracking-widest">Order ID</p>
                                            <p className="font-mono text-sm font-bold text-content">#{order.id?.slice(0, 8).toUpperCase()}</p>
                                        </div>

                                        <div className="flex items-center justify-between w-full py-2">
                                            {/* ฝั่งซ้าย: สถานะคำสั่งซื้อ */}
                                            <div className="flex items-center gap-2">
                                                <StatusBadge status={order.status} />

                                                {/* ถ้าต้องการโชว์ Label ภาษาอังกฤษกำกับแบบเบาๆ */}
                                                <span className="text-[10px] uppercase tracking-wider text-muted font-medium">
                                                    {order.status}
                                                </span>
                                            </div>

                                            {/* ฝั่งขวา: วันที่สั่งซื้อ/ชำระเงิน */}
                                            <div className="text-right">
                                                <div className="flex items-center gap-1.5 text-muted">
                                                    <Calendar size={12} className="text-muted" />
                                                    <p className="text-xs font-medium">
                                                        {order.invoice?.paidAt
                                                            ? convertDateUtctoTimezone(order.invoice.paidAt)
                                                            : "ยังไม่มีข้อมูลการชำระเงิน"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle Part: Products Preview (แสดงจำนวนรายการ) */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-main p-3 rounded-2xl text-muted">
                                                <Package size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-content">รายการสินค้า ({order.subOrders?.reduce((acc, sub) => acc + (sub.orderItems?.length || 0), 0) || 0} รายการ)</p>
                                                {/* <p className="text-sm text-gray-500 italic">
                                                        {Array.isArray(filterProduct) && filterProduct} 
                                                    </p> */}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xs font-bold text-muted uppercase tracking-widest">ยอดรวมสุทธิ</p>
                                            <p className="text-xl font-black text-primary">฿{order.totalPrice?.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Lower Part: Actions */}
                                    <div className="mt-6 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 text-muted text-xs">
                                            <CreditCard size={14} />
                                            <span>ชำระผ่าน: {order.invoice?.paymentMethod || 'N/A'}</span>
                                        </div>

                                        <button
                                            onClick={(e) => handleOrderDetail(e, order)}
                                            className="flex items-center gap-1 text-sm font-bold text-content hover:text-primary transition-colors"
                                        >
                                            ดูรายละเอียด <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
}

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