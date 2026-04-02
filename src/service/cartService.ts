import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartItem, Carts } from "../interface/cartInterface";
import api from "../lib/api";
import type { RootState } from "../store";
import { AxiosError } from "axios";

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


export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/api/v1/carts");
            const data = res.data as Carts;
            return data;
        } catch (e: unknown) {
            if (e instanceof Error) {
                return rejectWithValue(e.message);
            } else if (e instanceof AxiosError) {
                return rejectWithValue(e.response?.data?.message || e.message);
            }
            return rejectWithValue("An unknown error occurred");
        }
    }
)



export const mergeCartAfterLogin = createAsyncThunk(
    "cart/mergeCartAfterLogin",
    async (_, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const localItems = state.cart.cart?.items || [];

        if (localItems.length === 0) return;

        if (state.cart.isSynced) {
            console.log("Cart is synced already");
            return rejectWithValue("Cart is synced already");
        }

        try {
            // ส่งตะกร้าทั้งหมดจาก Local ไปที่ API ตัวใหม่ (Bulk Update/Create)
            await Promise.all(
                localItems.map((it) => api.post("/api/v1/carts", {
                    quantity: it.quantity,
                    productId: it.productId
                }))
            )
            console.log("Cart merged with database");
            const res = await api.get("/api/v1/carts");
            const dbData = res.data as Carts;
            saveToLocal(dbData);
            console.log("fetch cart from api and add to local success");
            return dbData;
        } catch (e: unknown) {
            const err = e as Error;
            return rejectWithValue(err.message);
        }
    }
);

export const addCartDb = createAsyncThunk(
    "cart/addCartDb",
    async (item: CartItem, { rejectWithValue }) => {
        try {

            const res = await api.post("/api/v1/carts", {
                quantity: item.quantity,
                productId: item.productId
            })


            console.log("add Cart to database");
            return res.data
        } catch (e: unknown) {
            if (e instanceof Error) {
                return rejectWithValue(e.message);
            } else if (e instanceof AxiosError) {
                return rejectWithValue(e.response?.data?.message || e.message);
            }
            return rejectWithValue("An unknown error occurred");
        }
    }
)

export const removeItemFormCartDb = createAsyncThunk(
    "cart/removeItemFormCartDb",
    async (itemId: string, { rejectWithValue }) => {
        try {
            const res = await api.delete(`/api/v1/carts/item/${itemId}`)
            if (res.status === 204) {
                console.log("remove Cart to database");
                return itemId
            }
            return undefined
        } catch (e: unknown) {
            if (e instanceof Error) {
                return rejectWithValue(e.message);
            } else if (e instanceof AxiosError) {
                return rejectWithValue(e.response?.data?.message || e.message);
            }
            return rejectWithValue("An unknown error occurred");
        }
    }
)


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
            console.log("🚀 ~ product:", product)

            // ตรวจสอบว่ามีสินค้าตัวนี้ (productId) อยู่ในตะกร้าหรือยัง


            // ถ้ายังไม่มี ให้ push เข้าไปใหม่ (กำหนด ID และ Date ตรงนี้เลย)
            state.cart?.items.push({
                ...product,
            });
            state.loading = false;
            state.error = null;
            console.log("Add to cart:", state.cart);
            saveToLocal(state.cart!);

        },

        removeFromCart: (state, action: PayloadAction<string>) => {
            const filteredItems = state.cart?.items.filter(item => item.productId !== action.payload);


            const asCarts: Carts = {
                ...state.cart!,
                items: filteredItems || [],
            };
            console.log("🚀 ~ asCarts:", asCarts)
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
            .addCase(addCartDb.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addCartDb.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload;
            })
            .addCase(addCartDb.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
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
            .addCase(mergeCartAfterLogin.pending, (state) => {
                state.error = null;
            })
            .addCase(mergeCartAfterLogin.fulfilled, (state) => {
                state.isSynced = true;
            })
            .addCase(mergeCartAfterLogin.rejected, (state, action) => {
                state.error = action.payload as string;
                state.isSynced = true;
            })
            .addCase(fetchCart.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false
                state.cart = action.payload
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(removeItemFormCartDb.fulfilled, (state, action) => {
                state.loading = false;
                const productId = action.payload;
                if (productId === undefined) return
                if (state.cart && productId) {
                    // ลบ item ออกจาก state โดยตรง
                    state.cart.items = state.cart.items.filter(item => item.productId !== productId);
                    saveToLocal(state.cart);
                }
            })
            .addCase(removeItemFormCartDb.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
    }
});

export const {
    addToCart,
    removeFromCart,
    clearCart
} = cartSlice.actions;

export default cartSlice.reducer;