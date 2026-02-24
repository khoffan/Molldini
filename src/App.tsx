import { Route, Routes } from 'react-router'
import ProductPage from './pages/Product'
import Cart from './pages/Cart'
import Navbar from './components/Navbar'
import ProductFormPage from './pages/ProductFormPage'
import ProductDetail from './pages/ProductDetail'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'
import { fetchProducts } from './service/productService'
import UserProfile from './pages/UserProfile'
import Login from './pages/LoginPage'
import Register from './pages/RegisterPage'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, messaging } from './firebase/firebaseConfig'
import { syncUserWithBackend, setInitialize } from './service/authService'
import ProtectRoute from './components/ProtectRoute'
import { fetchMyMerchant, resetMerchantState } from './service/merchantService'
import { fetchCategories } from './service/categoryService'
import { clearCart, fetchCart, mergeCartAfterLogin } from './service/cartService'
import CheckoutPage from './pages/CheckoutPage'
import ProfileLayout from './pages/ProfileLayout'
import GuestRoute from './components/GuestRoute'
import AddAddressUserPage from './pages/AddAddressUserPage'
import { clearUserData, fetchUser } from './service/userService'
import AddressPage from './pages/AddressPage'
import OrderUserPage from './pages/OrderUserPage'
import SettingPage from './pages/SettingPage'
import OrderDetailPage from './pages/OrderDetailPage'
import SuccessCheckoutPage from './pages/SuccessCheckoutPage'
import QRcodePage from './pages/QRcodePage'
import MerchantProductStore from './pages/MerchantProductStore'
import MerchantProfilePage from './pages/MerchantProfilePage'
import { fetchNoti, resetNotiState, setupNotifications } from './service/notificationService'
import { clearOrderState } from './service/orderService'
import PolicyPage from './pages/PolicyPage'
import TermPage from './pages/TermPage'




function App() {
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, isSynced } = useSelector((state: RootState) => state.auth)
  const cart = useSelector((state: RootState) => state.cart)
  useEffect(() => {
    dispatch(fetchProducts())
    dispatch(fetchCategories())
    const unscription = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log("User is signed in", firebaseUser);
        if (!isSynced) {
          await dispatch(syncUserWithBackend(
            firebaseUser
          ));
          dispatch(setupNotifications());
          if (!cart.isSynced) {
            dispatch(mergeCartAfterLogin());
          }
          await Promise.all([
            dispatch(fetchUser()),
            dispatch(fetchMyMerchant()),
            dispatch(fetchCart()),
            dispatch(fetchNoti())
          ])
        } else {
          console.log("user sign out")
          dispatch(clearCart());
          dispatch(clearUserData())
          dispatch(clearOrderState())
          dispatch(resetMerchantState())
          dispatch(resetNotiState())
        }
      }
      dispatch(setInitialize());
    })
    // const unsubscriptionMessage = onMessage(messaging, (payload) => {
    //   console.log("Foreground message:", payload);

    //   showToast({
    //     icon: 'info', // หรือเช็คจาก payload.data.type เพื่อเปลี่ยนสี icon
    //     title: payload.notification?.title || "แจ้งเตือนใหม่",
    //     text: payload.notification?.body,
    //     // แถม: ถ้าคลิกแล้วให้ลิงก์ไปหน้าออเดอร์
    //     didOpen: (toast) => {
    //       toast.style.cursor = 'pointer'; // เปลี่ยนเมาส์เป็นรูปมือให้รู้ว่าคลิกได้
    //       toast.addEventListener('click', () => {
    //         // ใช้ window.location หรือ navigate (ถ้าอยู่ใน Component)
    //         window.location.href = '/profile/orders';
    //         Swal.close(); // ปิด toast ทันทีที่คลิก
    //       });
    //     }
    //   });
    // })
    return () => {
      unscription()
      // unsubscriptionMessage()
    }
  }, [dispatch, isSynced])

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        {/* ใส่ Spinner สวยๆ ตรงนี้ เพื่อไม่ให้หน้าจอกระพริบ */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const element = (
    <Routes>
      <Route path="/" element={<ProductPage />} />
      <Route path="/policy" element={<PolicyPage />} />
      <Route path="/terms" element={<TermPage />} />
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/merchant/product/:id" element={<MerchantProductStore />} />
      <Route path="/cart" element={<Cart />} />
      <Route element={<ProtectRoute />}>
        <Route path="/merchant/profile" element={<MerchantProfilePage />} />
        <Route path="/add-product" element={<ProductFormPage />} />
        <Route path="/edit-product/:id" element={<ProductFormPage />} />
        <Route path="/profile" element={<ProfileLayout />}>
          <Route index element={<UserProfile />} />
          {/* URL: /profile/address (หน้ารวมที่อยู่) */}
          <Route path="address">
            <Route index element={<AddressPage />} />
            {/* URL: /profile/address/add (หน้าเพิ่มที่อยู่) */}
            <Route path="add" element={<AddAddressUserPage />} />
            <Route path="edit/:id" element={<AddAddressUserPage />} />
          </Route>
          <Route path='orders' element={<OrderUserPage />} />
          <Route path='orders/:id' element={<OrderDetailPage />} />
        </Route>
        <Route path='/settings' element={<SettingPage />} />
        <Route path="/checkout/:id" element={<CheckoutPage />} />
        <Route path='/checkout/qr' element={<QRcodePage />} />
        <Route path='/success/:id' element={<SuccessCheckoutPage />} />
      </Route>
    </Routes>
  )

  return (
    <>
      <Navbar />
      {element}
    </>
  )
}

export default App
