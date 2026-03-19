import type { InvoiceResponce, ReceiptResponse } from "./invoiceInterface";


export interface OrderResponse {
    id: string | null;
    userId: string | null;
    totalPrice: number; // ปรับให้รับ String ได้
    totalSystemFee?: number;
    totalNetMerchant?: number;
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
    totalPrice: number; // ปรับให้รับ String ได้
    totalSystemFee?: number;
    totalNetMerchant?: number;
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
    systemFeeAmount?: number;
    netToMerchant?: number;
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