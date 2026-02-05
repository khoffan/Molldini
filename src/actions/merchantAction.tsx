import type { Dispatch } from "@reduxjs/toolkit"
import type { CreateMerchantInput } from "../interface/merchantInterface"
import api from "../lib/api"

export const MerchantAction = {
    SET_MERCHANT: "SET_MERCHANT",
    SET_MERCHANT_SUCCESS: "SET_MERCHANT_SUCCESS",
    SET_MERCHANT_FAILURE: "SET_MERCHANT_FAILURE",
    FETCH_MERCHANT: "FETCH_MERCHANT",
    FETCH_MERCHANT_SUCCESS: "FETCH_MERCHANT_SUCCESS",
    FETCH_MERCHANT_FAILURE: "FETCH_MERCHANT_FAILURE",
    REMOVE_MERCHANT: "REMOVE_MERCHANT",
    REMOVE_MERCHANT_SUCCESS: "REMOVE_MERCHANT_SUCCESS",
    REMOVE_MERCHANT_FAILURE: "REMOVE_MERCHANT_FAILURE",
}

export type MerchantActionType = typeof MerchantAction[keyof typeof MerchantAction]

export const setMerchant = (merchant: CreateMerchantInput) => {
    return async (dispatch: Dispatch) => {
        dispatch({ type: MerchantAction.SET_MERCHANT })
        try {
            const data: CreateMerchantInput = merchant;
            const response = await api.post(`/api/v1/merchants`, data);
            dispatch({
                type: MerchantAction.SET_MERCHANT_SUCCESS,
                payload: response.data
            })
        } catch (e: unknown) {
            dispatch({
                type: MerchantAction.SET_MERCHANT_FAILURE,
                payload: (e as Error).message
            })
        }
    }
}

export const fetchMyMerchant = () => {
    return async (dispatch: Dispatch) => {
        dispatch({ type: MerchantAction.FETCH_MERCHANT })
        try {
            const response = await api.get(`/api/v1/merchants/me`);
            console.log("merchant", response.data)
            dispatch({
                type: MerchantAction.FETCH_MERCHANT_SUCCESS,
                payload: response.data
            })
        } catch (e: unknown) {
            dispatch({
                type: MerchantAction.FETCH_MERCHANT_FAILURE,
                payload: (e as Error).message
            })
        }
    }
}