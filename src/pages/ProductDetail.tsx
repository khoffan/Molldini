import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { ShoppingCart, Plus, Minus, ChevronLeft } from 'lucide-react';
import LoadingSkelition from '../components/LoadingSkelition';
import type { ProductState } from '../reducer/productReducer';
import { useDispatch } from 'react-redux';
import { addToCart } from '../actions/certActions';
import type { CartItem } from '../interface/cartInterface';
import Swal from 'sweetalert2';

function ProductDetail() {
    const { id } = useParams();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);

    const { items, loading, error } = useSelector((state: RootState) =>
        state.product
    ) as ProductState;

    const product = items.find(item => item.id === id);

    if (loading) {
        return <LoadingSkelition />;
    }

    if (error) {
        return <div className="text-center py-20 text-gray-500">เกิดข้อผิดพลาด: {error}</div>;
    }

    if (!product) {
        return <div className="text-center py-20 text-gray-500">ไม่พบข้อมูลสินค้า</div>;
    }

    const handleIncrement = () => setQuantity(prev => prev + 1);
    const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const handleAddToCart = (shouldNavigate: boolean) => {
        const cartItem: CartItem = {
            id: Date.now().toString(),
            productId: product.id ?? "",
            quantity,
            userId: "1",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
        dispatch(addToCart(cartItem));

        if (shouldNavigate) {
            // กรณีปุ่ม "ซื้อเลยตอนนี้"
            navigate('/cart');
        } else {
            // กรณีปุ่ม "เพิ่มไปยังรถเข็น" - แสดง Alert สวยๆ
            Swal.fire({
                title: 'เพิ่มลงตะกร้าสำเร็จ!',
                text: `เพิ่ม ${product.title} จำนวน ${quantity} ชิ้นเรียบร้อยแล้ว`,
                icon: 'success',
                showConfirmButton: false,
                timer: 1500, // ปิดเองภายใน 1.5 วินาที
                position: 'center',
                toast: false, // ถ้าอยากให้เป็น Popup กลางจอ
                iconColor: '#2563eb', // สีน้ำเงิน Blue-600 ของ Molldini
                customClass: {
                    popup: 'rounded-3xl', // ทำมุมโค้งให้เข้ากับ UI ของเรา
                    title: 'text-xl font-bold text-gray-800',
                }
            });
        }
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Navigation Breadcrumb */}
            <div className="max-w-6xl mx-auto px-4 py-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                >
                    <ChevronLeft size={20} />
                    <span>ย้อนกลับ</span>
                </button>
            </div>

            <main className="max-w-6xl mx-auto px-4">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex flex-col lg:flex-row">

                        {/* ฝั่งซ้าย: รูปภาพสินค้า */}
                        <div className="lg:w-1/2 p-8 border-r border-gray-50">
                            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 group">
                                <img
                                    src={product.image}
                                    alt={product.title}
                                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                        </div>

                        {/* ฝั่งขวา: รายละเอียดสินค้า */}
                        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col">
                            <div className="flex-1">
                                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider">
                                    {product.category}
                                </span>
                                <h1 className="mt-4 text-3xl font-extrabold text-gray-900 leading-tight">
                                    {product.title}
                                </h1>

                                <div className="mt-6 flex items-baseline gap-4">
                                    <span className="text-4xl font-black text-blue-600">
                                        ฿{product.price.toLocaleString()}
                                    </span>
                                    {/* สมมติราคาก่อนลด */}
                                    <span className="text-lg text-gray-400 line-through">
                                        ฿{(product.price * 1.2).toLocaleString()}
                                    </span>
                                </div>

                                <div className="mt-8">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase">รายละเอียดสินค้า</h3>
                                    <p className="mt-3 text-gray-600 leading-relaxed">
                                        {product.description || "ไม่มีรายละเอียดสินค้าเพิ่มเติมสำหรับรายการนี้ ผลิตภัณฑ์คุณภาพเยี่ยมที่คัดสรรมาเพื่อคุณโดยเฉพาะ"}
                                    </p>
                                </div>

                                {/* ส่วนเลือกจำนวนสินค้า */}
                                <div className="mt-10">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase mb-4">จำนวน</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                            <button
                                                onClick={handleDecrement}
                                                className="p-3 hover:bg-gray-50 text-gray-600 transition-colors"
                                            >
                                                <Minus size={18} />
                                            </button>
                                            <span className="w-14 text-center font-bold text-gray-900 border-x border-gray-200">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={handleIncrement}
                                                className="p-3 hover:bg-gray-50 text-gray-600 transition-colors"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                        <span className="text-sm text-gray-400">มีสินค้าทั้งหมด 99 ชิ้น</span>
                                    </div>
                                </div>
                            </div>

                            {/* ปุ่ม Action */}
                            <div className="mt-12 flex flex-col sm:flex-row gap-4">
                                <button onClick={() => handleAddToCart(false)} className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-4 rounded-2xl font-bold hover:bg-blue-100 transition-all active:scale-95">
                                    <ShoppingCart size={20} />
                                    เพิ่มไปยังรถเข็น
                                </button>
                                <button onClick={() => handleAddToCart(true)} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95">
                                    ซื้อเลยตอนนี้
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ส่วนเสริมด้านล่าง (Reviews/Specs) */}
                <div className="mt-8 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">คุณสมบัติโดยละเอียด</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                        <div className="flex justify-between py-2 border-b border-gray-50">
                            <span className="text-gray-500">แบรนด์</span>
                            <span className="font-medium text-gray-900 text-right">Premium Mall</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-50">
                            <span className="text-gray-500">การรับประกัน</span>
                            <span className="font-medium text-gray-900 text-right">12 เดือน</span>
                        </div>
                        {/* เพิ่มเติมได้ตามต้องการ */}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ProductDetail;