import { Route, Routes } from 'react-router'
import ProductPage from './pages/Product'
import Cart from './pages/Cart'
import Navbar from './components/Navbar'
import AddProduct from './pages/AddProduct'
import ProductDetail from './pages/ProductDetail'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from './store'
import { fetchProduct } from './actions/productAction'
import UserProfile from './pages/UserProfile'
import Login from './pages/LoginPage'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase/firebaseConfig'
import { loginSuccess, logout } from './actions/userAction'
import ProtectRoute from './components/ProtectRoute'
import MerchantPage from './pages/merchantPage'
import { fetchMyMerchant } from './actions/merchantAction'
import { fetchCategory } from './actions/categoryAction'




function App() {
  const dispatch = useDispatch<AppDispatch>()
  useEffect(() => {
    dispatch(fetchProduct())
    dispatch(fetchMyMerchant())
    dispatch(fetchCategory())
    const unscription = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        dispatch(loginSuccess(
          firebaseUser
        ))
      } else {
        dispatch(logout())
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