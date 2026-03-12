import type { Address } from "./addressInterface";
import type { Carts } from "./cartInterface";
import type { Media } from "./mediaInterface";
import type { Merchant } from "./merchantInterface";
import type { OrderResponse } from "./orderInterface";

export const UserRole = {
  USER: 'USER',
  MERCHANT: 'MERCHANT',
  ADMIN: 'ADMIN'
} as const;

// สร้าง Type จาก Object ข้างบน (เพื่อให้เรียกใช้ใน Interface ได้)
export type UserRoleType = typeof UserRole[keyof typeof UserRole];

export interface UserDevicesResponse {
  id: string;
  userId: string;
  fcmToken: string;
  deviceType: string | null,
  createdAt: string;
  updatedAt: string;
}


export interface AppUser {
  uid: string;           // Firebase ใช้คำว่า uid เป็นมาตรฐาน (Unique ID)
  providerId: string;    // 'google.com', 'password', ฯลฯ
  email: string;
  role: UserRoleType;
  firstName: string;     // แนะนำพิมพ์เต็มเพื่อความชัดเจน (fname -> firstName)
  lastName: string;
  displayName: string;   // เพิ่มอันนี้ไว้ เพราะ Google ให้มาเป็นชื่อเต็มก้อนเดียว
  image: Media | null;
  emailVerified: boolean;
  phoneNumber: string | null;
  createdAt: string;     // สำคัญมากสำหรับ Backend เพื่อดูว่าสมัครเมื่อไหร่
  lastLogin: string;
  addresses: Address[];
  carts?: Carts | null,
  merchant?: Merchant | null,
  orders: OrderResponse[]
  userDevices: UserDevicesResponse[]
}



