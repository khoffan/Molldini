export const UserRole = {
  USER: 'user',
  MERCHANT: 'merchant',
  ADMIN: 'admin'
} as const;

// สร้าง Type จาก Object ข้างบน (เพื่อให้เรียกใช้ใน Interface ได้)
export type UserRoleType = typeof UserRole[keyof typeof UserRole];


export interface AppUser {
  uid: string;           // Firebase ใช้คำว่า uid เป็นมาตรฐาน (Unique ID)
  providerId: string;    // 'google.com', 'password', ฯลฯ
  email: string;
  role: UserRoleType;
  firstName: string;     // แนะนำพิมพ์เต็มเพื่อความชัดเจน (fname -> firstName)
  lastName: string;
  displayName: string;   // เพิ่มอันนี้ไว้ เพราะ Google ให้มาเป็นชื่อเต็มก้อนเดียว
  photoURL: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
  createdAt: string;     // สำคัญมากสำหรับ Backend เพื่อดูว่าสมัครเมื่อไหร่
  lastLogin: string;     // เอาไว้เช็ค Session ล่าสุด
}

