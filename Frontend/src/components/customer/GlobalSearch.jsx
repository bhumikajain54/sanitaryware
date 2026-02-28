import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MdSearch, MdClose } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import { useProducts } from "../../context/ProductContext";
import { globalSearch } from "../../services/additionalServices";

const GlobalSearch = ({ showOnlyIcon = false }) => {
  const { isAuthenticated } = useAuth();
  const { products } = useProducts();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ products: [], categories: [], brands: [] });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(window.innerWidth >= 640 && !showOnlyIcon);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        try {
          const searchResults = await globalSearch(query);
          setResults(searchResults || { products: [], categories: [], brands: [] });
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults({ products: [], categories: [], brands: [] });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Handle responsive behavior
  useEffect(() => {
    const checkResponsive = () => {
      if (window.innerWidth < 640 || showOnlyIcon) {
        if (!query && !document.activeElement?.id?.includes('search')) {
          setIsExpanded(false);
        }
      } else {
        setIsExpanded(true);
      }
    };
    
    checkResponsive();
    window.addEventListener("resize", checkResponsive);
    return () => window.removeEventListener("resize", checkResponsive);
  }, [query, showOnlyIcon]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        if ((showOnlyIcon || window.innerWidth < 640) && !query) {
          setIsExpanded(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showOnlyIcon, query]);

  const handleToggle = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!isExpanded) {
      setIsExpanded(true);
      // Immediate focus for mobile responsiveness
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handleMouseEnter = () => {
    if (window.innerWidth >= 640 && showOnlyIcon) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 640 && showOnlyIcon && !query && document.activeElement !== inputRef.current) {
      setIsExpanded(false);
    }
  };

  const handleSelect = (product) => {
    setQuery("");
    setIsOpen(false);
    if (showOnlyIcon || window.innerWidth < 640) setIsExpanded(false);
    navigate(`/products/${product.id}`);
  };

  // Combine results for display
  const filtered = results.products || [];

  return (
    <div 
      ref={searchRef} 
      className="relative flex items-center justify-end"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Search Input Container */}
      <motion.div 
        animate={{ 
          width: isExpanded ? (window.innerWidth < 640 ? "240px" : "320px") : "48px",
        }}
        initial={false}
        className={`relative flex items-center transition-all duration-300 rounded-2xl border transition-colors duration-300 ${
          isExpanded 
            ? 'border-teal-500 ring-4 ring-teal-500/10 shadow-lg bg-[var(--bg-card)]' 
            : 'border-transparent hover:bg-[var(--bg-card)] text-[var(--text-muted)]'
        }`}
      >
        <button
          type="button"
          onPointerDown={handleToggle}
          className={`p-2.5 flex items-center justify-center transition-all duration-300 relative z-10 cursor-pointer ${isExpanded ? 'text-teal-600' : 'text-[var(--text-muted)] hover:text-teal-600'}`}
        >
          <MdSearch className="text-2xl" />
        </button>

        <motion.div
          animate={{ 
            width: isExpanded ? "100%" : 0,
            opacity: isExpanded ? 1 : 0,
            pointerEvents: isExpanded ? "auto" : "none",
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`flex-1 flex items-center overflow-hidden rounded-xl ${isExpanded ? 'pr-2' : ''}`}
        >
          <input
            ref={inputRef}
            id="global-search-input"
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              setIsOpen(true);
              setIsExpanded(true);
            }}
            className="w-full bg-transparent py-2 text-sm font-medium outline-none placeholder:text-[var(--text-muted)] text-[var(--text-main)]"
          />
          <div className="flex items-center shrink-0 gap-1">
            {query && (
              <button 
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="p-1 hover:bg-[var(--bg-app)] rounded-full transition-colors"
              >
                <MdClose className="text-[var(--text-muted)]" />
              </button>
            )}
            {(showOnlyIcon || window.innerWidth < 640) && isExpanded && (
               <button 
                 type="button"
                 onClick={() => {
                   setIsExpanded(false);
                   setQuery("");
                 }}
                 className="p-1 text-[var(--text-muted)] hover:text-teal-600"
               >
                 <MdClose size={20} />
               </button>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Autocomplete Results */}
      <AnimatePresence>
        {isOpen && query && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute top-full right-0 mt-2 w-[92vw] sm:w-80 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl shadow-2xl overflow-hidden z-[100] transition-colors duration-300"
          >
            <div className="p-2 border-b border-[var(--border-subtle)]">
              <span className="px-3 py-1 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                Suggestions
              </span>
            </div>
            <ul className="py-2">
              {filtered.map((product) => (
                <li
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-teal-500/5 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-[var(--border-main)]">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[var(--text-main)] truncate group-hover:text-teal-600 transition-colors">
                      {product.name}
                    </p>
                    <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-tight">
                      {product.brand} • <span className="text-teal-600">₹{product.price.toLocaleString()}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div 
              onClick={() => navigate(isAuthenticated ? '/products' : '/shop')}
              className="p-3 bg-[var(--bg-app)] text-center cursor-pointer hover:bg-teal-600 hover:text-white transition-all"
            >
              <span className="text-[10px] font-black uppercase tracking-widest">See all results</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalSearch;
