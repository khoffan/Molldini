import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../../common/lib/api";
import type { Category } from "../interfaces/categoryInterface";
import { AxiosError } from "axios";

export interface CategoryState {
    categories: Category[];
    loading: boolean;
    error: string | null;
}

const initialState: CategoryState = {
    categories: [],
    loading: false,
    error: null,
};

// 1. Thunk สำหรับดึงข้อมูลหมวดหมู่ทั้งหมด
export const fetchCategories = createAsyncThunk(
    "category/fetchCategories",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`/api/v1/categories`);
            return response.data as Category[];
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || error.message);
            } else {
                return rejectWithValue("An unknown error occurred");
            }
        }
    }
);

// 2. Thunk สำหรับเพิ่มหมวดหมู่ใหม่
export const createCategory = createAsyncThunk(
    "category/createCategory",
    async (payload: { name: string }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/api/v1/categories`, payload);
            return response.data as Category;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || error.message);

            } else {
                return rejectWithValue("An unknown error occurred");
            }
        }
    }
);

const categorySlice = createSlice({
    name: "category",
    initialState,
    reducers: {
        // สามารถเพิ่ม reducer สำหรับจัดการ state ภายในได้ เช่น clearError
        clearCategoryError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Handle Fetch Categories
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
                state.loading = false;
                state.categories = action.payload; // ทับข้อมูลเดิมด้วยข้อมูลล่าสุดจาก API
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Handle Create Category
            .addCase(createCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
                state.loading = false;
                state.categories.push(action.payload); // 💡 เพิ่มหมวดหมู่ใหม่ต่อท้าย Array เดิม
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;
