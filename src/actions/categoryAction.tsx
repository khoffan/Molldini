import api from "../lib/api";
import type { Category } from "../interface/categoryInterface";

export const CategoryAction = {
    SET_CATEGORY: 'SET_CATEGORY',
    SET_CATEGORY_SUCCESS: 'SET_CATEGORY_SUCCESS',
    SET_CATEGORY_FAILURE: 'SET_CATEGORY_FAILURE',
    FETCH_CATEGORY: 'FETCH_CATEGORY',
    FETCH_CATEGORY_SUCCESS: 'FETCH_CATEGORY_SUCCESS',
    FETCH_CATEGORY_FAILURE: 'FETCH_CATEGORY_FAILURE',
}

export type CategoryActionType = typeof CategoryAction[keyof typeof CategoryAction];

export const setCategory = (payload: any) => {
    return async (dispatch: any) => {
        dispatch({ type: CategoryAction.SET_CATEGORY });
        try {
            const response = await api.post(`/api/v1/categories`, payload);
            dispatch({
                type: CategoryAction.SET_CATEGORY_SUCCESS,
                payload: response.data
            })
        } catch (error) {
            dispatch({
                type: CategoryAction.SET_CATEGORY_FAILURE,
                payload: error
            })
        }
    }
}

export const fetchCategory = () => {
    return async (dispatch: any) => {
        dispatch({ type: CategoryAction.FETCH_CATEGORY });
        try {
            const response = await api.get(`/api/v1/categories`);
            const data: Category[] = response.data;
            dispatch({
                type: CategoryAction.FETCH_CATEGORY_SUCCESS,
                payload: data
            })
        } catch (error) {
            dispatch({
                type: CategoryAction.FETCH_CATEGORY_FAILURE,
                payload: error
            })
        }
    }
}