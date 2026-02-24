import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { Store, MapPin, Star, Package } from 'lucide-react';
import type { AppDispatch, RootState } from '../store';
import { fetchProducts } from '../service/productService';
import { getImageValidate } from '../utils/getImageValidate';

export default function MerchantProductStore() {
    const { id } = useParams();
    const dispatch = useDispatch<AppDispatch>();

    const { items, loading, error } = useSelector((state: RootState) => state.product);

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    const merchantProducts = useMemo(() => {
        if (!id) return [];
        return items.filter((item) => item.merchant?.id === id || item.merchantId === id);
    }, [items, id]);

    // ดึงข้อมูล Merchant จากสินค้าตัวแรกที่เจอ (เนื่องจาก API getAllProducts include merchant มาด้วย)
    const merchantInfo = merchantProducts.length > 0 ? merchantProducts[0].merchant : null;

    if (loading) return <div className="p-20 text-center">Loading...</div>;
    if (error) return <div className="p-20 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="min-h-screen bg-main px-4 py-10">
            <div className="max-w-7xl mx-auto">
                {/* Merchant Header */}
                <div className="bg-surface rounded-2xl shadow-sm border border-border-main p-6 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="w-32 h-32 rounded-full bg-gray-50 border-4 border-white shadow-lg overflow-hidden flex-shrink-0">
                        {merchantInfo?.logoUrl ? (
                            <img src={merchantInfo.logoUrl.url} alt={merchantInfo.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Store size={48} />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div>
                            <h1 className="text-xl font-bold text-content">ร้าน {merchantInfo?.name ?? `Merchant #${id?.slice(0, 6)}`}</h1>
                            <div className="flex items-center gap-3 text-sm text-muted mt-1">
                                {merchantInfo?.description || 'ร้านค้านี้ยังไม่มีคำอธิบาย'}
                            </div>
                        </div>

                        <div className="mt-4 flex gap-6 text-sm text-muted">
                            {merchantInfo?.address && (
                                <div className="flex items-center gap-1">
                                    <MapPin size={16} className="text-primary" />
                                    <span>{merchantInfo.address.district}, {merchantInfo.address.province}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <Package size={16} className="text-primary" />
                                <span><strong className="text-content">{merchantProducts?.length || 0}</strong> สินค้า</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Star size={16} className="text-amber-400" fill="currentColor" />
                                <span>4.8 (120 รีวิว)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {merchantProducts.map((product) => {
                        const defaultVariant = product.variants?.[0];
                        const hasMultipleVariants = product.variants && product.variants.length > 1;

                        return (
                            <Link to={`/product/${product.id}`} key={product.id} className="group flex flex-col bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-border-main">
                                {/* Image Section */}
                                <div className="relative aspect-[4/5] overflow-hidden">
                                    <img
                                        src={getImageValidate(product?.images?.[0]?.url ?? "")}
                                        alt={product.title}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = "https://placehold.co/400x500?text=Image+Error";
                                        }}
                                        className="w-full h-48 object-cover bg-main group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {hasMultipleVariants && (
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                                            <p className="text-[10px] font-bold uppercase text-gray-600">
                                                {product.variants.length} Options
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Content Section */}
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="mb-auto">
                                        <p className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">{product.category?.name || 'General'}</p>
                                        <h3 className="text-lg font-bold text-content line-clamp-2 group-hover:text-primary transition-colors mb-3">
                                            {product.title}
                                        </h3>
                                    </div>

                                    {/* Variants Preview */}
                                    <div className="mt-4 flex gap-2">
                                        {product.variants?.slice(0, 4).map((v) => (
                                            <div key={v.id} className="w-4 h-4 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center text-[8px] font-bold">
                                                {v.sku?.[0]}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-xs text-gray-400">Starting from</p>
                                            <p className="text-xl font-black text-gray-900">
                                                ฿{defaultVariant?.price.toLocaleString() ?? 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}