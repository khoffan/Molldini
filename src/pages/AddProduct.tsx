import { useState } from "react";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { setProduct } from "../actions/productAction";
import type { RootState, AppDispatch } from "../store";
import Swal from 'sweetalert2';

function AddProduct() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    // สร้าง State สำหรับเก็บค่าจากฟอร์ม
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        category: '',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400', // ใส่รูป Default ไว้
        description: ''
    });

    const { items: _, loading, error } = useSelector((state: RootState) => state.product);

    const handlePriceBlur = () => {
        if (formData.price !== '') {
            // แปลงค่าเป็น float แล้วเซ็ตกลับเป็น string ที่มีทศนิยม 2 ตำแหน่ง
            const formattedValue = parseFloat(formData.price).toFixed(2);
            setFormData({ ...formData, price: formattedValue });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // แปลงราคาเป็นตัวเลขก่อนส่ง
        const newProduct: any = {
            title: formData.title,
            price: Number(formData.price),
            category: formData.category,
            image: formData.image,
        };

        console.log("newProduct", newProduct);

        try {
            await dispatch(setProduct(newProduct));

            // เมื่อเพิ่มเสร็จ ย้อนกลับไปหน้าสินค้า
            Swal.fire({
                title: 'สำเร็จ!',
                text: 'เพิ่มสินค้าเข้าสู่ระบบเรียบร้อยแล้ว',
                icon: 'success',
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#2563eb', // สี blue-600
            }).then(() => {
                navigate('/');
            })
        } catch (e: any) {
            Swal.fire({
                title: 'เกิดข้อผิดพลาด',
                text: e.message,
                icon: 'error',
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#2563eb',
            })
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">เพิ่มสินค้าใหม่</h1>
                    <p className="text-gray-500">กรอกรายละเอียดสินค้าเพื่อลงขายใน Mall</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ชื่อสินค้า */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="เช่น Classic Watch"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* ราคา */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ราคา (บาท)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-400">฿</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    onBlur={handlePriceBlur}
                                />
                            </div>
                        </div>
                        {/* หมวดหมู่ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="">เลือกหมวดหมู่</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Fashion">Fashion</option>
                                <option value="Accessories">Accessories</option>
                            </select>
                        </div>
                    </div>

                    {/* URL รูปภาพ */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL รูปภาพสินค้า</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="https://..."
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        />
                    </div>

                    {/* รายละเอียด */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดสินค้า</label>
                        <textarea
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="บรรยายสรรพสินค้าของคุณ..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* ปุ่มบันทึก */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                        >
                            {loading ? "กำลังบันทึก..." : "บันทึกสินค้า"}
                        </button>
                    </div>
                    {/* error */}
                    {error && (
                        <div className="text-red-500 text-center">
                            {error}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default AddProduct;