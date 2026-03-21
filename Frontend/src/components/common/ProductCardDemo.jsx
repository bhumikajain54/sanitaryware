import { motion } from 'framer-motion';
import { MdStar, MdFavoriteBorder } from 'react-icons/md';
import AddToCartButton from './AddToCartButton';

/**
 * ProductCardDemo - Demonstrates the premium AddToCartButton 
 * within a modern, Apple/Stripe-inspired product card design.
 */
const ProductCardDemo = () => {
  const dummyProduct = {
    id: 'demo-1',
    name: 'Aurelius Premium Ceramic Basin',
    brand: 'SanitaryWare',
    category: 'Premium Collection',
    price: 18450,
    originalPrice: 22000,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    reviews: 124
  };

  return (
    <div className="p-10 bg-slate-50 min-h-[500px] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative w-full max-w-[340px] bg-white rounded-[2.5rem] p-6 shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden"
      >
        {/* Wishlist Icon */}
        <button className="absolute top-6 right-6 z-20 p-2.5 bg-white/80 backdrop-blur-md rounded-full text-slate-400 hover:text-red-500 hover:scale-110 transition-all shadow-sm">
          <MdFavoriteBorder size={20} />
        </button>

        {/* Product Image Holder */}
        <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-100 mb-6">
          <motion.img
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.8 }}
            src={dummyProduct.image}
            alt={dummyProduct.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
              {dummyProduct.brand}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
              <MdStar />
              <span>{dummyProduct.rating}</span>
              <span className="text-slate-300 font-medium">({dummyProduct.reviews})</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-slate-800 leading-tight mb-1">
              {dummyProduct.name}
            </h3>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              {dummyProduct.category}
            </p>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-slate-50 mt-2">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-slate-900 tracking-tighter">
                ₹{dummyProduct.price.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-300 line-through font-bold">
                ₹{dummyProduct.originalPrice.toLocaleString()}
              </span>
            </div>
            
            {/* ─── The Premium Button ─── */}
            <AddToCartButton 
              product={dummyProduct} 
              className="px-6 py-4 rounded-full shadow-2xl hover:-translate-y-1 transition-transform" 
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductCardDemo;
