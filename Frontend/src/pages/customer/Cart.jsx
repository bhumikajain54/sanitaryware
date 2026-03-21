import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdDeleteOutline,
  MdAdd,
  MdRemove,
  MdShoppingCart,
  MdArrowForward,
  MdOutlineShoppingBag,
  MdLocalShipping,
  MdVerified
} from 'react-icons/md';
import { useCart } from '../../context/CartContext';
import { Card, Badge } from '../../components/common/DashboardUI';
import SafeImage from '../../components/common/SafeImage';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();

  const total = getCartTotal();
  const deliveryFee = total > 5000 ? 0 : 500;
  const tax = total * 0.18;
  const grandTotal = total + deliveryFee + tax;

  /* ─── Empty State ─── */
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 sm:p-8 bg-[var(--bg-app)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4 sm:mb-5 md:mb-6 border-2 border-dashed border-slate-200"
        >
          <MdOutlineShoppingBag className="text-4xl sm:text-4xl md:text-5xl text-slate-300" />
        </motion.div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--text-main)] mb-1.5 sm:mb-2 text-center">Your cart is empty</h2>
        <p className="text-[var(--text-muted)] font-bold mb-5 sm:mb-6 md:mb-8 text-center max-w-xs sm:max-w-sm md:max-w-md opacity-60 text-xs sm:text-sm">
          Start adding some premium products to your cart and they will appear here.
        </p>
        <Link
          to="/products"
          className="flex items-center gap-2 sm:gap-3 bg-teal-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-2xl shadow-teal-500/20 hover:bg-teal-700 transition-all active:scale-95"
        >
          <MdShoppingCart className="text-lg sm:text-xl flex-shrink-0" />
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-5 sm:space-y-6 md:space-y-8 max-w-[1400px] mx-auto">

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 md:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-main)] tracking-tight flex items-center gap-2 sm:gap-3">
            <MdShoppingCart className="text-teal-600 text-2xl sm:text-3xl md:text-4xl flex-shrink-0" />
            Shopping Cart
          </h1>
          <p className="text-[var(--text-muted)] font-bold mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm uppercase tracking-widest opacity-60">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your bag
          </p>
        </div>
      </div>

      {/* ─── Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 items-start">

        {/* ── Cart Items ── */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          <AnimatePresence mode="popLayout">
            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group"
              >
                <Card noPadding className="hover:shadow-xl hover:border-teal-500/20 transition-all duration-300">
                  <div className="p-3 sm:p-4 md:p-5 lg:p-6 flex gap-3 sm:gap-4 md:gap-6 lg:gap-8 items-center">

                    {/* Product image */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50 border border-[var(--border-main)] flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5 sm:py-1">
                      <div>
                        <div className="flex items-start justify-between gap-2 sm:gap-3 md:gap-4">
                          <div className="min-w-0">
                            <p className="text-[9px] sm:text-[10px] font-black text-teal-600 uppercase tracking-widest mb-0.5 sm:mb-1">{item.brand}</p>
                            <h3
                              className="text-xs sm:text-sm md:text-base lg:text-xl font-black text-[var(--text-main)] truncate max-w-[130px] sm:max-w-[200px] md:max-w-[260px] lg:max-w-md group-hover:text-teal-600 transition-colors cursor-pointer"
                              onClick={() => navigate(`/product/${item.id}`)}
                            >
                              {item.name}
                            </h3>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="flex-shrink-0 p-1.5 sm:p-2 md:p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg sm:rounded-xl transition-all active:scale-90"
                          >
                            <MdDeleteOutline className="text-lg sm:text-xl md:text-2xl" />
                          </button>
                        </div>
                      </div>

                      {/* Quantity + Subtotal */}
                      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 md:gap-4 mt-2 sm:mt-3 md:mt-4">
                        {/* Quantity control */}
                        <div className="flex items-center gap-1 sm:gap-2 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-lg sm:rounded-xl p-0.5 sm:p-1 shadow-inner">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--bg-card)] rounded-md sm:rounded-lg transition-all active:scale-90 disabled:opacity-30"
                          >
                            <MdRemove className="text-sm sm:text-base" />
                          </button>
                          <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-black text-[var(--text-main)]">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--bg-card)] rounded-md sm:rounded-lg transition-all active:scale-90"
                          >
                            <MdAdd className="text-sm sm:text-base" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right">
                          <p className="text-[8px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-0.5">Subtotal</p>
                          <p className="text-sm sm:text-base md:text-lg font-black text-[var(--text-main)] tracking-tight">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ── Order Summary Sidebar ── */}
        <div className="lg:sticky lg:top-6 xl:top-8 space-y-4 sm:space-y-5 md:space-y-6">
          <Card className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
            <h3 className="text-base sm:text-lg md:text-xl font-black text-[var(--text-main)] tracking-tight">Order Summary</h3>

            {/* Price breakdown */}
            <div className="space-y-3 sm:space-y-4 border-b border-[var(--border-subtle)] pb-4 sm:pb-5 md:pb-6">
              <div className="flex justify-between items-center">
                <p className="text-[9px] sm:text-xs md:text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest">Base Amount</p>
                <p className="text-xs sm:text-sm font-black text-[var(--text-main)]">₹{total.toLocaleString()}</p>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <p className="text-[9px] sm:text-xs md:text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest">Delivery Fee</p>
                  {deliveryFee === 0 && <Badge variant="success" className="text-[7px] sm:text-[8px]">FREE</Badge>}
                </div>
                <p className={`text-xs sm:text-sm font-black ${deliveryFee === 0 ? 'text-emerald-500' : 'text-[var(--text-main)]'}`}>
                  {deliveryFee === 0 ? '₹0' : `₹${deliveryFee}`}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[9px] sm:text-xs md:text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest">GST (18%)</p>
                <p className="text-xs sm:text-sm font-black text-[var(--text-main)]">₹{Math.round(tax).toLocaleString()}</p>
              </div>
            </div>

            {/* Grand Total */}
            <div className="flex justify-between items-end sm:items-center">
              <div>
                <p className="text-[9px] sm:text-xs font-black text-teal-600 uppercase tracking-widest italic mb-0.5 sm:mb-1">Total Payable</p>
                <p className="text-2xl sm:text-2xl md:text-3xl font-black text-[var(--text-main)] tracking-tight">
                  ₹{Math.round(grandTotal).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full flex items-center justify-center gap-3 sm:gap-4 bg-[var(--text-main)] text-[var(--bg-card)] py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[9px] sm:text-xs shadow-2xl hover:opacity-90 transition-all active:scale-[0.98] group"
            >
              Proceed to Checkout
              <MdArrowForward className="text-base sm:text-xl group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </button>

            {/* Trust signals */}
            <div className="space-y-2.5 sm:space-y-3 pt-2 sm:pt-4">
              <div className="flex items-center gap-2.5 sm:gap-3 text-[var(--text-muted)] cursor-default">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <MdVerified className="text-emerald-500 text-sm sm:text-base" />
                </div>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Verified Premium Products</p>
              </div>
              <div className="flex items-center gap-2.5 sm:gap-3 text-[var(--text-muted)] cursor-default">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <MdLocalShipping className="text-blue-500 text-sm sm:text-base" />
                </div>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Safe & Insured Delivery</p>
              </div>
            </div>
          </Card>

          {/* Footer tagline */}
          <div className="px-4 sm:px-6 md:px-8">
            <p className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] text-center italic opacity-60">
              SinghAI Traders • Since 1995 • Quality Assured
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;