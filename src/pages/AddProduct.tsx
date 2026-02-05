import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { setProduct } from "../actions/productAction";
import type { RootState, AppDispatch } from "../store";
import Swal from 'sweetalert2';
import { Plus, Trash2, Package, FolderPlus } from "lucide-react"; // แนะนำให้ลง lucide-react ครับ
import type { CategoryState } from "../reducer/categoryReducer";
import { fetchCategory, setCategory } from "../actions/categoryAction";

function AddProduct() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        categoryId: '',
    });

    // 💡 หัวใจสำคัญ: เก็บข้อมูล Variants เป็น Array
    const [variants, setVariants] = useState([
        { variantName: 'Default', price: 0, stock: 0, sku: '', image: '' }
    ]);

    const { loading, error } = useSelector((state: RootState) => state.product);
    const { categories } = useSelector((state: RootState) => state.category) as CategoryState;

    useEffect(() => {
        dispatch(fetchCategory());
    }, [dispatch]);

    // ฟังก์ชันเพิ่ม Variant ใหม่
    const addVariant = () => {
        setVariants([...variants, { variantName: '', price: 0, stock: 0, sku: '', image: '' }]);
    };

    // ฟังก์ชันลบ Variant
    const removeVariant = (index: number) => {
        if (variants.length > 1) {
            setVariants(variants.filter((_, i) => i !== index));
        }
    };

    // ฟังก์ชันอัปเดตข้อมูลในแต่ละ Variant
    const updateVariant = (index: number, field: string, value: any) => {
        const newVariants = [...variants];
        (newVariants[index] as any)[field] = value;
        setVariants(newVariants);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // เตรียมข้อมูลตาม Schema (Product + Variants)
        const productPayload = {
            ...formData,
            variants: variants.map(v => ({
                ...v,
                price: Number(v.price),
                stock: Number(v.stock)
            }))
        };

        try {
            await dispatch(setProduct(productPayload));
            Swal.fire({
                title: 'สำเร็จ!',
                text: 'เพิ่มสินค้าและตัวเลือกเรียบร้อยแล้ว',
                icon: 'success',
                confirmButtonColor: '#2563eb',
            }).then(() => navigate('/merchant')); // ย้อนกลับไปหน้าจัดการร้านค้า
        } catch (e: any) {
            Swal.fire({ title: 'เกิดข้อผิดพลาด', text: e.message, icon: 'error' });
        }
    };

    // ฟังก์ชันสำหรับเพิ่มหมวดหมู่ใหม่ (Popup)
    const handleAddNewCategory = async () => {
        const { value: categoryName } = await Swal.fire({
            title: 'เพิ่มหมวดหมู่ใหม่',
            input: 'text',
            inputLabel: 'ชื่อหมวดหมู่',
            inputPlaceholder: 'กรุณากรอกชื่อหมวดหมู่...',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonText: 'ยกเลิก',
            confirmButtonText: 'บันทึก',
            inputValidator: (value) => {
                if (!value) return 'กรุณากรอกชื่อหมวดหมู่!'
            }
        });

        if (categoryName) {
            try {
                // // ส่ง action ไปหลังบ้าน (สมมติ action return ข้อมูลหมวดหมู่ใหม่ที่สร้างเสร็จ)
                await dispatch(setCategory({ name: categoryName }));

                // // เซ็ตค่าที่เลือกเป็นหมวดหมู่ใหม่ทันที
                // setFormData(prev => ({ ...prev, categoryId: result.id }));

                Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ',
                    text: `เพิ่มหมวดหมู่ "${categoryName}" เรียบร้อยแล้ว`,
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (err: any) {
                Swal.fire('เกิดข้อผิดพลาด', err.message, 'error');
            }
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">เพิ่มสินค้าใหม่</h1>
                    <p className="text-gray-500">กำหนดข้อมูลหลักและตัวเลือกสินค้า (Variants)</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* --- ส่วนข้อมูลหลัก --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้าหลัก</label>
                            <input
                                type="text" required
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        {/* หมวดหมู่ (Dynamic) */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่สินค้า</label>
                            <div className="flex gap-2">
                                <select
                                    required
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                >
                                    <option value="">เลือกหมวดหมู่</option>
                                    {Array.isArray(categories) && categories.map((cat: any) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>

                                {/* ปุ่มเพิ่มหมวดหมู่ */}
                                <button
                                    type="button"
                                    onClick={handleAddNewCategory}
                                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all group"
                                    title="เพิ่มหมวดหมู่ใหม่"
                                >
                                    <FolderPlus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดสินค้า</label>
                            <textarea
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* --- ส่วนจัดการ Variants --- */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Package className="w-5 h-5" /> ตัวเลือกสินค้า (Variants)
                            </h2>
                            <button
                                type="button" onClick={addVariant}
                                className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1 font-semibold transition-colors"
                            >
                                <Plus className="w-4 h-4" /> เพิ่มตัวเลือก
                            </button>
                        </div>

                        <div className="space-y-4">
                            {variants.map((variant, index) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative group">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="md:col-span-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">ชื่อตัวเลือก (เช่น สี, ไซส์)</label>
                                            <input
                                                type="text" required
                                                className="w-full mt-1 px-3 py-1.5 border rounded-md text-sm"
                                                value={variant.variantName}
                                                onChange={(e) => updateVariant(index, 'variantName', e.target.value)}
                                                placeholder="แดง, L, หรือชุดเซ็ต"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">ราคา (฿)</label>
                                            <input
                                                type="number" required
                                                className="w-full mt-1 px-3 py-1.5 border rounded-md text-sm"
                                                value={variant.price}
                                                onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">สต็อก</label>
                                            <input
                                                type="number" required
                                                className="w-full mt-1 px-3 py-1.5 border rounded-md text-sm"
                                                value={variant.stock}
                                                onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">SKU (ถ้ามี)</label>
                                            <input
                                                type="text"
                                                className="w-full mt-1 px-3 py-1.5 border rounded-md text-sm"
                                                value={variant.sku}
                                                onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {variants.length > 1 && (
                                        <button
                                            type="button" onClick={() => removeVariant(index)}
                                            className="absolute -right-2 -top-2 bg-white text-red-500 p-1.5 rounded-full shadow-sm border border-red-100 hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- Action Buttons --- */}
                    <div className="flex gap-4 pt-6 border-t">
                        <button
                            type="button" onClick={() => navigate(-1)}
                            className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit" disabled={loading}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:bg-gray-400"
                        >
                            {loading ? "กำลังบันทึก..." : "ยืนยันการเพิ่มสินค้า"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddProduct;