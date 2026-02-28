import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MdFavorite, MdDelete, MdShoppingCart, MdArrowBack } from 'react-icons/md';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist, getWishlistCount } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] py-4 md:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <div className="flex justify-start mb-2 md:mb-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-black uppercase tracking-tighter text-xs md:text-sm group"
            >
              <MdArrowBack className="text-sm md:text-xl group-hover:-translate-x-1 transition-transform" />
              Continue Shopping
            </Link>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-3 md:gap-6 mb-4 md:mb-6">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-teal-50 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner border border-teal-100/50 shrink-0">
                <MdFavorite className="text-xl md:text-3xl text-teal-600" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight leading-none" style={{ fontFamily: 'Playfair Display, serif' }}>WISHLIST</h1>
                <p className="text-[10px] md:text-sm text-gray-400 font-black uppercase tracking-[0.2em] mt-1 md:mt-2">
                  {getWishlistCount()} {getWishlistCount() === 1 ? 'ITEM' : 'ITEMS'}
                </p>
              </div>
            </div>

            {wishlistItems.length > 0 && (
              <button
                onClick={clearWishlist}
                className="px-4 py-2 md:px-8 md:py-4 bg-red-500/10 text-red-500 rounded-lg md:rounded-2xl text-[10px] md:text-base font-black uppercase tracking-widest hover:bg-red-500/20 transition-all active:scale-95 shadow-sm"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--bg-card)] rounded-2xl md:rounded-[3rem] shadow-xl p-10 md:p-24 text-center border border-[var(--border-main)] max-w-4xl mx-auto"
          >
            <div className="w-20 h-20 md:w-32 md:h-32 bg-[var(--bg-app)] rounded-full flex items-center justify-center mx-auto mb-6 md:mb-10 shadow-inner border border-[var(--border-main)]">
              <MdFavorite className="text-4xl md:text-6xl text-[var(--text-muted)]" />
            </div>
            <h2 className="text-2xl md:text-5xl font-black text-[var(--text-main)] mb-3 md:mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Your Wishlist is Empty
            </h2>
            <p className="text-xs md:text-xl text-[var(--text-muted)] mb-8 md:mb-12 max-w-sm mx-auto font-medium leading-relaxed">
              Start adding products you love to your wishlist!
            </p>
            <Link
              to="/products"
              className="inline-block px-10 py-4 md:px-16 md:py-6 bg-teal-600 text-white rounded-xl md:rounded-3xl font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-xl shadow-teal-100 active:scale-95 text-xs md:text-xl"
            >
              Browse Products
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-8">
            {wishlistItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[var(--bg-card)] rounded-xl md:rounded-[2.5rem] shadow-md hover:shadow-2xl transition-all duration-500 group border border-[var(--border-main)] overflow-hidden"
              >
                {/* Product Image */}
                <div className="relative h-28 sm:h-48 md:h-80 overflow-hidden bg-[var(--bg-app)] p-2 md:p-8">
                  <img
                    src={item.image || (item.images && item.images[0]) || 'https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg'}
                    alt={item.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-1 right-1 md:top-4 md:right-4 w-6 h-6 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 hover:text-white transition-all active:scale-90 group/btn"
                  >
                    <MdDelete className="text-xs md:text-2xl text-red-600 group-hover/btn:text-white" />
                  </button>

                  {/* Discount Badge */}
                  {item.discount && (
                    <div className="absolute top-1 left-1 md:top-4 md:left-4 bg-red-600 text-white px-1.5 py-0.5 md:px-4 md:py-2 rounded-md md:rounded-xl font-black text-[8px] md:text-sm uppercase tracking-widest shadow-lg">
                      -{item.discount}%
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-2 md:p-8 border-t border-gray-50">
                  <Link to={`/products/${item.id}`}>
                    <h3 className="text-[10px] md:text-2xl font-black text-gray-900 mb-1 md:mb-3 line-clamp-1 md:line-clamp-2 hover:text-teal-600 transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  
                  {item.brand && (
                    <p className="text-[8px] md:text-sm text-gray-400 font-bold uppercase tracking-widest mb-2 md:mb-4">{item.brand.name || item.brand}</p>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-1.5 md:gap-4 mb-3 md:mb-8 font-black">
                    <span className="text-xs md:text-3xl text-teal-600">
                      ₹{item.price?.toLocaleString()}
                    </span>
                    {item.originalPrice && (
                      <span className="text-[8px] md:text-lg text-gray-300 line-through">
                        ₹{item.originalPrice?.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full py-2 md:py-5 bg-gray-900 text-white rounded-lg md:rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-1 md:gap-3 hover:bg-black transition-all hover:shadow-xl active:scale-95 text-[8px] md:text-lg"
                  >
                    <MdShoppingCart className="text-[10px] md:text-2xl" />
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
