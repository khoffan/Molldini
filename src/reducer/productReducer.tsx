import { ActionType } from "../actions/productAction";
import type { ProductItem } from "../interface/productInterface";



export interface ProductState {
    items: ProductItem[],
    loading: boolean,
    error: string | null
}

const initState: ProductState = {
    items: [],
    loading: false,
    error: null
}

export const productReducer = (state: ProductState = initState, action: any) => {
    switch (action.type) {
        case ActionType.FETCH_PRODUCT:
            return {
                ...state,
                loading: true,
                error: null
            }
        case ActionType.FETCH_PRODUCT_SUCCESS:
            return {
                ...state,
                loading: false,
                items: action.payload
            }
        case ActionType.FETCH_PRODUCT_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        case ActionType.SET_PRODUCT:
            return {
                ...state,
                loading: true,
                error: null
            }
        case ActionType.SET_PRODUCT_SUCCESS:
            return {
                ...state,
                loading: false,
                items: [...state.items, action.payload]
            }
        case ActionType.SET_PRODUCT_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        case ActionType.REMOVE_PRODUCT:
            return {
                ...state,
                loading: false,
                items: state.items.filter((item) => item.id !== action.payload)
            }
        default:
            return state
    }
}
