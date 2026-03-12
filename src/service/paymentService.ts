import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { IPayment } from "../interface/paymentInterface";
import { AxiosError } from "axios";
import api from "../lib/api";

interface IPaymentState {
    payments: IPayment[],
    loading: boolean,
    error: string | null
}

const initialState: IPaymentState = {
    payments: [],
    loading: false,
    error: null
}

export const fetchPayment = createAsyncThunk(
    'payment/fetchPayment',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/api/v1/payments');
            return res.data as IPayment[];
        } catch (e: unknown) {
            if (e instanceof AxiosError) {
                return rejectWithValue(e.response?.data?.message || e.message);
            }
            return rejectWithValue("An unknown error occurred");
        }
    }
)

const paymentSlice = createSlice({
    name: "payment",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPayment.fulfilled, (state, action) => {
                state.payments = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
    }
});

export default paymentSlice.reducer