import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAddShoppingCart, MdCheck, MdAdd, MdRefresh } from 'react-icons/md';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';

/**
 * AddToCartButton - A premium, animated "Add to Cart" component.
 * Features: Shimmer effect, liquid-fill transition, micro-interactions, 
 * loading state, and dark mode support.
 */
const AddToCartButton = ({ product, quantity = 1, className = "", compact = false }) => {
  const { addToCart } = useCart();
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'added'

  // Reset back to idle after a delay when "added"
  useEffect(() => {
    if (status === 'added') {
      const timer = setTimeout(() => setStatus('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleAction = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (status !== 'idle') return;

    try {
      setStatus('loading');
      
      // Simulate slight network delay for premium "loading" feel if needed, 
      // or just wait for the actual context call
      await new Promise(resolve => setTimeout(resolve, 600)); 
      
      await addToCart(product, quantity);
      
      setStatus('added');
      toast.success(`${product.name || 'Item'} added to cart!`, {
        icon: '🛒',
        style: {
          borderRadius: '12px',
          background: '#333',
          color: '#fff',
        },
      });
    } catch (error) {
      setStatus('idle');
      toast.error('Failed to add item. Please try again.');
    }
  };

  // Animation Variants
  const iconVariants = {
    idle: { scale: 1, rotate: 0 },
    loading: { scale: 0.8, rotate: 360, transition: { repeat: Infinity, duration: 1, ease: "linear" } },
    added: { scale: 1.2, rotate: 0, color: '#fff' }
  };

  const textVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <motion.button
      onClick={handleAction}
      disabled={status === 'loading'}
      aria-label="Add to cart"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative group overflow-hidden flex items-center justify-center gap-3
        ${compact ? 'p-2.5 rounded-xl' : 'px-6 py-3.5 rounded-2xl'}
        font-bold text-sm md:text-base tracking-tight
        transition-all duration-500 shadow-lg cursor-pointer
        ${status === 'added' 
          ? 'bg-emerald-600 text-white shadow-emerald-500/40' 
          : 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40'
        }
        ${status === 'loading' ? 'cursor-wait opacity-90' : ''}
        ${className}
      `}
    >
      {/* ─── Shimmer / Glow Overlay ─── */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
      
      {/* ─── Liquid Fill Effect on Success ─── */}
      <AnimatePresence>
        {status === 'added' && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 4, opacity: 1 }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className="absolute bg-white/10 rounded-full w-24 h-24 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* ─── Content Wrap ─── */}
      <div className="relative z-10 flex items-center justify-center gap-2.5">
        {/* Left Icon */}
        <motion.div
          variants={iconVariants}
          animate={status}
          className="flex-shrink-0"
        >
          {status === 'idle' && <MdAddShoppingCart className="text-xl group-hover:scale-110 transition-transform" />}
          {status === 'loading' && <MdRefresh className="text-xl animate-spin" />}
          {status === 'added' && <MdCheck className="text-xl" />}
        </motion.div>

        {/* Center Text */}
        {!compact && (
          <div className="relative h-5 overflow-hidden min-w-[90px]">
            <AnimatePresence mode="wait">
              {status === 'idle' ? (
                <motion.span
                  key="idle-text"
                  variants={textVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute inset-0 whitespace-nowrap"
                >
                  Add to Cart
                </motion.span>
              ) : status === 'loading' ? (
                <motion.span
                  key="loading-text"
                  variants={textVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute inset-0 whitespace-nowrap opacity-80 italic"
                >
                  Securing...
                </motion.span>
              ) : (
                <motion.span
                  key="added-text"
                  variants={textVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute inset-0 whitespace-nowrap font-black"
                >
                  Added ✓
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Right Icon (Optional Plus) */}
        {!compact && status === 'idle' && (
          <motion.div 
            initial={{ opacity: 0.5, x: 0 }}
            whileHover={{ opacity: 1, x: 3 }}
            className="hidden sm:block"
          >
            <MdAdd className="text-teal-100/50" />
          </motion.div>
        )}
      </div>

      {/* ─── Ripple / Click Spark ─── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </motion.button>
  );
};

export default AddToCartButton;
