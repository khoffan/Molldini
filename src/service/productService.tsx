import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "../lib/api";
import type { Product, ProductInput } from "../interface/productInterface";
import { uploadToCloudinary } from "../lib/uploadfileToFirestoage";
import { AxiosError } from "axios";

export interface ProductState {
    items: Product[];
    loading: boolean;
    error: string | null;
}

const initialState: ProductState = {
    items: [],
    loading: false,
    error: null,
};

export interface ProductArgs {
    productData: ProductInput,
    mainFile?: File | null,
    variantFiles?: { index: number, file: File }[]
}

// 1. Thunk สำหรับดึงสินค้า (รองรับทั้ง List และ Single ID)
export const fetchProducts = createAsyncThunk(
    "product/fetchProducts",
    async (id: string | undefined, { rejectWithValue }) => {
        try {
            const endpoint = id ? `/api/v1/products/${id}` : "/api/v1/products";
            const response = await api.get(endpoint);
            console.log("response.data", response.data);
            return response.data as Product | Product[]; // ผลลัพธ์จะเป็น Product[] หรือ Product
        } catch (e: unknown) {
            const error = e as Error;
            return rejectWithValue(error.message);
        }
    }
);

// 2. Thunk สำหรับดึงสินค้าเฉพาะของ Merchant นั้นๆ
export const fetchProductMerchant = createAsyncThunk(
    "product/fetchProductMerchant",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/api/v1/products/merchant");
            return response.data as Product[];
        } catch (e: unknown) {
            const error = e as Error;
            return rejectWithValue(error.message);
        }
    }
);

// 3. Thunk สำหรับสร้างสินค้าใหม่
export const setProduct = createAsyncThunk(
    "product/setProduct",
    async (args: ProductArgs, { rejectWithValue }) => {
        try {
            const { productData, mainFile, variantFiles } = args;
            let mainImageMetadata = null;
            if (mainFile) {
                mainImageMetadata = await uploadToCloudinary(mainFile, "products");
            }

            // 2. จัดการรูปภาพของแต่ละ Variant (ถ้ามีการแนบไฟล์มา)
            const updatedVariants = [...productData.variants];
            if (variantFiles && variantFiles.length > 0) {
                for (const item of variantFiles) {
                    const vImageInfo = await uploadToCloudinary(item.file, "variants");
                    // เก็บ Metadata ไว้ใน Object variant เพื่อส่งไปให้ Backend
                    updatedVariants[item.index] = {
                        ...updatedVariants[item.index],
                        images: [{ ...vImageInfo }]
                    };
                }
            }

            // 3. รวมข้อมูลทั้งหมดเพื่อส่งไป Backend
            const finalPayload = {
                ...productData,
                images: mainImageMetadata ? [mainImageMetadata] : productData.images,
                variants: updatedVariants
            };

            console.log("finalPayload", finalPayload);

            const response = await api.post("/api/v1/products", finalPayload);
            return response.data;
        } catch (e: unknown) {
            const error = e as Error;
            return rejectWithValue(error.message);
        }
    }
);

export const updateProductById = createAsyncThunk(
    "update/productbyId",
    async ({ productId, args }: { productId: string, args: ProductArgs }, { rejectWithValue }) => {
        try {
            console.log("🚀 ~ productId:", productId)
            console.log("🚀 ~ productData:", args)
            const { productData, mainFile, variantFiles } = args;
            let mainImageMetadata = null;
            if (mainFile) {
                mainImageMetadata = await uploadToCloudinary(mainFile, "products");
            }

            const updatedVariants = [...productData.variants];
            if (variantFiles && variantFiles.length > 0) {
                for (const item of variantFiles) {
                    const vImageInfo = await uploadToCloudinary(item.file, "variants");
                    // เก็บ Metadata ไว้ใน Object variant เพื่อส่งไปให้ Backend
                    updatedVariants[item.index] = {
                        ...updatedVariants[item.index],
                        images: [{ ...vImageInfo }]
                    };
                }
            }

            // 3. รวมข้อมูลทั้งหมดเพื่อส่งไป Backend
            const finalPayload = {
                ...productData,
                images: mainImageMetadata ? [mainImageMetadata] : productData.images,
                variants: updatedVariants
            };
            const response = await api.put(`/api/v1/products/${productId}`, finalPayload);
            console.log("🚀 ~ response:", response.data)
            return response.data.data;
        } catch (e: unknown) {
            if (e instanceof Error) {
                return rejectWithValue(e.message);
            } else if (e instanceof AxiosError) {
                return rejectWithValue(e.response?.data?.message || e.message);
            }
            return rejectWithValue("An unknown error occurred");
        }

    }
);

const productSlice = createSlice({
    name: "product",
    initialState,
    reducers: {
        // สำหรับลบสินค้าออกจาก State โดยตรง (เช่น หลังลบใน DB สำเร็จ)
        removeProductLocally: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((item) => item.id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            // จัดการสถานะการ Fetch (ใช้ร่วมกันได้หรือแยกตาม Thunk)
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product | Product[]>) => {
                state.loading = false;
                // ถ้า payload เป็น array ให้ทับ items ถ้าเป็นชิ้นเดียวให้จัดการตาม logic หน้างาน
                if (Array.isArray(action.payload)) {
                    state.items = action.payload;
                } else {
                    // กรณีโหลดชิ้นเดียว อาจจะเลือก push หรืออัปเดตตัวที่มีอยู่
                    const index = state.items.findIndex(p => p.id === (action.payload as Product).id);
                    if (index !== -1) state.items[index] = action.payload as Product;
                    else state.items.push(action.payload as Product);
                }
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // กรณีดึงสินค้า Merchant
            .addCase(fetchProductMerchant.fulfilled, (state, action: PayloadAction<Product[]>) => {
                state.loading = false;
                state.items = action.payload;
            })

            // กรณีเพิ่มสินค้าใหม่
            .addCase(setProduct.fulfilled, (state, action: PayloadAction<Product>) => {
                state.loading = false;
                state.items.push(action.payload); // Immer จัดการ immutability ให้เอง
            })

            //case update product
            .addCase(updateProductById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProductById.fulfilled, (state, action: PayloadAction<Product>) => {
                state.loading = false;
                const index = state.items.findIndex(p => p.id === (action.payload as Product).id);
                if (index !== -1) state.items[index] = action.payload as Product;
                else state.items.push(action.payload as Product);
            })
            .addCase(updateProductById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { removeProductLocally } = productSlice.actions;
export default productSlice.reducer;