import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartItem, Carts } from "../interface/cartInterface";
import api from "../lib/api";
import type { RootState } from "../store";

export interface CartState {
    cart: Carts | null;
    loading: boolean;
    error: string | null;
    isSynced: boolean;
}

// Helper: โหลดข้อมูลจาก LocalStorage
const loadCartFromStorage = (): Carts | null => {
    try {
        const savedCart = localStorage.getItem("cart");
        return savedCart ? JSON.parse(savedCart) : null;
    } catch {
        return null;
    }
};

// Helper: บันทึกข้อมูลลง LocalStorage
const saveToLocal = (items: Carts) => {
    localStorage.setItem("cart", JSON.stringify(items));
};

const initialState: CartState = {
    cart: loadCartFromStorage(),
    loading: false,
    error: null,
    isSynced: false
};

export const syncCartToDb = createAsyncThunk(
    "cart/syncCartToDb",
    async (item: CartItem, { getState, rejectWithValue }) => {
        const state = getState() as RootState;

        // 1. ตรวจสอบว่า Login หรือยัง (เช็คจาก auth slice ของคุณ)
        const isAuthenticated = state.auth.isAuthenticated;

        if (!isAuthenticated) {
            // ถ้ายังไม่ Login ไม่ต้องยิง API ให้เสียเวลา (เพราะจะติด Middleware อยู่ดี)
            return null;
        }

        try {
            // 2. ถ้า Login แล้ว ส่งข้อมูลไปที่ Backend
            const res = await api.post("/api/v1/carts", {
                quantity: item.quantity,
                productId: item.productId
            });
            return res.data;
        } catch (e: unknown) {
            const err = e as Error;
            return rejectWithValue(err.message || "Sync failed");
        }
    }
);

export const mergeCartAfterLogin = createAsyncThunk(
    "cart/mergeCartAfterLogin",
    async (_, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const localItems = state.cart.cart?.items || [];

        if (localItems.length === 0) return;

        try {
            // ส่งตะกร้าทั้งหมดจาก Local ไปที่ API ตัวใหม่ (Bulk Update/Create)
            await Promise.all(
                localItems.map((it) => api.post("/api/v1/carts", {
                    quantity: it.quantity,
                    productId: it.productId
                }))
            )
            console.log("Cart merged with database");
        } catch (e: unknown) {
            const err = e as Error;
            return rejectWithValue(err.message);
        }
    }
);

export const addCartDb = createAsyncThunk(
    "cart/addCartDb",
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const localItems = state.cart.cart?.items || [];
            // for(const items of localItems){
            //     await api.post("/api/v1/carts", {
            //         variantId: items.variantId,
            //         quantity: items.quantity,
            //         productId: items.productId
            //     });
            // }
            await Promise.all(
                localItems.map((it) => api.post("/api/v1/carts", {
                    quantity: it.quantity,
                    productId: it.productId
                }))
            );
            console.log("add Cart to database");
        } catch (e: unknown) {
            const err = e as Error;
            return rejectWithValue(err.message);
        }
    }
)

export const fetchCartFromDb = createAsyncThunk(
    "cart/fetchCartFromDb",
    async () => {
        try {
            const res = await api.get("/api/v1/carts");
            const dbData = res.data as Carts;

            console.log("DB data:", dbData);

            if (dbData && dbData.items) {
                saveToLocal(dbData);
                return dbData;
            }
            return null;

        } catch (e: unknown) {
            // กรณี API พัง (เช่น Server down) ให้ถอยไปใช้ LocalStorage เป็นแผนสำรอง (Fallback)
            console.error("Fetch DB failed, falling back to local storage", e);
            const localData = loadCartFromStorage();

            // ถ้าไม่อยากให้ Error ขึ้นโชว์กวนใจ user ในเคสที่เน็ตหลุดแต่ยังมีของในเครื่อง
            // สามารถเลือกที่จะ return localData แทน rejectWithValue ได้ครับ
            return localData;
        }
    }
);

