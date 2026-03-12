import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Address } from "../interface/addressInterface";
import { AxiosError } from "axios";
import api from "../lib/api";


interface AddressState {
    addresses: Address[] | null;
    loading: boolean;
    error: string | null;
}

const initialState: AddressState = {
    addresses: null,
    loading: false,
    error: null,
}


export const fetchAddressById = createAsyncThunk(
    "user/updateAddressData",
    async (addressId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/api/v1/address/${addressId}`);
            return response.data as Address
        } catch (e: unknown) {
            if (e instanceof AxiosError) {
                return rejectWithValue(e.response?.data?.message || e.message);
            }
            return rejectWithValue("An unknown error occurred");
        }
    }
)

export const deletedAddressById = createAsyncThunk(
    "user/deleteAddress",
    async (addressId: string, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/api/v1/address/${addressId}/delete`);
            if (response.status !== 200) {
                return rejectWithValue(response.data.message);
            }
        } catch (e: unknown) {
            if (e instanceof AxiosError) {
                return rejectWithValue(e.response?.data?.message || e.message);
            }
            return rejectWithValue("An unknown error occurred");
        }
    }
)



const addressSlice = createSlice({
    name: "address",
    initialState: initialState,
    reducers: {
        resetAddressState: (state) => {
            state.addresses = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAddressById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAddressById.fulfilled, (state, action) => {
                state.addresses?.push(action.payload);
                state.loading = false;
            })
            .addCase(fetchAddressById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(deletedAddressById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deletedAddressById.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(deletedAddressById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export default addressSlice.reducer;