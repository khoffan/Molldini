import { createSlice, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CheckoutState, LineItem, ShippingMethod, OrderSummary } from '../interfaces/checkoutInterface';
import type { RootState } from '../../../store';
import type { Order } from '../../orders/interfaces/orderInterface';
import { toShippingMethod } from '../interfaces/checkoutInterface';
import type { IShipping } from '../../orders/interfaces/shippingInterface';

// ─── Initial State ───────────────────────────────────────────────────
const initialState: CheckoutState = {
    items: [],
    availableShippingMethods: [],
    isCalculating: false,
    error: null,
};

// ─── Slice ───────────────────────────────────────────────────────────
const checkoutSlice = createSlice({
    name: 'checkout',
    initialState,
    reducers: {
        /**
         * Hydrate checkout items from existing order data.
         * Maps each SubOrder → OrderItem into a flat LineItem[] with selectedShipping: null.
         */
        initializeCheckout(
            state,
            action: PayloadAction<{ order: Order; shippings: IShipping[] }>
        ) {
            const { order, shippings } = action.payload;

            // Flatten subOrders → orderItems into LineItem[]
            const items: LineItem[] = [];
            for (const sub of order.subOrders || []) {
                for (const item of sub.orderItems || []) {
                    items.push({
                        id: item.id || `${sub.id}-${item.productId}`,
                        productId: item.productId,
                        productVariantId: item.productVariantId,
                        title: item.title,
                        quantity: item.quantity,
                        price: item.price,
                        image: item.image,
                        sku: item.sku ?? null,
                        merchantId: item.merchantId || sub.merchantId,
                        merchantName: sub.merchantName || 'Unknown Shop',
                        subOrderId: sub.id,
                        isDigital: item.isDigital ?? false,
                        selectedShipping: null,
                        isCalculating: false,
                    });
                }
            }

            state.items = items;
            state.availableShippingMethods = shippings
                .filter(s => s.isActive)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map(toShippingMethod);
            state.isCalculating = false;
            state.error = null;
        },



        /**
         * Update the selected shipping method for a specific item.
         */
        updateMerchantShipping(
            state,
            action: PayloadAction<{ merchantId: string; shippingMethod: ShippingMethod | null }>
        ) {
            const { merchantId, shippingMethod } = action.payload;

            // วนลูปตรวจสอบสินค้าทุกชิ้นในรายการ Checkout
            state.items.forEach(item => {
                // ถ้าสินค้าชิ้นนั้นมาจาก Merchant ที่ระบุ ให้เปลี่ยน Shipping ทันที
                if (item.merchantId === merchantId) {
                    item.selectedShipping = shippingMethod;
                }
            });

            // หมายเหตุ: state.items ในที่นี้ควรเป็นรายการสินค้าที่อยู่ในหน้า Checkout 
            // ซึ่งปกติจะถูกกรองมาจากตะกร้าหลักแล้ว
        },

        /**
         * Toggle the isCalculating flag for a specific item (loading overlay).
         */
        setItemCalculating(
            state,
            action: PayloadAction<{ productId: string; isCalculating: boolean }>
        ) {
            const { productId, isCalculating } = action.payload;
            const item = state.items.find(i => i.productId === productId);
            if (item) {
                item.isCalculating = isCalculating;
            }
        },

        /**
         * Toggle the global isCalculating flag.
         */
        setGlobalCalculating(state, action: PayloadAction<boolean>) {
            state.isCalculating = action.payload;
        },

        /**
         * Reset the entire checkout state.
         */
        clearCheckout() {
            return initialState;
        },
    },
});

// ─── Actions ─────────────────────────────────────────────────────────
export const {
    initializeCheckout,
    updateMerchantShipping,
    setItemCalculating,
    setGlobalCalculating,
    clearCheckout,
} = checkoutSlice.actions;

// ─── Base Selectors ──────────────────────────────────────────────────
const selectCheckoutItems = (state: RootState) => state.checkout.items;
const selectCheckoutCalculating = (state: RootState) => state.checkout.isCalculating;
const selectAvailableShippingMethods = (state: RootState) => state.checkout.availableShippingMethods;

// ─── Memoized Selectors ──────────────────────────────────────────────

/**
 * 1. จัดกลุ่มสินค้าตามร้านค้า (ใช้เป็นพื้นฐานให้ Selector อื่น)
 */
export const selectCheckoutItemsByMerchant = createSelector(
    [selectCheckoutItems],
    (items) => {
        const groups = new Map<string, { merchantName: string; items: LineItem[] }>();
        for (const item of items) {
            const existing = groups.get(item.merchantId);
            if (existing) {
                existing.items.push(item);
            } else {
                groups.set(item.merchantId, {
                    merchantName: item.merchantName,
                    items: [item],
                });
            }
        }
        return Array.from(groups.entries()).map(([merchantId, group]) => ({
            merchantId,
            merchantName: group.merchantName,
            items: group.items,
        }));
    }
);

/**
 * 2. คำนวณราคาสรุปยอดแบบ "หนึ่งร้านค้า หนึ่งค่าส่ง"
 */
export const selectOrderSummary = createSelector(
    [selectCheckoutItemsByMerchant],
    (merchantGroups): OrderSummary => {
        let subtotal = 0;
        let totalShipping = 0;
        let totalItems = 0;

        for (const group of merchantGroups) {
            let merchantSubtotal = 0;
            let hasPhysicalItem = false;
            // ดึงค่าขนส่งจากสินค้าตัวแรกในกลุ่ม (เพราะค่าจะเท่ากันทั้งกลุ่ม)
            const selectedShipping = group.items[0]?.selectedShipping;

            for (const item of group.items) {
                const itemTotal = item.price * item.quantity;
                merchantSubtotal += itemTotal;
                subtotal += itemTotal;
                totalItems += item.quantity;
                if (!item.isDigital) hasPhysicalItem = true;
            }

            // คำนวณค่าส่งรายร้านค้า
            if (hasPhysicalItem && selectedShipping) {
                const threshold = selectedShipping.freeShippingThreshold;
                const isFree = threshold !== null && merchantSubtotal >= threshold;
                totalShipping += isFree ? 0 : selectedShipping.price;
            }
        }

        return {
            subtotal,
            totalShipping,
            grandTotal: subtotal + totalShipping,
            itemCount: totalItems,
            merchantCount: merchantGroups.length,
        };
    }
);

/**
 * 3. ตรวจสอบว่าเลือกขนส่งครบทุกร้านหรือยัง
 */
export const selectValidateCheckout = createSelector(
    [selectCheckoutItemsByMerchant],
    (merchantGroups): boolean => {
        if (merchantGroups.length === 0) return false;

        return merchantGroups.every(group => {
            const needsShipping = group.items.some(item => !item.isDigital);
            if (!needsShipping) return true;
            // ต้องมีการเลือก shipping ในสินค้าตัวแทนกลุ่ม
            return group.items[0].selectedShipping !== null;
        });
    }
);

export const selectIsAnyCalculating = createSelector(
    [selectCheckoutItems, selectCheckoutCalculating],
    (items, globalFlag): boolean => globalFlag || items.some(item => item.isCalculating)
);

// Re-export the base selector for direct use
export { selectAvailableShippingMethods };

export default checkoutSlice.reducer;
