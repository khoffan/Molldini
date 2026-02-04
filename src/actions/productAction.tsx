import axios from 'axios';
import type { ProductItem } from '../interface/productInterface';
import type { Dispatch } from '@reduxjs/toolkit';

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
    return async (dispath: Dispatch) => {
        dispath({
            type: ActionType.FETCH_PRODUCT,
        });
        if (id == "") {
            try {
                const response = await axios.get(baseUrl);
                const data: ProductItem[] = response.data;
                dispath(
                    {
                        type: ActionType.FETCH_PRODUCT_SUCCESS,
                        payload: data
                    }
                )
            } catch (e: unknown) {
                dispath(
                    {
                        type: ActionType.FETCH_PRODUCT_FAILURE,
                        payload: (e as Error).message
                    }

                )
            }
        } else {
            try {
                const response = await axios.get(baseUrl + "/" + id);
                const data: ProductItem = response.data;
                dispath(
                    {
                        type: ActionType.FETCH_PRODUCT_SUCCESS,
                        payload: data
                    }
                )
            } catch (e: unknown) {
                dispath(
                    {
                        type: ActionType.FETCH_PRODUCT_FAILURE,
                        payload: (e as Error).message
                    }

                )
            }
        }

    }
}

export const setProduct = (product: ProductItem) => {
    return async (dispatch: Dispatch) => {
        dispatch({ type: ActionType.SET_PRODUCT })
        try {
            product.createdAt = new Date().toISOString();
            product.updatedAt = new Date().toISOString();
            const data: ProductItem = product;
            const response = await axios.post(baseUrl, data);
            dispatch({
                type: ActionType.SET_PRODUCT_SUCCESS,
                payload: response.data
            })
        } catch (e: unknown) {
            dispatch({
                type: ActionType.SET_PRODUCT_FAILURE,
                payload: (e as Error).message
            })
        }
    }
}

