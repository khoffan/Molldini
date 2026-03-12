import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { IShipping } from "../interface/shippingInterface";
import { AxiosError } from "axios";
import api from "../lib/api";

interface IShiipingState {
    shippings: IShipping[]
    loading: boolean
    error: string | null
}

const initialState: IShiipingState = {
    shippings: [],
    loading: false,
    error: null
}

export const fetchShipping = createAsyncThunk(
    'shpping/fetchShipping',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/api/v1/shippings');
            return res.data as IShipping[];
        } catch (e: unknown) {
            if (e instanceof AxiosError) {
                return rejectWithValue(e.response?.data?.message || e.message);
            }
            return rejectWithValue("An unknown error occurred");
        }
    }
)

const shippingSlice = createSlice({
    name: "shipping",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchShipping.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchShipping.fulfilled, (state, action) => {
                state.loading = false;
                state.shippings = action.payload;
            })
            .addCase(fetchShipping.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
    }
})

export default shippingSlice.reducer