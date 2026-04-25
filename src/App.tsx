import { Route, Routes } from 'react-router'
// ── Feature Pages ──
import ProductPage from './features/products/pages/ProductPage'
import ProductDetail from './features/products/pages/ProductDetail'
import ProductFormPage from './features/products/pages/ProductFormPage'
import Cart from './features/carts/pages/Cart'
import CheckoutPage from './features/carts/pages/CheckoutPage'
import SuccessCheckoutPage from './features/carts/pages/SuccessCheckoutPage'
import QRcodePage from './features/carts/pages/QRcodePage'
import UserProfile from './features/user/pages/UserProfile'
import AddressPage from './features/user/pages/AddressPage'
import AddAddressUserPage from './features/user/pages/AddAddressUserPage'
import SettingPage from './features/user/pages/SettingPage'
import OrderUserPage from './features/orders/pages/OrderUserPage'
import OrderDetailPage from './features/orders/pages/OrderDetailPage'
import MerchantProductStore from './features/merchants/pages/MerchantProductStore'
import MerchantProfilePage from './features/merchants/pages/MerchantProfilePage'
// ── Shared / Kept in place ──
import Navbar from './common/components/Navbar'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'
import { fetchProducts } from './features/products/services/productService'
import Login from './features/auth/pages/LoginPage'
import Register from './features/auth/pages/RegisterPage'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './common/firebase/firebaseConfig'
import { syncUserWithBackend, setInitialize } from './features/auth/service/authService'
import ProtectRoute from './common/components/ProtectRoute'
import { fetchMyMerchant, resetMerchantState } from './features/merchants/services/merchantService'

import { clearCart, fetchCart } from './features/carts/services/cartService'
import ProfileLayout from './common/layout/ProfileLayout'
import GuestRoute from './common/components/GuestRoute'
import { clearUserData, fetchUser } from './features/user/services/userService'
import { fetchNoti, resetNotiState } from './features/notification/service/notificationService'
import { clearOrderState } from './features/orders/services/orderService'
import PolicyPage from './features/policy/pages/PolicyPage'
import TermPage from './features/term/pages/TermPage'
import NotFoundPage from './common/layout/NotFounadPage'
import LoadingLogoScreen from './common/components/loadingComponent/LoadingLogo'
import { Tooltip } from 'react-tooltip';
import { fetchCategories } from './features/products/services/categoryService'

function App() {
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, isSynced } = useSelector((state: RootState) => state.auth)
  useEffect(() => {
    // ดึงข้อมูล Public ก่อน
    dispatch(fetchProducts());
    dispatch(fetchCategories());

    let isSyncInProgress = false; // ป้องกันการรันซ้อนภายในรอบเดียว

    const handleAuth = async () => {
      try {
        // 1. ตรวจสอบผลจากการ Redirect ก่อน
        // ปิดส่วนนี้ไปก่อน
        // const result = await getRedirectResult(auth);
        // if (result?.user) {
        //   console.log("Redirect Success:", result.user.email);
        //   // สามารถจัดการข้อมูลพิเศษจาก Credential ได้ที่นี่ถ้าจำเป็น
        // }

        // 2. ใช้ onAuthStateChanged เป็นตัวจัดการหลักในการ Sync
        const unsubscription = onAuthStateChanged(auth, async (firebaseUser) => {
          console.log("onAuthStateChanged", firebaseUser);
          if (firebaseUser) {
            if (isSynced || isSyncInProgress) return;
            console.log("Syncing user...");
            try {
              isSyncInProgress = true;
              await dispatch(syncUserWithBackend(firebaseUser)).unwrap();

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
            console.log("User signed out");
            // Sign out logic
            dispatch(clearCart());
            dispatch(clearUserData());
            dispatch(clearOrderState());
            dispatch(resetMerchantState());
            dispatch(resetNotiState());
            dispatch(setInitialize());
          }
        });

        return unsubscription;
      } catch (error) {
        console.error("Auth Error:", error);
        dispatch(setInitialize()); // มั่นใจว่าแอปจะไม่ค้างที่หน้า Loading
      }
    };

    const authUnsubPromise = handleAuth();

    return () => {
      authUnsubPromise.then(unsub => unsub && unsub());
    };
  }, [dispatch, isSynced]);

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
      <Tooltip
        id="molldini-tooltip"
        // ใช้ ! หน้า class เพื่อให้ Tailwind ชนะสไตล์เดิมของ Lib
        className="!rounded-xl !text-xs !font-medium !shadow-lg !opacity-100"
        place="top"
      />
    </>
  )
}

export default App
