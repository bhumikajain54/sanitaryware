import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  MdKeyboardArrowDown
} from 'react-icons/md';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import ProductSidebarFilter from '../../components/common/ProductSidebarFilter';
import customerService from '../../services/customerService';

const FilterDropdown = ({ label, activeCount, children }) => {
   const [isOpen, setIsOpen] = useState(false);
   const dropdownRef = useRef(null);

   useEffect(() => {
      const handleClickOutside = (event) => {
         if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
         }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   return (
      <div className="relative" ref={dropdownRef}>
         <button 
           onClick={() => setIsOpen(!isOpen)}
           className={`flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${isOpen || activeCount > 0 ? 'border-teal-500 text-teal-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
         >
            <span>{label}</span>
            {activeCount > 0 && <span className="bg-teal-600 text-white w-4 h-4 flex items-center justify-center rounded-full text-[9px]">{activeCount}</span>}
            <MdKeyboardArrowDown className={`text-lg transition-transform ${isOpen ? 'rotate-180' : ''}`} />
         </button>
         <AnimatePresence>
            {isOpen && (
               <motion.div
                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: 10, scale: 0.95 }}
                 className="absolute top-full mt-2 left-0 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-4 max-h-[400px] overflow-y-auto"
               >
                  {children}
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
};

const CompactProductCard = ({ product, addToCart, toggleWishlist, isInWishlist }) => {
  const [imgSrc, setImgSrc] = useState(product.image);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(product.image);
    setHasError(false);
  }, [product.image]);

  return (
  <motion.div 
    layout
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="group bg-white rounded-xl overflow-hidden border border-slate-100 hover:border-teal-500 hover:shadow-xl transition-all duration-300 relative flex flex-col"
  >
    {/* Image Container */}
    <div className="relative aspect-square overflow-hidden bg-slate-50 flex items-center justify-center">
      {!hasError ? (
        <img
          src={imgSrc || '/placeholder.png'}
          alt={product.name}
          loading="lazy"
          onError={() => {
             setHasError(true);
             // Fallback to a generous default or avoid looping
             setImgSrc(null); 
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-slate-300 w-full h-full bg-slate-50">
           <MdSort className="text-4xl mb-2 opacity-20" />
           <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">No Image</span>
        </div>
      )}
      
      {/* Badges */}
      <div className="absolute top-2 left-2 flex flex-col gap-1">
         {product.badge && (
           <span className="px-2 py-1 bg-slate-900/90 text-white text-[9px] font-black uppercase tracking-widest rounded shadow-sm backdrop-blur-sm">
             {product.badge}
           </span>
         )}
         {product.discount > 0 && (
           <span className="px-2 py-1 bg-red-600/90 text-white text-[9px] font-black uppercase tracking-widest rounded shadow-sm backdrop-blur-sm">
             -{product.discount}%
           </span>
         )}
      </div>

      {/* Quick Actions overlay (Web style) */}
      <div className="absolute bottom-2 right-2 flex gap-2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
         <button
            onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
            className={`w-8 h-8 flex items-center justify-center rounded-lg shadow-lg transition-transform hover:scale-110 active:scale-95 ${
              isInWishlist(product.id) ? 'bg-red-500 text-white' : 'bg-white text-slate-400 hover:text-red-500'
            }`}
         >
            <MdFavorite size={16} />
         </button>
         <button
            onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }}
            className="w-8 h-8 bg-teal-600 text-white flex items-center justify-center rounded-lg shadow-lg hover:bg-teal-700 transition-transform hover:scale-110 active:scale-95"
         >
            <MdShoppingCart size={16} />
         </button>
      </div>
    </div>

    {/* Content */}
    <div className="p-3 flex flex-col flex-1 gap-1">
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        <span className="truncate">{product.brand}</span>
        <span className="text-teal-600 truncate max-w-[50%] text-right">{product.category}</span>
      </div>
      
      <h3 className="font-bold text-slate-800 text-sm leading-tight truncate group-hover:text-teal-600 transition-colors" title={product.name}>
        {product.name}
      </h3>

      <div className="mt-auto pt-2 flex items-baseline gap-2">
        <span className="text-base font-black text-slate-900">₹{product.price.toLocaleString()}</span>
        {product.originalPrice > product.price && (
          <span className="text-[10px] text-slate-400 line-through decoration-slate-300">
            ₹{product.originalPrice.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  </motion.div>
  );
};

const Products = () => {
  // --- Context & Hooks ---
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  
  // --- States ---
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['all']);
  const [selectedBrands, setSelectedBrands] = useState(['all']);
  const [priceRange, setPriceRange] = useState(100000);
  const [maxProductPrice, setMaxProductPrice] = useState(100000);
  
  // Sorting & Layout
  const [sortBy, setSortBy] = useState('popularity');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(16); // 4 rows of 4 cards

  // --- Data Loading ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [productsData, categoriesData, brandsData] = await Promise.all([
           customerService.getProducts(),
           customerService.getCategories(),
           customerService.getBrands()
        ]);
        
        // --- Normalization & Deduplication Logic based on Backend Entity ---
        const rawProducts = Array.isArray(productsData) ? productsData : (productsData?.products || []);
        let maxP = 0;
        
        // Use a map for deduplication by ID
        const uniqueProductsMap = new Map();
        
        rawProducts.forEach(p => {
            const id = p.id || p.productId;
            if (!id || uniqueProductsMap.has(id)) return;
            
            // Backend fields normalization
            const stockValue = p.stockQuantity !== undefined ? p.stockQuantity : 
                              (p.stock !== undefined ? p.stock : 
                              (p.quantity !== undefined ? p.quantity : 0));

            const price = parseFloat((p.price || p.amount || 0).toString().replace(/[^0-9.]/g, '')) || 0;
            if(price > maxP) maxP = price;
            
            uniqueProductsMap.set(id, {
                ...p,
                id,
                name: p.name || 'Untitled Product',
                price,
                originalPrice: parseFloat((p.originalPrice || p.mrp || 0).toString().replace(/[^0-9.]/g, '')) || (price * 1.2),
                image: p.mainImage || p.image || '/placeholder.png',
                mainImage: p.mainImage || p.image || '/placeholder.png',
                category: p.category?.name || (typeof p.category === 'string' ? p.category : 'General'),
                brand: p.brand?.name || (typeof p.brand === 'string' ? p.brand : 'Generic'),
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
        // Deduplicate categories by name
        const uniqueCats = Array.from(new Set(rawCats.map(c => c.name || c)));
        setCategories([{value: 'all', label: 'All Categories'}, ...uniqueCats.map(name => ({value: name, label: name}))]);
        
        const rawBrands = Array.isArray(brandsData) ? brandsData : (brandsData?.brands || []);
        // Deduplicate brands by name
        const uniqueBrands = Array.from(new Set(rawBrands.map(b => b.name || b)));
        setBrands([{value: 'all', label: 'All Brands'}, ...uniqueBrands.map(name => ({value: name, label: name}))]);

      } catch (err) {
        console.error("Data load failed", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- derived data ---
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
       const matchCat = selectedCategories.includes('all') || selectedCategories.some(c => p.category.toLowerCase().includes(c.toLowerCase()));
       const matchBrand = selectedBrands.includes('all') || selectedBrands.includes(p.brand);
       const matchPrice = p.price <= priceRange;
       const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
       return matchCat && matchBrand && matchPrice && matchSearch;
    });
  }, [products, selectedCategories, selectedBrands, priceRange, searchQuery]);

  const sortedProducts = useMemo(() => {
     let sorted = [...filteredProducts];
     if (sortBy === 'price-low') sorted.sort((a,b) => a.price - b.price);
     else if (sortBy === 'price-high') sorted.sort((a,b) => b.price - a.price);
     else if (sortBy === 'newest') sorted.sort((a,b) => b.id - a.id);
     return sorted;
  }, [filteredProducts, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedProducts.length / pageSize);
  const currentProducts = sortedProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
       setCurrentPage(newPage);
       window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
       
       {/* Top Header */}
       <div className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 md:px-8 py-4 shadow-sm">
          <div className="max-w-[1920px] mx-auto flex flex-col gap-4">
              
              <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* Brand */}
                  <div className="flex items-center gap-1">
                      <span className="text-xl font-black tracking-tight text-slate-900 uppercase">Sanitary</span>
                      <span className="text-xl font-light tracking-tight text-teal-600">Store</span>
                  </div>

                  {/* Search */}
                  <div className="flex-1 max-w-lg relative group">
                      <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-teal-600" />
                      <input 
                        type="text" 
                        placeholder="Search catalog..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      />
                  </div>
                  
                  {/* Sort By (Native Select) */}
                  <div className="flex items-center gap-2">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Sort:</span>
                     <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-lg px-3 py-2.5 focus:outline-none focus:border-teal-500 cursor-pointer"
                     >
                        <option value="popularity">Popularity</option>
                        <option value="newest">Newest</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                     </select>
                  </div>
              </div>

              {/* Horizontal Filter Bar */}
              <div className="flex flex-wrap items-center gap-2 md:gap-4 pb-1">
                   {/* Quick Filters */}
                   <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pr-4 border-r border-slate-100 mr-2">
                      {['All', 'WC', 'Basin', 'Faucet', 'Shower'].map(cat => (
                         <button
                            key={cat}
                            onClick={() => { setSelectedCategories(cat === 'All' ? ['all'] : [cat]); setCurrentPage(1); }}
                            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                               (cat === 'All' ? selectedCategories.includes('all') : selectedCategories.includes(cat))
                               ? 'bg-slate-900 text-white border-slate-900' 
                               : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                            }`}
                         >
                            {cat}
                         </button>
                      ))}
                   </div>
                   
                   {/* Dropdown Filters */}
                   <FilterDropdown label="Category" activeCount={selectedCategories.includes('all') ? 0 : selectedCategories.length}>
                      <div className="space-y-1">
                        {categories.map(cat => (
                           <label key={cat.value} className="flex items-center gap-3 cursor-pointer group py-1.5 hover:bg-slate-50 rounded px-1">
                              <input 
                                type="checkbox" 
                                className="accent-teal-600 w-4 h-4 rounded-sm"
                                checked={selectedCategories.includes(cat.value)}
                                onChange={() => {
                                   if(cat.value === 'all') setSelectedCategories(['all']);
                                   else {
                                      const newCats = selectedCategories.includes('all') ? [] : [...selectedCategories];
                                      if(newCats.includes(cat.value)) {
                                         const filtered = newCats.filter(c => c !== cat.value);
                                         setSelectedCategories(filtered.length ? filtered : ['all']);
                                      } else {
                                         setSelectedCategories([...newCats, cat.value]);
                                      }
                                   }
                                   setCurrentPage(1);
                                }}
                              />
                              <span className={`text-xs font-bold ${selectedCategories.includes(cat.value) ? 'text-teal-700' : 'text-slate-600'}`}>
                                 {cat.label}
                              </span>
                           </label>
                        ))}
                      </div>
                   </FilterDropdown>

                   <FilterDropdown label="Brand" activeCount={selectedBrands.includes('all') ? 0 : selectedBrands.length}>
                      <div className="space-y-1">
                        {brands.map(brand => (
                           <label key={brand.value} className="flex items-center gap-3 cursor-pointer group py-1.5 hover:bg-slate-50 rounded px-1">
                              <input 
                                type="checkbox" 
                                className="accent-teal-600 w-4 h-4 rounded-sm"
                                checked={selectedBrands.includes(brand.value)}
                                onChange={() => {
                                   if(brand.value === 'all') setSelectedBrands(['all']);
                                   else {
                                      const newBrands = selectedBrands.includes('all') ? [] : [...selectedBrands];
                                      if(newBrands.includes(brand.value)) {
                                         const filtered = newBrands.filter(b => b !== brand.value);
                                         setSelectedBrands(filtered.length ? filtered : ['all']);
                                      } else {
                                         setSelectedBrands([...newBrands, brand.value]);
                                      }
                                   }
                                   setCurrentPage(1);
                                }}
                              />
                              <span className={`text-xs font-bold ${selectedBrands.includes(brand.value) ? 'text-teal-700' : 'text-slate-600'}`}>
                                 {brand.label}
                              </span>
                           </label>
                        ))}
                      </div>
                   </FilterDropdown>

                   <FilterDropdown label="Price" activeCount={priceRange < maxProductPrice ? 1 : 0}>
                      <div className="px-2 py-2">
                           <div className="flex justify-between text-xs font-bold text-slate-800 mb-4">
                              <span>Max Price:</span>
                              <span>₹{priceRange.toLocaleString()}</span>
                           </div>
                           <input 
                              type="range" 
                              min="0" 
                              max={maxProductPrice} 
                              value={priceRange} 
                              onChange={(e) => setPriceRange(Number(e.target.value))}
                              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600 mb-2"
                           />
                           <div className="flex justify-between text-[10px] font-bold text-slate-400">
                              <span>₹0</span>
                              <span>₹{maxProductPrice.toLocaleString()}</span>
                           </div>
                      </div>
                   </FilterDropdown>

                   {(selectedCategories.length > 1 || !selectedCategories.includes('all') || !selectedBrands.includes('all') || priceRange < maxProductPrice) && (
                      <button 
                        onClick={() => { setSelectedCategories(['all']); setSelectedBrands(['all']); setPriceRange(maxProductPrice); setSearchQuery(''); }}
                        className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline ml-auto"
                      >
                         Clear Filters
                      </button>
                   )}
              </div>
          </div>
       </div>

       <div className="max-w-[1920px] mx-auto px-4 md:px-8 py-6">
            {/* MAIN CONTENT (Full Width) */}
            <main>
               {/* Results Stat line */}
               <div className="mb-6 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                   <span>{sortedProducts.length} Results Found</span>
                   <div className="hidden md:flex gap-1">
                      <button onClick={() => setViewMode('grid')} className={`p-1 rounded ${viewMode === 'grid' ? 'text-slate-900 bg-slate-200' : 'hover:bg-slate-100'}`}><MdGridView /></button>
                      <button onClick={() => setViewMode('list')} className={`p-1 rounded ${viewMode === 'list' ? 'text-slate-900 bg-slate-200' : 'hover:bg-slate-100'}`}><MdViewList /></button>
                   </div>
               </div>

               {/* Products Grid */}
               {loading ? (
                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {[...Array(20)].map((_, i) => (
                         <div key={i} className="bg-white rounded-xl h-64 animate-pulse border border-slate-100"></div>
                      ))}
                   </div>
               ) : currentProducts.length > 0 ? (
                   <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'grid-cols-1'}`}>
                      {currentProducts.map(product => (
                         viewMode === 'grid' ? (
                            <CompactProductCard 
                               key={product.id} 
                               product={product} 
                               addToCart={addToCart} 
                               toggleWishlist={toggleWishlist} 
                               isInWishlist={isInWishlist}
                            />
                         ) : (
                            <div key={product.id} className="bg-white rounded-xl p-4 border border-slate-100 flex gap-4 hover:border-teal-500 transition-all shadow-sm">
                               <div className="w-20 h-20 bg-slate-50 rounded-lg overflow-hidden shrink-0">
                                  <img src={product.image} className="w-full h-full object-cover" />
                                </div>
                               <div className="flex-1 flex items-center justify-between">
                                  <div>
                                       <h3 className="font-bold text-slate-900 text-sm mb-1">{product.name}</h3>
                                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{product.brand} • {product.category}</p>
                                  </div>
                                  <div className="text-right">
                                       <p className="font-black text-teal-600">₹{product.price.toLocaleString()}</p>
                                       <button onClick={() => addToCart(product, 1)} className="mt-2 px-4 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-teal-600">Add to Cart</button>
                                  </div>
                               </div>
                            </div>
                         )
                      ))}
                   </div>
               ) : (
                   <div className="py-24 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                      <MdSearch className="text-4xl text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">No Products Found</h3>
                   </div>
               )}

               {/* Pagination Controls */}
               {!loading && sortedProducts.length > 0 && (
                  <div className="flex items-center justify-center gap-2 mt-12 mb-12">
                     <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 hover:border-teal-500 hover:text-teal-600 transition-colors"
                     >
                        <MdKeyboardArrowLeft size={20} />
                     </button>
                     
                     <div className="flex items-center gap-1">
                        {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                           let p = idx + 1;
                           if (totalPages > 5 && currentPage > 3) p = currentPage - 2 + idx;
                           if (p > totalPages) return null;
                           
                           return (
                              <button 
                                 key={p}
                                 onClick={() => handlePageChange(p)}
                                 className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${
                                    currentPage === p 
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
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 hover:border-teal-500 hover:text-teal-600 transition-colors"
                     >
                        <MdKeyboardArrowRight size={20} />
                     </button>
                  </div>
               )}
            </main>
       </div>

       {/* Mobile Filters Drawer - Simplified */}
       <AnimatePresence>
          {isSidebarOpen && (
             <>
               <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
               <motion.div initial={{x:'-100%'}} animate={{x:0}} exit={{x:'-100%'}} className="fixed inset-y-0 left-0 w-80 bg-white z-[60] p-6 shadow-2xl overflow-y-auto">
                  <div className="flex justify-between items-center mb-8">
                     <h2 className="text-xl font-black uppercase tracking-tight">Filters</h2>
                     <button onClick={()=>setIsSidebarOpen(false)} className="p-2 bg-slate-100 rounded-lg"><MdClose /></button>
                  </div>
                  {/* Reuse Sidebar Filter for Mobile */}
                  <ProductSidebarFilter 
                     searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                     selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories} categories={categories}
                     selectedBrands={selectedBrands} setSelectedBrands={setSelectedBrands} brands={brands}
                     priceRange={priceRange} setPriceRange={setPriceRange} maxPrice={maxProductPrice}
                     types={[]} selectedTypes={[]} setSelectedTypes={()=>{}}
                     onClearFilters={() => { setSelectedCategories(['all']); setSelectedBrands(['all']); }}
                  />
               </motion.div>
             </>
          )}
       </AnimatePresence>

    </div>
  );
};

export default Products;
