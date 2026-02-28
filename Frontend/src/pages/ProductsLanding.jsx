import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdStar, 
  MdSearch, 
  MdKeyboardArrowDown, 
  MdShoppingCart, 
  MdMenu, 
  MdClose, 
  MdFilterList, 
  MdSort, 
  MdFavorite, 
  MdLocationOn, 
  MdPhone, 
  MdEmail,
  MdAutoAwesome,
  MdVerified,
  MdLayers,
  MdRefresh
} from 'react-icons/md';
import { FaFacebookF, FaInstagram } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import ProductSidebarFilter from '../components/common/ProductSidebarFilter';
import customerService from '../services/customerService';

const GlowOrb = ({ className = "" }) => (
  <div className={`absolute rounded-full blur-[140px] opacity-20 animate-pulse ${className}`} />
);

const ProductsLanding = () => {
  const [searchParams] = useSearchParams();
  const brandParam = searchParams.get('brand');

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [maxProductPrice, setMaxProductPrice] = useState(100000);
  const [loading, setLoading] = useState(true);
  
  // High Density UI Pagination
  const [visibleCount, setVisibleCount] = useState(48);
  const observerTarget = useRef(null);

  const { isInWishlist, toggleWishlist } = useWishlist();
  const [showFilters, setShowFilters] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['all']);
  const [selectedBrands, setSelectedBrands] = useState(['all']);
  const [priceRange, setPriceRange] = useState(1000000);
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedMountTypes, setSelectedMountTypes] = useState(['all']);
  const [sortBy, setSortBy] = useState('popularity');

  // Handle brand redirection from landing page
  useEffect(() => {
    if (brandParam && brands.length > 0) {
      const matchedBrand = brands.find(b => b.value.toLowerCase() === brandParam.toLowerCase());
      if (matchedBrand) {
        setSelectedBrands([matchedBrand.value]);
      }
    }
  }, [brandParam, brands]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadData = async () => {
        try {
            setLoading(true);
            const [productsData, categoriesData, brandsData] = await Promise.all([
                customerService.getProducts(),
                customerService.getCategories(),
                customerService.getBrands()
            ]);
            
            const rawProducts = Array.isArray(productsData) ? productsData : (productsData?.products || productsData?.content || productsData?.data || []);
            const rawCategories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.categories || categoriesData?.content || categoriesData?.data || []);
            const rawBrands = Array.isArray(brandsData) ? brandsData : (brandsData?.brands || brandsData?.content || brandsData?.data || []);
            
            let currentMaxPrice = 100000;
            const normalizedProducts = rawProducts.map(p => {
                const priceValue = p.price !== undefined ? p.price : (p.amount !== undefined ? p.amount : (p.currentPrice !== undefined ? p.currentPrice : 0));
                const price = typeof priceValue === 'string' ? parseFloat(priceValue.replace(/[^0-9.]/g, '')) : (parseFloat(priceValue) || 0);
                
                if (price > currentMaxPrice) currentMaxPrice = price;
                
                const origPriceValue = p.originalPrice || p.mrp || p.basePrice || p.oldPrice || (price > 0 ? price * 1.2 : 0);
                const originalPrice = typeof origPriceValue === 'string' ? parseFloat(origPriceValue.replace(/[^0-9.]/g, '')) : (parseFloat(origPriceValue) || 0);

                const stock = parseInt(p.stockQuantity !== undefined ? p.stockQuantity : (p.stock !== undefined ? p.stock : (p.stockCount !== undefined ? p.stockCount : (p.quantity !== undefined ? p.quantity : (p.qty || p.inventory || 0))))) || 0;

                return {
                    ...p,
                    id: p.id || p.productId,
                    brand: p.brand && typeof p.brand === 'object' ? p.brand.name : (p.brand || 'No Brand'),
                    category: p.category && typeof p.category === 'object' ? p.category.name : (p.category || 'No Category'),
                    mountType: p.mountType || 'Other',
                    price: price,
                    originalPrice: originalPrice > price ? originalPrice : (price > 0 ? price * 1.2 : 0),
                    stock: stock,
                    rating: parseFloat(p.rating) || 0,
                    reviews: parseInt(p.reviews) || 0,
                    badge: p.badge || (stock === 0 ? 'Out of Stock' : (p.isNew ? 'New Arrival' : '')),
                    image: p.image || p.imageUrl || p.mainImage || '/placeholder-product.png'
                };
            });

            setProducts(normalizedProducts);
            if (currentMaxPrice > 0) {
                setMaxProductPrice(currentMaxPrice);
                setPriceRange(currentMaxPrice);
            }
            setCategories([{ value: 'all', label: 'All Categories' }, ...rawCategories.map(c => ({ value: typeof c === 'string' ? c : (c.name || c.label), label: typeof c === 'string' ? c : (c.name || c.label || c.value) }))]);
            setBrands([{ value: 'all', label: 'All Brands' }, ...rawBrands.map(b => ({ value: typeof b === 'string' ? b : (b.name || b.label), label: typeof b === 'string' ? b : (b.name || b.label || b.value) }))]);
        } catch (err) {
            console.error('Failed to load products landing data:', err);
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, []);

  const sortOptions = [
    { value: 'popularity', label: 'Popularity' },
    { value: 'price-low to high', label: 'Low Price To High Price' },
    { value: 'price-high to low', label: 'High Price To Low Price' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'newest', label: 'Newest First' },
  ];

  const currentSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label || 'Popularity';
  const { addToCart } = useCart();

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };
  
  // Reset pagination on filter change
  useEffect(() => {
    setVisibleCount(48);
  }, [selectedCategories, selectedBrands, priceRange, searchQuery, sortBy]);

  const mountTypes = useMemo(() => {
    const types = new Set(products.map(p => p.mountType).filter(t => t && t !== 'Other'));
    return ['all', ...Array.from(types), 'Other'];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategories.includes('all') || selectedCategories.includes(product.category);
      const matchesBrand = selectedBrands.includes('all') || selectedBrands.includes(product.brand);
      const matchesPrice = product.price <= priceRange;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesColor = selectedColor === 'all' || !product.color || product.color === selectedColor;
      const matchesMaterial = selectedMaterials.length === 0 || !product.material || selectedMaterials.includes(product.material);
      const matchesMount = selectedMountTypes.includes('all') || !product.mountType || selectedMountTypes.includes(product.mountType);
      return matchesCategory && matchesBrand && matchesPrice && matchesSearch && matchesColor && matchesMaterial && matchesMount;
    });
  }, [selectedCategories, selectedBrands, priceRange, searchQuery, selectedColor, selectedMaterials, selectedMountTypes, products]);

  const sortedProducts = useMemo(() => {
    let result = [...filteredProducts];
    if (sortBy === 'popularity') result.sort((a, b) => b.reviews - a.reviews);
    else if (sortBy === 'price-low to high') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high to low') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'newest') result.sort((a, b) => b.id - a.id);
    return result;
  }, [filteredProducts, sortBy]);

  const visibleProducts = sortedProducts.slice(0, visibleCount);
  
  // Infinite Scroll Handler
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < sortedProducts.length) {
          setVisibleCount((prev) => Math.min(prev + 24, sortedProducts.length));
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [visibleCount, sortedProducts.length]);

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Exclusive': return 'bg-indigo-600';
      case 'New Arrival': return 'bg-teal-600';
      case 'Hot Deal': return 'bg-sky-600';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-800 overflow-x-hidden font-sans selection:bg-teal-500/10">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.015]" />
      </div>

      <div className="relative z-10 py-8 md:py-16">
        <div className="w-full max-w-[1920px] mx-auto px-2 md:px-6 lg:px-10">
          
          {/* Compact Header experience */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8 md:mb-12">
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center lg:text-left"
            >
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                    <span className="text-[10px] font-black tracking-[0.4em] text-teal-600 uppercase">Premium Catalog</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none uppercase italic">
                   THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-indigo-500 to-sky-500">COLLECTION</span>
                </h1>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl flex flex-col md:flex-row gap-4"
            >
                <div className="flex-1 group bg-white p-1 rounded-full border border-slate-200 shadow-lg focus-within:border-teal-500 transition-all">
                    <div className="relative flex items-center">
                        <MdSearch className="absolute left-4 text-xl text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        <input
                           type="text"
                           placeholder="Search inventory..."
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:outline-none font-bold text-sm tracking-wide text-slate-800"
                        />
                    </div>
                </div>
                
                <div className="flex gap-2 justify-center">
                     <button 
                        onClick={() => setShowFilters(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-white shadow-md rounded-full border border-slate-100 hover:bg-teal-600 hover:text-white transition-all group"
                     >
                        <MdFilterList className="text-lg text-teal-600 group-hover:text-white" />
                        <span className="text-xs font-black tracking-widest uppercase">FILTERS</span>
                     </button>

                     <button 
                       onClick={() => setIsSortOpen(!isSortOpen)}
                       className="flex items-center gap-2 px-6 py-3 bg-white shadow-md rounded-full border border-slate-100 hover:bg-indigo-600 hover:text-white transition-all group"
                     >
                        <MdSort className="text-lg text-indigo-600 group-hover:text-white" />
                        <span className="text-xs font-black tracking-widest uppercase">{currentSortLabel}</span>
                     </button>
                </div>
            </motion.div>
          </div>

          <AnimatePresence>
            {isSortOpen && (
               <motion.div 
                  initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="fixed top-24 right-4 md:right-10 z-[80] bg-white rounded-2xl shadow-2xl p-2 border border-slate-100 w-64"
               >
                   <div className="flex justify-between items-center px-4 py-2 border-b border-slate-50 mb-2">
                      <span className="text-[10px] font-black uppercase text-slate-400">Sort By</span>
                      <MdClose className="cursor-pointer" onClick={() => setIsSortOpen(false)}/>
                   </div>
                  {sortOptions.map((opt) => (
                     <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setIsSortOpen(false); }}
                        className={`w-full text-left px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                           sortBy === opt.value ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'
                        }`}
                     >
                        {opt.label}
                     </button>
                  ))}
               </motion.div>
            )}
            {isSortOpen && <div className="fixed inset-0 z-[70] bg-transparent" onClick={() => setIsSortOpen(false)} />}
          </AnimatePresence>

          {/* Grid Layout - High Density */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
             {loading ? (
               // Loading Skeletons
               <>
                 {[...Array(24)].map((_, i) => (
                   <div key={i} className="bg-white rounded-xl border border-slate-100 animate-pulse flex flex-col h-64">
                     <div className="h-40 bg-slate-100 rounded-t-xl"></div>
                     <div className="p-3 space-y-2 flex-1">
                       <div className="h-3 bg-slate-100 rounded w-3/4"></div>
                       <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                     </div>
                   </div>
                 ))}
               </>
             ) : (
              <AnimatePresence mode="popLayout">
                 {visibleProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl border border-slate-100 hover:border-teal-200 hover:shadow-xl transition-all duration-300 group flex flex-col h-full overflow-hidden"
                  >
                     <div className="relative h-40 md:h-48 overflow-hidden bg-slate-50">
                        <img 
                          src={product.image} 
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
                        />
                        
                        <div className="absolute top-2 left-2">
                           <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-white ${getBadgeColor(product.badge)}`}>
                              {product.badge}
                           </span>
                        </div>
                        
                         <button 
                           onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                           className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90 ${isInWishlist(product.id) ? 'bg-red-500 text-white' : 'bg-white text-slate-300 hover:text-red-500'}`}
                         >
                            <MdFavorite size={12} />
                         </button>
                     </div>

                     <div className="p-3 flex flex-col flex-1">
                        <div className="flex items-center gap-1 mb-1 text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                           <span>{product.brand}</span>
                           <span className="text-teal-500">•</span>
                           <span className="text-teal-600 truncate">{product.category}</span>
                        </div>
                        <h3 className="text-xs font-black text-slate-900 mb-2 leading-tight group-hover:text-teal-600 transition-colors line-clamp-2 uppercase">
                           {product.name}
                        </h3>
                        
                        <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-50">
                           <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-900 tracking-tighter">₹{(product.price || 0).toLocaleString()}</span>
                              {product.originalPrice > product.price && (
                                <span className="text-[8px] font-bold text-red-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                              )}
                           </div>
                           <button
                             onClick={(e) => handleAddToCart(product, e)}
                             className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center text-white hover:bg-teal-600 transition-all shadow-lg active:scale-95"
                           >
                              <MdShoppingCart size={14} />
                           </button>
                        </div>
                     </div>
                  </motion.div>
                ))}
              </AnimatePresence>
             )}
           </div>
           
             {/* Load More Trigger */}
             <div ref={observerTarget} className="h-10 mt-8 flex items-center justify-center">
                {visibleCount < filteredProducts.length && !loading && (
                   <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                )}
             </div>

          {/* Empty State */}
          {!loading && filteredProducts.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                   <MdAutoAwesome className="text-4xl text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">No Matches</h3>
                <p className="text-slate-400 text-sm font-medium mb-6">Adjust filters to find inventory.</p>
                <button 
                   onClick={() => { setSelectedCategories(['all']); setSelectedBrands(['all']); setPriceRange(maxProductPrice); setSearchQuery(''); setSelectedColor('all'); setSelectedMaterials([]); setSelectedMountTypes(['all']); }}
                   className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-teal-600 transition-all shadow-lg"
                >
                   Reset All
                </button>
            </motion.div>
          )}

        </div>
      </div>

      {/* Side Filters Drawer */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilters(false)} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[55]" />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white z-[60] shadow-2xl p-6 flex flex-col overflow-y-auto" >
               <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Filters</h2>
                  <button onClick={() => setShowFilters(false)} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors" >
                     <MdClose size={24} />
                  </button>
               </div>
               <ProductSidebarFilter 
                  searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                  selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories} categories={categories}
                  selectedBrands={selectedBrands} setSelectedBrands={setSelectedBrands} brands={brands}
                  priceRange={priceRange} setPriceRange={setPriceRange} maxPrice={maxProductPrice}
                  types={mountTypes} selectedTypes={selectedMountTypes} setSelectedTypes={setSelectedMountTypes}
                  onClearFilters={() => {
                     setSelectedCategories(['all']); setSelectedBrands(['all']); setPriceRange(maxProductPrice); setSearchQuery(''); setSelectedColor('all'); setSelectedMaterials([]); setSelectedMountTypes(['all']);
                  }}
               />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductsLanding;