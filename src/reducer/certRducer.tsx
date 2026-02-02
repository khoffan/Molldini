import { CartActionType } from "../actions/certActions";
import type { CartItem } from "../interface/cartInterface";

export interface CartState {
    items: CartItem[];
    loading: boolean;
    error: string | null;
}

export const initialCartState: CartState = {
    items: [],
    loading: false,
    error: null
}

const saveToLocal = (items: CartItem[]) => {
    localStorage.setItem("cart", JSON.stringify(items));
}

export const cartReducer = (state: CartState = initialCartState, action: any) => {
    let newState;
    let updatedItems: CartItem[];

    switch (action.type) {
        case CartActionType.FETCH_CART:
            return {
                ...state,
                items: action.payload,
                loading: false,
                error: null
            }
        case CartActionType.ADD_TO_CART:
            const exsitedCart = state.items.find(item => item.id === action.payload.id);
            if (exsitedCart) {
                newState = {
                    ...state,
                    items: state.items.map(item =>
                        item.id === action.payload.id
                            ? { ...item, quantity: item.quantity + action.payload.quantity }
                            : item
                    )
                }
            } else {
                newState = {
                    ...state,
                    items: [...state.items, action.payload]
                }
            }
            if (newState) {
                saveToLocal(newState.items);
            }
            return {
                ...state,
                items: [...state.items, action.payload]
            }
        case CartActionType.REMOVE_FROM_CART:
            updatedItems = state.items.filter(item => item.productId !== action.payload);
            saveToLocal(updatedItems); // อัปเดตหลังลบ
            return { ...state, items: updatedItems };

        case CartActionType.INCREMENT_QUANTITY:
            updatedItems = state.items.map(item =>
                item.productId === action.payload
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );
            saveToLocal(updatedItems); // อัปเดตหลังบวก
            return { ...state, items: updatedItems };

        case CartActionType.DECREMENT_QUANTITY:
            updatedItems = state.items.map(item =>
                item.productId === action.payload && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            );
            saveToLocal(updatedItems); // อัปเดตหลังลบจำนวน
            return { ...state, items: updatedItems };
        default:
            return state
    }
}