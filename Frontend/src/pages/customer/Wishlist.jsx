import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MdFavorite, MdDelete, MdShoppingCart, MdArrowBack } from 'react-icons/md';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import SafeImage from '../../components/common/SafeImage';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist, getWishlistCount } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] py-4 sm:py-5 md:py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 md:px-6 lg:px-8">

        {/* ─── Header ─── */}
        <div className="mb-4 sm:mb-6 md:mb-8">

          {/* Back link */}
          <div className="mb-3 sm:mb-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 sm:gap-2 text-teal-600 hover:text-teal-700 font-black uppercase tracking-tighter text-[10px] sm:text-xs md:text-sm group"
            >
              <MdArrowBack className="text-sm sm:text-base md:text-xl group-hover:-translate-x-1 transition-transform flex-shrink-0" />
              Continue Shopping
            </Link>
          </div>

          {/* Title + Clear All */}
          <div className="flex flex-col items-center text-center gap-3 sm:gap-4">
            <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6">
              <div className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-teal-50 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner border border-teal-100/50 flex-shrink-0">
                <MdFavorite className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-teal-600" />
              </div>
              <div className="text-left">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-none"
                  style={{ fontFamily: 'Playfair Display, serif' }}>
                  WISHLIST
                </h1>
                <p className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-gray-400 font-black uppercase tracking-[0.2em] mt-0.5 sm:mt-1 md:mt-2">
                  {getWishlistCount()} {getWishlistCount() === 1 ? 'ITEM' : 'ITEMS'}
                </p>
              </div>
            </div>

            {wishlistItems.length > 0 && (
              <button
                onClick={clearWishlist}
                className="px-4 sm:px-5 md:px-7 lg:px-8 py-2 sm:py-2.5 md:py-3 lg:py-4 bg-red-500/10 text-red-500 rounded-xl md:rounded-2xl text-[9px] sm:text-[10px] md:text-sm lg:text-base font-black uppercase tracking-widest hover:bg-red-500/20 transition-all active:scale-95 shadow-sm"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* ─── Empty State ─── */}
        {wishlistItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--bg-card)] rounded-2xl sm:rounded-3xl md:rounded-[3rem] shadow-xl p-8 sm:p-12 md:p-16 lg:p-24 text-center border border-[var(--border-main)] max-w-4xl mx-auto"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-[var(--bg-app)] rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-7 md:mb-8 lg:mb-10 shadow-inner border border-[var(--border-main)]">
              <MdFavorite className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--text-muted)]" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-black text-[var(--text-main)] mb-2.5 sm:mb-3 md:mb-4 lg:mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}>
              Your Wishlist is Empty
            </h2>
            <p className="text-xs sm:text-sm md:text-base lg:text-xl text-[var(--text-muted)] mb-6 sm:mb-8 md:mb-10 lg:mb-12 max-w-xs sm:max-w-sm mx-auto font-medium leading-relaxed">
              Start adding products you love to your wishlist!
            </p>
            <Link
              to="/products"
              className="inline-block px-7 sm:px-10 md:px-12 lg:px-16 py-3 sm:py-4 md:py-5 lg:py-6 bg-teal-600 text-white rounded-xl sm:rounded-2xl md:rounded-3xl font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-xl shadow-teal-100 active:scale-95 text-[10px] sm:text-xs md:text-sm lg:text-xl"
            >
              Browse Products
            </Link>
          </motion.div>
        ) : (
          /* ─── Product Grid ─── */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-5 lg:gap-8">
            {wishlistItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[var(--bg-card)] rounded-xl sm:rounded-2xl md:rounded-3xl lg:rounded-[2.5rem] shadow-md hover:shadow-2xl transition-all duration-500 group border border-[var(--border-main)] overflow-hidden"
              >
                {/* Product image */}
                <div className="relative h-28 sm:h-40 md:h-56 lg:h-80 overflow-hidden bg-[var(--bg-app)] p-2 sm:p-3 md:p-5 lg:p-8">
                  <SafeImage
                    src={item.image || (item.images && item.images[0])}
                    alt={item.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 md:top-3 md:right-3 lg:top-4 lg:right-4 w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-12 lg:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 hover:text-white transition-all active:scale-90 group/btn"
                  >
                    <MdDelete className="text-xs sm:text-sm md:text-base lg:text-2xl text-red-600 group-hover/btn:text-white" />
                  </button>

                  {/* Discount badge */}
                  {item.discount && (
                    <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 md:top-3 md:left-3 lg:top-4 lg:left-4 bg-red-600 text-white px-1.5 sm:px-2 md:px-3 lg:px-4 py-0.5 sm:py-1 md:py-1.5 lg:py-2 rounded-md sm:rounded-lg md:rounded-xl font-black text-[7px] sm:text-[8px] md:text-[10px] lg:text-sm uppercase tracking-widest shadow-lg">
                      -{item.discount}%
                    </div>
                  )}
                </div>

                {/* Product info */}
                <div className="p-2 sm:p-3 md:p-4 lg:p-8 border-t border-gray-50">
                  <Link to={`/products/${item.id}`}>
                    <h3 className="text-[10px] sm:text-xs md:text-sm lg:text-xl xl:text-2xl font-black text-gray-900 mb-0.5 sm:mb-1 md:mb-2 lg:mb-3 line-clamp-2 hover:text-teal-600 transition-colors leading-tight">
                      {item.name}
                    </h3>
                  </Link>

                  {item.brand && (
                    <p className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-sm text-gray-400 font-bold uppercase tracking-widest mb-1.5 sm:mb-2 md:mb-3 lg:mb-4 truncate">
                      {item.brand.name || item.brand}
                    </p>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-4 mb-2.5 sm:mb-3 md:mb-4 lg:mb-8 font-black">
                    <span className="text-xs sm:text-sm md:text-base lg:text-2xl xl:text-3xl text-teal-600 whitespace-nowrap">
                      ₹{item.price?.toLocaleString()}
                    </span>
                    {item.originalPrice && (
                      <span className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-lg text-gray-300 line-through whitespace-nowrap">
                        ₹{item.originalPrice?.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full py-1.5 sm:py-2 md:py-3 lg:py-5 bg-gray-900 text-white rounded-lg sm:rounded-xl md:rounded-xl lg:rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 hover:bg-black transition-all hover:shadow-xl active:scale-95 text-[8px] sm:text-[9px] md:text-[10px] lg:text-sm xl:text-lg"
                  >
                    <MdShoppingCart className="text-[10px] sm:text-xs md:text-sm lg:text-xl xl:text-2xl flex-shrink-0" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Wishlist;