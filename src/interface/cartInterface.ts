export interface CartItem {
    id?: string | null;
    cartId?: string | null;
    productId: string;
    title: string;
    quantity: number;
    userId: string | null;
}

export interface Carts {
    id?: string | null;
    userId?: string | null;
    items: CartItem[];
    totalPrice: number;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}