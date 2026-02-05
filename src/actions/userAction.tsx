import type { User } from "firebase/auth"
import type { AppUser } from "../interface/userInterface"
import { signOut } from "firebase/auth"
import { auth } from "../firebase/firebaseConfig"
import api from "../lib/api"
import type { Dispatch } from "@reduxjs/toolkit"


export const AuthAction = {
    SYNC_USER: "SYNC_USER",
    SUNC_ERROR: "SYNC_ERROR",
    LOGOUT: "LOGOUT",
}

export type AuthActionType = typeof AuthAction[keyof typeof AuthAction]


export const loginSuccess = (user: User) => {
    return async (dispatch: Dispatch) => {
        try {
            const idToken = await user.getIdToken();
            const res = await api.post(`/api/v1/users/me`, {}, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                }
            });
            const rawData = res.data;
            const appUser: AppUser = {
                uid: rawData.uid,
                providerId: rawData.provider,
                email: rawData.email,
                role: rawData.role,
                firstName: rawData.firstName,
                lastName: rawData.lastName,
                displayName: rawData.name,
                photoURL: rawData.imageUrl,
                emailVerified: rawData.emailVerified,
                phoneNumber: rawData.phoneNumber,
                createdAt: rawData.createdAt,
                lastLogin: rawData.lastLogin
            }
            dispatch({
                type: AuthAction.SYNC_USER,
                payload: appUser,
            });
        } catch (e: unknown) {
            console.log(e)
            dispatch({
                type: AuthAction.SUNC_ERROR,
                payload: (e as Error).message
            })
        }
    }
}

export const logout = () => {
    return async (dispatch: Dispatch) => {
        try {
            // 1. สั่ง Logout จาก Firebase ก่อน
            await signOut(auth);

            // 2. เมื่อ Firebase logout สำเร็จ ค่อยล้างข้อมูลใน Redux
            dispatch({
                type: AuthAction.LOGOUT,
            });

            // (Optional) คุณอาจจะล้างข้อมูลใน Cart หรือส่วนอื่นๆ ตรงนี้ได้ด้วย
            // dispatch({ type: "CLEAR_CART" });

        } catch (error) {
            console.error("Logout Error:", error);
        }
    };
};