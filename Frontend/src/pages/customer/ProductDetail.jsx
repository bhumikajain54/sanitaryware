import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdStar,
  MdStarHalf,
  MdStarOutline,
  MdAdd,
  MdRemove,
  MdShoppingCart,
  MdFavoriteBorder,
  MdShare,
  MdVerified,
  MdLocalShipping,
  MdSecurity,
  MdFilterList,
  MdClose,
  MdSort,
  MdKeyboardArrowDown,
  MdFavorite
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

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['all']);
  const [selectedBrands, setSelectedBrands] = useState(['all']);
  const [priceRange, setPriceRange] = useState(100000);
  const [selectedMountTypes, setSelectedMountTypes] = useState(['all']);
  const [showFilters, setShowFilters] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');

  // Normalization helper
  const normalizeProduct = (p) => {
    if (!p) return null;
    
    // Robust price detection (support 'price', 'amount', 'currentPrice')
    const priceValue = p.price !== undefined ? p.price : (p.amount !== undefined ? p.amount : (p.currentPrice !== undefined ? p.currentPrice : 0));
    const price = typeof priceValue === 'string' ? parseFloat(priceValue.replace(/[^0-9.]/g, '')) : (parseFloat(priceValue) || 0);
    
    // Robust original price detection
    const origPriceValue = p.originalPrice || p.mrp || p.basePrice || p.oldPrice || (price > 0 ? price * 1.2 : 0);
    const originalPrice = typeof origPriceValue === 'string' ? parseFloat(origPriceValue.replace(/[^0-9.]/g, '')) : (parseFloat(origPriceValue) || 0);
    
    // Robust stock detection
    const stock = parseInt(p.stockQuantity !== undefined ? p.stockQuantity : (p.stock !== undefined ? p.stock : (p.stockCount !== undefined ? p.stockCount : (p.quantity !== undefined ? p.quantity : (p.qty || p.inventory || 0))))) || 0;
    
    // Calculate discount if not provided
    const discount = p.discount || (originalPrice > price && originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

    return {
      ...p,
      id: p.id || p.productId,
      brand: p.brand && typeof p.brand === 'object' ? p.brand.name : (p.brand || 'No Brand'),
      category: p.category && typeof p.category === 'object' ? p.category.name : (p.category || 'No Category'),
      mountType: p.mountType || 'Other',
      price: price,
      originalPrice: originalPrice > price ? originalPrice : (price > 0 ? price * 1.2 : 0),
      stockCount: stock, // Maintain compatibility with both field names
      stock: stock,
      inStock: stock > 0,
      discount: discount,
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
        try {
           reviewsData = await customerService.getReviewsByProduct(id);
        } catch (revErr) { console.error("Reviews fetch failed", revErr); }

        const normalizedProduct = normalizeProduct(productData);
        setProduct(normalizedProduct);
        
        const rawRelated = Array.isArray(productsResponse) ? productsResponse : (productsResponse?.products || productsResponse?.content || productsResponse?.data || []);
        setRelatedProducts(rawRelated.map(normalizeProduct).filter(p => p.id !== normalizedProduct.id));
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

  const sortOptions = [
    { value: 'popularity', label: 'Popularity' },
    { value: 'price-low to high', label: 'Low Price To High Price' },
    { value: 'price-high to low', label: 'High Price To Low Price' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'newest', label: 'Newest First' },
  ];

  const currentSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label || 'Popularity';

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Exclusive': return 'bg-teal-600';
      case 'New Arrival': return 'bg-teal-500';
      case 'Hot Deal': return 'bg-orange-600';
      case 'Premium': return 'bg-blue-600';
      case 'Sale': return 'bg-red-600';
      case 'Trending': return 'bg-sky-600';
      default: return 'bg-gray-600';
    }
  };

  const categoriesList = [
    { value: 'all', label: 'All Categories' },
    { value: 'toilets', label: 'Toilets' },
    { value: 'basins', label: 'Wash Basins' },
    { value: 'faucets', label: 'Faucets' },
    { value: 'showers', label: 'Showers' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'sinks', label: 'Kitchen Sinks' },
  ];

  const brandsList = [
    { value: 'all', label: 'All Brands' },
    { value: 'CERA', label: 'CERA' },
    { value: 'Aquagold', label: 'Aquagold' },
    { value: 'Waterflow', label: 'Waterflow' },
    { value: 'Plasto', label: 'Plasto' },
    { value: 'Aquarium', label: 'Aquarium' },
  ];

  const mountTypes = ['Wall Mounted', 'Floor Mounted', 'Deck Mounted', 'Under Mount'];

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      alert(`${quantity} x ${product.name} added to cart!`);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, quantity);
      navigate('/checkout');
    }
  };

  const filteredRelatedProducts = relatedProducts.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = item.price <= priceRange;
    return matchesSearch && matchesPrice;
  });

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<MdStar key={`full-${i}`} className="text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<MdStarHalf key="half" className="text-yellow-400" />);
    }
    const emptyStars = 5 - Math.ceil(rating || 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<MdStarOutline key={`empty-${i}`} className="text-yellow-400" />);
    }
    return stars;
  };

  if (loading) {
     return (
        <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
     );
  }

  if (!product) {
    return (
        <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold text-[var(--text-main)] mb-4">Product Not Found</h1>
            <Link to="/products" className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest transition-all hover:bg-teal-700">Go to Shop</Link>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] py-6 md:py-8 font-inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb - Premium Styled */}
        <div className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
          <Link to="/" className="hover:text-teal-600 transition-colors">Home</Link>
          <span className="text-[var(--border-main)]">/</span>
          <Link to="/products" className="hover:text-teal-600 transition-colors">Shop</Link>
          <span className="text-[var(--border-main)]">/</span>
          <span className="text-teal-600">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* Product Images */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[var(--bg-card)] rounded-3xl p-4 md:p-8 shadow-xl shadow-teal-500/5 mb-6 border border-[var(--border-main)]"
            >
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-72 sm:h-96 md:h-[500px] object-contain rounded-2xl"
              />
            </motion.div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-teal-600' : 'border-[var(--border-main)] hover:border-teal-300'
                  }`}
                >
                  <img src={image} alt={`View ${index + 1}`} className="w-full h-20 md:h-24 object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[var(--bg-card)] rounded-2xl p-6 md:p-8 shadow-lg border border-[var(--border-main)]"
          >
            <div className="mb-4">
              <p className="text-sm text-[var(--text-muted)] mb-2 uppercase tracking-widest font-black">{product.brand}</p>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-[var(--text-main)] mb-4 tracking-tight">{product.name}</h1>
              {product.model && <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Model: {product.model}</p>}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1 text-xl">
                {renderStars(product.rating)}
              </div>
              <span className="text-lg font-black text-[var(--text-main)]">{product.rating}</span>
              <span className="text-[var(--text-muted)] font-bold text-sm">({product.reviewsCount || 0} reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-3xl md:text-5xl font-black text-teal-600 tracking-tighter">
                  ₹{(product.price || 0).toLocaleString()}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-xl text-[var(--text-muted)] line-through font-bold">
                    ₹{(product.originalPrice || 0).toLocaleString()}
                  </span>
                )}
                {product.discount > 0 && (
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                    {product.discount}% OFF
                  </span>
                )}
              </div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Inclusive of all taxes</p>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.inStock ? (
                <p className="text-green-600 font-bold flex items-center gap-2 text-sm uppercase tracking-widest">
                  <MdVerified className="text-xl" />
                  In Stock ({product.stockCount} available)
                </p>
              ) : (
                <p className="text-red-600 font-black text-sm uppercase tracking-widest">Out of Stock</p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-[var(--border-main)] rounded-2xl overflow-hidden bg-[var(--bg-app)]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-4 hover:bg-[var(--border-main)] transition-colors"
                  >
                    <MdRemove className="text-xl text-[var(--text-muted)]" />
                  </button>
                  <span className="px-8 text-xl font-black text-[var(--text-main)] min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                    className="p-4 hover:bg-[var(--border-main)] transition-colors"
                  >
                    <MdAdd className="text-xl text-[var(--text-muted)]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button 
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 ${product.inStock ? 'bg-teal-600 hover:bg-teal-700' : 'bg-gray-400 cursor-not-allowed'} text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-teal-500/20`}
              >
                <MdShoppingCart className="text-2xl" />
                Add to Cart
              </button>
              <button 
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className={`flex-1 ${product.inStock ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-300 cursor-not-allowed'} text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-orange-500/20`}
              >
                Buy Now
              </button>
            </div>

            {/* Wishlist & Share */}
             <div className="flex gap-4 mb-6">
              <button 
                onClick={() => toggleWishlist(product)}
                className={`flex-1 border-2 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                  isInWishlist(product.id)
                    ? 'border-rose-500 text-rose-500 bg-rose-50'
                    : 'border-[var(--border-main)] hover:border-teal-600 text-[var(--text-muted)] hover:text-teal-600'
                }`}
              >
                {isInWishlist(product.id) ? <MdFavorite className="text-xl" /> : <MdFavoriteBorder className="text-xl" />}
                {isInWishlist(product.id) ? 'Wishlisted' : 'Add to Wishlist'}
              </button>
              <button className="flex-1 border-2 border-[var(--border-main)] hover:border-teal-600 text-[var(--text-muted)] hover:text-teal-600 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                <MdShare className="text-xl" />
                Share
              </button>
            </div>

            {/* Delivery Check */}
            <div className="bg-[var(--bg-app)] border-2 border-[var(--border-main)] rounded-2xl p-6 mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] mb-4">Check Delivery Options</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Area Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="flex-1 px-5 py-3 bg-white border-2 border-[var(--border-main)] rounded-xl focus:outline-none focus:border-teal-500 transition-all font-bold text-sm tracking-widest"
                />
                <button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95">
                  Check
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-[var(--border-main)]">
              <div className="text-center">
                <MdVerified className="text-3xl text-teal-600 mx-auto mb-2" />
                <p className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">Genuine Product</p>
              </div>
              <div className="text-center">
                <MdLocalShipping className="text-3xl text-teal-600 mx-auto mb-2" />
                <p className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">Secure Shipping</p>
              </div>
              <div className="text-center">
                <MdSecurity className="text-3xl text-teal-600 mx-auto mb-2" />
                <p className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">Verified Gate</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-[var(--bg-card)] rounded-[2.5rem] p-8 md:p-12 shadow-2xl mb-12 border border-[var(--border-main)]">
          <div className="mb-12">
            <h2 className="text-3xl font-black text-[var(--text-main)] mb-6 uppercase tracking-tighter italic">Description</h2>
            <div className="text-[var(--text-muted)] font-medium leading-relaxed max-w-4xl">
                {product.description || "Premium quality sanitary ware designed for modern architectures. Durable, elegant, and engineered for performance."}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-xl font-black text-[var(--text-main)] mb-6 uppercase tracking-[0.2em] border-b-4 border-teal-600 w-fit pb-2">Technical Data</h3>
              <div className="space-y-4">
                {Object.entries(product.specifications || {}).length > 0 ? Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-3 border-b border-[var(--border-main)] group hover:bg-[var(--bg-app)] px-4 rounded-xl transition-colors">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-sm font-bold text-[var(--text-main)]">{value}</span>
                  </div>
                )) : (
                    <div className="text-slate-400 italic text-sm">No specifications listed.</div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-[var(--text-main)] mb-6 uppercase tracking-[0.2em] border-b-4 border-teal-600 w-fit pb-2">Key Highlights</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(product.features || []).length > 0 ? product.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-4 bg-[var(--bg-app)] p-4 rounded-2xl border border-[var(--border-main)]">
                    <MdVerified className="text-teal-600 text-2xl flex-shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)]">{feature}</span>
                  </li>
                )) : (
                    <li className="text-slate-400 italic text-sm">Standard corporate quality assurance applied.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Reviews Section Placeholder - Robust Styling */}
        <div className="bg-[var(--bg-card)] rounded-[2.5rem] p-8 md:p-12 shadow-xl mb-12 border border-[var(--border-main)] overflow-hidden">
             <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-black text-[var(--text-main)] uppercase tracking-tighter italic">Client Testimonials</h2>
                <div className="flex gap-2">
                    <div className="bg-teal-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg">TrustScore 4.8+</div>
                </div>
             </div>
             
             {reviews.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-[var(--bg-app)] p-6 rounded-3xl border border-[var(--border-main)] shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-teal-600 border border-[var(--border-main)] shadow-sm">{review.name?.[0]}</div>
                                    <div>
                                        <div className="font-black text-sm uppercase tracking-tight text-[var(--text-main)]">{review.name}</div>
                                        <div className="flex gap-0.5 mt-1">{renderStars(review.rating)}</div>
                                    </div>
                                </div>
                                <div className="text-[8px] font-black font-mono text-slate-300">{review.date}</div>
                            </div>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed">"{review.comment}"</p>
                        </div>
                    ))}
                 </div>
             ) : (
                 <div className="text-center py-12">
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Be the first to share your experience.</p>
                 </div>
             )}
        </div>

        {/* Related Products Section */}
        <div className="mt-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
              <div>
                <h2 className="text-4xl md:text-6xl font-black text-[var(--text-main)] mb-4 tracking-tighter uppercase italic">
                   YOU MAY <span className="text-teal-600">ALSO NEED.</span>
                </h2>
                <p className="text-[var(--text-muted)] font-black text-xs uppercase tracking-widest border-l-4 border-teal-500/20 pl-6">Synchronized items found in this category sector.</p>
              </div>
              <Link to="/products" className="group flex items-center gap-4 bg-white px-10 py-5 rounded-full border border-[var(--border-main)] shadow-xl hover:bg-teal-600 hover:text-white transition-all duration-500">
                  <span className="text-xs font-black uppercase tracking-[0.2em]">View Full Catalog</span>
                  <MdShoppingCart className="text-xl group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {filteredRelatedProducts.slice(0, 4).map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className="bg-white rounded-3xl border border-[var(--border-main)] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group"
                    >
                        <div className="relative aspect-square bg-[var(--bg-app)] overflow-hidden p-4">
                            <Link to={`/product/${item.id}`}>
                                <img src={item.images?.[0] || item.image} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" />
                            </Link>
                            <div className="absolute top-4 left-4">
                                <span className={`px-2.5 py-1 rounded-full text-[6px] font-black uppercase tracking-widest text-white ${getBadgeColor(item.badge)} shadow-lg`}>
                                    {item.badge}
                                </span>
                            </div>
                        </div>
                        <div className="p-6">
                            <Link to={`/product/${item.id}`} className="block mb-2">
                                <h3 className="text-sm font-black text-[var(--text-main)] uppercase italic group-hover:text-teal-600 transition-colors truncate">{item.name}</h3>
                            </Link>
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-black text-teal-600">₹{(item.price || 0).toLocaleString()}</span>
                                <button
                                   onClick={() => { addToCart(item, 1); alert("Added!"); }}
                                   className="w-10 h-10 bg-[var(--bg-app)] rounded-2xl flex items-center justify-center text-[var(--text-muted)] hover:bg-teal-600 hover:text-white transition-all"
                                >
                                    <MdShoppingCart size={18} />
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
