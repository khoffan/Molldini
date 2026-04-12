export interface Address {
    id: string;
    receiverName?: string | null;
    phone?: string | null;
    detail: string;      // บ้านเลขที่, ถนน
    subDistrict: string; // ตำบล/แขวง
    district: string;    // อำเภอ/เขต
    province: string;    // จังหวัด
    postcode: string;    // รหัสไปรษณีย์
    isDefault: boolean;

    // Foreign Keys
    userId?: string | null;
    merchantId?: string | null;

    // Timestamps
    createdAt: string | Date;
    updatedAt: string | Date;
}