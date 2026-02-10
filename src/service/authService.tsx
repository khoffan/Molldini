import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { signOut, type User } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import api from "../lib/api";
import type { AppUser } from "../interface/userInterface";

interface AuthState {
    user: AppUser | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
};

// 💡 ใช้ createAsyncThunk แทน Manual Thunk เดิม
export const syncUserWithBackend = createAsyncThunk(
    "auth/syncUser",
    async (firebaseUser: User, { rejectWithValue }) => {
        try {
            const idToken = await firebaseUser.getIdToken(true);
            const res = await api.post(
                `/api/v1/users/me`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                }
            );

            console.log(res.data);

            const rawData = res.data;
            // 💡 Mapping ข้อมูลตรงนี้เลย
            const appUser: AppUser = {
                uid: rawData.uid,
                providerId: rawData.provider,
                email: rawData.email,
                role: rawData.role,
                firstName: rawData.firstName,
                lastName: rawData.lastName,
                displayName: rawData.name,
                photoURL: rawData.imageUrl,
                emailVerified: rawData.emailVerified,
                phoneNumber: rawData.phoneNumber,
                createdAt: rawData.createdAt,
                lastLogin: rawData.lastLogin,
            };
            return appUser;
        } catch (err: unknown) {
            const e = err as Error;
            return rejectWithValue( e.message);
        }
    }
);

export const logoutAction = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await signOut(auth);
            return null;
        } catch (err: unknown) {
            const e = err as Error;
            return rejectWithValue(e.message);
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // 💡 เอาไว้ใช้กรณีต้องการล้าง Error หรือเซ็ตค่าแบบ Manual (ถ้ามี)
        clearAuthError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Sync User Cases
            .addCase(syncUserWithBackend.pending, (state) => {
                state.loading = true;
                state.error = null;
                
            })
            .addCase(syncUserWithBackend.fulfilled, (state, action: PayloadAction<AppUser>) => {
                state.user = action.payload;
                state.loading = false;
                state.isAuthenticated = true;
            })
            .addCase(syncUserWithBackend.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Logout Cases
            .addCase(logoutAction.fulfilled, (state) => {
                state.user = null;
                state.loading = false;
            });
    },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;