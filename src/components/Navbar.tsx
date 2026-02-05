import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector, } from "react-redux";
import type { AppDispatch, RootState, } from "../store";
import type { UserState } from "../reducer/userReducer";
import { useState, useRef, useEffect } from "react";
import { logout } from "../actions/userAction";
import { UserRole } from "../interface/userInterface";
import DropdownItem from "./DropdownItem";


function Navbar() {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  // สมมติค่าตัวเลขในตะกร้า (เดี๋ยวเราจะใช้ useSelector ดึงจาก Redux)
  const cartItemCount = useSelector((state: RootState) => state.cart.items.length);

  const { user } = useSelector((state: RootState) => state.auth) as UserState;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    dispatch(logout());
    setIsOpen(false);
    navigate("/");
  }

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
            <div className="border-l pl-5 ml-2 border-gray-200 relative" ref={dropdownRef}>
              {user ? (
                <>
                  {/* Avatar Button */}
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center space-x-2 group focus:outline-none"
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-400 transition-all" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-transparent group-hover:ring-blue-400">
                        {user.displayName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-gray-800 leading-none group-hover:text-blue-600">{user.displayName}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide">{user.role}</p>
                    </div>
                    <svg className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isOpen && (
                    <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden transform origin-top-right transition-all">
                      <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{user.email || user.displayName}</p>
                      </div>

                      <DropdownItem to="/profile" icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" label="My Profile" />

                      <DropdownItem to="/merchant" icon="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" label="Merchant Center" color="text-blue-600" />


                      <DropdownItem to="/settings" icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" label="Settings" />

                      <div className="border-t border-gray-50 mt-2 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
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