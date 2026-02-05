import { CategoryAction } from "../actions/categoryAction";
import type { Category } from "../interface/categoryInterface";

export interface CategoryState {
    categories: Category[];
    loading: boolean;
    error: string | null;
}

export const initialCatogoryState: CategoryState = {
    categories: [],
    loading: false,
    error: null
}

export const categoryReducer = (state: CategoryState = initialCatogoryState, action: any) => {
    console.log(action)
    switch (action.type) {
        case CategoryAction.SET_CATEGORY:
            return {
                ...state,
                loading: true,
                error: null
            }
        case CategoryAction.SET_CATEGORY_SUCCESS:
            return {
                ...state,
                loading: false,
                categories: action.payload
            }
        case CategoryAction.SET_CATEGORY_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        case CategoryAction.FETCH_CATEGORY:
            return {
                ...state,
                loading: true,
                error: null
            }
        case CategoryAction.FETCH_CATEGORY_SUCCESS:
            return {
                ...state,
                loading: false,
                categories: action.payload
            }
        case CategoryAction.FETCH_CATEGORY_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        default:
            return state
    }
}