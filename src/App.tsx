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
import { auth } from './firebase/firebaseConfig'
import { syncUserWithBackend, setInitialize } from './service/authService'
import ProtectRoute from './components/ProtectRoute'
import { fetchMyMerchant, resetMerchantState } from './service/merchantService'
import { fetchCategories } from './service/categoryService'
import { clearCart, fetchCart } from './service/cartService'
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
import { fetchNoti, resetNotiState } from './service/notificationService'
import { clearOrderState } from './service/orderService'
import PolicyPage from './pages/PolicyPage'
import TermPage from './pages/TermPage'
import NotFoundPage from './pages/NotFounadPage'
import LoadingLogoScreen from './components/loadingComponent/LoadingLogo'




function App() {
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, isSynced } = useSelector((state: RootState) => state.auth)
  useEffect(() => {
    // ดึงข้อมูล Public ก่อน
    dispatch(fetchProducts());
    dispatch(fetchCategories());

    let isSyncInProgress = false; // ป้องกันการรันซ้อนภายในรอบเดียว

    const unscription = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth State Changed. User:", firebaseUser?.uid);

      if (firebaseUser) {
        // 1. ตรวจสอบว่า Sync ไปแล้วหรือยัง หรือกำลัง Sync อยู่หรือไม่
        // ใช้ Store state (isSynced) และ local variable (isSyncInProgress) ควบคู่กัน
        console.log(isSynced || isSyncInProgress);
        if (isSynced || isSyncInProgress) return;

        try {
          isSyncInProgress = true;

          // 2. รับ Token และ Sync กับ Backend
          // มั่นใจว่าใน syncUserWithBackend มีการตั้งค่า axios.defaults.headers.common['Authorization']
          await dispatch(syncUserWithBackend(firebaseUser)).unwrap();

          // 3. แบบ Auto-prompt (เรียกตอนโหลด) ถูกปิดไว้
          // Safari iOS ไม่อนุญาตให้ขอ Permission อัตโนมัติ 
          // ต้องขอผ่าน User Gesture (เช่น OnClick) เท่านั้น
          // dispatch(setupNotifications());

          // 4. ดึงข้อมูลส่วนตัว (เรียกหลังจาก Sync สำเร็จเท่านั้น)
          await Promise.all([
            dispatch(fetchUser()),
            dispatch(fetchMyMerchant()),
            dispatch(fetchCart()),
            dispatch(fetchNoti())
          ]);

        } catch (error) {
          console.error("Sync failed:", error);
        } finally {
          isSyncInProgress = false;
          dispatch(setInitialize());
        }
      } else {
        // User Sign Out
        console.log("User signed out");
        dispatch(clearCart());
        dispatch(clearUserData());
        dispatch(clearOrderState());
        dispatch(resetMerchantState());
        dispatch(resetNotiState());
        dispatch(setInitialize());
      }
    });

    return () => unscription();
  }, [dispatch]); // เอา isSynced ออกจากตรงนี้เด็ดขาด!

  if (!isAuthenticated) {
    return <LoadingLogoScreen />
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
        <Route path='/orders/:id' element={<OrderDetailPage />} />
        <Route path='/settings' element={<SettingPage />} />
        <Route path="/checkout/:id" element={<CheckoutPage />} />
        <Route path='/checkout/qr' element={<QRcodePage />} />
        <Route path='/success/:id' element={<SuccessCheckoutPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
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
