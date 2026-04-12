import { getToken } from 'firebase/messaging'
import { messaging } from '../../../common/firebase/firebaseConfig';
import { AxiosError } from 'axios';
import api from '../../../common/lib/api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { notiResponse } from '../interfaces/notiInterface';

interface NotificationState {
    noti: notiResponse[],
    unreadCount: number
    isAllow: boolean,
    loading: boolean,
    permissionStatus: NotificationPermission;
    error: string | null
}

const initialState: NotificationState = {
    noti: [],
    unreadCount: 0,
    isAllow: "Notification" in window && Notification.permission === 'granted',
    permissionStatus: "Notification" in window ? Notification.permission : 'default',
    loading: false,
    error: null
}


const saveTokenToBackend = async (token: string) => {
    try {
        localStorage.setItem("fcmToken", token)

        const res = await api.put("/api/v1/update-fcm-token", {
            token: token
        })
        if (res.status === 200) {
            console.log('Token saved to backend successfully');
        }
    } catch (e: unknown) {
        if (e instanceof AxiosError) {
            console.error('Error saving token to backend:', e.response?.data);
        }
        console.error('Error saving token to backend:', e);
    }
}

export const setupNotifications = createAsyncThunk(
    "notifications/setup",
    async (_, { rejectWithValue }) => {
        try {
            console.log("Notification.permission", Notification.permission)
            // เช็คว่า Browser รองรับไหม (เผื่อเปิดในพวก In-app Browser เก่าๆ)
            if (!("Notification" in window)) {
                return rejectWithValue("This browser does not support desktop notification");
            }

            // ถ้าโดน Denied มาก่อนแล้ว ไม่ต้องเรียก Request ซ้ำ (เพราะมันจะไม่เด้ง)
            if (Notification.permission === 'denied') {
                return rejectWithValue("Permission blocked. Please enable it in browser settings.");
            }

            let permission: NotificationPermission = Notification.permission;

            // 1. ถ้ายังไม่ได้อนุญาต ให้เรียก Popup ของ Browser เพื่อขออนุญาต (ต้องทำผ่าน User Gesture)
            if (permission !== 'granted') {
                permission = await Notification.requestPermission();
            }

            if (permission === 'granted') {
                console.log('Notification permission granted.');

                // 2. ถ้าอนุญาตแล้ว ให้ดึง Token ทันที
                const token = await getToken(messaging, {
                    vapidKey: import.meta.env.VITE_VAPID_KEY
                });

                if (token) {
                    // 3. ส่ง Token ไปเก็บใน DB ผูกกับ UserId
                    await saveTokenToBackend(token);
                    return true;
                }
            } else {
                console.log('Unable to get permission to notify.');
                return rejectWithValue("Unable to get permission to notify.")
            }
        } catch (error) {
            console.error('Error setting up notifications:', error);
            return rejectWithValue(error);
        }
    }
)

export const fetchNoti = createAsyncThunk(
    "noti/fetchNoti",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/api/v1/notifications");
            console.log("res.data", res.data)
            return res.data as notiResponse[];
        } catch (e: unknown) {
            if (e instanceof Error) {
                return rejectWithValue(e.message);
            } else if (e instanceof AxiosError) {
                return rejectWithValue(e.response?.data?.message || e.message);
            }
            return rejectWithValue("An unknown error occurred");
        }
    }
)

export const readNoti = createAsyncThunk(
    'noti/readNoti',
    async (notiId: string, { rejectWithValue }) => {
        try {
            await api.patch(`/api/v1/notifications/${notiId}/read`);
            return true;
        } catch (e: unknown) {
            if (e instanceof Error) {
                return rejectWithValue(e.message);
            } else if (e instanceof AxiosError) {
                return rejectWithValue(e.response?.data?.message || e.message);
            }
            return rejectWithValue("An unknown error occurred");
        }
    }
);

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        resetNotiState: (state) => {
            state.noti = []
            state.unreadCount = 0
            state.isAllow = "Notification" in window && Notification.permission === 'granted'
            state.permissionStatus = "Notification" in window ? Notification.permission : 'default'
            state.loading = false
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(setupNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(setupNotifications.fulfilled, (state, action) => {
                state.error = null
                state.loading = false
                state.isAllow = action.payload as boolean
                state.permissionStatus = Notification.permission
            })
            .addCase(setupNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.permissionStatus = Notification.permission;
            })
            .addCase(fetchNoti.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNoti.fulfilled, (state, action) => {
                state.loading = false;
                state.noti = action.payload;
                const unread = action.payload.filter(item => !item.isRead).length;
                state.unreadCount = unread;
            })
            .addCase(fetchNoti.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(readNoti.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(readNoti.fulfilled, (state,) => {
                state.loading = false;
                state.error = null;
                const unreadNoti = state.noti.filter(item => !item.isRead).map(item => ({ ...item, isRead: true }));
                state.unreadCount = unreadNoti.length;
                state.noti = unreadNoti;
            })
            .addCase(readNoti.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
})

export const { resetNotiState } = notificationsSlice.actions
export default notificationsSlice.reducer
