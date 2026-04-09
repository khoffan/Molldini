import type { InvoiceResponse, ReceiptResponse } from "./invoiceInterface";


export interface OrderResponse {
    id: string | null;
    chargeId: string | null;
    userId: string | null;
    totalPrice: number;
    totalShippingCost: number;
    netAmount: number;
    totalSystemFee?: number;
    totalNetMerchant?: number;
    status: string;
    subOrders: SubOrder[];
    shippingAddress: string | null;
    receiverName: string | null;
    receiverPhone: string | null;
    email: string | null;
    invoice: InvoiceResponse;
    receipt: ReceiptResponse | null;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    expiredAt?: string | Date;
}


export interface Order {
    id?: string | null;
    chargeId?: string | null;
    userId: string | null;
    totalPrice: number;
    totalShippingCost?: number;
    netAmount?: number;
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
    expiredAt?: string | Date;
}

export interface SubOrder {
    id: string;
    orderId: string;
    merchantId: string;
    merchantName?: string | null;
    shippingFee: number;
    shippingProvider: string | null;
    feePercentage?: string | number;
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
    cartItemId?: string;
    title: string;
    quantity: number;
    price: number;
    image: string;
    productVariantId: string;
    sku?: string | null;
    isDigital?: boolean;
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