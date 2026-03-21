import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdStar, MdStarHalf, MdStarOutline,
  MdAdd, MdRemove, MdShoppingCart,
  MdFavoriteBorder, MdShare, MdVerified,
  MdLocalShipping, MdSecurity,
  MdFilterList, MdClose, MdSort,
  MdKeyboardArrowDown, MdFavorite
} from 'react-icons/md';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import ProductSidebarFilter from '../../components/common/ProductSidebarFilter';
import customerService from '../../services/customerService';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [pincode, setPincode] = useState('');
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['all']);
  const [selectedBrands, setSelectedBrands] = useState(['all']);
  const [priceRange, setPriceRange] = useState(100000);
  const [selectedMountTypes, setSelectedMountTypes] = useState(['all']);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');

  const normalizeProduct = (p) => {
    if (!p) return null;
    const priceValue = p.price ?? p.amount ?? p.currentPrice ?? 0;
    const price = parseFloat(String(priceValue).replace(/[^0-9.]/g, '')) || 0;
    const origPriceValue = p.originalPrice || p.mrp || p.basePrice || p.oldPrice || (price > 0 ? price * 1.2 : 0);
    const originalPrice = parseFloat(String(origPriceValue).replace(/[^0-9.]/g, '')) || 0;
    const stock = parseInt(p.stockQuantity ?? p.stock ?? p.stockCount ?? p.quantity ?? p.qty ?? p.inventory ?? 0) || 0;
    const discount = p.discount || (originalPrice > price && originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);
    return {
      ...p,
      id: p.id || p.productId,
      brand: p.brand && typeof p.brand === 'object' ? p.brand.name : (p.brand || 'No Brand'),
      category: p.category && typeof p.category === 'object' ? p.category.name : (p.category || 'No Category'),
      mountType: p.mountType || 'Other',
      price, originalPrice: originalPrice > price ? originalPrice : (price > 0 ? price * 1.2 : 0),
      stockCount: stock, stock, inStock: stock > 0, discount,
      rating: parseFloat(p.rating || 0),
      reviewsCount: parseInt(p.reviews || 0),
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image || '/Logo2.png'],
      specifications: p.specifications || {},
      features: Array.isArray(p.features) ? p.features : []
    };
  };

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const [productData, productsResponse] = await Promise.all([
          customerService.getProductById(id),
          customerService.getProducts({ limit: 8, category: 'all' })
        ]);
        let reviewsData = [];
        try { reviewsData = await customerService.getReviewsByProduct(id); } catch (e) { }
        const norm = normalizeProduct(productData);
        setProduct(norm);
        const rawRelated = Array.isArray(productsResponse) ? productsResponse : (productsResponse?.products || productsResponse?.content || productsResponse?.data || []);
        setRelatedProducts(rawRelated.map(normalizeProduct).filter(p => p?.id !== norm?.id));
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      } catch (err) {
        console.error('Failed to fetch product details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
    window.scrollTo(0, 0);
  }, [id]);

  const getBadgeColor = (badge) => ({
    Exclusive: 'bg-teal-600', 'New Arrival': 'bg-teal-500', 'Hot Deal': 'bg-orange-600',
    Premium: 'bg-blue-600', Sale: 'bg-red-600', Trending: 'bg-sky-600'
  }[badge] || 'bg-gray-600');

  const categoriesList = [
    { value: 'all', label: 'All Categories' }, { value: 'toilets', label: 'Toilets' },
    { value: 'basins', label: 'Wash Basins' }, { value: 'faucets', label: 'Faucets' },
    { value: 'showers', label: 'Showers' }, { value: 'accessories', label: 'Accessories' },
    { value: 'sinks', label: 'Kitchen Sinks' }
  ];
  const brandsList = [
    { value: 'all', label: 'All Brands' }, { value: 'CERA', label: 'CERA' },
    { value: 'Aquagold', label: 'Aquagold' }, { value: 'Waterflow', label: 'Waterflow' },
    { value: 'Plasto', label: 'Plasto' }, { value: 'Aquarium', label: 'Aquarium' }
  ];

  const handleAddToCart = () => { if (product) { addToCart(product, quantity); alert(`${quantity} x ${product.name} added to cart!`); } };
  const handleBuyNow = () => { if (product) { addToCart(product, quantity); navigate('/checkout'); } };

  const filteredRelated = relatedProducts.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) && item.price <= priceRange
  );

  const renderStars = (rating) => {
    const full = Math.floor(rating || 0);
    const half = (rating || 0) % 1 !== 0;
    const empty = 5 - Math.ceil(rating || 0);
    return [
      ...Array(full).fill(0).map((_, i) => <MdStar key={`f${i}`} className="text-yellow-400" />),
      ...(half ? [<MdStarHalf key="h" className="text-yellow-400" />] : []),
      ...Array(empty).fill(0).map((_, i) => <MdStarOutline key={`e${i}`} className="text-yellow-400" />)
    ];
  };

  /* Loading */
  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
      <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  /* Not Found */
  if (!product) return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] mb-4">Product Not Found</h1>
      <Link to="/products" className="bg-teal-600 text-white px-6 sm:px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-teal-700 transition-all">
        Go to Shop
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-app)] py-4 sm:py-6 md:py-8 font-inter">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 md:px-6 lg:px-8">

        {/* ─── Breadcrumb ─── */}
        <div className="mb-4 sm:mb-6 md:mb-8 flex items-center flex-wrap gap-1 sm:gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[var(--text-muted)]">
          <Link to="/" className="hover:text-teal-600 transition-colors whitespace-nowrap">Home</Link>
          <span className="text-[var(--border-main)]">/</span>
          <Link to="/products" className="hover:text-teal-600 transition-colors whitespace-nowrap">Shop</Link>
          <span className="text-[var(--border-main)]">/</span>
          <span className="text-teal-600 truncate max-w-[140px] sm:max-w-[250px] md:max-w-none">{product.name}</span>
        </div>

        {/* ─── Main Product Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10 md:mb-12">

          {/* Images */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-[var(--bg-card)] rounded-2xl sm:rounded-3xl p-3 sm:p-5 md:p-8 shadow-xl shadow-teal-500/5 mb-3 sm:mb-4 md:mb-6 border border-[var(--border-main)]"
            >
              <img
                src={product.images[selectedImage] || '/Logo2.png'}
                alt={product.name}
                onError={(e) => { e.target.src = '/Logo2.png'; e.target.className = 'w-full h-56 sm:h-80 md:h-[400px] lg:h-[500px] object-contain p-8 opacity-40'; }}
                className="w-full h-56 sm:h-80 md:h-[400px] lg:h-[500px] object-contain rounded-xl sm:rounded-2xl"
              />
            </motion.div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-teal-600' : 'border-[var(--border-main)] hover:border-teal-300'
                    }`}
                >
                  <img
                    src={image || '/Logo2.png'}
                    alt={`View ${index + 1}`}
                    onError={(e) => e.target.src = '/Logo2.png'}
                    className="w-full h-14 sm:h-18 md:h-20 lg:h-24 object-contain p-1.5 sm:p-2 bg-slate-50"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-[var(--bg-card)] rounded-2xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-[var(--border-main)]"
          >
            {/* Brand + Name */}
            <div className="mb-3 sm:mb-4">
              <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mb-1 sm:mb-2 uppercase tracking-widest font-black">{product.brand}</p>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-[var(--text-main)] mb-2 sm:mb-3 md:mb-4 tracking-tight leading-tight">{product.name}</h1>
              {product.model && <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Model: {product.model}</p>}
            </div>

            {/* Rating */}
            <div className="flex items-center flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
              <div className="flex items-center gap-0.5 text-base sm:text-lg md:text-xl">{renderStars(product.rating)}</div>
              <span className="text-base sm:text-lg font-black text-[var(--text-main)]">{product.rating}</span>
              <span className="text-[var(--text-muted)] font-bold text-xs sm:text-sm">({product.reviewsCount || 0} reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-4 sm:mb-5 md:mb-6">
              <div className="flex items-center flex-wrap gap-2 sm:gap-3 md:gap-4 mb-1 sm:mb-2">
                <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-teal-600 tracking-tighter">
                  ₹{(product.price || 0).toLocaleString()}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-base sm:text-lg md:text-xl text-[var(--text-muted)] line-through font-bold">
                    ₹{(product.originalPrice || 0).toLocaleString()}
                  </span>
                )}
                {product.discount > 0 && (
                  <span className="bg-red-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-black uppercase tracking-widest">
                    {product.discount}% OFF
                  </span>
                )}
              </div>
              <p className="text-[9px] sm:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Inclusive of all taxes</p>
            </div>

            {/* Stock */}
            <div className="mb-4 sm:mb-5 md:mb-6">
              {product.inStock ? (
                <p className="text-green-600 font-bold flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm uppercase tracking-widest">
                  <MdVerified className="text-lg sm:text-xl flex-shrink-0" />
                  In Stock ({product.stockCount} available)
                </p>
              ) : (
                <p className="text-red-600 font-black text-xs sm:text-sm uppercase tracking-widest">Out of Stock</p>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-4 sm:mb-5 md:mb-6">
              <label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 sm:mb-3">Quantity</label>
              <div className="flex items-center border-2 border-[var(--border-main)] rounded-xl sm:rounded-2xl overflow-hidden bg-[var(--bg-app)] w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 sm:p-4 hover:bg-[var(--border-main)] transition-colors"
                >
                  <MdRemove className="text-base sm:text-xl text-[var(--text-muted)]" />
                </button>
                <span className="px-5 sm:px-8 text-base sm:text-xl font-black text-[var(--text-main)] min-w-[2.5rem] sm:min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                  className="p-3 sm:p-4 hover:bg-[var(--border-main)] transition-colors"
                >
                  <MdAdd className="text-base sm:text-xl text-[var(--text-muted)]" />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col xs:flex-row gap-2.5 sm:gap-3 md:gap-4 mb-3 sm:mb-5 md:mb-6">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 ${product.inStock ? 'bg-teal-600 hover:bg-teal-700' : 'bg-gray-400 cursor-not-allowed'} text-white py-3.5 sm:py-4 md:py-5 rounded-xl sm:rounded-[1.5rem] font-black text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] flex items-center justify-center gap-2 sm:gap-3 transition-all active:scale-95 shadow-xl shadow-teal-500/20`}
              >
                <MdShoppingCart className="text-lg sm:text-xl md:text-2xl flex-shrink-0" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className={`flex-1 ${product.inStock ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-300 cursor-not-allowed'} text-white py-3.5 sm:py-4 md:py-5 rounded-xl sm:rounded-[1.5rem] font-black text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-orange-500/20`}
              >
                Buy Now
              </button>
            </div>

            {/* Wishlist + Share */}
            <div className="flex gap-2.5 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
              <button
                onClick={() => toggleWishlist(product)}
                className={`flex-1 border-2 py-3 sm:py-3.5 md:py-4 rounded-xl sm:rounded-[1.5rem] font-black text-[9px] sm:text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${isInWishlist(product.id)
                  ? 'border-rose-500 text-rose-500 bg-rose-50'
                  : 'border-[var(--border-main)] hover:border-teal-600 text-[var(--text-muted)] hover:text-teal-600'
                  }`}
              >
                {isInWishlist(product.id) ? <MdFavorite className="text-base sm:text-xl flex-shrink-0" /> : <MdFavoriteBorder className="text-base sm:text-xl flex-shrink-0" />}
                <span className="hidden xs:inline">{isInWishlist(product.id) ? 'Wishlisted' : 'Wishlist'}</span>
              </button>
              <button className="flex-1 border-2 border-[var(--border-main)] hover:border-teal-600 text-[var(--text-muted)] hover:text-teal-600 py-3 sm:py-3.5 md:py-4 rounded-xl sm:rounded-[1.5rem] font-black text-[9px] sm:text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 sm:gap-2 transition-colors">
                <MdShare className="text-base sm:text-xl flex-shrink-0" />
                <span className="hidden xs:inline">Share</span>
              </button>
            </div>

            {/* Delivery Check */}
            <div className="bg-[var(--bg-app)] border-2 border-[var(--border-main)] rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-5 md:mb-6">
              <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] mb-2 sm:mb-3 md:mb-4">Check Delivery Options</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="flex-1 min-w-0 px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 bg-white border-2 border-[var(--border-main)] rounded-xl focus:outline-none focus:border-teal-500 transition-all font-bold text-xs sm:text-sm tracking-widest"
                />
                <button className="flex-shrink-0 bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-xl font-black text-[9px] sm:text-xs uppercase tracking-widest transition-all active:scale-95">
                  Check
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 py-3 sm:py-4 border-t border-[var(--border-main)]">
              {[
                { icon: MdVerified, label: 'Genuine Product' },
                { icon: MdLocalShipping, label: 'Secure Shipping' },
                { icon: MdSecurity, label: 'Verified Gate' }
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="text-center">
                  <Icon className="text-2xl sm:text-3xl text-teal-600 mx-auto mb-1 sm:mb-2" />
                  <p className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ─── Description + Specs + Features ─── */}
        <div className="bg-[var(--bg-card)] rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-5 sm:p-7 md:p-10 lg:p-12 shadow-2xl mb-8 sm:mb-10 md:mb-12 border border-[var(--border-main)]">

          {/* Description */}
          <div className="mb-7 sm:mb-10 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--text-main)] mb-3 sm:mb-4 md:mb-6 uppercase tracking-tighter italic">Description</h2>
            <p className="text-[var(--text-muted)] font-medium leading-relaxed text-xs sm:text-sm md:text-base max-w-4xl">
              {product.description || 'Premium quality sanitary ware designed for modern architectures. Durable, elegant, and engineered for performance.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7 sm:gap-10 md:gap-12 mb-6 sm:mb-8 md:mb-12">
            {/* Specifications */}
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-black text-[var(--text-main)] mb-4 sm:mb-5 md:mb-6 uppercase tracking-[0.2em] border-b-4 border-teal-600 w-fit pb-1.5 sm:pb-2">Technical Data</h3>
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                {Object.entries(product.specifications).length > 0 ? (
                  Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 sm:py-3 border-b border-[var(--border-main)] group hover:bg-[var(--bg-app)] px-3 sm:px-4 rounded-xl transition-colors gap-4">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] flex-shrink-0">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-xs sm:text-sm font-bold text-[var(--text-main)] text-right">{value}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic text-xs sm:text-sm">No specifications listed.</p>
                )}
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-black text-[var(--text-main)] mb-4 sm:mb-5 md:mb-6 uppercase tracking-[0.2em] border-b-4 border-teal-600 w-fit pb-1.5 sm:pb-2">Key Highlights</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
                {product.features.length > 0 ? (
                  product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2.5 sm:gap-3 md:gap-4 bg-[var(--bg-app)] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[var(--border-main)]">
                      <MdVerified className="text-teal-600 text-lg sm:text-xl md:text-2xl flex-shrink-0" />
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] leading-tight">{feature}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic text-xs sm:text-sm">Standard corporate quality assurance applied.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* ─── Reviews ─── */}
        <div className="bg-[var(--bg-card)] rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-5 sm:p-7 md:p-10 lg:p-12 shadow-xl mb-8 sm:mb-10 md:mb-12 border border-[var(--border-main)] overflow-hidden">
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--text-main)] uppercase tracking-tighter italic">Client Testimonials</h2>
            <div className="flex-shrink-0">
              <div className="bg-teal-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-black text-[9px] sm:text-xs uppercase tracking-widest shadow-lg whitespace-nowrap">
                TrustScore 4.8+
              </div>
            </div>
          </div>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-[var(--bg-app)] p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-[var(--border-main)] shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 min-w-0">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-teal-600 border border-[var(--border-main)] shadow-sm flex-shrink-0 text-sm sm:text-base">
                        {review.name?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-xs sm:text-sm uppercase tracking-tight text-[var(--text-main)] truncate">{review.name}</p>
                        <div className="flex gap-0.5 mt-0.5 text-sm">{renderStars(review.rating)}</div>
                      </div>
                    </div>
                    <p className="text-[8px] sm:text-[9px] font-black font-mono text-slate-300 flex-shrink-0">{review.date}</p>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">"{review.comment}"</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-10 md:py-12">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs sm:text-sm">Be the first to share your experience.</p>
            </div>
          )}
        </div>

        {/* ─── Related Products ─── */}
        <div className="mt-10 sm:mt-14 md:mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-7 sm:mb-10 md:mb-16">
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-[var(--text-main)] mb-2 sm:mb-3 md:mb-4 tracking-tighter uppercase italic leading-tight">
                YOU MAY <span className="text-teal-600">ALSO NEED.</span>
              </h2>
              <p className="text-[var(--text-muted)] font-black text-[9px] sm:text-xs uppercase tracking-widest border-l-4 border-teal-500/20 pl-3 sm:pl-4 md:pl-6">
                Synchronized items found in this category sector.
              </p>
            </div>
            <Link
              to="/products"
              className="group flex items-center gap-2 sm:gap-3 md:gap-4 bg-white px-5 sm:px-7 md:px-10 py-3 sm:py-4 md:py-5 rounded-full border border-[var(--border-main)] shadow-xl hover:bg-teal-600 hover:text-white transition-all duration-500 flex-shrink-0 w-fit"
            >
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] whitespace-nowrap">View Full Catalog</span>
              <MdShoppingCart className="text-base sm:text-lg md:text-xl group-hover:translate-x-1 sm:group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {filteredRelated.slice(0, 4).map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl sm:rounded-3xl border border-[var(--border-main)] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group"
              >
                <div className="relative aspect-square bg-[var(--bg-app)] overflow-hidden p-2 sm:p-3 md:p-4">
                  <Link to={`/product/${item.id}`}>
                    <img
                      src={item.images?.[0] || item.image || '/Logo2.png'}
                      onError={(e) => e.target.src = '/Logo2.png'}
                      alt={item.name}
                      className="w-full h-full object-contain p-2 sm:p-3 md:p-4 mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                    />
                  </Link>
                  {item.badge && (
                    <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4">
                      <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[6px] sm:text-[7px] font-black uppercase tracking-widest text-white ${getBadgeColor(item.badge)} shadow-lg`}>
                        {item.badge}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                  <Link to={`/product/${item.id}`} className="block mb-1.5 sm:mb-2">
                    <h3 className="text-[10px] sm:text-xs md:text-sm font-black text-[var(--text-main)] uppercase italic group-hover:text-teal-600 transition-colors truncate">{item.name}</h3>
                  </Link>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm sm:text-base md:text-lg font-black text-teal-600">₹{(item.price || 0).toLocaleString()}</span>
                    <button
                      onClick={() => { addToCart(item, 1); alert('Added!'); }}
                      className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-[var(--bg-app)] rounded-xl sm:rounded-2xl flex items-center justify-center text-[var(--text-muted)] hover:bg-teal-600 hover:text-white transition-all flex-shrink-0"
                    >
                      <MdShoppingCart size={15} className="sm:hidden" />
                      <MdShoppingCart size={18} className="hidden sm:block" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;