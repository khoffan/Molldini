import { useNavigate } from 'react-router';
import type { Merchant } from '../interface/merchantInterface'; // ปรับ path ตามโปรเจกต์
import { Plus, Package, ShoppingBag, MapPin, Globe } from 'lucide-react';

interface Props {
    merchant: Merchant;
}

function MerchantDashboard({ merchant }: Props) {
    const navigate = useNavigate()
    // คำนวณสถิติจริงจากข้อมูลที่มีใน merchant object
    const totalProducts = merchant.products?.length || 0;

    const totalStock = merchant.products?.reduce((acc, prod) => {
        // 1. คำนวณสต็อกรวมของ "Product นี้" จากทุก Variants ก่อน
        const productTotal = prod.variants?.reduce((variantAcc, variant) => {
            return variantAcc + (Number(variant.stock) || 0);
        }, 0) || 0;

        // 2. นำสต็อกรวมของ Product นี้ไปบวกเข้ากับยอดรวมทั้งหมด (acc)
        return acc + productTotal;
    }, 0) || 0;

    return (
        <div className="space-y-8">
            {/* 1. สถิติจริงจาก Interface (Real Data Stats) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 rounded-xl bg-blue-50">
                        <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">รายการสินค้า</p>
                        <h3 className="text-2xl font-bold text-gray-800">{totalProducts} รายการ</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 rounded-xl bg-orange-50">
                        <ShoppingBag className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">สต็อกรวมทั้งหมด</p>
                        <h3 className="text-2xl font-bold text-gray-800">{totalStock} ชิ้น</h3>
                    </div>
                </div>

                {/* แสดงข้อมูลที่อยู่ร้านค้าจาก Relation address */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 rounded-xl bg-green-50">
                        <MapPin className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm text-gray-500 font-medium">ที่ตั้งร้านค้า</p>
                        <p className="text-sm font-bold text-gray-800 truncate">
                            {merchant.address ? `${merchant.address.province}` : 'ยังไม่ระบุที่อยู่'}
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. ส่วนข้อมูลร้านค้า (Store Profile Detail) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    {merchant.logoUrl ? (
                        <img
                            src={merchant.logoUrl}
                            alt={merchant.name}
                            className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-50"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                            <Globe className="w-8 h-8 text-gray-400" />
                        </div>
                    )}

                    <div className="flex-1">
                        <h2 className="text-2xl font-black text-gray-900">{merchant.name}</h2>
                        <p className="text-gray-600 mt-1">{merchant.description || 'ไม่มีคำอธิบายร้านค้า'}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 uppercase font-bold">
                                ID: {merchant.id.split('-')[0]}...
                            </span>
                            <span className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-600 font-bold italic">
                                เป็นสมาชิกเมื่อ: {new Date(merchant.createdAt).toLocaleDateString('th-TH')}
                            </span>
                        </div>
                    </div>

                    <button onClick={() => navigate("/add-product")} className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                        <Plus className="w-5 h-5" />
                        เพิ่มสินค้าใหม่
                    </button>
                </div>
            </div>

            {/* 3. รายการสินค้าจริง (ถ้ามี) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">จัดการสินค้าภายในร้าน</h3>
                </div>

                {merchant.products && merchant.products.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="px-6 py-4">ชื่อสินค้า</th>
                                    <th className="px-6 py-4">ราคาปัจจุบัน</th>
                                    <th className="px-6 py-4">สต็อก</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {merchant.products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                        {product.variants.map((variant) => (
                                            <>
                                                <td className="px-6 py-4 font-semibold text-gray-800">{variant.variantName}</td>
                                                <td className="px-6 py-4 text-gray-600">฿{variant.price.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`font-bold ${variant.stock <= 5 ? 'text-red-500' : 'text-gray-600'}`}>
                                                        {variant.stock} ชิ้น
                                                    </span>
                                                </td>
                                            </>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-medium">ยังไม่มีสินค้าในร้านค้าของคุณ</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MerchantDashboard;