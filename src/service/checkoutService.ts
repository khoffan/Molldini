import { createSlice, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CheckoutState, LineItem, ShippingMethod, OrderSummary } from '../interface/checkoutInterface';
import type { RootState } from '../store';
import type { Order } from '../interface/orderInterface';
import { toShippingMethod } from '../interface/checkoutInterface';
import type { IShipping } from '../interface/shippingInterface';

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
        updateItemShipping(
            state,
            action: PayloadAction<{ productId: string; shippingMethod: ShippingMethod | null }>
        ) {
            const { productId, shippingMethod } = action.payload;
            const item = state.items.find(i => i.productId === productId);
            if (item) {
                item.selectedShipping = shippingMethod;
            }
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
    updateItemShipping,
    setItemCalculating,
    setGlobalCalculating,
    clearCheckout,
} = checkoutSlice.actions;

// ─── Base Selectors ──────────────────────────────────────────────────
const selectCheckoutItems = (state: RootState) => state.checkout.items;
const selectCheckoutCalculating = (state: RootState) => state.checkout.isCalculating;
const selectAvailableShippingMethods = (state: RootState) => state.checkout.availableShippingMethods;

// ─── Memoized Selectors (reselect via RTK) ───────────────────────────

/**
 * selectOrderSummary
 * Iterates all items → sums price*quantity + per-item shipping fee → grandTotal.
 */
export const selectOrderSummary = createSelector(
    [selectCheckoutItems],
    (items): OrderSummary => {
        let subtotal = 0;
        let totalShipping = 0;
        const merchantIds = new Set<string>();

        for (const item of items) {
            subtotal += item.price * item.quantity;

            if (!item.isDigital && item.selectedShipping) {
                // Respect free-shipping thresholds per item
                const itemTotal = item.price * item.quantity;
                const threshold = item.selectedShipping.freeShippingThreshold;
                const isFree = threshold !== null && itemTotal >= threshold;
                totalShipping += isFree ? 0 : item.selectedShipping.price;
            }

            merchantIds.add(item.merchantId);
        }

        return {
            subtotal,
            totalShipping,
            grandTotal: subtotal + totalShipping,
            itemCount: items.reduce((acc, i) => acc + i.quantity, 0),
            merchantCount: merchantIds.size,
        };
    }
);

/**
 * validateCheckout
 * Returns true only if every non-digital item has a selectedShipping !== null.
 */
export const selectValidateCheckout = createSelector(
    [selectCheckoutItems],
    (items): boolean => {
        if (items.length === 0) return false;
        return items.every(item => item.isDigital || item.selectedShipping !== null);
    }
);

/**
 * selectIsAnyCalculating
 * True if any individual item or the global flag is calculating.
 */
export const selectIsAnyCalculating = createSelector(
    [selectCheckoutItems, selectCheckoutCalculating],
    (items, globalFlag): boolean => {
        return globalFlag || items.some(item => item.isCalculating);
    }
);

/**
 * selectCheckoutItemsByMerchant
 * Groups LineItem[] by merchantId for rendering merchant-grouped sections.
 */
export const selectCheckoutItemsByMerchant = createSelector(
    [selectCheckoutItems],
    (items): { merchantId: string; merchantName: string; items: LineItem[] }[] => {
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

// Re-export the base selector for direct use
export { selectAvailableShippingMethods };

export default checkoutSlice.reducer;
