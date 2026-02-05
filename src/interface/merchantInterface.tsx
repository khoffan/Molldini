import type { AppUser } from "./userInterface";
import type { Product } from "./productInterface";
import type { Address } from "./addressInterface";

export interface Merchant {
    id: string;
    name: string;
    description?: string | null; // ใน Prisma เป็น String? จะได้ค่าเป็น null ได้
    logoUrl?: string | null;
    ownerId: string;

    // Relations (ใส่เป็น Optional ไว้เผื่อกรณีที่ดึงข้อมูลแบบไม่ได้ include)
    owner?: AppUser;
    address?: Address | null;
    products?: Product[];

    createdAt: string | Date; // ใช้ string สำหรับเวลาที่มาจาก JSON (ISO String)
    updatedAt: string | Date;
}

// สำหรับตอนสร้าง Merchant ใหม่ (มักจะไม่ส่ง id และวันที่)
export interface CreateMerchantInput {
    name: string;
    description?: string;
    logoUrl?: string;
    ownerId: string;
    address: Address;
}

// สำหรับตอนอัปเดตข้อมูลร้านค้า
export interface UpdateMerchantInput extends Partial<CreateMerchantInput> {
    id: string; // บังคับ id เพื่อให้รู้ว่าอัปเดตตัวไหน
}