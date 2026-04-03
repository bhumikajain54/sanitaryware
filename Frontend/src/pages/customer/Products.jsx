import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
   MdFilterList,
   MdSearch,
   MdSort,
   MdFavorite,
   MdShoppingCart,
   MdKeyboardArrowLeft,
   MdKeyboardArrowRight,
   MdGridView,
   MdViewList,
   MdCheck,
   MdClose,
   MdKeyboardArrowDown,
   MdCompareArrows
} from 'react-icons/md';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useComparison } from '../../context/ComparisonContext';
import ProductSidebarFilter from '../../components/common/ProductSidebarFilter';
import customerService from '../../services/customerService';
import ComparisonBar from '../../components/common/ComparisonBar';
import ComparisonModal from '../../components/common/ComparisonModal';
import AddToCartButton from '../../components/common/AddToCartButton';
import SafeImage from '../../components/common/SafeImage';

/* ─── FilterDropdown ─── */
const FilterDropdown = ({ label, activeCount, children }) => {
   const [isOpen, setIsOpen] = useState(false);
   const dropdownRef = useRef(null);

   useEffect(() => {
      const handleClickOutside = (e) => {
         if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   return (
      <div className="relative flex-shrink-0" ref={dropdownRef}>
         <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2 bg-white border rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${isOpen || activeCount > 0
               ? 'border-teal-500 text-teal-700 shadow-sm'
               : 'border-slate-200 text-slate-600 hover:border-slate-300'
               }`}
         >
            <span>{label}</span>
            {activeCount > 0 && (
               <span className="bg-teal-600 text-white w-4 h-4 flex items-center justify-center rounded-full text-[8px] flex-shrink-0">
                  {activeCount}
               </span>
            )}
            <MdKeyboardArrowDown className={`text-base sm:text-lg transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
         </button>
         <AnimatePresence>
            {isOpen && (
               <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full mt-2 left-0 w-56 sm:w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-3 sm:p-4 max-h-[320px] sm:max-h-[400px] overflow-y-auto"
               >
                  {children}
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
};

/* ─── CompactProductCard ─── */
const CompactProductCard = ({ product, addToCart, toggleWishlist, isInWishlist, isInComparison, toggleComparison }) => {
   const [imgSrc, setImgSrc] = useState(product.image);
   const [hasError, setHasError] = useState(false);

   useEffect(() => { setImgSrc(product.image); setHasError(false); }, [product.image]);

   return (
      <motion.div
         layout
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         className="group bg-white rounded-xl overflow-hidden border border-slate-100 hover:border-teal-500 hover:shadow-xl transition-all duration-300 relative flex flex-col"
      >
         {/* Image */}
         <div className="relative aspect-square overflow-hidden bg-slate-50 flex items-center justify-center">
            <Link to={`/product/${product.id}`} className="w-full h-full block">
               <SafeImage
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 bg-slate-50"
                  onErrorCapture={(e) => {
                     e.currentTarget.src = '/Logo2.png';
                  }}
               />
            </Link>

            {/* Badges */}
            <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 flex flex-col gap-1">
               {product.badge && (
                  <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-slate-900/90 text-white text-[7px] sm:text-[9px] font-black uppercase tracking-widest rounded shadow-sm backdrop-blur-sm">
                     {product.badge}
                  </span>
               )}
               {product.discount > 0 && (
                  <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-600/90 text-white text-[7px] sm:text-[9px] font-black uppercase tracking-widest rounded shadow-sm backdrop-blur-sm">
                     -{product.discount}%
                  </span>
               )}
            </div>

            {/* Compare Badge — Mobile Friendly */}
            <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2">
               <button
                  onClick={(e) => { e.stopPropagation(); toggleComparison(product); }}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[7px] sm:text-[9px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg transition-all border ${isInComparison(product.id)
                        ? 'bg-teal-500 text-white border-teal-400'
                        : 'bg-white/80 text-slate-800 border-white/50 hover:bg-white'
                     }`}
               >
                  <MdCompareArrows size={10} className="sm:hidden" />
                  <MdCompareArrows size={12} className="hidden sm:block" />
                  <span>{isInComparison(product.id) ? 'Added' : 'Compare'}</span>
               </button>
            </div>

            {/* Quick actions — always visible on mobile, hover on desktop */}
            <div className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 flex gap-1.5 sm:gap-2 sm:translate-y-12 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 transition-all duration-300">
               <button
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                  className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg shadow-lg transition-transform hover:scale-110 active:scale-95 ${isInWishlist(product.id) ? 'bg-red-500 text-white' : 'bg-white text-slate-400 hover:text-red-500'
                     }`}
               >
                  <MdFavorite size={14} className="sm:hidden" />
                  <MdFavorite size={16} className="hidden sm:block" />
               </button>
               <AddToCartButton 
                  product={product} 
                  compact 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl"
               />
            </div>
         </div>

         {/* Content */}
         <div className="p-2 sm:p-3 flex flex-col flex-1 gap-0.5 sm:gap-1">
            <div className="flex items-center justify-between text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">
               <span className="truncate">{product.brand}</span>
               <span className="text-teal-600 truncate max-w-[45%] sm:max-w-[50%] text-right">{product.category}</span>
            </div>
            <Link to={`/product/${product.id}`} className="block">
               <h3 className="font-bold text-slate-800 text-[11px] sm:text-sm leading-tight truncate group-hover:text-teal-600 transition-colors" title={product.name}>
                  {product.name}
               </h3>
            </Link>
            <div className="mt-auto pt-1.5 sm:pt-2 flex items-baseline gap-1.5 sm:gap-2">
               <span className="text-sm sm:text-base font-black text-slate-900">₹{product.price.toLocaleString()}</span>
               {product.originalPrice > product.price && (
                  <span className="text-[9px] sm:text-[10px] text-slate-400 line-through decoration-slate-300">
                     ₹{product.originalPrice.toLocaleString()}
                  </span>
               )}
            </div>
         </div>
      </motion.div>
   );
};

/* ─── Products Page ─── */
const Products = () => {
   const { isInWishlist, toggleWishlist } = useWishlist();
   const { addToCart } = useCart();
   const { comparedProducts, addToComparison, isInComparison } = useComparison();
   const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

   const [loading, setLoading] = useState(true);
   const [products, setProducts] = useState([]);
   const [categories, setCategories] = useState([]);
   const [brands, setBrands] = useState([]);
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedCategories, setSelectedCategories] = useState(['all']);
   const [selectedBrands, setSelectedBrands] = useState(['all']);
   const [priceRange, setPriceRange] = useState(100000);
   const [maxProductPrice, setMaxProductPrice] = useState(100000);
   const [sortBy, setSortBy] = useState('popularity');
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
   const [viewMode, setViewMode] = useState('grid');
   const [currentPage, setCurrentPage] = useState(1);
   const [pageSize] = useState(16);

   useEffect(() => {
      const loadData = async () => {
         setLoading(true);
         try {
            const [productsData, categoriesData, brandsData] = await Promise.all([
               customerService.getProducts(),
               customerService.getCategories(),
               customerService.getBrands()
            ]);

            const rawProducts = Array.isArray(productsData) ? productsData : (productsData?.products || []);
            let maxP = 0;
            const uniqueProductsMap = new Map();

            rawProducts.forEach(p => {
               const id = p.id || p.productId;
               if (!id || uniqueProductsMap.has(id)) return;
               const stockValue = p.stockQuantity !== undefined ? p.stockQuantity :
                  (p.stock !== undefined ? p.stock : (p.quantity !== undefined ? p.quantity : 0));
               const price = parseFloat((p.price || p.amount || 0).toString().replace(/[^0-9.]/g, '')) || 0;
               if (price > maxP) maxP = price;
               uniqueProductsMap.set(id, {
                  ...p, id,
                  name: p.name || 'Untitled Product', price,
                  originalPrice: parseFloat((p.originalPrice || p.mrp || 0).toString().replace(/[^0-9.]/g, '')) || (price * 1.2),
                   image: (Array.isArray(p.images) && p.images.length) ? p.images[0] : (p.mainImage || p.image || '/Logo2.png'),
                   mainImage: (Array.isArray(p.images) && p.images.length) ? p.images[0] : (p.mainImage || p.image || '/Logo2.png'),
                  category: typeof p.category === 'string' ? p.category : (p.category?.name || 'General'),
                  brand: typeof p.brand === 'string' ? p.brand : (p.brand?.name || 'Generic'),
                  stock: Math.max(0, parseInt(stockValue)),
                  stockQuantity: Math.max(0, parseInt(stockValue)),
                  active: p.active !== undefined ? p.active : true,
                  badge: p.badge || (parseInt(stockValue) === 0 ? 'Sold Out' : ''),
                  discount: p.discount || 0
               });
            });

            const deduplicated = Array.from(uniqueProductsMap.values());
            setProducts(deduplicated);
            setMaxProductPrice(maxP);
            setPriceRange(maxP);

            const rawCats = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.categories || []);
            const uniqueCats = Array.from(new Set(rawCats.map(c => typeof c === 'string' ? c : (c?.name || 'Unknown'))));
            setCategories([{ value: 'all', label: 'All Categories' }, ...uniqueCats.map(name => ({ value: name, label: name }))]);

            const rawBrands = Array.isArray(brandsData) ? brandsData : (brandsData?.brands || []);
            const uniqueBrands = Array.from(new Set(rawBrands.map(b => typeof b === 'string' ? b : (b?.name || 'Generic'))));
            setBrands([{ value: 'all', label: 'All Brands' }, ...uniqueBrands.map(name => ({ value: name, label: name }))]);
         } catch (err) {
            console.error('Data load failed', err);
         } finally {
            setLoading(false);
         }
      };
      loadData();
   }, []);

   const filteredProducts = useMemo(() => products.filter(p => {
      const matchCat = selectedCategories.includes('all') || selectedCategories.some(c => p.category.toLowerCase().includes(c.toLowerCase()));
      const matchBrand = selectedBrands.includes('all') || selectedBrands.includes(p.brand);
      const matchPrice = p.price <= priceRange;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchBrand && matchPrice && matchSearch;
   }), [products, selectedCategories, selectedBrands, priceRange, searchQuery]);

   const sortedProducts = useMemo(() => {
      const sorted = [...filteredProducts];
      if (sortBy === 'price-low') sorted.sort((a, b) => a.price - b.price);
      else if (sortBy === 'price-high') sorted.sort((a, b) => b.price - a.price);
      else if (sortBy === 'newest') sorted.sort((a, b) => b.id - a.id);
      return sorted;
   }, [filteredProducts, sortBy]);

   const totalPages = Math.ceil(sortedProducts.length / pageSize);
   const currentProducts = sortedProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

   const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
         setCurrentPage(newPage);
         window.scrollTo({ top: 0, behavior: 'smooth' });
      }
   };

   const QUICK_CATS = ['All', 'WC', 'Basin', 'Faucet', 'Shower'];
   const hasActiveFilters = !selectedCategories.includes('all') || !selectedBrands.includes('all') || priceRange < maxProductPrice || searchQuery;

   return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800">

         {/* ─── Sticky Top Header ─── */}
         <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
            <div className="max-w-[1920px] mx-auto px-3 sm:px-5 md:px-6 lg:px-8 py-3 sm:py-4 flex flex-col gap-2.5 sm:gap-3 md:gap-4">

               {/* Row 1: Brand + Search + Sort */}
               <div className="flex items-center gap-2 sm:gap-3 md:gap-4">

                  {/* Brand name */}
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                     <span className="text-base sm:text-lg md:text-xl font-black tracking-tight text-slate-900 uppercase">Sanitary</span>
                     <span className="text-base sm:text-lg md:text-xl font-light tracking-tight text-teal-600">Store</span>
                  </div>

                  {/* Search */}
                  <div className="flex-1 relative group min-w-0">
                     <MdSearch className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base sm:text-lg group-focus-within:text-teal-600 z-10" />
                     <input
                        type="text"
                        placeholder="Search catalog..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none"
                     />
                  </div>

                  {/* Mobile filter trigger */}
                  <button
                     onClick={() => setIsSidebarOpen(true)}
                     className="sm:hidden flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-wider flex-shrink-0 bg-white"
                  >
                     <MdFilterList className="text-base" />
                     Filters
                  </button>

                  {/* Sort select */}
                  <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                     <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:inline">Sort:</span>
                     <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-white border border-slate-200 text-slate-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 focus:outline-none focus:border-teal-500 cursor-pointer"
                     >
                        <option value="popularity">Popularity</option>
                        <option value="newest">Newest</option>
                        <option value="price-low">Price ↑</option>
                        <option value="price-high">Price ↓</option>
                     </select>
                  </div>
               </div>

               {/* Row 2: Filter bar — desktop only */}
               <div className="hidden sm:flex flex-wrap items-center gap-2 md:gap-3 pb-0.5">

                  {/* Quick category pills */}
                  <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pr-3 sm:pr-4 border-r border-slate-100 mr-1 sm:mr-2">
                     {QUICK_CATS.map(cat => (
                        <button
                           key={cat}
                           onClick={() => { setSelectedCategories(cat === 'All' ? ['all'] : [cat]); setCurrentPage(1); }}
                           className={`whitespace-nowrap px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all border ${(cat === 'All' ? selectedCategories.includes('all') : selectedCategories.includes(cat))
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                              }`}
                        >
                           {cat}
                        </button>
                     ))}
                  </div>

                  {/* Dropdown filters */}
                  <FilterDropdown label="Category" activeCount={selectedCategories.includes('all') ? 0 : selectedCategories.length}>
                     <div className="space-y-1">
                        {categories.map(cat => (
                           <label key={cat.value} className="flex items-center gap-2.5 sm:gap-3 cursor-pointer py-1 sm:py-1.5 hover:bg-slate-50 rounded px-1">
                              <input type="checkbox" className="accent-teal-600 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm"
                                 checked={selectedCategories.includes(cat.value)}
                                 onChange={() => {
                                    if (cat.value === 'all') { setSelectedCategories(['all']); }
                                    else {
                                       const cur = selectedCategories.includes('all') ? [] : [...selectedCategories];
                                       if (cur.includes(cat.value)) {
                                          const f = cur.filter(c => c !== cat.value);
                                          setSelectedCategories(f.length ? f : ['all']);
                                       } else { setSelectedCategories([...cur, cat.value]); }
                                    }
                                    setCurrentPage(1);
                                 }}
                              />
                              <span className={`text-[10px] sm:text-xs font-bold ${selectedCategories.includes(cat.value) ? 'text-teal-700' : 'text-slate-600'}`}>{cat.label}</span>
                           </label>
                        ))}
                     </div>
                  </FilterDropdown>

                  <FilterDropdown label="Brand" activeCount={selectedBrands.includes('all') ? 0 : selectedBrands.length}>
                     <div className="space-y-1">
                        {brands.map(brand => (
                           <label key={brand.value} className="flex items-center gap-2.5 sm:gap-3 cursor-pointer py-1 sm:py-1.5 hover:bg-slate-50 rounded px-1">
                              <input type="checkbox" className="accent-teal-600 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm"
                                 checked={selectedBrands.includes(brand.value)}
                                 onChange={() => {
                                    if (brand.value === 'all') { setSelectedBrands(['all']); }
                                    else {
                                       const cur = selectedBrands.includes('all') ? [] : [...selectedBrands];
                                       if (cur.includes(brand.value)) {
                                          const f = cur.filter(b => b !== brand.value);
                                          setSelectedBrands(f.length ? f : ['all']);
                                       } else { setSelectedBrands([...cur, brand.value]); }
                                    }
                                    setCurrentPage(1);
                                 }}
                              />
                              <span className={`text-[10px] sm:text-xs font-bold ${selectedBrands.includes(brand.value) ? 'text-teal-700' : 'text-slate-600'}`}>{brand.label}</span>
                           </label>
                        ))}
                     </div>
                  </FilterDropdown>

                  <FilterDropdown label="Price" activeCount={priceRange < maxProductPrice ? 1 : 0}>
                     <div className="px-1 sm:px-2 py-2">
                        <div className="flex justify-between text-xs font-bold text-slate-800 mb-3 sm:mb-4">
                           <span>Max Price:</span>
                           <span>₹{priceRange.toLocaleString()}</span>
                        </div>
                        <input type="range" min="0" max={maxProductPrice} value={priceRange}
                           onChange={(e) => setPriceRange(Number(e.target.value))}
                           className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600 mb-2"
                        />
                        <div className="flex justify-between text-[9px] sm:text-[10px] font-bold text-slate-400">
                           <span>₹0</span>
                           <span>₹{maxProductPrice.toLocaleString()}</span>
                        </div>
                     </div>
                  </FilterDropdown>

                  {hasActiveFilters && (
                     <button
                        onClick={() => { setSelectedCategories(['all']); setSelectedBrands(['all']); setPriceRange(maxProductPrice); setSearchQuery(''); }}
                        className="text-[9px] sm:text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline ml-auto flex-shrink-0"
                     >
                        Clear Filters
                     </button>
                  )}
               </div>
            </div>
         </div>

         {/* ─── Main Content ─── */}
         <div className="max-w-[1920px] mx-auto px-3 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6">

            {/* Results bar */}
            <div className="mb-3 sm:mb-4 md:mb-6 flex items-center justify-between text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">
               <span>{sortedProducts.length} Results</span>
               <div className="flex items-center gap-2 sm:gap-3">
                  {/* Mobile sort */}
                  <select
                     value={sortBy}
                     onChange={(e) => setSortBy(e.target.value)}
                     className="sm:hidden bg-white border border-slate-200 text-slate-700 text-[10px] font-bold rounded-lg px-2 py-1.5 focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                     <option value="popularity">Popularity</option>
                     <option value="newest">Newest</option>
                     <option value="price-low">Price ↑</option>
                     <option value="price-high">Price ↓</option>
                  </select>

                  {/* View mode toggles — tablet+ */}
                  <div className="hidden sm:flex gap-1">
                     <button onClick={() => setViewMode('grid')} className={`p-1 sm:p-1.5 rounded ${viewMode === 'grid' ? 'text-slate-900 bg-slate-200' : 'hover:bg-slate-100'}`}>
                        <MdGridView className="text-base sm:text-lg" />
                     </button>
                     <button onClick={() => setViewMode('list')} className={`p-1 sm:p-1.5 rounded ${viewMode === 'list' ? 'text-slate-900 bg-slate-200' : 'hover:bg-slate-100'}`}>
                        <MdViewList className="text-base sm:text-lg" />
                     </button>
                  </div>
               </div>
            </div>

            {/* Product Grid / List */}
            {loading ? (
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3 md:gap-4">
                  {[...Array(12)].map((_, i) => (
                     <div key={i} className="bg-white rounded-xl h-48 sm:h-56 md:h-64 animate-pulse border border-slate-100" />
                  ))}
               </div>
            ) : currentProducts.length > 0 ? (
               <div className={`grid gap-2.5 sm:gap-3 md:gap-4 ${viewMode === 'grid'
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                  : 'grid-cols-1'
                  }`}>
                  {currentProducts.map(product => (
                     viewMode === 'grid' ? (
                        <CompactProductCard
                           key={product.id}
                           product={product}
                           addToCart={addToCart}
                           toggleWishlist={toggleWishlist}
                           isInWishlist={isInWishlist}
                           isInComparison={isInComparison}
                           toggleComparison={addToComparison}
                        />
                     ) : (
                        /* List view */
                        <div key={product.id} className="bg-white rounded-xl p-3 sm:p-4 border border-slate-100 flex gap-3 sm:gap-4 hover:border-teal-500 transition-all shadow-sm">
                           <Link to={`/product/${product.id}`} className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0 group/img">
                              <SafeImage
                                 src={product.image}
                                 alt={product.name}
                                 className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                              />
                           </Link>
                           <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                 <Link to={`/product/${product.id}`} className="hover:text-teal-600 transition-colors">
                                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm mb-0.5 sm:mb-1 truncate">{product.name}</h3>
                                 </Link>
                                 <p className="text-[8px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                    {product.brand} • {product.category}
                                 </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                 <p className="font-black text-teal-600 text-sm sm:text-base">₹{product.price.toLocaleString()}</p>
                                 <AddToCartButton 
                                    product={product} 
                                    className="mt-2 text-xs py-2 px-4 rounded-xl" 
                                 />
                              </div>
                           </div>
                        </div>
                     )
                  ))}
               </div>
            ) : (
               <div className="py-16 sm:py-20 md:py-24 text-center bg-white rounded-xl sm:rounded-2xl border border-dashed border-slate-200">
                  <MdSearch className="text-3xl sm:text-4xl text-slate-300 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">No Products Found</h3>
               </div>
            )}

            {/* ─── Pagination ─── */}
            {!loading && sortedProducts.length > 0 && (
               <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-8 sm:mt-10 md:mt-12 mb-6 sm:mb-8 md:mb-12">
                  <button
                     onClick={() => handlePageChange(currentPage - 1)}
                     disabled={currentPage === 1}
                     className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:border-teal-500 hover:text-teal-600 transition-colors"
                  >
                     <MdKeyboardArrowLeft size={18} />
                  </button>

                  <div className="flex items-center gap-1 sm:gap-1.5">
                     {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                        let p = idx + 1;
                        if (totalPages > 5 && currentPage > 3) p = currentPage - 2 + idx;
                        if (p > totalPages) return null;
                        return (
                           <button
                              key={p}
                              onClick={() => handlePageChange(p)}
                              className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center rounded-lg font-bold text-xs sm:text-sm transition-all ${currentPage === p
                                 ? 'bg-slate-900 text-white shadow-lg'
                                 : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400'
                                 }`}
                           >
                              {p}
                           </button>
                        );
                     })}
                  </div>

                  <button
                     onClick={() => handlePageChange(currentPage + 1)}
                     disabled={currentPage === totalPages}
                     className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:border-teal-500 hover:text-teal-600 transition-colors"
                  >
                     <MdKeyboardArrowRight size={18} />
                  </button>
               </div>
            )}
         </div>

         {/* ─── Mobile Filters Drawer ─── */}
         <AnimatePresence>
            {isSidebarOpen && (
               <>
                  <motion.div
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                     onClick={() => setIsSidebarOpen(false)}
                     className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                  />
                  <motion.div
                     initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                     transition={{ type: 'tween', duration: 0.25 }}
                     className="fixed inset-y-0 left-0 w-[85vw] max-w-xs sm:max-w-sm bg-white z-[60] shadow-2xl overflow-y-auto"
                  >
                     <div className="flex justify-between items-center p-4 sm:p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
                        <h2 className="text-base sm:text-xl font-black uppercase tracking-tight">Filters</h2>
                        <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 sm:p-2 bg-slate-100 rounded-lg">
                           <MdClose className="text-base sm:text-lg" />
                        </button>
                     </div>

                     {/* Mobile sort inside drawer */}
                     <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100">
                        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sort By</p>
                        <select
                           value={sortBy}
                           onChange={(e) => setSortBy(e.target.value)}
                           className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                        >
                           <option value="popularity">Popularity</option>
                           <option value="newest">Newest</option>
                           <option value="price-low">Price: Low to High</option>
                           <option value="price-high">Price: High to Low</option>
                        </select>
                     </div>

                     {/* Quick category pills in drawer */}
                     <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100">
                        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Quick Filter</p>
                        <div className="flex flex-wrap gap-2">
                           {QUICK_CATS.map(cat => (
                              <button
                                 key={cat}
                                 onClick={() => { setSelectedCategories(cat === 'All' ? ['all'] : [cat]); setCurrentPage(1); }}
                                 className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${(cat === 'All' ? selectedCategories.includes('all') : selectedCategories.includes(cat))
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white text-slate-500 border-slate-200'
                                    }`}
                              >
                                 {cat}
                              </button>
                           ))}
                        </div>
                     </div>

                     <div className="p-4 sm:p-5">
                        <ProductSidebarFilter
                           searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                           selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories} categories={categories}
                           selectedBrands={selectedBrands} setSelectedBrands={setSelectedBrands} brands={brands}
                           priceRange={priceRange} setPriceRange={setPriceRange} maxPrice={maxProductPrice}
                           types={[]} selectedTypes={[]} setSelectedTypes={() => { }}
                           onClearFilters={() => { setSelectedCategories(['all']); setSelectedBrands(['all']); }}
                        />
                     </div>

                     {/* Apply button */}
                     <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 sm:p-5">
                        <button
                           onClick={() => setIsSidebarOpen(false)}
                           className="w-full py-3 bg-teal-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-teal-500/20 hover:bg-teal-700 transition-colors"
                        >
                           Show {filteredProducts.length} Results
                        </button>
                     </div>
                  </motion.div>
               </>
            )}
         </AnimatePresence>

         {/* ─── Comparison UI ─── */}
         <AnimatePresence>
            {comparedProducts?.length > 0 && (
               <ComparisonBar key="bar" onCompare={() => setIsComparisonModalOpen(true)} />
            )}
            {isComparisonModalOpen && (
               <ComparisonModal 
                  key="modal" 
                  isOpen={isComparisonModalOpen} 
                  onClose={() => setIsComparisonModalOpen(false)} 
               />
            )}
         </AnimatePresence>
      </div>
   );
};

export default Products;