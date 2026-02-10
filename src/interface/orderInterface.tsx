export interface Order {
    id?: string | null;
    userId: string | null;
    totalPrice: number;
    status: string;
    items: OrderItems[];
    shippingAddress: OrderAddress;
    reciveInfo: OrderReceiveInfo;
    email: string | null;
    recivePhone: string | null;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export interface OrderItems {
    id?: string | null;
    orderId?: string | null;
    productId: string;
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
    phome: string;
}