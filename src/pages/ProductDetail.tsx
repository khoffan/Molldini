import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { ShoppingCart, Plus, Minus, ChevronLeft, Star, ShieldCheck, Truck } from 'lucide-react';
import LoadingSkelition from '../components/loadingSkeleton/LoadingShrinkBoxSkelition';
import { useDispatch } from 'react-redux';
import { addCartDb } from '../service/cartService';
import type { CartItem } from '../interface/cartInterface';
import Swal from 'sweetalert2';
import { fetchProducts } from '../service/productService';
import { getImageValidate } from '../utils/getImageValidate';

function ProductDetail() {
    const { id } = useParams();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);

    const { items, loading, error } = useSelector((state: RootState) =>
        state.product
    );

    const product = items.find(item => item.id === id);
    const productVariant = product?.variants;

    // เพิ่ม State สำหรับเลือก Variant (เริ่มต้นที่ตัวแรก)
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
    const currentVariant = productVariant![selectedVariantIndex];


    let imageUrl: string = "";
    if (Array.isArray(currentVariant.images) && currentVariant.images.length > 0) {
        imageUrl = getImageValidate(currentVariant.images[0].url);
    } else {
        imageUrl = "https://placehold.co/400x500?text=Image+Error";
    }


    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    if (loading) {
        return <LoadingSkelition />;
    }

    if (error) {
        return <div className="text-center py-20 text-gray-500">เกิดข้อผิดพลาด: {error}</div>;
    }

    if (!product || !currentVariant) return <div className="text-center py-20 text-gray-500">ไม่พบข้อมูลสินค้า</div>;

    const handleIncrement = () => setQuantity(prev => prev + 1);
    const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const handleAddToCart = (shouldNavigate: boolean, variantId: string) => {
        const cartItem: CartItem = {
            quantity,
            userId: "",
            title: product.title,
            productId: variantId
        }
        dispatch(addCartDb(cartItem));

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
            {/* Breadcrumb */}
            <div className="max-w-6xl mx-auto px-4 py-4">
                <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors font-medium">
                    <ChevronLeft size={20} /> ย้อนกลับ
                </button>
            </div>

            <main className="max-w-6xl mx-auto px-4">
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex flex-col lg:flex-row">

                        {/* 📸 ฝั่งซ้าย: รูปภาพสินค้า (ไม่ Map ซ้ำแล้ว) */}
                        <div className="lg:w-1/2 p-4 lg:p-12 bg-white">
                            <div className="aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-50 group">
                                <img
                                    src={imageUrl}
                                    alt={currentVariant.variantName}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        // ถ้า Link หลักตาย ให้เปลี่ยนเป็น Link สำรอง (Fallback Link)
                                        target.src = "https://placehold.co/400x500?text=Image+Error";
                                    }}
                                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        </div>

                        {/* 📝 ฝั่งขวา: รายละเอียดและการเลือก */}
                        <div className="lg:w-1/2 p-8 lg:p-12 bg-white flex flex-col border-l border-gray-50">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-widest">
                                        {currentVariant.sku}
                                    </span>
                                    <div className="flex items-center gap-1 text-amber-400">
                                        <Star size={14} fill="currentColor" />
                                        <span className="text-gray-400 text-xs font-bold">4.8 (120 รีวิว)</span>
                                    </div>
                                </div>

                                <h1 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
                                    {product.title}
                                </h1>
                                <p className="text-gray-500 mt-2 font-medium">{currentVariant.variantName}</p>

                                <div className="mt-8 flex items-center gap-4">
                                    <span className="text-4xl font-black text-blue-600">
                                        ฿{currentVariant.price.toLocaleString()}
                                    </span>
                                    <span className="text-xl text-gray-300 line-through font-medium">
                                        ฿{(currentVariant.price * 1.2).toLocaleString()}
                                    </span>
                                </div>

                                {/* 🎨 ส่วนเลือก Variant (ใช้ Map ตรงนี้แทน) */}
                                <div className="mt-10">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">ตัวเลือกสินค้า</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {Array.isArray(productVariant) && productVariant.map((variant, index) => (
                                            <button
                                                key={variant.id}
                                                onClick={() => setSelectedVariantIndex(index)}
                                                className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all border-2 ${selectedVariantIndex === index
                                                    ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md shadow-blue-50'
                                                    : 'border-gray-100 hover:border-gray-200 text-gray-500'
                                                    }`}
                                            >
                                                {variant.variantName}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 🔢 ส่วนเลือกจำนวน */}
                                <div className="mt-10">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">จำนวน</h3>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center bg-gray-50 rounded-2xl p-1 border border-gray-100">
                                            <button onClick={handleDecrement} className="p-3 hover:bg-white rounded-xl text-gray-600 transition-all shadow-sm active:scale-90"><Minus size={18} /></button>
                                            <span className="w-12 text-center font-black text-lg text-gray-900">{quantity}</span>
                                            <button onClick={handleIncrement} className="p-3 hover:bg-white rounded-xl text-gray-600 transition-all shadow-sm active:scale-90"><Plus size={18} /></button>
                                        </div>
                                        <span className="text-xs font-bold text-gray-400">คลังสินค้า: {currentVariant.stock} ชิ้น</span>
                                    </div>
                                </div>
                            </div>

                            {/* 🛒 ปุ่ม Action */}
                            <div className="mt-12 flex flex-col sm:flex-row gap-4">
                                <button onClick={() => handleAddToCart(false, currentVariant.id)} className="flex-[2] flex items-center justify-center gap-3 bg-white border-2 border-blue-600 text-blue-600 py-4 rounded-2xl font-black hover:bg-blue-50 transition-all active:scale-95 shadow-lg shadow-blue-50">
                                    <ShoppingCart size={22} /> เพิ่มลงรถเข็น
                                </button>
                                <button onClick={() => handleAddToCart(true, currentVariant.id)} className="flex-[3] bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95">
                                    ซื้อเลยตอนนี้
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Badges */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-white p-5 rounded-3xl flex items-center gap-4 border border-gray-100">
                        <div className="bg-green-50 p-3 rounded-2xl text-green-600"><ShieldCheck /></div>
                        <div><p className="font-bold text-sm">รับประกันของแท้</p><p className="text-xs text-gray-400">ยินดีคืนเงิน 100%</p></div>
                    </div>
                    <div className="bg-white p-5 rounded-3xl flex items-center gap-4 border border-gray-100">
                        <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><Truck /></div>
                        <div><p className="font-bold text-sm">จัดส่งด่วน</p><p className="text-xs text-gray-400">ภายใน 1-3 วันทำการ</p></div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ProductDetail;