// Thunk สำหรับอัปเดตจำนวนสินค้าในตะกร้าไปยัง Database
export const updateCartIncrementQuantityDb = createAsyncThunk(
    "cart/updateCartIncrementQuantityDb",
    async ({ productId }: { productId: string }, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const variantStock = state.product.items
            .map(item => item.variants)
            .flat()
            .find(v => v.id === productId)?.stock;
        const cart = state.cart.cart;
        const qty = cart!.items.find(item => item.productId === productId)?.quantity || 0;
        if (qty <= 0) {
            return rejectWithValue("จำนวนสินค้าในตะกร้าไม่เพียงพอที่จะลด");
        }

        // ถ้ายังไม่ได้ Login ให้จบการทำงาน (เก็บแค่ใน Local เท่านั้น)
        if (!state.auth.isAuthenticated) return null;

        if (qty > variantStock!) {
            return rejectWithValue("จำนวนสินค้าที่สั่งเกินสต็อก");
        }

        try {
            // ยิง API ไปที่ path เดียวกับ addToCart เพราะเราเขียน logic 'upsert' ไว้แล้ว
            const res = await api.put("/api/v1/carts/increament", {
                productId,
            });
            return res.data;
        } catch (e: unknown) {
            const err = e as Error;
            return rejectWithValue(err.message || "ไม่สามารถอัปเดตจำนวนได้");
        }
    }
);
export const updateCartDecrementQuantityDb = createAsyncThunk(
    "cart/updateCartDecrementQuantityDb",
    async ({ productId }: { productId: string }, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const variantStock = state.product.items
            .map(item => item.variants)
            .flat()
            .find(v => v.id === productId)?.stock;

        const cart = state.cart.cart;
        const qty = cart!.items.find(item => item.productId === productId)?.quantity || 0;
        if (qty <= 0) {
            return rejectWithValue("จำนวนสินค้าในตะกร้าไม่เพียงพอที่จะลด");
        }

        // ถ้ายังไม่ได้ Login ให้จบการทำงาน (เก็บแค่ใน Local เท่านั้น)
        if (!state.auth.isAuthenticated) return null;

        if (qty > variantStock!) {
            return rejectWithValue("จำนวนสินค้าที่สั่งเกินสต็อก");
        }

        try {
            // ยิง API ไปที่ path เดียวกับ addToCart เพราะเราเขียน logic 'upsert' ไว้แล้ว
            const res = await api.put("/api/v1/carts/decreament", {
                productId,
            });
            return res.data;
        } catch (e: unknown) {
            const err = e as Error;
            return rejectWithValue(err.message || "ไม่สามารถอัปเดตจำนวนได้");
        }
    }
);


const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        fetchCartFromLocal: (state, action: PayloadAction<Carts>) => {
            state.cart = action.payload;
            state.loading = false;
            state.error = null;
        },
        addToCart: (state, action: PayloadAction<CartItem>) => {
            const product = action.payload;
            // ตรวจสอบว่ามีสินค้าตัวนี้ (productId) อยู่ในตะกร้าหรือยัง

            const existingItem = state.cart?.items.find(item => item.productId === product.productId);

            if (existingItem) {
                // ถ้ามีแล้ว ให้บวกจำนวนเพิ่ม
                existingItem.quantity += product.quantity;
            } else {
                // ถ้ายังไม่มี ให้ push เข้าไปใหม่ (กำหนด ID และ Date ตรงนี้เลย)
                state.cart?.items.push({
                    ...product,
                });
                state.loading = false;
                state.error = null;
            }
            saveToLocal(state.cart!);
        },

        removeFromCart: (state, action: PayloadAction<string>) => {
            const filteredItems = state.cart?.items.filter(item => item.productId !== action.payload);
            const asCarts: Carts = {
                ...state.cart!,
                items: filteredItems || [],
            };
            state.cart = asCarts;
            saveToLocal(state.cart!);
        },


        clearCart: (state) => {
            state.cart = null;
            localStorage.removeItem("cart");
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(syncCartToDb.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            .addCase(addCartDb.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addCartDb.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(addCartDb.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(syncCartToDb.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCartIncrementQuantityDb.fulfilled, (state, action) => {
                state.loading = false;
                const updatedItem = action.payload;
                const index = state.cart?.items.findIndex(i => i.productId === updatedItem.productId);
                if (state.cart && index !== undefined && index !== -1) {
                    state.cart.items[index] = updatedItem; // ทับข้อมูลเดิมด้วยข้อมูลใหม่จาก DB
                    saveToLocal(state.cart);
                }
            })
            .addCase(updateCartIncrementQuantityDb.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateCartDecrementQuantityDb.fulfilled, (state, action) => {
                state.loading = false;
                const updatedItem = action.payload;
                const index = state.cart?.items.findIndex(i => i.productId === updatedItem.productId);
                if (state.cart && index !== undefined && index !== -1) {
                    state.cart.items[index] = updatedItem; // ทับข้อมูลเดิมด้วยข้อมูลใหม่จาก DB
                    saveToLocal(state.cart);
                }
            })
            .addCase(updateCartDecrementQuantityDb.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchCartFromDb.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string;
                state.isSynced = true;
            })
            .addCase(fetchCartFromDb.fulfilled, (state, action) => {
                state.cart = action.payload;
                state.isSynced = true;
                state.loading = false;
            })
            .addCase(mergeCartAfterLogin.pending, (state) => {
                state.error = null;
            })
            .addCase(mergeCartAfterLogin.fulfilled, (state) => {
                state.isSynced = true;
            })
            .addCase(mergeCartAfterLogin.rejected, (state, action) => {
                state.error = action.payload as string;
                state.isSynced = true;
            });
    }
});

export const {
    addToCart,
    removeFromCart,
    clearCart
} = cartSlice.actions;

export default cartSlice.reducer;