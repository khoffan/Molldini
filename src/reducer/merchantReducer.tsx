import type { Merchant } from "../interface/merchantInterface"
import { MerchantAction } from "../actions/merchantAction"


interface SetMerchantAction {
    type: typeof MerchantAction.SET_MERCHANT;
}

interface SetMerchantSuccessAction {
    type: typeof MerchantAction.SET_MERCHANT_SUCCESS;
    payload: Merchant;
}

interface SetMerchantFailureAction {
    type: typeof MerchantAction.SET_MERCHANT_FAILURE;
    payload: string;
}

type MerchantReducerAction = SetMerchantAction | SetMerchantSuccessAction | SetMerchantFailureAction



export interface merchatState {
    merchant: Merchant | null;
    loading: boolean;
    error: string | null;
}

export const initialState: merchatState = {
    merchant: null,
    loading: false,
    error: null,
}

export const merchantReducer = (state: merchatState = initialState, action: MerchantReducerAction) => {
    console.log("action", action);
    switch (action.type) {
        case MerchantAction.SET_MERCHANT:
            return {
                ...state,
                loading: true,
            }
        case MerchantAction.SET_MERCHANT_SUCCESS: {
            const { payload } = action as SetMerchantSuccessAction
            console.log("payload", payload);
            return {
                ...state,
                loading: false,
                merchant: payload,
            }
        }

        case MerchantAction.SET_MERCHANT_FAILURE: {
            const { payload } = action as SetMerchantFailureAction
            return {
                ...state,
                loading: false,
                error: payload,
            }
        }

        case MerchantAction.FETCH_MERCHANT: {
            return {
                ...state,
                loading: true,
            }
        }

        case MerchantAction.FETCH_MERCHANT_SUCCESS: {
            const { payload } = action as SetMerchantSuccessAction
            console.log("payload", payload);
            return {
                ...state,
                loading: false,
                merchant: payload,
            }
        }

        case MerchantAction.FETCH_MERCHANT_FAILURE: {
            const { payload } = action as SetMerchantFailureAction
            return {
                ...state,
                loading: false,
                error: payload,
            }
        }

        default:
            return state
    }
}