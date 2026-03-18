import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MdShoppingCart, MdMenu, MdClose, MdFavorite, MdNotifications } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import GlobalSearch from '../customer/GlobalSearch';

const LandingNavbar = () => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout, loading } = useAuth();
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const wishlistCount = getWishlistCount();

  const handleCartClick = (e) => {
    e.preventDefault();
    navigate('/cart');
  };

  const isHomePage = location.pathname === '/';

  const navLinks = [
    { name: 'Home', href: isHomePage ? '#home' : '/#home' },
    { 
      name: 'About Us', 
      href: isAuthenticated ? '/about' : (isHomePage ? '#about' : '/#about') 
    },
    { name: 'Products', href: isHomePage ? '#products' : '/shop' },
    { name: 'Brands', href: isHomePage ? '#brands' : '/#brands' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-0">
           <div className="w-5 h-5 md:w-10 md:h-10 bg-slate-950 rounded md:rounded-lg p-0.5 md:p-1 flex-shrink-0">
                <img src="/Logo2.png" alt="Logo" className="w-full h-full object-contain invert" />
              </div>
            <div>
              <h1 className="text-[12px] xs:text-base sm:text-lg md:text-2xl font-black text-gray-900 leading-none tracking-tighter">Singhai Traders</h1>
              <p className="text-[9px] text-gray-400 hidden xs:block mt-1 font-bold italic">Premium Sanitary Ware</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.href.startsWith('/') ? (
                <Link 
                  key={link.name} 
                  to={link.href} 
                  className="text-gray-700 hover:text-teal-600 font-medium transition-colors"
                >
                  {link.name}
                </Link>
              ) : (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className="text-gray-700 hover:text-teal-600 font-medium transition-colors"
                >
                  {link.name}
                </a>
              )
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-4 relative">
            {/* Search Icon/Bar */}
            <GlobalSearch showOnlyIcon={true} />

            {/* Wishlist Icon */}
            <Link
              to={isAuthenticated ? "/customer/wishlist" : "/customer/login"}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <MdFavorite className={`text-xl sm:text-2xl ${wishlistCount > 0 && isAuthenticated ? 'text-red-500' : 'text-gray-700'}`} />
              {wishlistCount > 0 && isAuthenticated && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <button 
              onClick={handleCartClick}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <MdShoppingCart className="text-xl sm:text-2xl text-gray-700 group-hover:text-teal-600" />
              {getCartCount() > 0 && (
                <span className="absolute top-0 right-0 bg-teal-600 text-white text-[10px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </button>
            {/* Auth Button */}
            <div className="hidden sm:block relative">
              {loading ? (
                <div className="w-20 h-8 bg-gray-100 animate-pulse rounded-lg" />
              ) : !isAuthenticated ? (
                <Link
                  to="/customer/login"
                  className="px-4 md:px-5 py-2 text-xs md:text-base bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors whitespace-nowrap"
                >
                  Login
                </Link>
              ) : (
                <div className="flex items-center gap-2 md:gap-3">
                   <Link
                      to="/customer/dashboard"
                      className="px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-sm bg-teal-50 text-teal-600 rounded-lg font-bold hover:bg-teal-600 hover:text-white transition-all shadow-sm"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      className="text-[10px] md:text-sm text-red-600 font-semibold hover:underline"
                    >
                      Logout
                    </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
               onClick={() => setIsMenuOpen(!isMenuOpen)}
               className="md:hidden p-2 pr-4 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
               {isMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-6 shadow-lg animate-slide-down">
          <div className="flex flex-col gap-5 px-6">
            {navLinks.map((link) => (
              link.href.startsWith('/') ? (
                <Link 
                  key={link.name} 
                  to={link.href} 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-700 font-bold text-lg hover:text-teal-600 transition-colors"
                >
                  {link.name}
                </Link>
              ) : (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-700 font-bold text-lg hover:text-teal-600 transition-colors"
                >
                  {link.name}
                </a>
              )
            ))}
            
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
               {loading ? (
                 <div className="w-full h-12 bg-gray-50 animate-pulse rounded-xl" />
               ) : !isAuthenticated ? (
                  <Link
                    to="/customer/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full px-4 py-3 bg-teal-600 text-white rounded-xl font-bold text-center text-sm"
                  >
                    Login
                  </Link>
               ) : (
                 <>
                   <Link
                      to="/customer/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full px-4 py-3 bg-teal-50 text-teal-600 rounded-xl font-bold text-center"
                    >
                      My Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                        navigate('/');
                      }}
                      className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold"
                    >
                      Logout
                    </button>
                 </>
               )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
