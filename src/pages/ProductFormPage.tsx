/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { setProduct, updateProductById, setProductImportCsv, type ProductArgs } from "../service/productService";
import type { RootState, AppDispatch } from "../store";
import Swal from 'sweetalert2';
import { Plus, Trash2, Package, FolderPlus, X, ImagePlus, LinkIcon, FileUp } from "lucide-react";
import { fetchCategories, createCategory } from "../service/categoryService";
import type { Category } from "../interface/categoryInterface";
import type { Product, ProductVariant } from "../interface/productInterface";

interface VariantFormData {
    id?: string;
    variantName: string;
    price: number;
    stock: number;
    sku: string | null;
    image: string; // เก็บเป็น URL หรือ path ชั่วคราว\
    imagePreview: string;
}

interface ProductFormData {
    title: string;
    description: string;
    categoryId: string;
    image: File | null;
    imageUrl: string;
}


function ProductFormPage() {
    const { id } = useParams();
    const location = useLocation();
    const existingProduct = location.state?.product as Product | undefined;
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [formData, setFormData] = useState<ProductFormData>(() => {
        if (existingProduct) {
            if (existingProduct.images?.length > 0) {
                return {
                    title: existingProduct.title,
                    description: existingProduct.description ?? "",
                    categoryId: existingProduct.categoryId || '',
                    image: null,
                    imageUrl: existingProduct.images?.[0]?.url || ""
                };
            } else {
                return {
                    title: existingProduct.title,
                    description: existingProduct.description ?? "",
                    categoryId: existingProduct.categoryId || '',
                    image: null,
                    imageUrl: ""
                };
            }

        }
        return { title: '', description: '', categoryId: '', image: null, imageUrl: '' };
    });
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string>("");

    // 💡 หัวใจสำคัญ: เก็บข้อมูล Variants เป็น Array
    const [variants, setVariants] = useState<VariantFormData[]>(() => {
        if (existingProduct?.variants) {
            return existingProduct.variants.map((v: ProductVariant) => ({
                id: v.id,
                variantName: v.variantName,
                price: v.price,
                stock: v.stock,
                sku: v.sku,
                imagePreview: v.images?.[0]?.url || "",
                image: v.images?.[0]?.url || ""
            }));
        }
        return [{ variantName: 'Default', price: 0, stock: 0, sku: '', image: '', imagePreview: "" }]
    });

    const { loading, error } = useSelector((state: RootState) => state.product);
    const { categories } = useSelector((state: RootState) => state.category);

    const [variantFiles, setVariantFiles] = useState<Record<number, File>>({});
    const csvInputRef = useRef<HTMLInputElement>(null);
    const [csvLoading, setCsvLoading] = useState(false);

    // ฟังก์ชัน Import CSV
    const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setCsvLoading(true);
        try {
            const isImport = await dispatch(setProductImportCsv(file)).unwrap();
            if (isImport) {
                Swal.fire({
                    title: 'สำเร็จ!',
                    text: 'นำเข้าสินค้าจากไฟล์ CSV เรียบร้อยแล้ว',
                    icon: 'success',
                    confirmButtonColor: '#2563eb',
                }).then(() => navigate('/merchant/profile', { replace: true }));
            } else {
                Swal.fire({
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถนำเข้าไฟล์ได้',
                    icon: 'error',
                    confirmButtonColor: '#2563eb',
                }).then(() => navigate('/merchant/profile', { replace: true }));
            }

        } catch (err: unknown) {
            Swal.fire({ title: 'เกิดข้อผิดพลาด', text: (err as Error).message || 'ไม่สามารถนำเข้าไฟล์ได้', icon: 'error' });
        } finally {
            setCsvLoading(false);
            // Reset input เพื่อให้เลือกไฟล์เดิมซ้ำได้
            if (csvInputRef.current) csvInputRef.current.value = '';
        }
    };

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

    // useEffect(() => {
    //     if (id && existingProduct) {
    //         if (Array.isArray(existingProduct.images) && existingProduct.images.length > 0) {
    //             setFormData({
    //                 title: existingProduct.title,
    //                 description: existingProduct.description ?? "",
    //                 categoryId: existingProduct.categoryId || '',
    //                 image: null as File | null,
    //                 imageUrl: existingProduct.images[0].url
    //             });
    //             setMainImagePreview(existingProduct.images[0].url);
    //         } else {
    //             setFormData({
    //                 title: existingProduct.title,
    //                 description: existingProduct.description ?? "",
    //                 categoryId: existingProduct.categoryId || '',
    //                 image: null as File | null,
    //                 imageUrl: ""
    //             });
    //         }
    //         // Map variants จาก database เข้าสู่ state ของเรา
    //         const mappedVariants = existingProduct.variants.map((v: any) => ({
    //             ...v,
    //             imagePreview: v.images?.[0]?.url || "" // ไว้โชว์รูปเดิม
    //         }));
    //         setVariants(mappedVariants);
    //     } else if (!id) {
    //         setFormData({ title: '', description: '', categoryId: '', image: null, imageUrl: '' });
    //         setVariants([{ variantName: 'Default', price: 0, stock: 0, sku: '', image: '' }]);
    //         return;
    //     }
    // }, [id, existingProduct]);


    // ฟังก์ชันเพิ่ม Variant ใหม่
    const addVariant = () => {
        setVariants([...variants, { variantName: '', price: 0, stock: 0, sku: '', image: '', imagePreview: "" }]);
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

    const handleSubmit = async (e: React.FormEvent, productId?: string) => {
        e.preventDefault();
        if (id && existingProduct) {
            console.log(" edit zone");
            const proId = productId || existingProduct.id;
            const productPayload: ProductArgs = {
                productData: {
                    title: formData.title,
                    description: formData.description,
                    categoryId: formData.categoryId || null,
                    images: formData.imageUrl ? [{ url: formData.imageUrl, path: '', fileName: "external link", mimeType: null, size: null }] : [],
                    merchantId: null,
                    variants: variants.map((v) => ({
                        id: v.id,
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
                await dispatch(updateProductById({
                    productId: proId,
                    args: productPayload
                })).unwrap();
                Swal.fire({
                    title: 'สำเร็จ!',
                    text: 'เพิ่มสินค้าและตัวเลือกเรียบร้อยแล้ว',
                    icon: 'success',
                    confirmButtonColor: '#2563eb',
                }).then(() => navigate('/merchant')); // ย้อนกลับไปหน้าจัดการร้านค้า
            } catch (e: unknown) {
                Swal.fire({ title: 'เกิดข้อผิดพลาด', text: (e as Error).message, icon: 'error' });
            }
        } else {
            console.log(" add zone");

            const productPayload: ProductArgs = {
                productData: {
                    title: formData.title,
                    description: formData.description,
                    categoryId: formData.categoryId || null,
                    images: formData.imageUrl ? [{ url: formData.imageUrl, path: '', fileName: "external link", mimeType: null, size: null }] : [],
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
        }
        // เตรียมข้อมูลตาม Schema (Product + Variants)

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
    return (
        <div className="bg-main min-h-screen py-10 px-4">
            <div>{error}</div>
            <div className="max-w-4xl mx-auto bg-surface rounded-xl shadow-sm border border-border-main overflow-hidden">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 pt-6">
                    <div>
                        <h1 className="text-2xl font-bold text-content">{id ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h1>
                        <p className="text-muted">กำหนดข้อมูลหลักและตัวเลือกสินค้า (Variants)</p>
                    </div>
                    <div>
                        <input
                            type="file"
                            accept=".csv"
                            ref={csvInputRef}
                            className="hidden"
                            onChange={handleImportCsv}
                        />
                        <button
                            type="button"
                            disabled={csvLoading}
                            onClick={() => csvInputRef.current?.click()}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg disabled:bg-gray-400 disabled:shadow-none"
                        >
                            <FileUp className="w-5 h-5" />
                            {csvLoading ? 'กำลังนำเข้า...' : 'นำเข้า CSV'}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 px-6 pb-6">
                    {/* --- ส่วนข้อมูลหลัก --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* --- ส่วนรูปภาพหลัก --- */}
                        <div className="mb-8 p-6 border-2 border-dashed border-border-main rounded-2xl bg-main">
                            <label className="block text-sm font-bold text-content mb-4">รูปภาพสินค้าหลัก</label>
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                {/* Preview & Upload Area */}
                                <div className="relative w-full md:w-48 h-48 bg-surface rounded-xl border border-border-main overflow-hidden flex items-center justify-center group">
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
                                        <label className="cursor-pointer flex flex-col items-center text-muted hover:text-primary transition-colors">
                                            <ImagePlus className="w-10 h-10 mb-2" />
                                            <span className="text-xs font-medium">เลือกรูปภาพ</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleMainImageChange} />
                                        </label>
                                    )}
                                </div>

                                {/* หรือใส่เป็น URL */}
                                <div className="flex-1 w-full space-y-3">
                                    <p className="text-content font-medium">ลากไฟล์มาวาง หรือ คลิกเพื่อเลือก</p>
                                    <p className="text-muted text-sm mt-1">รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB</p>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-muted" />
                                        <input
                                            type="url"
                                            placeholder="https://example.com/image.jpg"
                                            className="w-full pl-10 pr-4 py-2 border border-border-main rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                                            value={formData.imageUrl || ""}
                                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-sm text-muted mb-4">
                                        อัปโหลดไฟล์ CSV เพื่อเพิ่มสินค้าหลายรายการพร้อมกันไฟล์เป็นหลัก</p>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-content mb-1">ชื่อสินค้า *</label>
                            <input
                                type="text" required
                                className="w-full px-4 py-2.5 border border-border-main rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        {/* หมวดหมู่ (Dynamic) */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-content mb-1">แบรนด์</label>
                            <select
                                required
                                className="flex-1 px-4 py-2.5 border border-border-main rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-surface transition-all"
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
                                className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                                title="เพิ่มหมวดหมู่ใหม่"
                            >
                                <FolderPlus className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-content mb-1">รายละเอียด</label>
                            <textarea
                                rows={3}
                                placeholder="อธิบายรายละเอียดสินค้า..."
                                className="w-full px-4 py-2.5 border border-border-main rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* --- ส่วนจัดการ Variants --- */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-border-main pb-2">
                            <h2 className="text-lg font-semibold text-content flex items-center gap-2">
                                <Package className="w-5 h-5" /> ตัวเลือกสินค้า (Variants)
                            </h2>
                            <button
                                type="button" onClick={addVariant}
                                className="text-sm bg-primary-light text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 flex items-center gap-1 font-semibold transition-colors"
                            >
                                <Plus className="w-4 h-4" /> เพิ่มตัวเลือก
                            </button>
                        </div>

                        <div className="space-y-4">
                            {variants.map((variant, index) => (
                                <div key={index} className="p-4 bg-main rounded-xl border border-border-main relative group">
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                        <div className="md:col-span-1">
                                            <label className="text-xs font-bold text-muted uppercase">ชื่อตัวเลือก (เช่น สี, ไซส์)</label>
                                            <input
                                                type="text" required
                                                className="w-full mt-1 px-3 py-1.5 border border-border-main rounded-md text-sm"
                                                value={variant.variantName}
                                                onChange={(e) => updateVariant(index, 'variantName', e.target.value)}
                                                placeholder="แดง, L, หรือชุดเซ็ต"
                                            />
                                        </div>
                                        <div className="md:col-span-1">
                                            <label className="text-xs font-bold text-muted uppercase">รูปตัวเลือก</label>
                                            <div className="mt-1 relative aspect-square w-full bg-surface rounded-lg border-2 border-dashed border-border-main flex items-center justify-center overflow-hidden group">
                                                {(variant as any).imagePreview || variant.image ? (
                                                    <img
                                                        src={(variant as any).imagePreview || variant.image}
                                                        className="w-full h-full object-cover"
                                                        alt="Variant"
                                                    />
                                                ) : (
                                                    <label className="cursor-pointer text-muted hover:text-primary">
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
                                            <label className="text-xs font-bold text-muted uppercase">ชื่อตัวเลือก</label>
                                            {/* เพิ่มช่องใส่ URL เล็กๆ ใต้ชื่อตัวเลือก */}
                                            <input
                                                type="text"
                                                placeholder="ลิงก์รูป (URL)"
                                                className="w-full mt-2 px-2 py-1 border border-border-main rounded text-[10px]"
                                                value={variant.image}
                                                onChange={(e) => updateVariant(index, 'image', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-muted uppercase">ราคา (฿)</label>
                                            <input
                                                type="number" required
                                                className="w-full mt-1 px-3 py-1.5 border border-border-main rounded-md text-sm"
                                                value={variant.price}
                                                onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-muted uppercase">สต็อก</label>
                                            <input
                                                type="number" required
                                                className="w-full mt-1 px-3 py-1.5 border border-border-main rounded-md text-sm"
                                                value={variant.stock}
                                                onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-muted uppercase">SKU (ถ้ามี)</label>
                                            <input
                                                type="text"
                                                className="w-full mt-1 px-3 py-1.5 border border-border-main rounded-md text-sm"
                                                value={variant.sku || ""}
                                                onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {variants.length > 1 && (
                                        <button
                                            type="button" onClick={() => removeVariant(index)}
                                            className="absolute -right-2 -top-2 bg-surface text-red-500 p-1.5 rounded-full shadow-sm border border-red-100 hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- Action Buttons --- */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border-main">
                        <button
                            type="button" onClick={() => navigate(-1)}
                            className="px-6 py-2.5 bg-surface border border-border-main text-content rounded-lg hover:bg-surface-hover transition-colors font-medium"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit" disabled={loading}
                            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                        >
                            {loading ? "กำลังบันทึก..." : "ยืนยันการเพิ่มสินค้า"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProductFormPage;