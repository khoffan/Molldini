import axios from 'axios';
import api from '../lib/api';
import type { Product } from '../interface/productInterface';
import type { Dispatch } from '@reduxjs/toolkit';

export const ProductAction = {
    FETCH_PRODUCT: "FETCH_PRODUCT",
    FETCH_PRODUCT_SUCCESS: "FETCH_PRODUCT_SUCCESS",
    FETCH_PRODUCT_FAILURE: "FETCH_PRODUCT_FAILURE",
    SET_PRODUCT: "SET_PRODUCT",
    SET_PRODUCT_SUCCESS: "SET_PRODUCT_SUCCESS",
    SET_PRODUCT_FAILURE: "SET_PRODUCT_FAILURE",
    REMOVE_PRODUCT: "REMOVE_PRODUCT",
}

export type ProductActionType = typeof ProductAction[keyof typeof ProductAction]

const baseUrl: string = "https://697d069897386252a2676641.mockapi.io/product";

export const fetchProduct = (id: string = "") => {
    return async (dispath: Dispatch) => {
        dispath({
            type: ProductAction.FETCH_PRODUCT,
        });
        if (id == "") {
            try {
                const response = await axios.get(baseUrl);
                const data: Product[] = response.data;
                dispath(
                    {
                        type: ProductAction.FETCH_PRODUCT_SUCCESS,
                        payload: data
                    }
                )
            } catch (e: unknown) {
                dispath(
                    {
                        type: ProductAction.FETCH_PRODUCT_FAILURE,
                        payload: (e as Error).message
                    }

                )
            }
        } else {
            try {
                const response = await axios.get(baseUrl + "/" + id);
                const data: Product = response.data;
                dispath(
                    {
                        type: ProductAction.FETCH_PRODUCT_SUCCESS,
                        payload: data
                    }
                )
            } catch (e: unknown) {
                dispath(
                    {
                        type: ProductAction.FETCH_PRODUCT_FAILURE,
                        payload: (e as Error).message
                    }

                )
            }
        }

    }
}

export const fetchProductMerchant = () => {
    return async (dispatch: Dispatch) => {
        dispatch({ type: ProductAction.FETCH_PRODUCT })
        try {
            const response = await api.get("/api/v1/products/merchant");
            const data: Product[] = response.data;
            dispatch(
                {
                    type: ProductAction.FETCH_PRODUCT_SUCCESS,
                    payload: data
                }
            )
        } catch (e: unknown) {
            dispatch(
                {
                    type: ProductAction.FETCH_PRODUCT_FAILURE,
                    payload: (e as Error).message
                }

            )
        }
    }
}

export const setProduct = (product: any) => {
    return async (dispatch: Dispatch) => {
        dispatch({ type: ProductAction.SET_PRODUCT })
        try {
            const data: Product = product;
            const response = await api.post("/api/v1/products", data);
            dispatch({
                type: ProductAction.SET_PRODUCT_SUCCESS,
                payload: response.data
            })
        } catch (e: unknown) {
            dispatch({
                type: ProductAction.SET_PRODUCT_FAILURE,
                payload: (e as Error).message
            })
        }
    }
}

