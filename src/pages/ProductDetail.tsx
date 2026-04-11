import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import type { AppDispatch } from '../store';
import { ShoppingCart, Plus, Minus, ChevronLeft, Star } from 'lucide-react';
import LoadingSkelition from '../components/loadingComponent/LoadingShrinkBoxSkelition';
import { useDispatch } from 'react-redux';
import { addCartDb } from '../service/cartService';
import type { CartItem } from '../interface/cartInterface';
import Swal from 'sweetalert2';
import { useGuardAction } from '../utils/checkAuth';
import { fetchProducts } from '../service/productService';
import { getImageValidate } from '../utils/getImageValidate';
import { Helmet } from 'react-helmet-async';
import type { Product } from '../interface/productInterface';

function ProductDetail() {
    const { checkAuth } = useGuardAction();
    const { id } = useParams();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // --- [ปรับปรุง] ใช้ Local State เพื่อความสดใหม่ของข้อมูล ---
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

    useEffect(() => {
        const loadProductData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                // 🚀 เรียก action ตรงๆ และ unwrap ออกมา
                const result = await dispatch(fetchProducts(id)).unwrap();

                // ตรวจสอบว่าเป็น Object สินค้าตัวเดียว (ถ้า API คืนค่าเป็น Array ให้หยิบตัวแรก)
                const data = Array.isArray(result) ? result[0] : result;

                if (data && data.variants && data.variants.length > 0) {
                    setProduct(data);
                } else {
                    throw new Error("Product data is incomplete");
                }
            } catch (err: unknown) {
                console.error("Fetch Error:", err);
                setError((err as Error).message || "ไม่สามารถโหลดข้อมูลสินค้าได้");
                // ถ้าไม่พบสินค้าจริงๆ ให้ดีดกลับหน้าแรก
                navigate('/', { replace: true });
            } finally {
                setLoading(false);
            }
        };

        loadProductData();
    }, [dispatch, id, navigate]);

    // --- [Helper Variables] ---
    const productVariant = product?.variants;
    const currentVariant = productVariant?.[selectedVariantIndex];
    console.log(currentVariant)

    // จัดการรูปภาพ (ปลอดภัยขึ้นด้วย Optional Chaining)
    let imageUrl: string = "https://placehold.co/400x500?text=No+Image";
    if (currentVariant?.images && currentVariant.images.length > 0) {
        imageUrl = getImageValidate(currentVariant.images[0]?.url ?? '');
    }

    // --- [Handlers] ---
    const handleIncrement = () => setQuantity(prev => prev + 1);
    const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const handleAddToCart = (shouldNavigate: boolean, variantId: string) => {
        if (!product) return;
        checkAuth(() => {
            const cartItem: CartItem = {
                quantity,
                userId: "",
                title: product.title,
                productId: variantId
            }
            dispatch(addCartDb(cartItem));

            if (shouldNavigate) {
                navigate('/cart');
            } else {
                Swal.fire({
                    title: 'เพิ่มลงตะกร้าสำเร็จ!',
                    text: `เพิ่ม ${product.title} จำนวน ${quantity} ชิ้นเรียบร้อยแล้ว`,
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    iconColor: '#2563eb',
                    customClass: { popup: 'rounded-3xl', title: 'text-xl font-bold text-gray-800' }
                });
            }
        })
    }

    // --- [Conditional Rendering] ---
    if (loading) return <LoadingSkelition />;
    if (error) return <div className="text-center py-20 text-muted">เกิดข้อผิดพลาด: {error}</div>;
    if (!product || !currentVariant) return null;

    return (
        <>
            <Helmet>
                <title>{`${product.title} | Molldini`}</title>
                <meta name="description" content={product.description || ""} />
                <meta property="og:title" content={product.title} />
                <meta property="og:image" content={productVariant?.[0]?.images?.[0]?.url || ""} />
            </Helmet>

            <div className="bg-main min-h-screen pb-12">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted hover:text-primary transition-colors font-medium">
                        <ChevronLeft size={20} /> ย้อนกลับ
                    </button>
                </div>

                <main className="max-w-6xl mx-auto px-4">
                    <div className="bg-surface rounded-[2.5rem] shadow-sm border border-border-main overflow-hidden">
                        <div className="flex flex-col lg:flex-row">

                            {/* ฝั่งซ้าย: รูปภาพ */}
                            <div className="lg:w-1/2 p-4 lg:p-12 bg-surface">
                                <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-border-main group">
                                    <img
                                        src={imageUrl}
                                        alt={currentVariant.variantName}
                                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
                                        onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x500?text=Image+Error"; }}
                                    />
                                </div>
                            </div>

                            {/* ฝั่งขวา: รายละเอียด */}
                            <div className="lg:w-1/2 p-8 lg:p-12 bg-surface flex flex-col border-l border-border-main">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="px-3 py-1 bg-primary-light text-primary text-[10px] font-bold rounded-full uppercase tracking-widest">
                                            {currentVariant.sku || 'PRODUCT'}
                                        </span>
                                        <div className="flex items-center gap-1 text-amber-400">
                                            <Star size={14} fill="currentColor" />
                                            <span className="text-muted text-xs font-bold">4.8 (120 รีวิว)</span>
                                        </div>
                                    </div>

                                    <h1 className="text-3xl lg:text-4xl font-black text-content leading-tight">
                                        {product.title}
                                    </h1>
                                    <p className="text-muted mt-2 font-medium">{currentVariant.variantName}</p>

                                    <div className="mt-8 flex items-center gap-4">
                                        <span className="text-4xl font-black text-primary">
                                            ฿{currentVariant.price.toLocaleString()}
                                        </span>
                                        <span className="text-xl text-muted/50 line-through font-medium">
                                            ฿{(currentVariant.price * 1.2).toLocaleString()}
                                        </span>
                                    </div>

                                    {/* ส่วนเลือก Variant */}
                                    <div className="mt-10">
                                        <h3 className="text-xs font-black text-muted uppercase tracking-[0.2em] mb-4">ตัวเลือกสินค้า</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {productVariant.map((variant, index) => (
                                                <button
                                                    key={variant.id}
                                                    onClick={() => setSelectedVariantIndex(index)}
                                                    className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all border-2 ${selectedVariantIndex === index
                                                        ? 'border-primary bg-primary-light text-primary shadow-md'
                                                        : 'border-border-main hover:border-content/30 text-muted'
                                                        }`}
                                                >
                                                    {variant.variantName}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* ส่วนเลือกจำนวน */}
                                    <div className="mt-10">
                                        <h3 className="text-xs font-black text-muted uppercase tracking-[0.2em] mb-4">จำนวน</h3>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center bg-main rounded-2xl p-1 border border-border-main">
                                                <button onClick={handleDecrement} className="p-3 hover:bg-surface rounded-xl text-content transition-all shadow-sm active:scale-90"><Minus size={18} /></button>
                                                <span className="w-12 text-center font-black text-lg text-content">{quantity}</span>
                                                <button onClick={handleIncrement} className="p-3 hover:bg-surface rounded-xl text-content transition-all shadow-sm active:scale-90"><Plus size={18} /></button>
                                            </div>
                                            <span className="text-xs font-bold text-muted">คลังสินค้า: {currentVariant.stock} ชิ้น</span>
                                        </div>
                                    </div>
                                </div>

                                {/* ปุ่ม Action */}
                                <div className="mt-12 flex flex-col sm:flex-row gap-4">
                                    <button onClick={() => handleAddToCart(false, currentVariant.id)} className="flex-[2] flex items-center justify-center gap-3 bg-surface border-2 border-primary text-primary py-4 rounded-2xl font-black hover:bg-primary-light transition-all active:scale-95 shadow-lg">
                                        <ShoppingCart size={22} /> เพิ่มลงรถเข็น
                                    </button>
                                    <button onClick={() => handleAddToCart(true, currentVariant.id)} className="flex-[3] bg-primary text-white py-4 rounded-2xl font-black hover:bg-primary/90 transition-all shadow-xl active:scale-95">
                                        ซื้อเลยตอนนี้
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Info Badges อื่นๆ... */}
                </main>
            </div>
        </>
    );
}

export default ProductDetail;