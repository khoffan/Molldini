import type { Merchant } from "./merchantInterface";
import type { Category } from "./categoryInterface";
import type { Media, MediaInput } from "./mediaInterface";

export interface ProductVariant {
    id: string;
    productId: string;
    variantName: string; // เช่น "สีดำ, ไซส์ L"
    price: number;      // ราคาเฉพาะของตัวเลือกนี้
    stock: number;      // จำนวนสต็อก
    images: Media[]; // รูปเฉพาะสี (ถ้ามี)
    sku: string | null;   // รหัสสินค้าเฉพาะตัว
}

export interface ProductVariantInput {
    variantName: string; // เช่น "สีดำ, ไซส์ L"
    price: number;      // ราคาเฉพาะของตัวเลือกนี้
    stock: number;      // จำนวนสต็อก
    images: MediaInput[]; // รูปเฉพาะสี (ถ้ามี)
    sku: string | null;   // รหัสสินค้าเฉพาะตัว
}

export interface Product {
    id: string;
    title: string;
    description: string | null;
    merchantId: string | null;
    categoryId: string | null;
    images: Media[];

    // Relations
    merchant?: Merchant;
    category?: Category | null;

    // 💡 หัวใจสำคัญ: สินค้าหนึ่งตัวจะมีหลาย Variant
    variants: ProductVariant[];
}

export interface ProductInput {
    title: string;
    description: string | null;
    merchantId: string | null;
    categoryId: string | null;
    images: MediaInput[];

    // Relations
    merchant?: Merchant;
    category?: Category | null;

    // 💡 หัวใจสำคัญ: สินค้าหนึ่งตัวจะมีหลาย Variant
    variants: ProductVariantInput[];
}

// สำหรับใช้ในหน้าแรก (Home) หรือรายการสินค้าที่ต้องการแสดงราคาเริ่มต้น
export interface ProductSummary extends Product {
    lowestPrice: number; // ราคาที่ถูกที่สุดในบรรดา variants
    totalStock: number;  // ผลรวมสต็อกของทุก variants
}