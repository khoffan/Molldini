import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./service/authService";
import merchantReducer from "./service/merchantService";
import cartReducer from "./service/cartService";
import categoryReducer from "./service/categoryService";
import productReducer from "./service/productService";
import orderReducer from "./service/orderService";
import userService from "./service/userService";
import addressReducer from './service/addressService';
import notiReducer from './service/notificationService';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
        cart: cartReducer,
        merchant: merchantReducer,
        category: categoryReducer,
        order: orderReducer,
        user: userService,
        address: addressReducer,
        noti: notiReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // ปิดเช็คเพราะเรามี Firebase Object ปนอยู่
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;