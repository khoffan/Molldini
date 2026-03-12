import React, { memo } from 'react'
import type { Product } from '../../interface/productInterface'
import { Link, useNavigate } from 'react-router';
import { getImageValidate } from '../../utils/getImageValidate';
import { Store } from 'lucide-react';


interface ProductContentProps {
    product: Product

}
export const ProductContent = memo(({ product }: ProductContentProps) => {
    const navigate = useNavigate();

    const handleMerchantPage = (e: React.MouseEvent, merchantId: string) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/merchant/product/${merchantId}`);
    }

    // เลือก Variant ตัวแรกเป็นค่าเริ่มต้น หรือตัวที่ราคาถูกที่สุด
    const defaultVariant = product.variants?.[0];
    const hasMultipleVariants = product.variants && product.variants.length > 1;

    return (
        <Link to={`/product/${product.id}`} key={product.id}
            className="group flex flex-col bg-surface rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-border-main will-change-transform">
            {/* Image Section */}
            <div className="relative aspect-[4/5] overflow-hidden">
                <img
                    src={getImageValidate(product?.images?.[0]?.url)}
                    alt={product.title}
                    decoding='async'
                    loading='lazy'
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        // ถ้า Link หลักตาย ให้เปลี่ยนเป็น Link สำรอง (Fallback Link)
                        target.src = "https://placehold.co/400x500?text=Image+Error";
                    }}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {hasMultipleVariants && (
                    <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                        <p className="text-[10px] font-bold uppercase text-muted">
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

                    <button onClick={(e) => handleMerchantPage(e, product.merchantId!)} className="flex items-center gap-2 mb-4 pb-4 border-b border-border-main cursor-pointer">
                        <div className="w-6 h-6 rounded-full bg-surface-hover flex items-center justify-center overflow-hidden border border-border-main shrink-0">
                            {product.merchant?.logoUrl ? (
                                <img src={product.merchant.logoUrl.url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <Store size={12} className="text-muted" />
                            )}
                        </div>
                        <span className="text-xs text-muted font-medium truncate">
                            {product.merchant?.name || 'Molldini Official'}
                        </span>
                    </button>
                </div>

                {/* Variants Preview (แสดงจุดสีหรือขนาดคร่าวๆ) */}
                <div className="mt-4 flex gap-2">
                    {product.variants?.slice(0, 4).map((v) => (
                        <div key={v.id} className="w-4 h-4 rounded-full border border-border-main bg-surface-hover flex items-center justify-center text-[8px] font-bold">
                            {v.sku?.[0]}
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs text-muted">Starting from</p>
                        <p className="text-xl font-black text-content">
                            ฿{defaultVariant?.price.toLocaleString() ?? 'N/A'}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
})
