import React, { useState } from "react";
import type { Merchant, UpdateMerchantInput } from "../../interface/merchantInterface";
import { MapPin, Edit3, Save, X, Copy, Check } from "lucide-react";
import { useForm, type Path } from "react-hook-form";

// 1. สร้าง Interface สำหรับ Form โดยอ้างอิงจาก UpdateMerchantInput
// แต่เราตัด 'id' และ 'ownerId' ออกจากกลุ่มที่แก้ไขได้
interface IMerchantForm extends Omit<UpdateMerchantInput, "id" | "ownerId" | "logoUrl"> {
    id: string; // เก็บไว้สำหรับแสดงผลและอ้างอิง แต่ห้ามแก้
}

interface Props {
    merchant: Merchant;
    onSave: (data: UpdateMerchantInput) => Promise<void>;
}

const MerchantSettingsForm: React.FC<Props> = ({ merchant, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // 2. กำหนดค่าเริ่มต้นจาก Props merchant
    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<IMerchantForm>({
        defaultValues: {
            id: merchant.id,
            name: merchant.name,
            description: merchant.description || "",
            address: {
                detail: merchant.address?.detail || "",
                subDistrict: merchant.address?.subDistrict || "",
                district: merchant.address?.district || "",
                province: merchant.address?.province || "",
                postcode: merchant.address?.postcode || "",
            }
        }
    });

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const onSubmit = async (data: IMerchantForm) => {
        // เตรียมข้อมูลให้ตรงกับ UpdateMerchantInput interface
        const updateData: UpdateMerchantInput = {
            id: merchant.id, // ใช้ ID จาก merchant เดิมเสมอ
            name: data.name,
            description: data.description,
            address: data.address, // Cast เป็น any สั้นๆ เพื่อให้ match กับ Address interface ของคุณ
        };

        await onSave(updateData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        reset();
        setIsEditing(false);
    };

    // 3. ปรับ RenderField ให้ใช้ Path<IMerchantForm>
    const renderField = (
        label: string,
        value: string | undefined | null,
        name: Path<IMerchantForm>,
        isFullWidth = false,
        disabled = false
    ) => (
        <div className={`space-y-1.5 ${isFullWidth ? "md:col-span-2" : ""}`}>
            <label className="text-xs font-semibold text-content-200 uppercase tracking-wider flex justify-between">
                {label}
                {!isEditing && value && name === "id" && (
                    <button
                        type="button"
                        onClick={() => copyToClipboard(value, name)}
                        className="text-blue-500 hover:text-blue-600 flex items-center gap-1 lowercase"
                    >
                        {copiedField === name ? <Check size={12} /> : <Copy size={12} />}
                        {copiedField === name ? "copied" : "copy id"}
                    </button>
                )}
            </label>

            {isEditing && !disabled ? (
                <input
                    {...register(name)}
                    className="w-full px-4 py-3 bg-white rounded-xl text-content border border-surface-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
            ) : (
                <div className={`px-4 py-3 bg-surface-200 rounded-xl text-content border border-surface-200 select-all ${disabled ? "font-mono text-sm opacity-70" : "font-medium"}`}>
                    {value || <span className="text-content-200 italic font-normal">ยังไม่ได้ระบุ</span>}
                </div>
            )}
        </div>
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-surface rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-lg font-bold text-content">ข้อมูลร้านค้า</h3>
                        <p className="text-sm text-content-200">จัดการรายละเอียดและที่อยู่ร้านค้าของคุณ</p>
                    </div>
                    {!isEditing ? (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                        >
                            <Edit3 size={16} /> แก้ไขข้อมูล
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex items-center gap-2 px-4 py-2 text-content-200 hover:bg-surface-200 rounded-lg transition-colors text-sm font-medium"
                            >
                                <X size={16} /> ยกเลิก
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 text-sm font-medium"
                            >
                                <Save size={16} /> {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    {/* ข้อมูลพื้นฐาน */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderField("ชื่อร้านค้า", merchant.name, "name")}
                        {renderField("Merchant ID", merchant.id, "id", false, true)}
                        {renderField("คำอธิบายร้านค้า", merchant.description, "description", true)}
                    </div>

                    {/* ที่อยู่ */}
                    <div className="border-t border-surface-200 pt-6">
                        <h3 className="text-md font-bold text-content mb-4 flex items-center gap-2">
                            <MapPin size={18} className="text-blue-600" />
                            ที่อยู่ร้านค้า
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderField("รายละเอียดที่อยู่", merchant.address?.detail, "address.detail")}
                            {renderField("ตำบล/แขวง", merchant.address?.subDistrict, "address.subDistrict")}
                            {renderField("อำเภอ/เขต", merchant.address?.district, "address.district")}
                            {renderField("จังหวัด", merchant.address?.province, "address.province")}
                            {renderField("รหัสไปรษณีย์", merchant.address?.postcode, "address.postcode")}
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default MerchantSettingsForm;