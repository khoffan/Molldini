import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { type AppUser } from "../interface/userInterface";
import type { Address } from "../interface/addressInterface";
import { AxiosError } from "axios";
import api from "../lib/api";

interface UserState {
    user: AppUser | null;
    loading: boolean;
    error: string | null;
}

export const initialState: UserState = {
    user: null,
    loading: false,
    error: null,
}

export const updateAddressUser = createAsyncThunk(
    "update/userAddress",
    async (userAddress: Partial<Address>, { rejectWithValue }) => {
        try {
            const response = await api.put(`/api/v1/users/address/me`, {
                address: userAddress
            });
            const rawData = response.data;
            const appUser: AppUser = {
                uid: rawData.id,
                providerId: rawData.provider,
                email: rawData.email,
                role: rawData.role,
                firstName: rawData.firstName,
                lastName: rawData.lastName,
                displayName: rawData.name,
                image: rawData.image,
                emailVerified: rawData.emailVerified,
                phoneNumber: rawData.phoneNumber,
                createdAt: rawData.createdAt,
                lastLogin: rawData.lastLogin,
                addresses: rawData.addresses,
                orders: rawData.orders,
                userDevices: rawData.userDevices,
            };
            return appUser;
        } catch (e: unknown) {
            if (e instanceof AxiosError) {
                return rejectWithValue(e.response?.data?.message || e.message);
            } else {
                return rejectWithValue("An unknown error occurred");
            }
        }
    }
);

export const updateAddressData = createAsyncThunk(
    "user/updateAddressData",
    async ({ addressId, userAddress }: { addressId: string, userAddress: Partial<Address> }, { rejectWithValue }) => {
        try {
            const updateRes = await api.put(`/api/v1/address/${addressId}/edit`, {
                address: userAddress
            });

            if (updateRes.status !== 200) {
                return rejectWithValue(updateRes.data.message);
            }
            console.log("update address su");

            const res = await api.get(`/api/v1/profile`);
            const rawData = res.data;
            const appUser: AppUser = {
                uid: rawData.id,
                providerId: rawData.provider,
                email: rawData.email,
                role: rawData.role,
                firstName: rawData.firstName,
                lastName: rawData.lastName,
                displayName: rawData.name,
                image: rawData.image,
                emailVerified: rawData.emailVerified,
                phoneNumber: rawData.phoneNumber,
                createdAt: rawData.createdAt,
                lastLogin: rawData.lastLogin,
                addresses: rawData.addresses,
                orders: rawData.orders,
                userDevices: rawData.userDevices,
            };
            return appUser;
        } catch (e: unknown) {
            if (e instanceof AxiosError) {
                return rejectWithValue(e.response?.data?.message || e.message);
            }
            return rejectWithValue("An unknown error occurred");
        }
    }
)



export const updateUser = createAsyncThunk(
    "user/updateUser",
    async ({ displayName, emailVerify, phoneNumber }: { displayName: string, emailVerify: boolean, phoneNumber: string }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/api/v1/users/me`, {
                displayName,
                emailVerify,
                phoneNumber
            });
            const rawData = response.data;
            const appUser: AppUser = {
                uid: rawData.id,
                providerId: rawData.provider,
                email: rawData.email,
                role: rawData.role,
                firstName: rawData.firstName,
                lastName: rawData.lastName,
                displayName: rawData.name,
                image: rawData.image,
                emailVerified: rawData.emailVerified,
                phoneNumber: rawData.phoneNumber,
                createdAt: rawData.createdAt,
                lastLogin: rawData.lastLogin,
                addresses: rawData.addresses,
                orders: rawData.orders,
                userDevices: rawData.userDevices,
            };
            return appUser;
        } catch (e: unknown) {
            if (e instanceof AxiosError) {
                return rejectWithValue(e.response?.data?.message || e.message);
            } else {
                return rejectWithValue("An unknown error occurred");
            }
        }
    }
)


export const fetchUser = createAsyncThunk(
    "fetch/user",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`/api/v1/profile`);
            const rawData = response.data;
            const appUser: AppUser = {
                uid: rawData.id,
                providerId: rawData.provider,
                email: rawData.email,
                role: rawData.role,
                firstName: rawData.firstName,
                lastName: rawData.lastName,
                displayName: rawData.name,
                image: rawData.image,
                emailVerified: rawData.emailVerified,
                phoneNumber: rawData.phoneNumber,
                createdAt: rawData.createdAt,
                lastLogin: rawData.lastLogin,
                addresses: rawData.addresses,
                orders: rawData.orders, userDevices: rawData.userDevices,
            };

            return appUser;
        } catch (e: unknown) {
            if (e instanceof AxiosError) {
                return rejectWithValue(e.response?.data?.message || e.message);
            } else {
                return rejectWithValue("An unknown error occurred");
            }
        }
    }
);

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        clearUserData: (state) => {
            state.user = null
            state.loading = false
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateAddressUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateAddressUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.loading = false;
            })
            .addCase(updateAddressUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.loading = false;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.loading = false;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateAddressData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateAddressData.fulfilled, (state, action) => {
                state.user = action.payload;
                state.loading = false;
            })
            .addCase(updateAddressData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
    },
});

export const { clearUserData } = userSlice.actions;
export default userSlice.reducer;