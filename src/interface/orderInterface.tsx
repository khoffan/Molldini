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

import type { InvoiceResponce, ReceiptResponse } from "./invoiceInterface";


export interface OrderResponse {
    id: string | null;
    userId: string | null;
    totalPrice: number;
    status: string;
    subOrders: SubOrder[];
    shippingAddress: string | null;
    receiverName: string | null;
    email: string | null;
    recivePhone: string | null;
    invoice: InvoiceResponce;
    receipt: ReceiptResponse;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}


export interface Order {
    id?: string | null;
    userId: string | null;
    totalPrice: number;
    status: string;
    subOrders: SubOrder[];
    shippingAddress: OrderAddress;
    reciveInfo: OrderReceiveInfo;
    email: string | null;
    recivePhone: string | null;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export interface SubOrder {
    id: string;
    orderId: string;
    merchantId: string;
    merchantName?: string | null;
    shippingFee: number;
    totalPrice: number;
    status: string;
    orderItems: OrderItems[];
    createAt?: string | Date;
    updateAt?: string | Date;
}

export interface OrderItems {
    id?: string | null;
    subOrderId?: string | null;
    productId: string;
    merchantId: string;
    title: string;
    quantity: number;
    price: number;
    image: string;
    productVariantId: string;
}

export interface OrderAddress {
    address: string;
    city: string;
    zipCode: string;
}

export interface OrderReceiveInfo {
    firstName: string;
    lastName: string;
    phone: string;
}