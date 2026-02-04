import { Link } from "react-router";
import { useSelector, } from "react-redux";
import type { RootState, } from "../store";
import type { UserState } from "../reducer/userReducer";




function Navbar() {

  // สมมติค่าตัวเลขในตะกร้า (เดี๋ยวเราจะใช้ useSelector ดึงจาก Redux)
  const cartItemCount = useSelector((state: RootState) => state.cart.items.length);

  const { user } = useSelector((state: RootState) => state.auth) as UserState;



  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo Section */}
          <Link to={"/"} className="flex-shrink-0 flex items-center cursor-pointer">
            <span className="text-2xl font-black tracking-tighter text-blue-600">
              MOLL<span className="text-gray-900">dini</span>
            </span>
          </Link>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Home</Link>
            <a className="text-gray-600 hover:text-blue-600 font-medium transition-colors cursor-pointer">New Arrivals</a>
            <a className="text-gray-600 hover:text-blue-600 font-medium transition-colors cursor-pointer">Categories</a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-5">
            {/* Cart Icon */}
            <Link to="/cart" className="relative cursor-pointer group">
              <div className="p-2 bg-gray-50 rounded-full group-hover:bg-blue-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* 2. User Section: เช็คว่า Login หรือยัง */}
            <div className="border-l pl-5 ml-2 border-gray-200">
              {user ? (
                /* ถ้า Login แล้ว: โชว์ Avatar และชื่อ */
                <Link to="/user-profile" className="flex items-center space-x-2 group">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-gray-200 group-hover:ring-blue-400 transition-all"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {user.displayName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-800 leading-none group-hover:text-blue-600">{user.displayName}</p>
                    <p className="text-[10px] text-gray-500">{user.role}</p>
                  </div>
                </Link>
              ) : (
                /* ถ้ายังไม่ได้ Login: โชว์ปุ่ม Login */
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm active:scale-95"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;