import type { Media } from "./mediaInterface";


// Interface หลักสำหรับ Shipping
export interface IShipping {
    id: string;
    name: string;
    provider: string; // Unique
    description: string;
    price: number;
    estimatedDays: string;
    minOrderAmount: number;
    freeShippingThreshold: number | null; // รองรับ Optional จาก Int?
    sortOrder: number;
    isActive: boolean;
    image?: Media | null; // Media?
    createAt: Date | string; // Date เมื่อมาจาก Backend, string เมื่อเป็น JSON
    updateAt: Date | string;
}