import type { CartItem } from "../interface/cartInterface";

export const CartActionType = {
    ADD_TO_CART: "ADD_TO_CART",
    FETCH_CART: "FETCH_CART",
    REMOVE_FROM_CART: "REMOVE_FROM_CART",
    INCREMENT_QUANTITY: "INCREMENT_QUANTITY",
    DECREMENT_QUANTITY: "DECREMENT_QUANTITY"
}

export const fetchCart = () => {
    const savedCart = localStorage.getItem("cart");
    console.log(savedCart);
    const cartItems: CartItem[] = savedCart ? JSON.parse(savedCart) : [];
    console.log(cartItems);
    return {
        type: CartActionType.FETCH_CART,
        payload: cartItems
    }
}


export const addToCart = (product: CartItem) => {
    product.id = Date.now().toString();
    product.createdAt = new Date().toISOString();
    product.updatedAt = new Date().toISOString();
    return {
        type: CartActionType.ADD_TO_CART,
        payload: product
    }
}

export const removeFromCart = (productId: string) => ({
    type: CartActionType.REMOVE_FROM_CART,
    payload: productId
})

export const incrementQuantity = (productId: string) => ({
    type: CartActionType.INCREMENT_QUANTITY,
    payload: productId
})

export const decrementQuantity = (productId: string) => ({
    type: CartActionType.DECREMENT_QUANTITY,
    payload: productId
})

