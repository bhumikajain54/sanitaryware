import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdDelete, MdAdd, MdRemove, MdShoppingCart, MdArrowBack } from 'react-icons/md';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const continuePath = isAuthenticated ? '/products' : '/shop';

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id) => {
    removeFromCart(id);
  };

  const subtotal = getCartTotal();
  // Calculate discount based on originalPrice if available
  const discount = cartItems.reduce((sum, item) => {
    const original = item.originalPrice || item.price;
    return sum + ((original - item.price) * item.quantity);
  }, 0);
  
  const tax = subtotal * 0.18; // 18% GST
  const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 200;
  const total = subtotal + tax + shipping;

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: amount % 1 !== 0 ? 2 : 0
    });
  };

  const formatTotal = (amount) => {
    return (amount || 0).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] py-4 md:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6 md:mb-10">
          <div className="flex justify-start mb-4">
            <Link
              to={continuePath}
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-black uppercase tracking-tighter text-[10px] md:text-sm group"
            >
              <MdArrowBack className="text-sm md:text-xl group-hover:-translate-x-1 transition-transform" />
              <span>Continue Shopping</span>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-3xl md:text-3xl font-black text-[var(--text-main)] mb-1 tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>Shopping Cart</h1>
            <p className="text-xs md:text-lg text-[var(--text-muted)] font-medium tracking-tight">{cartItems.length} items in your cart</p>
          </div>
        </div>

        {cartItems.length === 0 ? (
          // Empty Cart
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--bg-card)] rounded-2xl md:rounded-[3rem] shadow-xl p-10 md:p-24 text-center border border-[var(--border-main)] max-w-4xl mx-auto"
          >
            <div className="w-20 h-20 md:w-32 md:h-32 bg-[var(--bg-app)] rounded-full flex items-center justify-center mx-auto mb-6 md:mb-10 shadow-inner border border-[var(--border-main)]">
              <MdShoppingCart className="text-4xl md:text-6xl text-[var(--text-muted)]" />
            </div>
            <h2 className="text-2xl md:text-5xl font-black text-[var(--text-main)] mb-3 md:mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Your cart is empty
            </h2>
            <p className="text-xs md:text-xl text-[var(--text-muted)] mb-8 md:mb-12 max-w-sm mx-auto font-medium leading-relaxed">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              to={continuePath}
              className="inline-block px-10 py-4 md:px-16 md:py-6 bg-teal-600 text-white rounded-xl md:rounded-3xl font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-xl shadow-teal-500/10 active:scale-95 text-xs md:text-xl"
            >
              Start Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[var(--bg-card)] rounded-2xl md:rounded-[2rem] p-4 md:p-8 shadow-md hover:shadow-xl transition-all border border-[var(--border-main)] group"
                >
                  <div className="flex flex-row gap-4 md:gap-8">
                    <div className="w-24 h-24 md:w-48 md:h-48 rounded-xl md:rounded-3xl overflow-hidden bg-[var(--bg-app)] border border-[var(--border-subtle)] flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-1 md:mb-4">
                          <div>
                            <h3 className="text-sm md:text-3xl font-black text-[var(--text-main)] mb-0.5 md:mb-2 line-clamp-1 md:line-clamp-none hover:text-teal-600 transition-colors cursor-pointer">
                              {item.name}
                            </h3>
                            <p className="text-[10px] md:text-sm text-[var(--text-muted)] font-bold uppercase tracking-widest">{item.brand}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-[var(--text-muted)] hover:text-red-500 p-2 hover:bg-red-500/10 rounded-full transition-all active:scale-90"
                          >
                            <MdDelete className="text-xl md:text-3xl" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3 md:gap-6 mb-4 md:mb-8 font-black">
                          <span className="text-base md:text-3xl text-teal-600">
                            ₹{formatCurrency(item.price)}
                          </span>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <span className="text-xs md:text-lg text-[var(--text-muted)] line-through">
                              ₹{formatCurrency(item.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-2 md:pt-0 border-t md:border-t-0 border-[var(--border-subtle)]">
                        <div className="flex items-center bg-[var(--bg-app)] border border-[var(--border-main)] rounded-lg md:rounded-2xl overflow-hidden">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-2 md:p-4 hover:bg-[var(--bg-card)] hover:text-teal-600 transition-all active:scale-95 text-[var(--text-main)]"
                          >
                            <MdRemove className="text-sm md:text-xl" />
                          </button>
                          <span className="px-4 md:px-8 text-xs md:text-xl font-black text-[var(--text-main)]">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-2 md:p-4 hover:bg-[var(--bg-card)] hover:text-teal-600 transition-all active:scale-95 text-[var(--text-main)]"
                          >
                            <MdAdd className="text-sm md:text-xl" />
                          </button>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className="text-[8px] md:text-[12px] text-teal-600/60 font-black uppercase tracking-[0.2em] mb-1">Subtotal</span>
                          <span className="text-xs md:text-2xl font-black text-[var(--text-main)] italic tracking-tighter">₹{formatCurrency((item.price || 0) * (item.quantity || 1))}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[var(--bg-card)] rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-[var(--border-main)] sticky top-6 md:top-10"
              >
                <h2 className="text-xl md:text-4xl font-black text-[var(--text-main)] mb-8 tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>Order Summary</h2>

                <div className="space-y-4 md:space-y-6 mb-8 md:mb-10 text-xs md:text-lg">
                  <div className="flex justify-between text-[var(--text-muted)] font-medium">
                    <span>Subtotal</span>
                    <span className="font-black text-[var(--text-main)]">₹{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-medium bg-green-500/10 px-3 py-2 md:px-4 md:py-3 rounded-xl border border-green-500/20">
                    <span className="font-bold flex items-center gap-1.5 md:gap-2">
                       <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse" />
                       Discount
                    </span>
                    <span className="font-black">-₹{formatCurrency(discount)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-muted)] font-medium">
                    <span>Tax (GST 18%)</span>
                    <span className="font-black text-[var(--text-main)]">₹{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-muted)] font-medium">
                    <span>Shipping</span>
                    <span className="font-black">
                      {shipping === 0 ? (
                        <span className="text-green-600 font-black tracking-widest">FREE</span>
                      ) : (
                        <span className="text-[var(--text-main)]">₹{formatCurrency(shipping)}</span>
                      )}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <div className="bg-teal-500/10 p-3 md:p-4 rounded-xl border border-teal-500/20">
                       <p className="text-[10px] md:text-sm text-teal-600 font-bold leading-relaxed">
                        Add ₹{(5000 - subtotal).toLocaleString()} more for <span className="underline decoration-2 underline-offset-4">FREE SHIPPING</span>
                       </p>
                    </div>
                  )}
                </div>

                <div className="border-t-2 border-[var(--border-main)] pt-6 md:pt-8 mb-8 md:mb-12">
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] md:text-[14px] font-black uppercase tracking-[0.2em] text-[var(--text-main)] leading-none">Grand</span>
                        <span className="text-[10px] md:text-[14px] font-black uppercase tracking-[0.2em] text-[var(--text-main)] mt-1">Total</span>
                      </div>
                      <div className="flex flex-col opacity-40">
                        <span className="text-[6px] md:text-[9px] font-black uppercase tracking-widest leading-tight">Inclusive</span>
                        <span className="text-[6px] md:text-[9px] font-black uppercase tracking-widest leading-tight">of all</span>
                        <span className="text-[6px] md:text-[9px] font-black uppercase tracking-widest leading-tight">taxes</span>
                      </div>
                    </div>
                    <div className="text-right flex-1">
                      <span className="text-xl sm:text-2xl md:text-3xl font-black text-teal-600 tracking-tighter italic block leading-none">
                        ₹{formatTotal(total)}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="block w-full bg-teal-600 hover:bg-teal-700 text-white text-center py-4 md:py-6 rounded-xl md:rounded-[1.5rem] font-black uppercase tracking-widest text-xs md:text-xl transition-all shadow-xl shadow-teal-500/20 mb-4 active:scale-95"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  to={continuePath}
                  className="block w-full border-2 border-[var(--border-main)] text-[var(--text-muted)] hover:text-teal-600 hover:bg-teal-500/5 hover:border-teal-500/20 text-center py-4 md:py-6 rounded-xl md:rounded-[1.5rem] font-black uppercase tracking-widest text-xs md:text-xl transition-all active:scale-95"
                >
                  Continue Shopping
                </Link>

                {/* Trust Badges */}
                <div className="mt-8 md:mt-12 pt-8 md:pt-12 border-t border-[var(--border-subtle)]">
                  <div className="grid grid-cols-2 gap-4 md:gap-6">
                    <div className="bg-[var(--bg-app)] p-3 md:p-4 rounded-xl border border-[var(--border-main)] text-center group/badge">
                        <span className="text-xs md:text-sm font-black text-[var(--text-main)] block mb-0.5 group-hover/badge:text-teal-600 transition-colors italic">Secure</span>
                        <span className="text-[8px] md:text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Payments</span>
                    </div>
                    <div className="bg-[var(--bg-app)] p-3 md:p-4 rounded-xl border border-[var(--border-main)] text-center group/badge">
                        <span className="text-xs md:text-sm font-black text-[var(--text-main)] block mb-0.5 group-hover/badge:text-teal-600 transition-colors italic">Free</span>
                        <span className="text-[8px] md:text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Returns</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
