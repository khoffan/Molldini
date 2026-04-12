import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/service/authService";
import merchantReducer from "./features/merchants/services/merchantService";
import cartReducer from "./features/carts/services/cartService";
import categoryReducer from "./features/products/services/categoryService";
import productReducer from "./features/products/services/productService";
import orderReducer from "./features/orders/services/orderService";
import userService from "./features/user/services/userService";
import addressReducer from './features/address/service/addressService';
import notiReducer from './features/notification/service/notificationService';
import paymentReducer from './features/orders/services/paymentService';
import shippingReducer from './features/orders/services/shippingService';
import checkoutReducer from './features/carts/services/checkoutService';

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
        noti: notiReducer,
        payment: paymentReducer,
        shipping: shippingReducer,
        checkout: checkoutReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // ปิดเช็คเพราะเรามี Firebase Object ปนอยู่
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;