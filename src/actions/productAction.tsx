import axios from 'axios';
import type { ProductItem } from '../interface/productInterface';

export const ActionType = {
    FETCH_PRODUCT: "FETCH_PRODUCT",
    FETCH_PRODUCT_SUCCESS: "FETCH_PRODUCT_SUCCESS",
    FETCH_PRODUCT_FAILURE: "FETCH_PRODUCT_FAILURE",
    SET_PRODUCT: "SET_PRODUCT",
    SET_PRODUCT_SUCCESS: "SET_PRODUCT_SUCCESS",
    SET_PRODUCT_FAILURE: "SET_PRODUCT_FAILURE",
    REMOVE_PRODUCT: "REMOVE_PRODUCT",
}

const baseUrl: string = "https://697d069897386252a2676641.mockapi.io/product";

export const fetchProduct = (id: string = "") => {
    return async (dispath: any) => {
        dispath({
            type: ActionType.FETCH_PRODUCT,
        });
        if (id == "") {
            try {
                const response: any = await axios.get(baseUrl);
                const data: ProductItem[] = response.data;
                dispath(
                    {
                        type: ActionType.FETCH_PRODUCT_SUCCESS,
                        payload: data
                    }
                )
            } catch (e: any) {
                dispath(
                    {
                        type: ActionType.FETCH_PRODUCT_FAILURE,
                        payload: e.message
                    }

                )
            }
        } else {
            try {
                const response: any = await axios.get(baseUrl + "/" + id);
                const data: ProductItem = response.data;
                dispath(
                    {
                        type: ActionType.FETCH_PRODUCT_SUCCESS,
                        payload: data
                    }
                )
            } catch (e: any) {
                dispath(
                    {
                        type: ActionType.FETCH_PRODUCT_FAILURE,
                        payload: e.message
                    }

                )
            }
        }

    }
}

export const setProduct = (product: any) => {
    return async (dispatch: any) => {
        dispatch({ type: ActionType.SET_PRODUCT })
        try {
            product.createdAt = new Date().toISOString();
            product.updatedAt = new Date().toISOString();
            const data: ProductItem = product;
            const response: any = await axios.post(baseUrl, data);
            dispatch({
                type: ActionType.SET_PRODUCT_SUCCESS,
                payload: response.data
            })
        } catch (e: any) {
            dispatch({
                type: ActionType.SET_PRODUCT_FAILURE,
                payload: e.message
            })
        }
    }
}

