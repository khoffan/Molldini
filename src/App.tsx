import { Route, Routes } from 'react-router'
import ProductPage from './pages/Product'
import Cart from './pages/Cart'
import Navbar from './components/Navbar'
import AddProduct from './pages/AddProduct'
import ProductDetail from './pages/ProductDetail'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from './store'
import { fetchProducts } from './service/productService'
import UserProfile from './pages/UserProfile'
import Login from './pages/LoginPage'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase/firebaseConfig'
import { syncUserWithBackend, logoutAction } from './service/authService'
import ProtectRoute from './components/ProtectRoute'
import MerchantPage from './pages/merchantPage'
import { fetchMyMerchant } from './service/merchantService'
import { fetchCategories } from './service/categoryService'
import { fetchCartFromDb, mergeCartAfterLogin } from './service/cartService'
import CheckoutPage from './pages/CheckoutPage'


function App() {
  const dispatch = useDispatch<AppDispatch>()
  useEffect(() => {
    dispatch(fetchProducts())
    dispatch(fetchCategories())
    const unscription = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await dispatch(syncUserWithBackend(
          firebaseUser
        ))

        dispatch(fetchMyMerchant())
        dispatch(mergeCartAfterLogin())
        dispatch(fetchCartFromDb())
      } else {
        dispatch(logoutAction())
      }
    })
    return () => unscription()
  }, [dispatch])
  const element = (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProductPage />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route element={<ProtectRoute />}>
        <Route path="/merchant" element={<MerchantPage />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/checkout/:id" element={<CheckoutPage />} />
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