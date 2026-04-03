import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdShoppingCart,
  MdVerified,
  MdArrowForward,
  MdStar,
  MdPhone,
  MdEmail,
  MdLocationOn,
  MdChevronLeft,
  MdChevronRight,
  MdSecurity,
  MdLocalShipping,
  MdHandshake,
  MdOutlineWorkspacePremium,
  MdInventory
} from 'react-icons/md';
import { FaFacebookF, FaInstagram } from 'react-icons/fa';
import customerService from '../services/customerService';
import HeroSlider from '../components/home/HeroSlider';
import SafeImage from '../components/common/SafeImage';
import { formatMediaUrl } from '../utils/mediaUtils';

// ─── Skeleton Components ──────────────────────────────────────────────────────
const CategorySkeleton = () => (
  <div className="group relative h-[160px] sm:h-[260px] md:h-[360px] lg:h-[450px] rounded-2xl sm:rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-200 animate-pulse">
    <div className="absolute bottom-3 left-3 right-3 md:bottom-8 md:left-8 md:right-8 space-y-2">
      <div className="h-3 md:h-6 bg-slate-300 rounded w-3/4"></div>
      <div className="h-7 md:h-10 bg-slate-300 rounded"></div>
    </div>
  </div>
);

const ProductSkeleton = () => (
  <div className="bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-slate-100 p-3 md:p-4 animate-pulse">
    <div className="aspect-square bg-slate-200 rounded-xl mb-3 md:mb-4"></div>
    <div className="h-3 md:h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
    <div className="h-3 md:h-4 bg-slate-200 rounded w-1/2"></div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const LandingPage = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, [location]);

  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectionsLoaded, setSectionsLoaded] = useState({ banners: false, products: false });

  useEffect(() => {
    const loadHomeData = async () => {
      const safeFetch = async (promise, fallback) => {
        try { return await promise; } catch (e) { console.warn('Section load failed', e); return fallback; }
      };
      try {
        setLoading(true);
        const bannersData = await safeFetch(customerService.getBanners(), []);
        setBanners(Array.isArray(bannersData) ? bannersData : []);
        setSectionsLoaded(prev => ({ ...prev, banners: true }));

        const [categoriesData, brandsData, testimonialsData, productsData] = await Promise.all([
          safeFetch(customerService.getCategories(), []),
          safeFetch(customerService.getBrands(), []),
          safeFetch(customerService.getTestimonials(), []),
          safeFetch(customerService.getProducts(), [])
        ]);

        setCategories(Array.isArray(categoriesData) ? categoriesData.slice(0, 4) : []);
        setBrands(Array.isArray(brandsData) ? brandsData : []);
        setTestimonials(Array.isArray(testimonialsData) ? testimonialsData.slice(0, 2) : []);

        const rawProducts = Array.isArray(productsData)
          ? productsData
          : (productsData?.content || productsData?.data || []);
        const normalizedProducts = rawProducts.map(p => ({
          ...p,
          brand: p.brand && typeof p.brand === 'object' ? p.brand.name : (p.brand || 'No Brand'),
          category: p.category && typeof p.category === 'object' ? p.category.name : (p.category || 'No Category'),
        })).slice(0, 4);

        setProducts(normalizedProducts);
        setSectionsLoaded(prev => ({ ...prev, products: true }));
      } catch (error) {
        console.error('Critical failure loading home data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const stats = [
    { label: 'Happy Clients', value: '10k+', icon: <MdStar className="text-yellow-400" /> },
    { label: 'Years of Excellence', value: '7+', icon: <MdVerified className="text-teal-500" /> },
    { label: 'Premium Brands', value: '15+', icon: <MdOutlineWorkspacePremium className="text-indigo-500" /> },
    { label: 'Service Areas', value: '50+', icon: <MdLocationOn className="text-red-500" /> },
  ];

  const features = [
    { title: 'Premium Quality', desc: 'Every piece is handpicked from world-renowned manufacturers ensuring lifetime durability.', icon: <MdOutlineWorkspacePremium />, color: 'bg-teal-50 text-teal-600 shadow-teal-100' },
    { title: 'Secured Logistics', desc: 'Multi-layer protective packaging for zero-damage delivery guarantee.', icon: <MdSecurity />, color: 'bg-blue-50 text-blue-600 shadow-blue-100' },
    { title: 'Priority Support', desc: 'Architectural consultants available 24/7 to help you choose the perfect fittings for your vision.', icon: <MdHandshake />, color: 'bg-indigo-50 text-indigo-600 shadow-indigo-100' },
    { title: 'Smart Inventory', desc: 'Over 5000+ ready-to-dispatch units. No waiting months for your dream bathroom.', icon: <MdInventory />, color: 'bg-amber-50 text-amber-600 shadow-amber-100' },
    { title: 'Green Tech', desc: 'Eco-friendly fittings that reduce water consumption by up to 40% without compromising on pressure.', icon: <MdVerified />, color: 'bg-emerald-50 text-emerald-600 shadow-emerald-100' },
    { title: 'Fast Shipping', desc: 'Nationwide logistics ensuring your order reaches you within 3-5 business days across India.', icon: <MdLocalShipping />, color: 'bg-rose-50 text-rose-600 shadow-rose-100' },
  ];

  return (
    <div id="home" className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <HeroSlider banners={banners} />

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <section className="relative z-30 -mt-6 sm:-mt-10 md:-mt-14 lg:-mt-16 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="bg-white p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl flex flex-col items-center text-center border border-slate-100"
            >
              <div className="text-lg sm:text-2xl md:text-3xl mb-1 sm:mb-2 md:mb-3">{stat.icon}</div>
              <div className="text-sm sm:text-xl md:text-2xl lg:text-3xl font-black text-slate-900 leading-none">{stat.value}</div>
              <div className="text-[8px] sm:text-[10px] md:text-xs lg:text-sm font-semibold text-slate-500 uppercase tracking-tight sm:tracking-wider mt-0.5 sm:mt-1 leading-tight text-center">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 md:mb-20 lg:mb-24">
            <h3 className="text-teal-600 font-black tracking-[0.3em] uppercase mb-3 text-xs sm:text-sm">Why Choose Us</h3>
            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight tracking-tighter uppercase">
              The Gold Standard in <span className="text-teal-600 italic">Living.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
            {features.map((feat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="group p-6 sm:p-8 md:p-8 lg:p-10 rounded-2xl sm:rounded-[2rem] border border-slate-100 bg-white hover:shadow-2xl hover:border-teal-100 transition-all cursor-default"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 ${feat.color} rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl md:text-4xl mb-5 sm:mb-6 md:mb-8 group-hover:scale-110 transition-transform shadow-lg`}>
                  {feat.icon}
                </div>
                <h4 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-slate-900 mb-2 sm:mb-3 md:mb-4 uppercase tracking-tighter">
                  {feat.title}
                </h4>
                <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ─────────────────────────────────────────────────────────────── */}
      <section id="about" className="py-10 sm:py-16 md:py-24 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center">

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -top-4 -left-4 w-24 sm:w-32 md:w-40 h-24 sm:h-32 md:h-40 bg-teal-100/50 rounded-full blur-2xl md:blur-3xl" />
              <img
                src="/showroom_premium.png"
                alt="Showroom"
                className="relative z-10 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] shadow-[0_20px_50px_-5px_rgba(0,0,0,0.1)] w-full transform -rotate-1 sm:-rotate-2"
              />
              <div className="absolute -bottom-4 -right-4 sm:-bottom-5 sm:-right-5 md:-bottom-6 md:-right-6 z-20 bg-teal-600 text-white p-4 sm:p-5 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl">
                <p className="text-xl sm:text-2xl md:text-3xl font-black leading-none">7+</p>
                <p className="text-[9px] sm:text-xs md:text-sm uppercase tracking-widest font-bold mt-0.5">Years Trust</p>
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col justify-center"
            >
              <h3 className="text-teal-600 text-xs sm:text-sm md:text-base font-black tracking-widest uppercase mb-2 sm:mb-3 md:mb-4 flex items-center gap-2">
                <span className="w-6 sm:w-8 h-[2px] bg-teal-600 inline-block" /> Defining Luxury
              </h3>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-slate-950 mb-4 sm:mb-5 md:mb-6 md:mb-8 leading-tight uppercase tracking-tighter">
                Crafting Your <span className="text-teal-600 italic">Vision.</span>
              </h2>
              <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 text-slate-600 text-sm sm:text-base md:text-base lg:text-lg leading-relaxed">
                <p>
                  Since 2019, Singhai Traders has stood as a beacon of excellence in the sanitary ware industry. We don't just sell fittings; we curate experiences that elevate your daily life.
                </p>
                <p>
                  Our showroom in Balaghat houses a handpicked collection of the world's finest brands, ensuring every piece meets the highest standards.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────────────── */}
      <section id="products" className="py-10 sm:py-16 md:py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[200px] md:w-[500px] h-[200px] md:h-[500px] bg-teal-500/10 rounded-full blur-[60px] md:blur-[120px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-row items-end justify-between mb-6 sm:mb-8 md:mb-12 lg:mb-16 gap-2">
            <div>
              <h3 className="text-teal-400 text-[10px] sm:text-xs md:text-sm lg:text-base font-black tracking-widest uppercase mb-1 sm:mb-2 md:mb-4">The Collection</h3>
              <h2 className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight uppercase tracking-tighter">
                Curated <span className="text-teal-400 italic">Categories.</span>
              </h2>
            </div>
            <Link to="/shop" className="text-teal-400 text-xs sm:text-sm md:text-base font-bold flex items-center gap-1 sm:gap-2 hover:gap-3 transition-all whitespace-nowrap">
              VIEW ALL <MdArrowForward className="text-base sm:text-lg md:text-[20px]" />
            </Link>
          </div>

          {/* Category Grid: 2 col mobile → 4 col desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-8">
            {!sectionsLoaded.products ? (
              Array.from({ length: 4 }).map((_, i) => <CategorySkeleton key={i} />)
            ) : categories.map((cat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -8 }}
                className="group relative h-[160px] sm:h-[240px] md:h-[340px] lg:h-[420px] xl:h-[450px] rounded-2xl sm:rounded-[1.5rem] lg:rounded-[2.5rem] overflow-hidden shadow-2xl"
              >
                <img
                  src={formatMediaUrl(cat.image)}
                  alt={cat.name}
                  loading={idx > 1 ? 'lazy' : 'eager'}
                  onError={(e) => {
                    e.target.src = '/Logo2.png';
                    e.target.classList.add('object-contain', 'p-8', 'bg-slate-100');
                    e.target.classList.remove('object-cover');
                  }}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent opacity-90" />

                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 md:bottom-6 md:left-6 md:right-6 lg:bottom-8 lg:left-8 lg:right-8">
                  <span className="hidden sm:inline-block bg-teal-600/30 backdrop-blur-md text-teal-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 sm:px-3 py-0.5 sm:py-1 rounded-full mb-1.5 sm:mb-2 md:mb-3 border border-teal-500/30">
                    {cat.tag}
                  </span>
                  <h4 className="text-xs sm:text-sm md:text-lg lg:text-2xl font-black text-white mb-2 sm:mb-3 md:mb-4 lg:mb-6 leading-tight uppercase tracking-tighter">
                    {cat.name}
                  </h4>
                  <Link
                    to={cat.link}
                    className="w-full bg-white text-slate-950 py-1.5 sm:py-2 md:py-3 lg:py-4 rounded-lg sm:rounded-xl md:rounded-2xl font-black text-[9px] sm:text-xs md:text-sm flex items-center justify-center gap-1 md:gap-2 transition-all duration-300 hover:bg-teal-50"
                  >
                    DETAILS
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── New Arrivals ──────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8 sm:mb-10 md:mb-14 lg:mb-16">
            <div>
              <h3 className="text-teal-600 text-[10px] sm:text-xs md:text-sm font-black tracking-widest uppercase mb-1 sm:mb-2 md:mb-4">Latest Arrivals</h3>
              <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                New <span className="text-teal-600 italic">Segments.</span>
              </h2>
            </div>
            <Link to="/shop" className="text-teal-600 font-bold flex items-center gap-1 sm:gap-2 group text-xs sm:text-sm md:text-base whitespace-nowrap">
              EXPLORE ALL <MdArrowForward className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-8">
            {!sectionsLoaded.products ? (
              Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
            ) : products.length > 0 ? products.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-slate-50 rounded-[1.5rem] sm:rounded-[1.75rem] md:rounded-[2rem] overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-500"
              >
                <div className="aspect-square overflow-hidden bg-white">
                  <img
                    src={formatMediaUrl(product.image)}
                    alt={product.name}
                    loading={idx > 1 ? 'lazy' : 'eager'}
                    onError={(e) => {
                      e.target.src = '/Logo2.png';
                      e.target.classList.add('object-contain', 'p-6');
                      e.target.classList.remove('object-cover');
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-3 sm:p-4 md:p-5 lg:p-8">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2 text-[9px] sm:text-[10px] font-black text-teal-600 uppercase tracking-widest">
                    <span className="truncate">{product.brand}</span>
                    <span className="w-1 h-1 bg-teal-200 rounded-full flex-shrink-0" />
                    <span className="text-slate-400 truncate">{product.category}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm md:text-base lg:text-xl font-black text-slate-900 mb-2 sm:mb-3 md:mb-4 truncate uppercase tracking-tighter group-hover:text-teal-600 transition-colors">
                    {product.name}
                  </h4>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm sm:text-base md:text-lg lg:text-2xl font-black text-slate-950">
                      ₹{(product.price || 0).toLocaleString()}
                    </span>
                    <Link
                      to="/shop"
                      className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-slate-900 text-white rounded-xl sm:rounded-2xl flex items-center justify-center hover:bg-teal-600 transition-all shadow-lg active:scale-95 flex-shrink-0"
                    >
                      <MdShoppingCart className="text-sm sm:text-base md:text-lg lg:text-[20px]" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-12 sm:py-16 md:py-20 text-center bg-slate-50 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] border-2 border-dashed border-slate-200">
                <MdInventory className="mx-auto text-5xl sm:text-6xl text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs sm:text-sm">Synchronizing new inventory...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Brands ────────────────────────────────────────────────────────────── */}
      <section id="brands" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 md:mb-20">
            <h3 className="text-teal-600 font-black tracking-widest uppercase mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm">Authorized Dealer</h3>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-slate-950">Trusted by World-Class Brands</h2>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-x-8 sm:gap-x-12 md:gap-x-16 gap-y-6 sm:gap-y-8 md:gap-y-12 opacity-60 grayscale hover:grayscale-0 transition-all">
            {brands.map((brand, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center p-4 sm:p-6 transition-all group-hover:shadow-xl group-hover:border-teal-100 group-hover:bg-white overflow-hidden relative">
                  {!brand.logo || brand.logo === 'null' ? (
                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="text-xl sm:text-2xl md:text-3xl font-black text-teal-600/30 group-hover:text-teal-600/60 transition-colors uppercase">
                        {brand.name?.substring(0, 2) || 'B'}
                      </span>
                      <span className="text-[8px] md:text-[10px] font-black text-slate-300 uppercase tracking-tighter mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {brand.name}
                      </span>
                    </div>
                  ) : (
                    <SafeImage
                      src={brand.logo}
                      alt={brand.name}
                      className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-14 md:py-20 lg:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stack on mobile, side-by-side on md+ */}
          <div className="flex flex-col md:grid md:grid-cols-3 gap-6 md:gap-8 lg:gap-12 items-start md:items-center">

            {/* Label */}
            <div className="md:col-span-1">
              <h3 className="text-teal-600 text-xs sm:text-sm md:text-base font-black tracking-widest uppercase mb-1 sm:mb-2 md:mb-4">Reviews</h3>
              <h2 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-black text-slate-950 mb-2 md:mb-4 lg:mb-6 leading-tight uppercase tracking-tighter">
                Client <span className="text-teal-600 italic">Intel.</span>
              </h2>
              <p className="text-slate-600 text-sm sm:text-base md:text-base lg:text-lg leading-relaxed">
                Excellence is not an act, but a habit. Read how we've helped shape high-end architectural projects.
              </p>
            </div>

            {/* Cards */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 w-full">
              {testimonials.map((t, idx) => (
                <div key={idx} className="bg-white p-5 sm:p-6 md:p-7 lg:p-10 rounded-2xl sm:rounded-3xl shadow-lg border border-slate-100 flex flex-col h-full">
                  <div className="flex gap-0.5 sm:gap-1 text-yellow-400 mb-3 md:mb-4 lg:mb-6">
                    {[...Array(t.rating || 5)].map((_, i) => <MdStar key={i} className="text-base sm:text-lg md:text-[20px]" />)}
                  </div>
                  <p className="text-slate-600 italic text-sm sm:text-sm md:text-base lg:text-lg mb-4 md:mb-6 lg:mb-8 leading-relaxed line-clamp-4">
                    "{t.comment}"
                  </p>
                  <div className="flex items-center gap-3 md:gap-4 mt-auto">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-slate-200 rounded-full shrink-0" />
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-slate-950 text-sm sm:text-base truncate uppercase tracking-tighter">{t.name}</h4>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium truncate uppercase">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="py-6 sm:py-8 md:py-10 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative overflow-hidden bg-slate-950 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] lg:rounded-[3rem] p-8 sm:p-12 md:p-16 lg:p-24 text-center">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1920&fit=crop')] opacity-20 bg-cover bg-center" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-3 sm:mb-4 md:mb-5 lg:mb-6 leading-tight uppercase tracking-tighter">
              Build Your <span className="text-teal-400 italic">Vision.</span>
            </h2>
            <p className="text-xs sm:text-sm md:text-base lg:text-xl text-slate-300 mb-6 sm:mb-8 md:mb-10 lg:mb-12 font-light">
              Visit our showroom or browse digital catalog to find perfect fittings.
            </p>
            <div className="flex flex-row justify-center gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              <Link
                to="/shop"
                className="bg-teal-600 hover:bg-teal-500 text-white px-5 sm:px-7 md:px-8 lg:px-10 py-2.5 sm:py-3 md:py-4 lg:py-5 rounded-full font-black shadow-2xl transition-all text-[10px] sm:text-xs md:text-sm lg:text-base uppercase tracking-widest"
              >
                SHOP CATALOG
              </Link>
              <Link
                to="/contact"
                className="bg-white text-slate-950 px-5 sm:px-7 md:px-8 lg:px-10 py-2.5 sm:py-3 md:py-4 lg:py-5 rounded-full font-black shadow-2xl transition-all text-[10px] sm:text-xs md:text-sm lg:text-base uppercase tracking-widest hover:bg-slate-100"
              >
                CONSULTATION
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;