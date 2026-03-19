/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Order, OrderAddress, OrderReceiveInfo, OrderResponse } from "../interface/orderInterface";
import api from "../lib/api";
import { AxiosError } from "axios";

// Helper สำหรับแปลง Order ให้เป็น Number ทั้ง Object
const transformOrderToNumber = (order: any): Order => {
    if (!order) return order;
    return {
        ...order,
        totalPrice: Number(order.totalPrice || 0),
        totalSystemFee: order.totalSystemFee ? Number(order.totalSystemFee) : undefined,
        totalNetMerchant: order.totalNetMerchant ? Number(order.totalNetMerchant) : undefined,
        subOrders: order.subOrders?.map((sub: any) => ({
            ...sub,
            totalPrice: Number(sub.totalPrice || 0),
            shippingFee: Number(sub.shippingFee || 0),
            systemFeeAmount: Number(sub.systemFeeAmount || 0),
            netToMerchant: Number(sub.netToMerchant || 0),
            orderItems: sub.orderItems?.map((item: any) => ({
                ...item,
                price: Number(item.price || 0)
            }))
        }))
    };
};

const transformOrderResToNumber = (order: any): OrderResponse => {
    if (!order) return order;
    return {
        ...order,
        totalPrice: Number(order.totalPrice || 0),
        totalSystemFee: order.totalSystemFee ? Number(order.totalSystemFee) : undefined,
        totalNetMerchant: order.totalNetMerchant ? Number(order.totalNetMerchant) : undefined,
        subOrders: order.subOrders?.map((sub: any) => ({
            ...sub,
            totalPrice: Number(sub.totalPrice || 0),
            shippingFee: Number(sub.shippingFee || 0),
            systemFeeAmount: Number(sub.systemFeeAmount || 0),
            netToMerchant: Number(sub.netToMerchant || 0),
            orderItems: sub.orderItems?.map((item: any) => ({
                ...item,
                price: Number(item.price || 0)
            }))
        }))
    };
};

interface OrderState {
    listOrderUser: OrderResponse[] | null;
    listOrderMerchant: OrderResponse[] | null;
    order: Order | null;
    loading: boolean;
    error: string | null;
}

export const initialOrderState: OrderState = {
    listOrderUser: null,
    listOrderMerchant: null,
    order: null,
    loading: false,
    error: null,
};

export const fetchOrderUser = createAsyncThunk(
    'order/fetchUser',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/api/v1/orders/user');
            return res.data as OrderResponse[];
        } catch (e: unknown) {
            if (e instanceof AxiosError) {
                return rejectWithValue(e.response?.data?.message || e.message);
            }
            return rejectWithValue("An unknown error occurred");
        }
    }
)

export const fetchOrderMerchant = createAsyncThunk(
    'order/fetchMerchant',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/api/v1/orders/merchant');
            return res.data as OrderResponse[];
        } catch (e: unknown) {
            if (e instanceof AxiosError) {
                return rejectWithValue(e.response?.data?.message || e.message);
            }
            return rejectWithValue("An unknown error occurred");
        }
    }
)

export const fetchOrderById = createAsyncThunk(
    "order/fetchOrderbyId",
    async (orderId: string, { rejectWithValue }) => {
        try {
            const res = await api.get(`/api/v1/orders/${orderId}`);
            const order: Order = {
                id: res.data.id,
                userId: res.data.userId,
                status: res.data.status,
                totalPrice: res.data.totalPrice,
                subOrders: res.data.subOrders,
                shippingAddress: res.data.shippingAddress,
                reciveInfo: res.data.reciveInfo,
                email: res.data.email,
                recivePhone: res.data.recivePhone,
                createdAt: res.data.createdAt,
                updatedAt: res.data.updatedAt,
            }
            return order;
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
    async ({ cartId, selectedItems, shippingAddress, receiverName, receiverPhone, paymentMethod }: { cartId: string, selectedItems: string[], shippingAddress: string, receiverName: string, receiverPhone: string, paymentMethod: string }, { rejectWithValue }) => {
        try {
            const res = await api.post(`/api/v1/orders/from-cart/${cartId}`, {
                shippingAddress,
                selectedItems,
                receiverName,
                receiverPhone,
                paymentMethod
            });
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
    async ({ source, orderId, shippingId }: { source: string, orderId: string, shippingId: string }, { rejectWithValue }) => {
        try {
            const res = await api.post("/api/v1/checkout/" + orderId, {
                source,
                shippingId
            });
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
        },
        setOrderLocalCheckout: (state) => {
            const orderParse = JSON.stringify(state.order);
            localStorage.setItem("order", orderParse);
        },
        fetchOrderLocalCheckout: (state) => {
            const orderParse = localStorage.getItem("order");
            if (orderParse) {
                state.order = transformOrderToNumber(JSON.parse(orderParse));
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(setOrderFromCartId.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(setOrderFromCartId.fulfilled, (state, action) => {
                state.order = transformOrderToNumber(action.payload);
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
                state.order = transformOrderToNumber(action.payload);
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
                state.order = transformOrderToNumber(action.payload);
                state.loading = false;
            })
            .addCase(checkoutOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchOrderUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderUser.fulfilled, (state, action) => {
                state.listOrderUser = action.payload.map(transformOrderResToNumber);
                state.loading = false;
            })
            .addCase(fetchOrderUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchOrderMerchant.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderMerchant.fulfilled, (state, action) => {
                state.listOrderMerchant = action.payload.map(transformOrderResToNumber);
                state.loading = false;
            })
            .addCase(fetchOrderMerchant.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchOrderById.pending, (state) => {
                state.loading = false;
            })
            .addCase(fetchOrderById.fulfilled, (state, action) => {
                state.order = action.payload;
                state.loading = false;
            })
            .addCase(fetchOrderById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string
            })
    }
});

export default orderSlice.reducer;
export const { clearOrderState, setOrderLocalCheckout, fetchOrderLocalCheckout } = orderSlice.actions;