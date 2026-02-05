import type { Merchant } from "./merchantInterface";
import type { Category } from "./categoryInterface";

export interface ProductVariant {
    id: string;
    productId: string;
    variantName: string; // เช่น "สีดำ, ไซส์ L"
    price: number;      // ราคาเฉพาะของตัวเลือกนี้
    stock: number;      // จำนวนสต็อก
    image: string | null; // รูปเฉพาะสี (ถ้ามี)
    sku: string | null;   // รหัสสินค้าเฉพาะตัว

    createdAt: string | Date;
    updatedAt: string | Date;
}

export interface Product {
    id: string;
    title: string;
    description: string | null;
    merchantId: string | null;
    categoryId: string | null;

    // Relations
    merchant?: Merchant;
    category?: Category | null;

    // 💡 หัวใจสำคัญ: สินค้าหนึ่งตัวจะมีหลาย Variant
    variants: ProductVariant[];

    createdAt: string | Date;
    updatedAt: string | Date;
}

// สำหรับใช้ในหน้าแรก (Home) หรือรายการสินค้าที่ต้องการแสดงราคาเริ่มต้น
export interface ProductSummary extends Product {
    lowestPrice: number; // ราคาที่ถูกที่สุดในบรรดา variants
    totalStock: number;  // ผลรวมสต็อกของทุก variants
}