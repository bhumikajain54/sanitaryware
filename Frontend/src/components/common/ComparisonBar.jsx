import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdCompareArrows, MdDelete } from 'react-icons/md';
import { useComparison } from '../../context/ComparisonContext';

const ComparisonBar = ({ onCompare }) => {
  const { comparedProducts, removeFromComparison, clearComparison } = useComparison();

  if (comparedProducts.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[95vw] max-w-2xl"
    >
      <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-3 sm:p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {comparedProducts.map((product) => (
            <div key={product.id} className="relative flex-shrink-0 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg overflow-hidden border border-white/20">
                <img src={product.image || '/Logo2.png'} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => removeFromComparison(product.id)}
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-lg"
              >
                <MdClose size={12} />
              </button>
            </div>
          ))}
          {comparedProducts.length < 4 && (
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center text-white/20">
              <span className="text-[10px] font-black">{comparedProducts.length}/4</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={clearComparison}
            className="text-[10px] font-black text-white/50 uppercase tracking-widest hover:text-white transition-colors"
          >
            Clear
          </button>
          <button
            onClick={onCompare}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-teal-500 text-white rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all hover:scale-105 active:scale-95"
          >
            <MdCompareArrows size={16} />
            <span>Compare {comparedProducts.length}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ComparisonBar;
