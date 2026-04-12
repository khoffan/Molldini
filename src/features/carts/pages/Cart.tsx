import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import type { CartItem } from "../interfaces/cartInterface";
import { fetchCart, removeItemFormCartDb, updateCartDecrementQuantityDb, updateCartIncrementQuantityDb } from "../services/cartService";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { setOrderFromCartId, setOrderLocalCheckout } from "../../orders/services/orderService";
import Swal from "sweetalert2";
import { getImageValidate } from "../../../common/utils/getImageValidate";
import LoadingSkelition from "../../../common/components/loadingComponent/LoadingShrinkBoxSkelition";
import { showToast } from "../../../common/utils/Toast";
import { fetchPayment } from "../../orders/services/paymentService";
import { fetchShipping } from "../../orders/services/shippingService";
import { fetchAddressUser } from "../../address/service/addressService";


function Cart() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  // ดึงสินค้าทั้งหมดจาก Product Slice มาเพื่อหาข้อมูลชื่อ/รูป/ราคา
  const { cart, loading, error } = useSelector((state: RootState) => state.cart);
  const cartItems = cart?.items || [];
  const allProducts = useSelector((state: RootState) => state.product);
  const productVarients = allProducts.items.map(item => item.variants).flat();
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // ฟังก์ชันสำหรับ Toggle เลือก/ไม่เลือก
  const handleSelectItem = (productId: string) => {
    setSelectedItems(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // ฟังก์ชันเลือกทั้งหมด
  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.productId));
    }
  };

  // คำนวณราคารวมทั้งหมด
  const subtotal = useMemo(() => {
    return cartItems.filter(item => selectedItems.includes(item.productId)).reduce((acc, item) => {
      return acc + (productVarients.find(v => v.id === item.productId)?.price || 0) * item.quantity;
    }, 0);
  }, [cartItems, productVarients, selectedItems]);


  const total = subtotal;

  const handleDeleteItem = (id: string) => {
    dispatch(removeItemFormCartDb(id));
  }

  const handleIncrement = (id: string) => {
    dispatch(updateCartIncrementQuantityDb({ productId: id }));
  }

  const handleDecrement = (id: string) => {

    dispatch(updateCartDecrementQuantityDb({ productId: id }));

  }



  const handleCheckOut = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      showToast({
        icon: 'warning',
        title: 'No items selected',
        text: 'Please select at least one item to checkout.',
      });
      return;
    }

    // 🟢 1. เริ่มแสดง Loading ทันที
    Swal.fire({
      title: 'กำลังเตรียมคำสั่งซื้อ...',
      text: 'กรุณารอสักครู่ ระบบกำลังจัดเตรียมข้อมูลให้คุณ',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const result = await dispatch(setOrderFromCartId({
        cartId: id,
        selectedItems,
        shippingAddress: "",
        receiverName: "",
        receiverPhone: "",
        paymentMethod: ""
      })).unwrap();
      const [address, payment, shipping] = await Promise.all([
        dispatch(fetchAddressUser()).unwrap(),
        dispatch(fetchPayment()).unwrap(),
        dispatch(fetchShipping()).unwrap(),
      ]);
      const hasPayment = payment && payment.length > 0;
      const hasShipping = shipping && shipping.length > 0;
      const hasAddress = address && address.length > 0;

      if (!hasAddress || !hasPayment || !hasShipping) {
        Swal.close(); // ปิด Loading ก่อนหน้า

        // แสดงแจ้งเตือนระบุสาเหตุที่ชัดเจน
        let errorMsg = "";
        if (!hasPayment && !hasShipping) errorMsg = "กรุณาตั้งค่าวิธีการชำระเงินและที่อยู่จัดส่ง";
        else if (!hasPayment) errorMsg = "ไม่พบวิธีการชำระเงินในระบบ";
        else errorMsg = "กรุณาเพิ่มที่อยู่สำหรับจัดส่งสินค้า";

        Swal.fire({
          title: 'ข้อมูลไม่ครบถ้วน',
          text: errorMsg,
          icon: 'warning',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#2563eb', // สี Primary ของ Molldini
          customClass: { popup: 'rounded-3xl' }
        });

        return; // 🛑 หยุดการทำงาน ไม่ไปต่อยังขั้นตอนถัดไป
      }

      dispatch(setOrderLocalCheckout());
      Swal.close();

      navigate(`/checkout/${result.id}?items=${JSON.stringify(selectedItems)}`);
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
    return <LoadingSkelition />
  }

  return (
    <div className="bg-main min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-content mb-8">Shopping Cart</h1>
        {/* ส่วนหัวตะกร้า: เพิ่มเลือกทั้งหมด */}
        <div className="flex items-center gap-2 mb-4 bg-surface p-3 rounded-lg shadow-sm border border-border-main">
          <input
            type="checkbox"
            checked={selectedItems.length === cartItems.length && cartItems.length > 0}
            onChange={handleSelectAll}
            className="w-5 h-5 cursor-pointer rounded accent-blue-600"
          />
          <span className="text-sm font-medium text-content">Select All ({cartItems.length})</span>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 1. รายการสินค้าในตะกร้า */}
          <div className="flex-1 space-y-4">
            {Array.isArray(cartItems) && cartItems.length > 0 && productVarients.length > 0 && cartItems.map((item: CartItem) => {
              const productInfo = productVarients.find(p => p.id === item.productId);

              return <div key={item.id} className="bg-surface p-4 rounded-xl shadow-sm border border-border-main flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.productId)}
                  onChange={() => handleSelectItem(item.productId)}
                  className="w-5 h-5 cursor-pointer rounded accent-blue-600"
                />
                <img
                  src={getImageValidate(productInfo?.images[0]?.url ?? "")}
                  alt={productInfo?.variantName ?? ""}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // ถ้า Link หลักตาย ให้เปลี่ยนเป็น Link สำรอง (Fallback Link)
                    target.src = "https://placehold.co/400x500?text=Image+Error";
                  }}
                  className="w-24 h-24 object-cover rounded-lg"
                />

                <div className="flex-1">
                  <h3 className="font-bold text-content">{productInfo?.variantName}</h3>
                  <p className="text-primary font-bold">฿{productInfo?.price.toLocaleString()}</p>
                </div>

                {/* ส่วนปรับจำนวน */}
                <div className="flex items-center border border-border-main rounded-lg">
                  <button onClick={() => handleDecrement(item.productId)} className="px-3 py-1 hover:bg-surface-hover">-</button>
                  <span className="px-3 font-medium">{item.quantity}</span>
                  <button onClick={() => handleIncrement(item.productId)} className="px-3 py-1 hover:bg-surface-hover">+</button>
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
            <div className="bg-surface p-6 rounded-xl shadow-sm border border-border-main">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 border-b border-border-main pb-4 mb-4 text-muted">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>฿{subtotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg text-content mb-6">
                <span>Total</span>
                <span>฿{total.toLocaleString()}</span>
              </div>

              <button onClick={(e) => handleCheckOut(e, cart?.id ?? "")} className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg">
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
