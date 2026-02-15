import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Order, OrderAddress, OrderReceiveInfo, OrderResponse } from "../interface/orderInterface";
import api from "../lib/api";
import { AxiosError } from "axios";

interface OrderState {
    order: Order | null;
    loading: boolean;
    error: string | null;
}

export const initialOrderState: OrderState = {
    order: null,
    loading: false,
    error: null,
};

export const fetchOrderById = createAsyncThunk(
    "order/fetchOrderbyId",
    async (orderId: string, { rejectWithValue }) => {
        try {
            const res = await api.get(`/api/v1/orders/${orderId}`);
            return res.data as OrderResponse;
        } catch (e: unknown) {
            if (e instanceof AxiosError) {
                return rejectWithValue(e.response?.data?.message || e.message);
            }
            return rejectWithValue("An unknown error occurred");
        }
    }
);

export const setOrderFromCartId = createAsyncThunk(
    'order/fetchFromDb',
    async ({ cartId, shippingAddress, receiverName, receiverPhone, paymentMethod }: { cartId: string, shippingAddress: string, receiverName: string, receiverPhone: string, paymentMethod: string }, { rejectWithValue }) => {
        try {
            const res = await api.post(`/api/v1/orders/from-cart/${cartId}`, {
                shippingAddress,
                receiverName,
                receiverPhone,
                paymentMethod
            });
            console.log("Order created from cart ID:", res.data);
            return res.data;
        } catch (err: unknown) {
            if (err instanceof Error) {
                return rejectWithValue(err.message);
            }
        }
    }
)

export const updateDataOrder = createAsyncThunk(
    "order/updateData",
    async ({ cartId, reciveAddress, reciveInfo, paymentMethod }: { cartId: string, reciveAddress: OrderAddress, reciveInfo: OrderReceiveInfo, paymentMethod: string }, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { order: OrderState };
            const orderId = state.order.order?.id;
            if (!orderId) {
                console.log("Order ID is missing in state");
                return rejectWithValue("Order ID is missing");
            }
            const address: string = reciveAddress.address + ", " + reciveAddress.city + ", " + reciveAddress.zipCode;
            const fullname = reciveInfo.firstName + " " + reciveInfo.lastName;
            const phone = reciveInfo.phone;
            const res = await api.put(`/api/v1/orders/${orderId}/data/${cartId}`, {
                shippingAddress: address,
                receiverName: fullname,
                receiverPhone: phone,
                paymentMethod: paymentMethod,
            });
            console.log("Order data updated:", res.data);
            return res.data;
        } catch (e: unknown) {
            if (e instanceof Error) {
                return rejectWithValue(e.message);
            }
            return rejectWithValue("An unknown error occurred");
        }
    }
);

export const checkoutOrder = createAsyncThunk(
    "order/checkout",
    async ({ source, orderId, }: { source: string, orderId: string }, { rejectWithValue }) => {
        try {
            const res = await api.post("/api/v1/checkout/" + orderId, {
                source
            });
            console.log("Order checked out:", res.data);
            return res.data;
        } catch (e: unknown) {
            if (e instanceof Error) {
                return rejectWithValue(e.message);
            } else if (e instanceof AxiosError) {
                return rejectWithValue(e.response?.data?.message || e.message);
            }
            return rejectWithValue("An unknown error occurred");
        }
    }
)

const orderSlice = createSlice({
    name: 'order',
    initialState: initialOrderState,
    reducers: {
        clearOrderState: (state) => {
            state.order = null;
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(setOrderFromCartId.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(setOrderFromCartId.fulfilled, (state, action) => {
                state.order = action.payload;
                state.loading = false;
            })
            .addCase(setOrderFromCartId.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateDataOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateDataOrder.fulfilled, (state, action) => {
                state.order = action.payload;
                state.loading = false;
            })
            .addCase(updateDataOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(checkoutOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkoutOrder.fulfilled, (state, action) => {
                state.order = action.payload;
                state.loading = false;
            })
            .addCase(checkoutOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
    }
});

export default orderSlice.reducer;
export const { clearOrderState } = orderSlice.actions;