export interface InvoiceResponse {
    id: string | null;
    orderId: string | null;
    amount: number;
    shippingCost: number;
    paymentMethod: string;
    status: string;
    paidAt: string | null;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

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
