import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "../lib/api";
import type { Merchant, CreateMerchantInput } from "../interface/merchantInterface";
import { AxiosError } from "axios";

interface MerchantState {
    merchant: Merchant | null;
    loading: boolean;
    error: string | null;
}

const initialState: MerchantState = {
    merchant: null,
    loading: false,
    error: null,
};

// 1. Thunk สำหรับสร้างร้านค้าใหม่
export const createMerchant = createAsyncThunk(
    "merchant/createMerchant",
    async (merchantData: CreateMerchantInput, { rejectWithValue }) => {
        try {
            const response = await api.post(`/api/v1/merchants`, merchantData);
            return response.data as Merchant;
        } catch (e: unknown) {
            if (e instanceof Error) {
                return rejectWithValue(e.message);
            } else if (e instanceof AxiosError) {
                return rejectWithValue(e.response?.data?.message || e.message);
            } else {
                return rejectWithValue("An unknown error occurred");
            }
        }
    }
);

// 2. Thunk สำหรับดึงข้อมูลร้านค้าของฉัน (Me)
export const fetchMyMerchant = createAsyncThunk(
    "merchant/fetchMyMerchant",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`/api/v1/merchants/me`);
            return response.data as Merchant;
        } catch (e: unknown) {
            if (e instanceof Error) {
                return rejectWithValue(e.message);
            } else if (e instanceof AxiosError) {
                return rejectWithValue(e.response?.data?.message || e.message);
            } else {
                return rejectWithValue("An unknown error occurred");
            }
        }
    }
);

const merchantSlice = createSlice({
    name: "merchant",
    initialState,
    reducers: {
        // ไว้ล้างข้อมูลร้านค้าออกจาก State (เช่น ตอน logout)
        resetMerchantState: (state) => {
            state.merchant = null;
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Handle Create Merchant
            .addCase(createMerchant.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createMerchant.fulfilled, (state, action: PayloadAction<Merchant>) => {
                state.loading = false;
                state.merchant = action.payload;
            })
            .addCase(createMerchant.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Handle Fetch Merchant
            .addCase(fetchMyMerchant.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyMerchant.fulfilled, (state, action: PayloadAction<Merchant>) => {
                state.loading = false;
                state.merchant = action.payload;
            })
            .addCase(fetchMyMerchant.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { resetMerchantState } = merchantSlice.actions;
export default merchantSlice.reducer;