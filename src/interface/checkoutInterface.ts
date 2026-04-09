import type { IShipping } from './shippingInterface';

// ─── Shipping Method (subset of IShipping for per-item selection) ─────
export interface ShippingMethod {
    id: string;
    name: string;
    provider: string;
    price: number;
    estimatedDays: string;
    freeShippingThreshold: number | null;
    image?: { url: string } | null;
}

// ─── Line Item — order item with checkout-specific state ──────────────
export interface LineItem {
    id: string;
    productId: string;
    productVariantId: string;
    title: string;
    quantity: number;
    price: number;
    image: string;
    sku: string | null;
    merchantId: string;
    merchantName: string;
    subOrderId: string;
    isDigital: boolean;
    selectedShipping: ShippingMethod | null;
    isCalculating: boolean;
}

// ─── Checkout Slice State ─────────────────────────────────────────────
export interface CheckoutState {
    items: LineItem[];
    availableShippingMethods: ShippingMethod[];
    isCalculating: boolean;
    error: string | null;
}

// ─── Selector Return Types ────────────────────────────────────────────
export interface OrderSummary {
    subtotal: number;
    totalShipping: number;
    grandTotal: number;
    itemCount: number;
    merchantCount: number;
}

// ─── Helper: Convert IShipping → ShippingMethod ──────────────────────
export const toShippingMethod = (s: IShipping): ShippingMethod => ({
    id: s.id,
    name: s.name,
    provider: s.provider,
    price: s.price,
    estimatedDays: s.estimatedDays,
    freeShippingThreshold: s.freeShippingThreshold,
    image: s.image ? { url: s.image.url } : null,
});
