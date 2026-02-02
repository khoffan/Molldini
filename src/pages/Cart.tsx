import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import type { AppDispatch, RootState } from "../store";
import type { CartItem } from "../interface/cartInterface";
import type { CartState } from "../reducer/certRducer";
import type { ProductState } from "../reducer/productReducer";
import { decrementQuantity, removeFromCart, incrementQuantity, fetchCart } from "../actions/certActions";



function Cart() {
  const dispatch = useDispatch<AppDispatch>();
  // ดึงสินค้าทั้งหมดจาก Product Slice มาเพื่อหาข้อมูลชื่อ/รูป/ราคา
  const { items } = useSelector((state: RootState) => state.cart) as CartState;
  const allProducts = useSelector((state: RootState) => state.product) as ProductState;
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch])
  // คำนวณราคารวมทั้งหมด
  const subtotal = items.reduce((acc, item) => {
    const productInfo = allProducts.items.find(p => p.id === item.productId);
    return acc + (productInfo?.price || 0) * item.quantity;
  }, 0);

  const shipping = subtotal > 0 ? 10 : 0;

  const total = subtotal + shipping;

  const handleDeleteItem = (id: string) => {
    dispatch(removeFromCart(id));
  }

  const handleIncrement = (id: string) => {
    dispatch(incrementQuantity(id));
  }

  const handleDecrement = (id: string) => {
    dispatch(decrementQuantity(id));
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 1. รายการสินค้าในตะกร้า */}
          <div className="flex-1 space-y-4">
            {items.map((item: CartItem) => {
              const productInfo = allProducts.items.find(p => p.id === item.productId);

              return <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <img src={productInfo?.image} alt={productInfo?.title} className="w-24 h-24 object-cover rounded-lg" />

                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{productInfo?.title}</h3>
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

              <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;