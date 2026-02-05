import { createStore, combineReducers, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import { productReducer } from './reducer/productReducer';
import { cartReducer } from './reducer/certRducer';
import { userReducer } from './reducer/userReducer';
import { merchantReducer } from './reducer/merchantReducer';
import { categoryReducer } from './reducer/categoryReducer';

const rootReducer = combineReducers({
    product: productReducer,
    cart: cartReducer,
    auth: userReducer,
    merchant: merchantReducer,
    category: categoryReducer
})

export const store = createStore(rootReducer, applyMiddleware(thunk));

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 