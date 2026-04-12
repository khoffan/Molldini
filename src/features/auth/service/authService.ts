import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { signOut, type User } from "firebase/auth";
import { auth } from "../../../common/firebase/firebaseConfig";
import api from "../../../common/lib/api";
import type { AppUser } from "../../user/interfaces/userInterface";


export interface AuthState {
    user: AppUser | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    isSynced: boolean
}

const initialState: AuthState = {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    isSynced: false,
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
                image: rawData.image,
                emailVerified: rawData.emailVerified,
                phoneNumber: rawData.phoneNumber,
                createdAt: rawData.createdAt,
                lastLogin: rawData.lastLogin,
                addresses: [],
                orders: [],
                userDevices: [],
            };
            return appUser;
        } catch (err: unknown) {
            const e = err as Error;
            return rejectWithValue(e.message);
        }
    }
);

export const logoutAction = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            const localFcmToken = localStorage.getItem("fcmToken");
            await api.post("/api/v1/users/logout", {
                fcmToken: localFcmToken
            });

            localStorage.removeItem("fcmToken");
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
        setInitialize: (state) => {
            state.loading = false;
            state.isAuthenticated = true
        },
        // 💡 เอาไว้ใช้กรณีต้องการล้
        // าง Error หรือเซ็ตค่าแบบ Manual (ถ้ามี)
        clearAuthError: (state) => {
            state.error = null;
        },
        clearState: (state) => {
            state.user = null;
            state.loading = false;
            state.error = null;
            state.isAuthenticated = false;
            state.isSynced = false;
        }
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
                state.isSynced = true;
            })
            .addCase(syncUserWithBackend.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(logoutAction.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutAction.fulfilled, (state) => {
                state.user = null;
                state.loading = false;
            })
            .addCase(logoutAction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearAuthError, setInitialize, clearState } = authSlice.actions;
export default authSlice.reducer;