import { Link } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../store";



function Navbar() {
  // สมมติค่าตัวเลขในตะกร้า (เดี๋ยวเราจะใช้ useSelector ดึงจาก Redux)
  const cartItemCount = useSelector((state: RootState) => state.cart.items.length);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* 1. Logo Section */}
          <Link to={"/"} className="flex-shrink-0 flex items-center cursor-pointer">
            <span className="text-2xl font-black tracking-tighter text-blue-600">
              MOLL<span className="text-gray-900">dini</span>
            </span>
          </Link>

          {/* 2. Navigation Links (Desktop) */}
          <div className="hidden md:flex space-x-8">
            <a className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Home</a>
            <a className="text-gray-600 hover:text-blue-600 font-medium transition-colors">New Arrivals</a>
            <a className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Categories</a>
          </div>

          {/* 3. Action Buttons (Cart & User) */}
          <div className="flex items-center space-x-5">
            {/* Search Icon (Optional) */}
            <button className="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Cart Icon with Badge */}
            <Link to="/cart" className="relative cursor-pointer group">
              <div className="p-2 bg-gray-50 rounded-full group-hover:bg-blue-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>

              {/* Badge จำนวนสินค้า */}
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Avatar / Login */}
            <Link to={"/user-profile"} className="flex items-center cursor-pointer border-l pl-5 ml-2 border-gray-200">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                DM
              </div>
              <span className="hidden sm:block ml-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                Dini Molldini
              </span>
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;