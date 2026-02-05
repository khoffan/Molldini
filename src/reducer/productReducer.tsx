import { ProductAction } from "../actions/productAction";
import type { Product } from "../interface/productInterface";



export interface ProductState {
    items: Product[],
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
        case ProductAction.FETCH_PRODUCT:
            return {
                ...state,
                loading: true,
                error: null
            }
        case ProductAction.FETCH_PRODUCT_SUCCESS:
            return {
                ...state,
                loading: false,
                items: action.payload
            }
        case ProductAction.FETCH_PRODUCT_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        case ProductAction.SET_PRODUCT:
            return {
                ...state,
                loading: true,
                error: null
            }
        case ProductAction.SET_PRODUCT_SUCCESS:
            return {
                ...state,
                loading: false,
                items: [...state.items, action.payload]
            }
        case ProductAction.SET_PRODUCT_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        case ProductAction.REMOVE_PRODUCT:
            return {
                ...state,
                loading: false,
                items: state.items.filter((item) => item.id !== action.payload)
            }
        default:
            return state
    }
}
