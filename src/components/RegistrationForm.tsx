import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch } from 'react-redux';
import { setMerchant } from '../actions/merchantAction';
import type { AppDispatch } from '../store';
import type { CreateMerchantInput } from '../interface/merchantInterface';
import type { Address } from '../interface/addressInterface';
// 1. กำหนด Validation Schema ให้ตรงกับ Prisma Model
const merchantSchema = z.object({
    name: z.string().min(3, "ชื่อร้านค้าต้องมีอย่างน้อย 3 ตัวอักษร"),
    description: z.string().optional(),
    // ข้อมูลที่อยู่
    detail: z.string().min(5, "กรุณากรอกรายละเอียดที่อยู่"),
    subDistrict: z.string().min(1, "กรุณากรอกตำบล/แขวง"),
    district: z.string().min(1, "กรุณากรอกอำเภอ/เขต"),
    province: z.string().min(1, "กรุณากรอกจังหวัด"),
    postcode: z.string().length(5, "รหัสไปรษณีย์ต้องมี 5 หลัก"),
});

type MerchantFormValues = z.infer<typeof merchantSchema>;

function RegistrationForm({ userId }: { userId?: string }) {
    const dispatch = useDispatch<AppDispatch>();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<MerchantFormValues>({
        resolver: zodResolver(merchantSchema),
    });

    const onSubmit = async (data: MerchantFormValues) => {
        console.log("summiting...")
        const merchantInput: CreateMerchantInput = {
            name: data.name,
            description: data.description,
            ownerId: userId ?? "",
            address:
                {
                    detail: data.detail,
                    subDistrict: data.subDistrict,
                    district: data.district,
                    province: data.province,
                    postcode: data.postcode,
                } as Address,
        };
        dispatch(setMerchant(merchantInput));
        console.log("merchantInput", merchantInput);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* --- Section 1: Store General Info --- */}
            <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-blue-600 pl-3">
                    ข้อมูลร้านค้า
                </h2>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อร้านค้า (Store Name)</label>
                        <input
                            {...register("name")}
                            className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 transition-all ${errors.name ? "border-red-500 focus:ring-red-100" : "border-gray-300 focus:ring-blue-100"
                                }`}
                            placeholder="ระบุชื่อร้านค้าของคุณ"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดร้านค้า (เลือกได้)</label>
                        <textarea
                            {...register("description")}
                            rows={3}
                            className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
                            placeholder="บอกรายละเอียดคร่าวๆ เกี่ยวกับร้านค้าของคุณ"
                        />
                    </div>
                </div>
            </section>

            {/* --- Section 2: Store Address (อิงจากตาราง Address) --- */}
            <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-blue-600 pl-3">
                    ที่อยู่ร้านค้า (จุดส่งของ)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">เลขที่บ้าน, ถนน, ซอย</label>
                        <input
                            {...register("detail")}
                            className="w-full p-2.5 border border-gray-300 rounded-lg"
                            placeholder="123/45 หมู่ 6 ถ.สุขุมวิท..."
                        />
                        {errors.detail && <p className="text-red-500 text-xs mt-1">{errors.detail.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ตำบล/แขวง</label>
                        <input {...register("subDistrict")} className="w-full p-2.5 border border-gray-300 rounded-lg" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">อำเภอ/เขต</label>
                        <input {...register("district")} className="w-full p-2.5 border border-gray-300 rounded-lg" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">จังหวัด</label>
                        <input {...register("province")} className="w-full p-2.5 border border-gray-300 rounded-lg" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">รหัสไปรษณีย์</label>
                        <input {...register("postcode")} className="w-full p-2.5 border border-gray-300 rounded-lg" placeholder="10xxx" />
                        {errors.postcode && <p className="text-red-500 text-xs mt-1">{errors.postcode.message}</p>}
                    </div>
                </div>
            </section>

            {/* --- Submit Button --- */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:bg-gray-400 shadow-lg shadow-blue-100"
            >
                {isSubmitting ? "กำลังดำเนินการ..." : "ยืนยันการสมัครร้านค้า"}
            </button>
        </form>
    );
}

export default RegistrationForm;