import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import GlobalSearch from '../customer/GlobalSearch';
import {
  MdHome,
  MdInventory,
  MdBusiness,
  MdInfo,
  MdPhone,
  MdDashboard,
  MdShoppingCart,
  MdFavorite,
  MdNotifications
} from 'react-icons/md';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const navigate = useNavigate();

  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const baseItems = [
    // { name: 'Home', path: '/home', icon: MdHome }, // Removed - using Dashboard instead
    { name: 'Products', path: '/products', icon: MdInventory },
    // { name: 'Brands', path: '/brands', icon: MdBusiness }, // Removed
    // { name: 'About', path: '/about', icon: MdInfo }, // Not implemented
    { name: 'Contact', path: '/contact', icon: MdPhone },
  ];

  const navItems = isAuthenticated 
    ? [{ name: 'Dashboard', path: '/customer/dashboard', icon: MdDashboard }, ...baseItems]
    : baseItems;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Top Row */}
        <div className="flex justify-between items-center h-16 md:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg shadow p-1">
              <img src="/Logo2.png" alt="Singhai Traders" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Singhai Traders
              </h1>
              <p className="text-xs text-gray-600 hidden sm:block">
                Premium Sanitary Ware
              </p>
            </div>
          </Link>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-4">

            {/* Search Bar */}
            <GlobalSearch showOnlyIcon={true} />

            {/* Desktop Icons */}
            <div className="flex items-center gap-2">
              {/* Wishlist */}
              <Link 
                to={isAuthenticated ? "/customer/wishlist" : "/customer/login"}
                className="relative p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-all group"
              >
                <MdFavorite className={`text-2xl ${wishlistCount > 0 && isAuthenticated ? 'text-red-500' : 'group-hover:text-red-500'}`} />
                {wishlistCount > 0 && isAuthenticated && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-all group">
                <MdShoppingCart className="text-2xl group-hover:text-teal-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <NavLink to="/customer/login" className="btn-primary px-5 py-2">
                Login
              </NavLink>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            ☰
          </button>
        </div>

        {/* 🔹 Tab Style Navigation (Like AdminNavbar) */}
        <div className="hidden md:block">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/home'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                    isActive
                      ? 'text-teal-600 border-teal-600 bg-teal-50'
                      : 'text-gray-600 border-transparent hover:text-teal-600 hover:border-teal-300 hover:bg-teal-50'
                  }`
                }
              >
                <item.icon className="text-lg" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-gray-700 font-medium"
                >
                  <item.icon />
                  {item.name}
                </NavLink>
              ))}

              <Link 
                to={isAuthenticated ? "/customer/wishlist" : "/customer/login"}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-gray-700 font-medium hover:text-teal-600"
              >
                <MdFavorite className={wishlistCount > 0 && isAuthenticated ? 'text-red-500' : ''} />
                Wishlist {wishlistCount > 0 && isAuthenticated && `(${wishlistCount})`}
              </Link>

              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 py-2 text-gray-700 font-medium">
                    <MdNotifications />
                    Notifications
                  </div>
                  <button onClick={handleLogout} className="text-red-600 text-left py-2 font-medium">
                    Logout
                  </button>
                </>
              ) : (
                <NavLink to="/customer/login" className="btn-primary text-center">
                  Login
                </NavLink>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
