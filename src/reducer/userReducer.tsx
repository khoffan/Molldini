import type { AppUser } from "../interface/userInterface";
import { AuthAction } from "../actions/userAction";



interface SyncActionUser {
    type: typeof AuthAction.SYNC_USER,
    payload: AppUser
}

interface LogoutAction {
    type: typeof AuthAction.LOGOUT,
}

type UserAction = SyncActionUser | LogoutAction



export interface UserState {
    user: AppUser | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    isInitialized: boolean;
}

export const initialUserState: UserState = {
    user: null,
    token: null,
    loading: false,
    error: null,
    isInitialized: false
}

export const userReducer = (state: UserState = initialUserState, action: UserAction): UserState => {
    switch (action.type) {
        case AuthAction.SYNC_USER: {
            const {payload} = action as SyncActionUser;
            return {
                ...state,
                user: payload,
                loading: false,
                error: null,
                isInitialized: true
            }
        }
        case AuthAction.LOGOUT:
            return {
                ...initialUserState,
                isInitialized: true
            }
        default:
            return state
    }
}