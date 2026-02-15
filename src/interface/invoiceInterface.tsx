// {
//             "id": "0f595614-aacf-47df-8c9a-2e426f6f60ec",
//             "userId": "Mhe2TYlhvug8qmcdJ9WMVusAbXC3",
//             "totalPrice": 0,
//             "status": "PENDING",
//             "shippingAddress": "",
//             "receiverName": "",
//             "receiverPhone": "",
//             "createdAt": "2026-02-08T14:48:41.469Z",
//             "updatedAt": "2026-02-08T14:48:41.469Z",
//             "items": [
//                 {
//                     "id": "852a734e-4722-485c-8fea-06d0b3dabfd2",
//                     "orderId": "0f595614-aacf-47df-8c9a-2e426f6f60ec",
//                     "productId": "ad2d4c3c-b7a9-45e5-b72f-df9026401c84",
//                     "title": "dfsdf",
//                     "price": 300,
//                     "quantity": 32,
//                     "image": "https://res.cloudinary.com/dy5dc3gow/image/upload/v1770541342/molldini/variants/izl2hwaoqkinurlxdwhw.png",
//                     "productVariantId": "9624d8a0-f8f4-4eea-953a-f5d722b146e6"
//                 }
//             ],
//             "invoice": {
//                 "id": "daec794d-ae60-48c1-af3d-d277bad3dd91",
//                 "orderId": "0f595614-aacf-47df-8c9a-2e426f6f60ec",
//                 "amount": 0,
//                 "paymentMethod": "",
//                 "status": "UNPAID",
//                 "paidAt": null,
//                 "createdAt": "2026-02-08T14:48:41.469Z",
//                 "updatedAt": "2026-02-08T14:48:41.469Z"
//             }
//         },

export interface InvoiceResponce {
    id: string | null;
    orderId: string | null;
    amount: number;
    paymentMethod: string;
    status: string;
    paidAt: string | null;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}
// id        String  @id @default(uuid())
//   orderId   String  @unique
//   order     Order   @relation(fields: [orderId], references: [id])
//   invoiceId String  @unique
//   invoice   Invoice @relation(fields: [invoiceId], references: [id])

//   receiptNumber String   @unique // เช่น REC20240001
//   amount        Float // ยอดที่จ่ายจริง
//   paymentMethod String // เช่น "PROMPTPAY"
//   omiseChargeId String? // เก็บ ID จาก Omise ไว้ตรวจสอบ
//   paidAt        DateTime @default(now())
//   createdAt     DateTime @default(now())
export interface ReceiptResponse {
    id: string;
    orderId: string;
    invoiceId: string;
    receiptNumber: string;
    amount: number;
    paymentMethod: string;
    omiseChargeId: string;
    paidAt: string;
    createdAt: string;
}