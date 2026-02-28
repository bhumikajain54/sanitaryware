import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MdSearch, 
  MdClose,
  MdShoppingBag,
  MdCategory,
  MdBrandingWatermark,
  MdReceipt,
  MdTrendingUp
} from 'react-icons/md';
import { globalSearch } from '../services/additionalServices';
import { toast } from 'react-hot-toast';

const GlobalSearchBar = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length >= 2) {
        performSearch();
      } else {
        setResults(null);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, selectedCategory]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const filters = selectedCategory !== 'all' ? { type: selectedCategory } : {};
      const searchResults = await globalSearch(query, filters);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (type, item) => {
    switch(type) {
      case 'product':
        navigate(`/products/${item.id}`);
        break;
      case 'category':
        navigate(`/products?category=${item.id}`);
        break;
      case 'brand':
        navigate(`/products?brand=${item.id}`);
        break;
      case 'order':
        navigate(`/admin/orders/${item.id}`);
        break;
      default:
        break;
    }
    onClose?.();
  };

  const getResultIcon = (type) => {
    switch(type) {
      case 'product': return <MdShoppingBag className="text-teal-600" />;
      case 'category': return <MdCategory className="text-blue-600" />;
      case 'brand': return <MdBrandingWatermark className="text-purple-600" />;
      case 'order': return <MdReceipt className="text-orange-600" />;
      default: return <MdSearch className="text-gray-600" />;
    }
  };

  const getTotalResults = () => {
    if (!results) return 0;
    return (results.products?.length || 0) +
           (results.categories?.length || 0) +
           (results.brands?.length || 0) +
           (results.orders?.length || 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-[var(--bg-card)] rounded-3xl shadow-2xl border border-[var(--border-main)] overflow-hidden"
      >
        {/* Search Header */}
        <div className="p-6 border-b border-[var(--border-main)]">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-[var(--text-muted)]" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, categories, brands, orders..."
                className="w-full pl-14 pr-4 py-4 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-2xl text-lg text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-teal-500 outline-none transition-all"
              />
              {loading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600"></div>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-[var(--bg-app)] rounded-xl transition-colors"
            >
              <MdClose className="text-2xl text-[var(--text-main)]" />
            </button>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['all', 'products', 'categories', 'brands', 'orders'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-teal-600 text-white'
                    : 'bg-[var(--bg-app)] text-[var(--text-muted)] hover:bg-[var(--bg-card)]'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.length < 2 ? (
            <div className="p-12 text-center">
              <MdSearch className="text-6xl text-[var(--text-muted)] opacity-30 mx-auto mb-4" />
              <p className="text-[var(--text-muted)] font-medium">
                Type at least 2 characters to search
              </p>
            </div>
          ) : loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-[var(--text-muted)] font-medium">Searching...</p>
            </div>
          ) : !results || getTotalResults() === 0 ? (
            <div className="p-12 text-center">
              <MdSearch className="text-6xl text-[var(--text-muted)] opacity-30 mx-auto mb-4" />
              <p className="text-[var(--text-main)] font-bold text-lg mb-2">
                No results found
              </p>
              <p className="text-[var(--text-muted)] font-medium">
                Try different keywords or filters
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {/* Products */}
              {results.products && results.products.length > 0 && (
                <div>
                  <h3 className="text-sm font-black text-[var(--text-muted)] uppercase tracking-wider mb-3 px-2">
                    Products ({results.products.length})
                  </h3>
                  <div className="space-y-2">
                    {results.products.map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => handleResultClick('product', product)}
                        className="flex items-center gap-4 p-4 bg-[var(--bg-app)] hover:bg-[var(--bg-card)] rounded-xl cursor-pointer transition-all border border-transparent hover:border-teal-500/30"
                      >
                        <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          {getResultIcon('product')}
                        </div>
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[var(--text-main)] truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-[var(--text-muted)] truncate">
                            {product.category} • ₹{product.price?.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <MdTrendingUp className="text-teal-600 flex-shrink-0" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {results.categories && results.categories.length > 0 && (
                <div>
                  <h3 className="text-sm font-black text-[var(--text-muted)] uppercase tracking-wider mb-3 px-2">
                    Categories ({results.categories.length})
                  </h3>
                  <div className="space-y-2">
                    {results.categories.map((category) => (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => handleResultClick('category', category)}
                        className="flex items-center gap-4 p-4 bg-[var(--bg-app)] hover:bg-[var(--bg-card)] rounded-xl cursor-pointer transition-all border border-transparent hover:border-blue-500/30"
                      >
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          {getResultIcon('category')}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-[var(--text-main)]">
                            {category.name}
                          </p>
                          <p className="text-sm text-[var(--text-muted)]">
                            {category.productCount || 0} products
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Brands */}
              {results.brands && results.brands.length > 0 && (
                <div>
                  <h3 className="text-sm font-black text-[var(--text-muted)] uppercase tracking-wider mb-3 px-2">
                    Brands ({results.brands.length})
                  </h3>
                  <div className="space-y-2">
                    {results.brands.map((brand) => (
                      <motion.div
                        key={brand.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => handleResultClick('brand', brand)}
                        className="flex items-center gap-4 p-4 bg-[var(--bg-app)] hover:bg-[var(--bg-card)] rounded-xl cursor-pointer transition-all border border-transparent hover:border-purple-500/30"
                      >
                        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          {getResultIcon('brand')}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-[var(--text-main)]">
                            {brand.name}
                          </p>
                          <p className="text-sm text-[var(--text-muted)]">
                            {brand.productCount || 0} products
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders (Admin only) */}
              {results.orders && results.orders.length > 0 && (
                <div>
                  <h3 className="text-sm font-black text-[var(--text-muted)] uppercase tracking-wider mb-3 px-2">
                    Orders ({results.orders.length})
                  </h3>
                  <div className="space-y-2">
                    {results.orders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => handleResultClick('order', order)}
                        className="flex items-center gap-4 p-4 bg-[var(--bg-app)] hover:bg-[var(--bg-card)] rounded-xl cursor-pointer transition-all border border-transparent hover:border-orange-500/30"
                      >
                        <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          {getResultIcon('order')}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-[var(--text-main)]">
                            {order.orderNumber}
                          </p>
                          <p className="text-sm text-[var(--text-muted)]">
                            ₹{order.totalAmount?.toLocaleString('en-IN')} • {order.status}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {results && getTotalResults() > 0 && (
          <div className="p-4 border-t border-[var(--border-main)] bg-[var(--bg-app)]">
            <p className="text-sm text-[var(--text-muted)] text-center font-medium">
              Found {getTotalResults()} result{getTotalResults() !== 1 ? 's' : ''} for "{query}"
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default GlobalSearchBar;
