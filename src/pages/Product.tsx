import { useDispatch, useSelector, } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { Link, useNavigate } from "react-router";
import type { Product } from "../interface/productInterface";
import LoadingSkelition from "../components/LoadingSkelition";
import { addToCart } from "../actions/certActions";
import type { CartItem } from "../interface/cartInterface";

function ProductPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector((state: RootState) => state.product)

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    const cartItem: CartItem = {
      id: Date.now().toString(),
      productId: product.id ?? "",
      quantity: 1,
      userId: "1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    dispatch(addToCart(cartItem));
    navigate('/cart');
  }

  if (loading) {
    return <LoadingSkelition />
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header ส่วนหัว - ปรับให้มีปุ่ม Add Product อยู่ข้างๆ */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Featured Products</h1>
            <p className="mt-2 text-lg text-gray-500">เลือกชมสินค้าคุณภาพที่เราคัดสรรมาเพื่อคุณ</p>
          </div>

          {/* 3. ปุ่มนำทางไปหน้า Add Product */}
          {/* <button
            onClick={() => navigate('/add-product')} // เปลี่ยน path ให้ตรงกับที่ตั้งไว้ใน App.tsx
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Product
          </button> */}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {items.map((product: any) => (
            <Link to={`/product/${product.id}`} key={product.id} className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Image Container */}
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 lg:aspect-none h-72">
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Product Details */}
              <div className="p-6">
                <div>
                  <span className="text-xs font-semibold tracking-wide uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-gray-800">
                    <span aria-hidden="true" className="absolute inset-0" />
                    {product.title}
                  </h3>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xl font-extrabold text-gray-900">
                    ฿{product.price.toLocaleString()}
                  </p>
                  <button onClick={(e) => handleAddToCart(e, product)} className="relative z-10 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductPage;