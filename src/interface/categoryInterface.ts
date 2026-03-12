import type { Product } from "./productInterface";

// --- 1. Category Interface ---
export interface Category {
    id: string;
    name: string;
    createdAt: string | Date;
    // Optional Relation: เผื่อกรณีดึง Category แล้วอยากได้รายการสินค้าข้างในด้วย
    products?: Product[];
}