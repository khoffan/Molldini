/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChevronDown, ChevronUp, Edit3, Layers } from "lucide-react";
import { useState } from "react";
import type { Product, ProductVariant } from "../../interface/productInterface";
import { useNavigate } from "react-router";

// --- Component สำหรับ Desktop Row ---
export function ProductDesktopRow({ product }: { product: Product }) {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);
    const totalStock = product.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) || 0;

    const handleEdit = (id: string, product: Product) => {
        navigate("/edit-product/" + id, {
            state: {
                product: product
            }
        });
    }

    return (
        <>
            <tr
                className={`hover:bg-gray-50/80 transition-all cursor-pointer ${isExpanded ? 'bg-blue-50/20' : ''}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden">
                            <img
                                src={product.variants?.[0]?.images?.[0]?.url || 'https://placehold.co/100'}
                                className="w-full h-full object-cover"
                                alt=""
                            />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 line-clamp-1">{product.title}</p>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">{product.category?.name ?? 'ไม่มีหมวดหมู่'}</p>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                        <Layers size={16} className="text-blue-500" />
                        {product.variants?.length} รูปแบบ
                    </div>
                </td>
                <td className="px-6 py-5">
                    <span className={`text-sm font-bold ${totalStock <= 5 ? 'text-red-500' : 'text-gray-700'}`}>
                        {totalStock} ชิ้น
                    </span>
                </td>
                <td className="px-6 py-5 text-right">
                    <div className="flex justify-end items-center gap-2">
                        {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                    </div>
                </td>
            </tr>

            {/* ส่วนที่ขยายออกมา (Variant Details) */}
            {isExpanded && (
                <tr>
                    <td colSpan={4} className="px-6 pb-6 bg-blue-50/20">
                        <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50/50 text-gray-500">
                                    <tr>
                                        <th className="px-4 py-3 font-bold">ชื่อตัวเลือก (Variant)</th>
                                        <th className="px-4 py-3 font-bold">ราคา</th>
                                        <th className="px-4 py-3 font-bold text-center">สต็อก</th>
                                        <th className="px-4 py-3 font-bold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-gray-600">
                                    {product.variants.map((v: ProductVariant, index: number) => (
                                        <tr key={index} className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-medium text-gray-800">{v.variantName}</td>
                                            <td className="px-4 py-3 font-bold text-blue-600">฿{v.price.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={v.stock <= 5 ? 'text-red-500 font-bold' : ''}>{v.stock}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => handleEdit(product.id, product)} className="p-1 hover:text-blue-600 transition-colors"><Edit3 size={16} /></button>
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

// --- Component สำหรับ Mobile Card ---
export function ProductMobileCard({ product }: { product: Product }) {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <div className="p-4 bg-white">
            <div className="flex items-start gap-4" onClick={() => setIsExpanded(!isExpanded)}>
                <img
                    src={product.variants?.[0]?.images?.[0]?.url || 'https://placehold.co/100'}
                    className="w-20 h-20 rounded-2xl object-cover border border-gray-100"
                    alt=""
                />
                <div className="flex-1 min-w-0 pt-1">
                    <h4 className="font-bold text-gray-900 truncate mb-1">{product.title}</h4>
                    <div className="flex flex-wrap gap-2">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">
                            {product.variants?.length} Variants
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                            {product.category?.name || ''}
                        </span>
                    </div>
                </div>
                <button className="mt-1 text-gray-300">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>

            {isExpanded && (
                <div className="mt-4 space-y-2 bg-gray-50 rounded-2xl p-4">
                    {product.variants.map((v: ProductVariant, index: number) => (
                        <div key={index} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
                            <div>
                                <p className="text-sm font-bold text-gray-800">{v.variantName}</p>
                                <p className="text-[10px] text-gray-400">คงเหลือ: {v.stock} ชิ้น</p>
                            </div>
                            <p className="font-black text-blue-600">฿{v.price.toLocaleString()}</p>
                        </div>
                    ))}
                    <button className="w-full py-3 text-sm font-bold text-gray-500 bg-white rounded-xl border border-dashed border-gray-200 mt-2 hover:bg-gray-100 transition-colors">
                        แก้ไขข้อมูลสินค้า
                    </button>
                </div>
            )}
        </div>
    );
}