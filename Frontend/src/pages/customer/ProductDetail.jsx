import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdStar, MdStarHalf, MdStarOutline,
  MdAdd, MdRemove, MdShoppingCart,
  MdFavoriteBorder, MdShare, MdVerified,
  MdLocalShipping, MdSecurity,
  MdClose, MdFavorite, MdLocalOffer,
  MdCompareArrows, MdCheckCircle, MdGppGood, MdAccessTime,
  MdOutlineLocationOn, MdArrowForward, MdRateReview, MdOutlineRateReview
} from 'react-icons/md';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import customerService from '../../services/customerService';
import AddToCartButton from '../../components/common/AddToCartButton';
import { toast } from 'react-hot-toast';

/* ─── Premium Image Zoom Component ─── */
const ImageGallery = ({ images, name }) => {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState({ x: 0, y: 0, show: false });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoom({ x, y, show: true });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Thumbnails */}
      <div className="order-2 md:order-1 flex md:flex-col gap-3 max-h-[500px] overflow-y-auto no-scrollbar py-2">
        {images.map((img, i) => (
          <button
            key={i}
            onMouseEnter={() => setActive(i)}
            onClick={() => setActive(i)}
            className={`w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 transition-all flex-shrink-0 bg-white dark:bg-slate-800 p-1.5 ${active === i ? 'border-teal-500 shadow-md ring-2 ring-teal-50 dark:ring-teal-900/20' : 'border-slate-100 dark:border-slate-700 hover:border-slate-300'
              }`}
          >
            <img src={img} alt={name} className="w-full h-full object-contain" />
          </button>
        ))}
      </div>

      {/* Main Image with Zoom */}
      <div className="order-1 md:order-2 flex-1 relative">
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setZoom({ ...zoom, show: false })}
          className="aspect-square bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden cursor-zoom-in relative group"
        >
          <motion.img
            key={active}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            src={images[active]}
            alt={name}
            className="w-full h-full object-contain p-8 md:p-12"
          />

          {/* Zoom Overlay */}
          <AnimatePresence>
            {zoom.show && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 pointer-events-none hidden md:block rounded-3xl"
                style={{
                  backgroundImage: `url(${images[active]})`,
                  backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                  backgroundSize: '220%',
                  backgroundRepeat: 'no-repeat',
                  backgroundColor: 'inherit'
                }}
              />
            )}
          </AnimatePresence>

          {/* Badge */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
            <span className="px-3 py-1 bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">Premium Quality</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Offer Card Component ─── */
const OfferCard = ({ icon: Icon, title, desc, tag }) => (
  <div className="flex-shrink-0 w-64 p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-all">
        <Icon size={20} />
      </div>
      <p className="font-bold text-xs text-slate-800 dark:text-slate-100">{title}</p>
    </div>
    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-3">{desc}</p>
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest bg-teal-50 dark:bg-teal-900/20 px-2 py-1 rounded">{tag}</span>
      <button className="text-[10px] font-bold text-slate-400 hover:text-teal-600 uppercase transition-colors">Details</button>
    </div>
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('Specs');
  const [pincode, setPincode] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState(null);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      await customerService.postReview({ 
        productId: Number(id), 
        rating: Number(reviewRating), 
        comment: String(reviewComment).trim() 
      });
      toast.success('Review submitted!');
      setIsReviewModalOpen(false);
    } catch (err) { }
    finally { setIsSubmittingReview(false); }
  };

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const [data, productsData, reviewsData] = await Promise.all([
          customerService.getProductById(id),
          customerService.getProducts(),
          customerService.getReviewsByProduct(id)
        ]);

        const price = data.price || data.amount || 0;
        const originalPrice = data.originalPrice || (price * 1.2);
        const stock = data.stockQuantity !== undefined ? data.stockQuantity : (data.stock || 0);

        const normProduct = {
          ...data,
          id: data.id || id,
          brand: typeof data.brand === 'string' ? data.brand : (data.brand?.name || 'Elite Series'),
          price, originalPrice,
          discount: Math.round(((originalPrice - price) / originalPrice) * 100),
          images: (Array.isArray(data.images) && data.images.length) ? data.images : [data.mainImage || data.image || '/Logo2.png'],
          specifications: data.specifications || {
            "Material": "Premium High-Grade Ceramic",
            "Color/Finish": data.color || "Glossy White",
            "Weight": "14.5 kg",
            "Warranty": "10-Year Comprehensive Warranty",
            "Mount Type": data.mountType || "Wall-Hung",
            "Water Usage": "Dual Flush (Eco-friendly)"
          },
          features: data.features || ["Water Saving Technology", "Easy-to-Install Design", "Anti-Bacterial Surface", "Premium Scratch-Resistant Finish", "Soft Close Mechanism"]
        };

        setProduct(normProduct);
        setReviews(reviewsData || []);

        const rawRelated = Array.isArray(productsData) ? productsData : (productsData?.products || []);
        setRelated(rawRelated.slice(0, 4).map(p => ({
          ...p,
          brand: typeof p.brand === 'string' ? p.brand : (p.brand?.name || 'Elite')
        })));
      } catch (err) {
        console.error("PDP Error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handleCheckDelivery = () => {
    if (pincode.length === 6) {
      setDeliveryStatus('checking');
      setTimeout(() => setDeliveryStatus('available'), 800);
    } else {
      toast.error("Please enter a valid 6-digit pincode");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-6" />
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Synchronizing Data...</p>
      </div>
    </div>
  );

  if (!product) return <div className="p-20 text-center dark:text-white">Product not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-500 pb-24 md:pb-12">

      {/* ─── Breadcrumb ─── */}
      <nav className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <Link to="/" className="hover:text-teal-600 transition-colors">Home</Link>
          <span className="opacity-30">/</span>
          <Link to="/products" className="hover:text-teal-600 transition-colors">Collection</Link>
          <span className="opacity-30">/</span>
          <span className="text-slate-800 dark:text-slate-200 truncate">{product.name}</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">

        {/* ─── Left: Image Gallery (5 cols) ─── */}
        <div className="lg:col-span-6 xl:col-span-5">
          <ImageGallery images={product.images} name={product.name} />
        </div>

        {/* ─── Right: Product Info (7 cols) ─── */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-10">

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="bg-slate-900 dark:bg-teal-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full tracking-widest shadow-lg uppercase">{product.brand || 'Elite Series'}</span>
              <div className="flex items-center gap-4">
                <button onClick={() => toggleWishlist(product)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isInWishlist(product.id) ? 'bg-rose-50 text-rose-500 shadow-rose-100' : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-500 border border-slate-100 dark:border-slate-700'}`}>
                  {isInWishlist(product.id) ? <MdFavorite size={20} /> : <MdFavoriteBorder size={20} />}
                </button>
                <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 text-slate-400 hover:text-teal-600 border border-slate-100 dark:border-slate-700 transition-all">
                  <MdShare size={20} />
                </button>
              </div>
            </div>

            <header className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight italic">
                {product.name.split(' ').slice(0, -1).join(' ')} <span className="text-teal-600">{product.name.split(' ').slice(-1)}</span>
              </h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center bg-teal-600 dark:bg-teal-500 text-white px-3 py-1 rounded-lg gap-1.5 shadow-lg shadow-teal-500/20">
                  <span className="font-black text-sm">
                    {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0'}
                  </span>
                  <MdStar size={16} />
                </div>
                <a href="#reviews" className="text-xs font-bold text-slate-400 hover:text-teal-600 transition-colors uppercase tracking-[0.2em] border-b-2 border-slate-100 dark:border-slate-800 pb-0.5">
                  {reviews.length} Verified Reviews
                </a>
              </div>
            </header>

            {/* Price section */}
            <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
              <div className="flex items-baseline gap-5 mb-3">
                <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">₹{product.price.toLocaleString()}</h2>
                <span className="text-xl text-slate-300 dark:text-slate-600 line-through font-bold">₹{product.originalPrice.toLocaleString()}</span>
                <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-lg text-sm font-black tracking-widest uppercase">
                  Budget Save {product.discount}%
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <MdGppGood className="text-teal-600" /> Secure Price Listing • Taxes Included
              </p>

              <div className="mt-8 flex items-center gap-6">
                <div className={`px-4 py-2 rounded-xl flex items-center gap-3 text-[11px] font-black uppercase tracking-widest border transition-all ${product.stockQuantity > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-800/50' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 border-rose-100 dark:border-rose-800/50'}`}>
                  {product.stockQuantity > 0 ? <><MdVerified size={18} /> In Stock Now</> : <><MdClose size={18} /> Out of Stock</>}
                </div>
                {product.stockQuantity > 0 && product.stockQuantity < 10 && (
                  <div className="flex items-center gap-2 text-xs font-black text-rose-500 dark:text-rose-400 italic">
                    <MdAccessTime size={16} /> Low Stock: {product.stockQuantity} Remaining
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ─── Detailed Actions Section ─── */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex items-center bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-1 shadow-sm transition-focus-within focus-within:border-teal-400">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-14 h-14 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group"><MdRemove size={20} className="group-active:scale-90" /></button>
                <span className="w-16 text-center font-black text-xl text-slate-800 dark:text-white">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-14 h-14 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group"><MdAdd size={20} className="group-active:scale-90" /></button>
              </div>
              <AddToCartButton
                product={product}
                quantity={quantity}
                className="flex-grow h-16 shadow-2xl shadow-teal-500/30 text-base"
              />
            </div>

            <button onClick={() => navigate('/checkout')} className="w-full h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.25rem] font-black text-sm uppercase tracking-[0.3em] shadow-xl hover:bg-black dark:hover:bg-slate-100 transition-all active:scale-[0.98] flex items-center justify-center gap-4">
              Proceed to Checkout <MdArrowForward size={22} />
            </button>
            <button className="w-full py-4 border-2 border-slate-100 dark:border-slate-800 hover:border-teal-500 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-teal-600 transition-all rounded-xl flex items-center justify-center gap-2 group">
              <MdCompareArrows size={18} className="group-hover:rotate-180 transition-transform duration-500" /> Add to Comparison Cluster
            </button>
          </section>

          {/* ─── Delivery Section ─── */}
          <section className="bg-slate-100 dark:bg-slate-900/40 p-8 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 flex items-center gap-3">
              <MdOutlineLocationOn className="text-teal-600 text-xl" /> Distribution Verification
            </h3>
            <div className="flex gap-4">
              <input
                type="text"
                maxLength="6"
                placeholder="Target Pincode"
                value={pincode}
                onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                className="flex-1 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:border-teal-500 font-black text-sm tracking-[0.4em] dark:text-white"
              />
              <button
                onClick={handleCheckDelivery}
                className="bg-slate-900 dark:bg-teal-600 text-white font-black text-[11px] px-10 py-4 rounded-2xl uppercase transition-all shadow-lg active:scale-95"
              >
                {deliveryStatus === 'checking' ? '...' : 'Verify'}
              </button>
            </div>
            <AnimatePresence>
              {deliveryStatus === 'available' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-[11px] font-black text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-transform hover:-translate-y-1">
                    <MdLocalShipping className="text-teal-600 text-xl" /> Express Delivery: 2 Days
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-black text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-transform hover:-translate-y-1 text-teal-600">
                    <MdCheckCircle className="text-xl" /> Secure COD Verified
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Offers List */}
          <div className="space-y-4">
            <div className="flex overflow-x-auto no-scrollbar gap-4 py-2">
              <OfferCard icon={MdSecurity} title="Manufacturer Warranty" desc="Enjoy 10-year official brand warranty with direct support" tag="WARRANTY" />
              <OfferCard icon={MdAccessTime} title="Express Installation" desc="Same day dispatch for orders confirmed before 2 PM local" tag="FAST" />
              <OfferCard icon={MdLocalOffer} title="Combo Discount" desc="Flat 15% off when you buy 2+ items from this collection" tag="BUNDLE" />
            </div>
          </div>

        </div>
      </div>

      {/* ─── Detailed Content Section ─── */}
      <section className="max-w-7xl mx-auto px-4 mt-28">
        <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-8 md:p-16 border border-slate-100 dark:border-slate-800 shadow-[0_50px_100px_rgba(0,0,0,0.05)] dark:shadow-none">
          <header className="flex flex-wrap gap-8 md:gap-16 border-b border-slate-100 dark:border-slate-800 mb-12">
            {['Specs', 'Description', 'Installation', 'Reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-6 text-xs font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === tab ? 'text-teal-600' : 'text-slate-300 hover:text-slate-500'}`}
              >
                {tab}
                {activeTab === tab && <motion.div layoutId="tab-underline" className="absolute bottom-[-1.5px] left-0 right-0 h-1 bg-teal-600 rounded-full" />}
              </button>
            ))}
          </header>

          <main className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'Specs' && (
                <motion.div key="specs" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {Object.entries(product.specifications).map(([k, v]) => (
                    <div key={k} className="group p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-transparent hover:border-teal-500/20 transition-all">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{k}</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{v}</p>
                    </div>
                  ))}
                </motion.div>
              )}
              {activeTab === 'Description' && (
                <motion.div key="desc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl space-y-8">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight italic">Engineering Excellence.</h3>
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                      {product.description || "Designed with sophisticated engineering and premium materials, this product stands at the intersection of durability and modern aesthetics. Perfectly suited for high-end residential and commercial projects. Our ceramic glaze is anti-bacterial and scratch-resistant, ensuring it looks brand new for decades."}
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                      {product.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-4 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-200">
                          <MdCheckCircle className="text-teal-600 text-xl flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
              {activeTab === 'Installation' && (
                <motion.div key="install" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-4xl space-y-10">
                  <div className="p-8 md:p-12 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-8">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Technical Installation Guide</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black">1</div>
                          <h4 className="font-black text-xs uppercase tracking-widest text-slate-800 dark:text-slate-200">Surface Preparation</h4>
                        </div>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed">Ensure the mounting wall is structural and level. All plumbing inlets should be centered according to the technical blueprint provided in the box.</p>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black">2</div>
                          <h4 className="font-black text-xs uppercase tracking-widest text-slate-800 dark:text-slate-200">Bracket Mounting</h4>
                        </div>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed">Secure the premium alloy mounting brackets using the heavy-duty bolts. Use a spirit level to ensure perfect horizontal alignment.</p>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black">3</div>
                          <h4 className="font-black text-xs uppercase tracking-widest text-slate-800 dark:text-slate-200">Plumbing Connection</h4>
                        </div>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed">Connect the dual flush mechanism to the inlet. We recommend using a high-quality flexible hose to prevent future leaks.</p>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black">4</div>
                          <h4 className="font-black text-xs uppercase tracking-widest text-slate-800 dark:text-slate-200">Sealing</h4>
                        </div>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed">Apply a thin bead of anti-fungal silicone around the edges for a professional, watertight finish. Allow 24 hours to cure before use.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              {activeTab === 'Reviews' && (
                <motion.div key="reviews" id="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Verified Customer Experience.</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Share your story with this product</p>
                    </div>
                    <button
                      onClick={() => setIsReviewModalOpen(true)}
                      className="px-8 py-3.5 bg-yellow-400 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-yellow-400/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <MdOutlineRateReview size={18} /> Write a Review
                    </button>
                  </div>
                  {reviews.length > 0 ? (
                    <>
                      <div className="flex flex-col lg:flex-row gap-16">
                        <div className="lg:w-1/3 p-12 bg-slate-950 dark:bg-black rounded-[2.5rem] text-white text-center shadow-2xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-[60px]" />
                          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-500 mb-4">Overall Rating</h4>
                          <div className="text-7xl font-black mb-4 tracking-tighter">
                            {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                            <span className="text-3xl text-slate-600">/5</span>
                          </div>
                          <div className="flex justify-center gap-1.5 text-2xl text-amber-500 mb-4 font-black">
                            {Array(5).fill(0).map((_, i) => (
                              <MdStar key={i} className={i < Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) ? 'text-yellow-400' : 'text-slate-600 outline-none'} />
                            ))}
                          </div>
                          <p className="text-xs font-medium text-slate-400 tracking-wide">Based on {reviews.length} verified buyer reviews</p>
                        </div>
                        <div className="flex-1 space-y-6 self-center">
                          {[5, 4, 3, 2, 1].map(star => {
                            const count = reviews.filter(r => r.rating === star).length;
                            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                            return (
                              <div key={star} className="flex items-center gap-6">
                                <span className="text-[11px] font-black text-slate-400 w-6 tracking-widest">{star}★</span>
                                <div className="flex-1 h-3 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${percentage}%` }}
                                    className="h-full bg-teal-600"
                                  />
                                </div>
                                <span className="text-[11px] font-black text-slate-400 w-10 text-right">{Math.round(percentage)}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Reviews List */}
                      <div className="space-y-8 pt-12 border-t border-slate-100 dark:border-slate-800">
                        {reviews.map((rev, idx) => (
                          <div key={rev.id || idx} className="flex gap-6 pb-8 border-b border-slate-50 dark:border-slate-900 last:border-0 last:pb-0">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 uppercase tracking-widest text-sm shrink-0">
                              {rev.user?.userName?.slice(0, 2) || rev.user?.name?.slice(0, 2) || 'AN'}
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center justify-between">
                                <h5 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{rev.user?.userName || rev.user?.name || 'Anonymous User'}</h5>
                                <div className="flex text-yellow-500">
                                  {Array(5).fill(0).map((_, i) => (
                                    <MdStar key={i} className={i < rev.rating ? 'text-yellow-400' : 'text-slate-200'} />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic">"{rev.comment}"</p>
                              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="py-16 flex flex-col items-center relative overflow-hidden"
                    >
                      {/* Background decoration */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl" />
                      </div>

                      {/* Stars decoration */}
                      <div className="flex gap-2 mb-8">
                        {[1,2,3,4,5].map((s, i) => (
                          <motion.div
                            key={s}
                            initial={{ opacity: 0, scale: 0, rotate: -30 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
                          >
                            <MdStar className="text-4xl text-slate-100 dark:text-slate-800" />
                          </motion.div>
                        ))}
                      </div>

                      {/* Icon */}
                      <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl border border-slate-100 dark:border-slate-700 relative">
                        <MdOutlineRateReview className="text-5xl text-slate-300 dark:text-slate-600" />
                        <div className="absolute -top-2 -right-2 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-[10px] font-black text-slate-900">0</span>
                        </div>
                      </div>

                      <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-3">
                        Be The First To Review
                      </h3>
                      <p className="text-sm font-medium text-slate-400 dark:text-slate-500 max-w-sm mx-auto text-center leading-relaxed mb-8">
                        No one has shared their experience yet. Your honest review helps thousands of buyers make the right choice.
                      </p>

                      <button
                        onClick={() => setIsReviewModalOpen(true)}
                        className="px-10 py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-yellow-400/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <MdRateReview size={18} /> Write First Review
                      </button>

                      <p className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest mt-5">
                        Takes less than 2 minutes
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </section>

      {/* ─── Similar Section ─── */}
      <section className="max-w-7xl mx-auto px-4 mt-32 pb-32">
        <header className="flex items-end justify-between gap-8 mb-16">
          <div className="space-y-3">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
              COMPLETE THE <span className="text-teal-600">COLLECTION.</span>
            </h2>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 border-l-4 border-teal-500/20 pl-6">
              Discover matching units designed for the same architectural flow.
            </p>
          </div>
          <Link to="/products" className="group hidden md:flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white pb-1 active:scale-95 transition-all">
            Browse Full Catalog <MdArrowForward className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {related.map(item => (
            <motion.div
              key={item.id}
              whileHover={{ y: -15 }}
              className="group bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-2 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-500"
            >
              <div className="aspect-square bg-slate-50 dark:bg-slate-800 rounded-[1.75rem] overflow-hidden mb-5 p-6 relative">
                <Link to={`/product/${item.id}`}>
                  <img src={item.image || '/Logo2.png'} alt={item.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 mix-blend-multiply dark:mix-blend-normal" />
                </Link>
                <button className="absolute bottom-4 right-4 w-10 h-10 bg-white dark:bg-slate-700 text-slate-400 hover:text-rose-500 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110">
                  <MdFavoriteBorder size={18} />
                </button>
              </div>
              <div className="px-4 pb-6 space-y-3">
                <header>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.brand || 'Elite'}</p>
                  <h3 className="text-xs font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-teal-600 transition-colors">{item.name}</h3>
                </header>
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-slate-900 dark:text-white">₹{(item.price || 0).toLocaleString()}</span>
                  <AddToCartButton product={item} compact className="w-10 h-10 rounded-2xl" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Floating Mobile Bar ─── */}
      <footer className="fixed bottom-0 left-0 right-0 z-[60] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 p-4 md:hidden">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <div className="pr-4 border-r border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total</p>
            <p className="text-lg font-black text-slate-900 dark:text-white leading-none">₹{product.price.toLocaleString()}</p>
          </div>
          <button onClick={() => addToCart(product, quantity)} className="flex-1 bg-black dark:bg-white text-white dark:text-slate-900 h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-transform flex items-center justify-center gap-3">
            <MdShoppingCart size={20} /> Add
          </button>
          <button onClick={() => navigate('/checkout')} className="flex-1 bg-teal-600 text-white h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-transform shadow-lg shadow-teal-500/20">
            Buy
          </button>
        </div>
      </footer>

      {/* ─── Review Submission Modal ─── */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsReviewModalOpen(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
              <div className="p-8 sm:p-12 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Your Feedback</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rate your experience</p>
                  </div>
                  <button onClick={() => setIsReviewModalOpen(false)} className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-100 transition-colors"><MdClose size={24} /></button>
                </div>

                <form onSubmit={handleReviewSubmit} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} type="button" onClick={() => setReviewRating(star)} className="focus:outline-none transition-transform hover:scale-125">
                          <MdStar size={40} className={star <= reviewRating ? 'text-yellow-400' : 'text-slate-100 dark:text-slate-800'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Share Detailed Experience</label>
                    <textarea
                      required
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      placeholder="What exactly did you like or dislike?"
                      className="w-full h-40 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-6 outline-none focus:border-yellow-400 font-bold text-sm transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full h-16 bg-slate-900 dark:bg-yellow-400 text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {isSubmittingReview ? 'SENDING...' : 'PUBLISH REVIEW'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ProductDetail;