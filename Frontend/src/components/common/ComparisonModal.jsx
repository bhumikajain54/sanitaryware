import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdShoppingBag, MdDelete } from 'react-icons/md';
import { useComparison } from '../../context/ComparisonContext';
import { useCart } from '../../context/CartContext';

const ComparisonModal = ({ isOpen, onClose }) => {
  const { comparedProducts, removeFromComparison, clearComparison } = useComparison();
  const { addToCart } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none p-4 sm:p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md pointer-events-auto"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 uppercase tracking-tight">Compare Products</h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{comparedProducts.length}/4 Selected</span>
          </div>
          <button onClick={onClose} className="p-2 sm:p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <MdClose size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-x-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="w-40 text-left py-4 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">Specifications</th>
                {comparedProducts.map((product) => (
                  <th key={product.id} className="p-4 w-1/4 min-w-[180px]">
                    <div className="flex flex-col gap-3 relative group">
                      <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 relative group-hover:border-teal-500 transition-colors">
                        <img src={product.image || '/Logo2.png'} alt={product.name} className="w-full h-full object-cover p-2" />
                        <button
                          onClick={() => removeFromComparison(product.id)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                        >
                          <MdDelete size={14} />
                        </button>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] sm:text-xs font-black text-teal-600 uppercase tracking-widest truncate">{product.brand}</p>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 leading-tight h-10">{product.name}</h3>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Category */}
              <tr>
                <td className="py-4 text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</td>
                {comparedProducts.map(p => (
                  <td key={p.id} className="p-4 text-xs font-bold text-slate-700">{p.category}</td>
                ))}
              </tr>
              {/* Price */}
              <tr>
                <td className="py-4 text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</td>
                {comparedProducts.map(p => (
                  <td key={p.id} className="p-4">
                    <span className="text-sm sm:text-lg font-black text-slate-900">₹{p.price.toLocaleString()}</span>
                    {p.originalPrice > p.price && (
                      <p className="text-[9px] sm:text-[10px] text-slate-400 line-through">₹{p.originalPrice.toLocaleString()}</p>
                    )}
                  </td>
                ))}
              </tr>
              {/* Discount */}
              <tr>
                <td className="py-4 text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Discount</td>
                {comparedProducts.map(p => (
                  <td key={p.id} className="p-4">
                    {p.discount > 0 ? (
                      <span className="text-[10px] sm:text-xs font-bold text-red-500">-{p.discount}% OFF</span>
                    ) : (
                      <span className="text-[10px] sm:text-xs text-slate-300">N/A</span>
                    )}
                  </td>
                ))}
              </tr>
              {/* Availability */}
              <tr>
                <td className="py-4 text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Availability</td>
                {comparedProducts.map(p => (
                  <td key={p.id} className="p-4">
                    {p.stock > 0 ? (
                      <span className="text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase">In Stock</span>
                    ) : (
                      <span className="text-[10px] sm:text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full uppercase">Sold Out</span>
                    )}
                  </td>
                ))}
              </tr>
              {/* Action */}
              <tr className="bg-slate-50/50">
                <td className="py-4 text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</td>
                {comparedProducts.map(p => (
                  <td key={p.id} className="p-4 align-middle">
                    <button
                      onClick={() => addToCart(p, 1)}
                      className="w-full flex items-center justify-center gap-2 py-2 sm:py-3 bg-teal-600 text-white rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-teal-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-teal-500/10"
                    >
                      <MdShoppingBag size={14} />
                      <span>Add to Cart</span>
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center sm:hidden">
           <button onClick={onClose} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Back</button>
           <button onClick={clearComparison} className="text-[10px] font-black text-red-500 uppercase tracking-widest">Clear All</button>
        </div>
      </motion.div>
    </div>
  );
};

export default ComparisonModal;
