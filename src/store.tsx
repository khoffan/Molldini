import { createStore, combineReducers, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import { productReducer } from './reducer/productReducer';
import { cartReducer } from './reducer/certRducer';

const rootReducer = combineReducers({
    product: productReducer,
    cart: cartReducer
})

export const store = createStore(rootReducer, applyMiddleware(thunk));

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 