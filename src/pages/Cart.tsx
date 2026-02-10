import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import type { CartItem } from "../interface/cartInterface";
import { fetchCartFromDb, mergeCartAfterLogin, removeFromCart, updateCartDecrementQuantityDb, updateCartIncrementQuantityDb } from "../service/cartService";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { setOrderFromCartId } from "../service/orderService";
import Swal from "sweetalert2";



function Cart() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  // ดึงสินค้าทั้งหมดจาก Product Slice มาเพื่อหาข้อมูลชื่อ/รูป/ราคา
  const { cart, loading, error } = useSelector((state: RootState) => state.cart);
  const cartItems = cart?.items || [];
  const isSynced = useSelector((state: RootState) => state.cart.isSynced);
  const allProducts = useSelector((state: RootState) => state.product);
  const productVarients = allProducts.items.map(item => item.variants).flat();
  useEffect(() => {
    if (isSynced) {
      dispatch(fetchCartFromDb());
    }
    dispatch(mergeCartAfterLogin());
  }, [dispatch, isSynced])

  console.log("Cart items:", cartItems);
  // คำนวณราคารวมทั้งหมด
  const subtotal = cartItems.reduce((acc, item) => {
    return acc + (productVarients.find(v => v.id === item.productId)?.price || 0) * item.quantity;
  }, 0) ?? 0;

  const shipping = subtotal > 0 ? 10 : 0;

  const total = subtotal + shipping;

  const handleDeleteItem = (id: string) => {
    dispatch(removeFromCart(id));
  }

  const handleIncrement = (id: string) => {
    dispatch(updateCartIncrementQuantityDb({ productId: id }));
  }

  const handleDecrement = (id: string) => {

    dispatch(updateCartDecrementQuantityDb({ productId: id }));

  }

  const handleCheckOut = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    try {
      if (!isSynced) {
        await dispatch(mergeCartAfterLogin());
        console.log("Syncing cart...");
      }
      console.log("Proceed to checkout with total amount:", total);
      console.log("Cart ID for checkout:", id);
      await dispatch(setOrderFromCartId({
        cartId: id,
        shippingAddress: "",
        receiverName: "",
        receiverPhone: "",
        paymentMethod: ""
      }));
      navigate(`/checkout/${id}`);
    } catch (err: unknown) {
      console.error("Error during checkout:", err);
      Swal.fire({
        icon: 'error',
        title: 'Checkout Failed',
        text: err instanceof Error ? err.message : 'An unexpected error occurred during checkout.',
      })
    }

  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-10">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 1. รายการสินค้าในตะกร้า */}
          <div className="flex-1 space-y-4">
            {Array.isArray(cartItems) && cartItems.length > 0 && productVarients.length > 0 && cartItems.map((item: CartItem) => {
              const productInfo = productVarients.find(p => p.id === item.productId);

              return <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <img src={productInfo?.images[0].url ?? ""} alt={productInfo?.variantName ?? ""} className="w-24 h-24 object-cover rounded-lg" />

                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{productInfo?.variantName}</h3>
                  <p className="text-blue-600 font-bold">฿{productInfo?.price.toLocaleString()}</p>
                </div>

                {/* ส่วนปรับจำนวน */}
                <div className="flex items-center border rounded-lg">
                  <button onClick={() => handleDecrement(item.productId)} className="px-3 py-1 hover:bg-gray-100">-</button>
                  <span className="px-3 font-medium">{item.quantity}</span>
                  <button onClick={() => handleIncrement(item.productId)} className="px-3 py-1 hover:bg-gray-100">+</button>
                </div>

                <button onClick={() => handleDeleteItem(item.productId)} className="text-red-400 hover:text-red-600 p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            })}
          </div>

          {/* 2. ส่วนสรุปยอดสั่งซื้อ (Order Summary) */}
          <div className="w-full lg:w-80">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 border-b pb-4 mb-4 text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>฿{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>฿{shipping.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg text-gray-900 mb-6">
                <span>Total</span>
                <span>฿{total.toLocaleString()}</span>
              </div>

              <button onClick={(e) => handleCheckOut(e, cart?.id ?? "")} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
      {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
    </div>
  );
}

export default Cart;