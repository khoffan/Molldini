// import { createStore, combineReducers, applyMiddleware } from 'redux';
// import { thunk } from 'redux-thunk';
// import { productReducer } from './reducer/productReducer';
// import { cartReducer } from './reducer/certRducer';
// import { userReducer } from './reducer/userReducer';
// import { merchantReducer } from './reducer/merchantReducer';
// import { categoryReducer } from './reducer/categoryReducer';

// const rootReducer = combineReducers({
//     product: productReducer,
//     cart: cartReducer,
//     auth: userReducer,
//     merchant: merchantReducer,
//     category: categoryReducer
// })

// export const store = createStore(rootReducer, applyMiddleware(thunk));

// export type RootState = ReturnType<typeof store.getState>
// export type AppDispatch = typeof store.dispatch 

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./service/authService";
import merchantReducer from "./service/merchantService";
import cartReducer from "./service/cartService";
import categoryReducer from "./service/categoryService";
import productReducer from "./service/productService";
import orderReducer from "./service/orderService";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
        cart: cartReducer,
        merchant: merchantReducer,
        category: categoryReducer,
        order: orderReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // ปิดเช็คเพราะเรามี Firebase Object ปนอยู่
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;