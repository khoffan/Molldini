/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { setProduct, type ProductArgs } from "../service/productService";
import type { RootState, AppDispatch } from "../store";
import Swal from 'sweetalert2';
import { Plus, Trash2, Package, FolderPlus, X, ImagePlus, LinkIcon } from "lucide-react"; // แนะนำให้ลง lucide-react ครับ
import { fetchCategories, createCategory } from "../service/categoryService";
import type { Category } from "../interface/categoryInterface";

interface VariantFormData {
    variantName: string;
    price: number;
    stock: number;
    sku: string;
    image: string; // เก็บเป็น URL หรือ path ชั่วคราว\
}

interface ProductFormData {
    title: string;
    description: string;
    categoryId: string;
    image: File | null;
    imageUrl: string;
}


function AddProduct() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const [formData, setFormData] = useState<ProductFormData>({
        title: '',
        description: '',
        categoryId: '',
        image: null as File | null,
        imageUrl: ""
    });
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string>("");

    // 💡 หัวใจสำคัญ: เก็บข้อมูล Variants เป็น Array
    const [variants, setVariants] = useState<VariantFormData[]>([
        { variantName: 'Default', price: 0, stock: 0, sku: '', image: '' }
    ]);

    const { loading, error } = useSelector((state: RootState) => state.product);
    const { categories } = useSelector((state: RootState) => state.category);

    const [variantFiles, setVariantFiles] = useState<Record<number, File>>({});

    // ฟังก์ชันจัดการรูปหลัก
    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMainImageFile(file);
            setMainImagePreview(URL.createObjectURL(file));
        }
    };

    // ฟังก์ชันจัดการรูป Variant
    const handleVariantImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVariantFiles(prev => ({ ...prev, [index]: file }));
            updateVariant(index, 'imagePreview', URL.createObjectURL(file)); // เก็บ preview ไว้โชว์
        }
    };

    useEffect(() => {
        dispatch(fetchCategories());
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateVariant = (index: number, field: string, value: any) => {
        const newVariants = [...variants];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (newVariants[index] as any)[field] = value;
        setVariants(newVariants);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // เตรียมข้อมูลตาม Schema (Product + Variants)
        const productPayload: ProductArgs = {
            productData: {
                title: formData.title,
                description: formData.description,
                categoryId: formData.categoryId || null,
                images: [],
                merchantId: null,
                variants: variants.map((v) => ({
                    variantName: v.variantName,
                    price: Number(v.price),
                    stock: Number(v.stock),
                    sku: v.sku || null,
                    images: v.image ? [{ url: v.image, path: '', fileName: "external link", mimeType: null, size: null }] : []
                }))
            },
            mainFile: mainImageFile,
            // แปลง record เป็น array ของ {index, file}
            variantFiles: Object.entries(variantFiles).map(([index, file]) => ({
                index: parseInt(index),
                file
            }))
        };

        try {
            await dispatch(setProduct(productPayload)).unwrap();
            Swal.fire({
                title: 'สำเร็จ!',
                text: 'เพิ่มสินค้าและตัวเลือกเรียบร้อยแล้ว',
                icon: 'success',
                confirmButtonColor: '#2563eb',
            }).then(() => navigate('/merchant')); // ย้อนกลับไปหน้าจัดการร้านค้า
        } catch (e: unknown) {
            Swal.fire({ title: 'เกิดข้อผิดพลาด', text: (e as Error).message, icon: 'error' });
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
                await dispatch(createCategory({ name: categoryName }));

                // // เซ็ตค่าที่เลือกเป็นหมวดหมู่ใหม่ทันที
                // setFormData(prev => ({ ...prev, categoryId: result.id }));

                Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ',
                    text: `เพิ่มหมวดหมู่ "${categoryName}" เรียบร้อยแล้ว`,
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (e: unknown) {
                const err = e as Error;
                Swal.fire('เกิดข้อผิดพลาด', err.message, 'error');
            }
        }
    };

    if (error) {
        return <div>{error}</div>
    }

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
                        {/* --- ส่วนรูปภาพหลัก --- */}
                        <div className="mb-8 p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                            <label className="block text-sm font-bold text-gray-700 mb-4">รูปภาพสินค้าหลัก</label>
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                {/* Preview & Upload Area */}
                                <div className="relative w-full md:w-48 h-48 bg-white rounded-xl border overflow-hidden flex items-center justify-center group">
                                    {mainImagePreview ? (
                                        <>
                                            <img src={mainImagePreview} className="w-full h-full object-cover" alt="Preview" />
                                            <button
                                                type="button"
                                                onClick={() => { setMainImageFile(null); setMainImagePreview(""); }}
                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center text-gray-400 hover:text-blue-500 transition-colors">
                                            <ImagePlus className="w-10 h-10 mb-2" />
                                            <span className="text-xs font-medium">เลือกรูปภาพ</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleMainImageChange} />
                                        </label>
                                    )}
                                </div>

                                {/* หรือใส่เป็น URL */}
                                <div className="flex-1 w-full space-y-3">
                                    <p className="text-sm text-gray-500">หรือระบุ URL ของรูปภาพ</p>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <input
                                            type="url"
                                            placeholder="https://example.com/image.jpg"
                                            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.imageUrl || ""} // ถ้ามี field image ใน formData
                                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 font-light italic">* หากเลือกอัปโหลดไฟล์ ระบบจะใช้รูปจากไฟล์เป็นหลัก</p>
                                </div>
                            </div>
                        </div>
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
                                    {Array.isArray(categories) && categories.map((cat: Category) => (
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
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                                        <div className="md:col-span-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">รูปตัวเลือก</label>
                                            <div className="mt-1 relative aspect-square w-full bg-white rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group">
                                                {(variant as any).imagePreview || variant.image ? (
                                                    <img
                                                        src={(variant as any).imagePreview || variant.image}
                                                        className="w-full h-full object-cover"
                                                        alt="Variant"
                                                    />
                                                ) : (
                                                    <label className="cursor-pointer text-gray-400 hover:text-blue-500">
                                                        <Plus className="w-6 h-6" />
                                                        <input
                                                            type="file" className="hidden"
                                                            onChange={(e) => handleVariantImageChange(index, e)}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        </div>

                                        <div className="md:col-span-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">ชื่อตัวเลือก</label>
                                            {/* ... input ชื่อตัวเลือก ... */}

                                            {/* เพิ่มช่องใส่ URL เล็กๆ ใต้ชื่อตัวเลือก */}
                                            <input
                                                type="text"
                                                placeholder="ลิงก์รูป (URL)"
                                                className="w-full mt-2 px-2 py-1 border rounded text-[10px]"
                                                value={variant.image}
                                                onChange={(e) => updateVariant(index, 'image', e.target.value)}
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