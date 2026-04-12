/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChevronDown, ChevronUp, Edit3, Layers } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import type { Product, ProductVariant } from "../../products/interfaces/productInterface";
import { useNavigate } from "react-router";

// --- Component สำหรับ Desktop Row ---
export const ProductDesktopRow = memo(({ product }: { product: Product }) => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);
    const totalStock = useMemo(() => {
        return product.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) || 0;
    }, [product.variants]);

    const handleEdit = (id: string, product: Product) => {
        navigate("/edit-product/" + id, {
            state: {
                product: product
            }
        });
    }

    const toggleExpand = useCallback(() => setIsExpanded(p => !p), []);


    return (
        <>
            <tr
                className={`hover:bg-surface-hover/80 transition-all cursor-pointer ${isExpanded ? 'bg-primary-light/20' : ''}`}
                onClick={toggleExpand}
            >
                <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-surface-hover border border-border-main shrink-0 overflow-hidden">
                            <img
                                src={product.variants?.[0]?.images?.[0]?.url || 'https://placehold.co/100'}
                                className="w-full h-full object-cover"
                                alt=""
                            />
                        </div>
                        <div>
                            <p className="font-bold text-content line-clamp-1">{product.title}</p>
                            <p className="text-xs text-muted uppercase tracking-wider">{product.category?.name ?? 'ไม่มีหมวดหมู่'}</p>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted">
                        <Layers size={16} className="text-blue-500" />
                        {product.variants?.length} รูปแบบ
                    </div>
                </td>
                <td className="px-6 py-5">
                    <span className={`text-sm font-bold ${totalStock <= 5 ? 'text-red-500' : 'text-content'}`}>
                        {totalStock} ชิ้น
                    </span>
                </td>
                <td className="px-6 py-5 text-right">
                    <div className="flex justify-end items-center gap-2">
                        {isExpanded ? <ChevronUp size={20} className="text-muted" /> : <ChevronDown size={20} className="text-muted" />}
                    </div>
                </td>
            </tr>

            {/* ส่วนที่ขยายออกมา (Variant Details) */}
            {isExpanded && (
                <tr>
                    <td colSpan={4} className="px-6 pb-6 bg-primary-light/20">
                        <div className="bg-surface rounded-xl border border-primary/20 shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-surface-hover/50 text-muted">
                                    <tr>
                                        <th className="px-4 py-3 font-bold">ชื่อตัวเลือก (Variant)</th>
                                        <th className="px-4 py-3 font-bold">ราคา</th>
                                        <th className="px-4 py-3 font-bold text-center">สต็อก</th>
                                        <th className="px-4 py-3 font-bold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-main text-muted">
                                    {product.variants.map((v: ProductVariant, index: number) => (
                                        <tr key={index} className="hover:bg-surface-hover/50">
                                            <td className="px-4 py-3 font-medium text-content">{v.variantName}</td>
                                            <td className="px-4 py-3 font-bold text-primary">฿{v.price.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={v.stock <= 5 ? 'text-red-500 font-bold' : ''}>{v.stock}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => handleEdit(product.id, product)} className="p-1 hover:text-primary transition-colors"><Edit3 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
)

// --- Component สำหรับ Mobile Card ---
export const ProductMobileCard = memo(({ product }: { product: Product }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const toggleExpand = useCallback(() => setIsExpanded(p => !p), []);
    return (
        <div className="p-4 bg-surface">
            <div className="flex items-start gap-4" onClick={toggleExpand}>
                <img
                    src={product.variants?.[0]?.images?.[0]?.url || 'https://placehold.co/100'}
                    className="w-20 h-20 rounded-2xl object-cover border border-border-main"
                    alt=""
                />
                <div className="flex-1 min-w-0 pt-1">
                    <h4 className="font-bold text-content truncate mb-1">{product.title}</h4>
                    <div className="flex flex-wrap gap-2">
                        <span className="text-[10px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded-md uppercase">
                            {product.variants?.length} Variants
                        </span>
                        <span className="text-[10px] font-bold text-muted bg-surface-hover px-2 py-0.5 rounded-md">
                            {product.category?.name || ''}
                        </span>
                    </div>
                </div>
                <button className="mt-1 text-muted">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>

            {isExpanded && (
                <div className="mt-4 space-y-2 bg-surface-hover rounded-2xl p-4">
                    {product.variants.map((v: ProductVariant, index: number) => (
                        <div key={index} className="flex justify-between items-center bg-surface p-3 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-border-main">
                            <div>
                                <p className="text-sm font-bold text-content">{v.variantName}</p>
                                <p className="text-[10px] text-muted">คงเหลือ: {v.stock} ชิ้น</p>
                            </div>
                            <p className="font-black text-primary">฿{v.price.toLocaleString()}</p>
                        </div>
                    ))}
                    <button className="w-full py-3 text-sm font-bold text-muted bg-surface rounded-xl border border-dashed border-border-main mt-2 hover:bg-surface-hover transition-colors">
                        แก้ไขข้อมูลสินค้า
                    </button>
                </div>
            )}
        </div>
    );
})
