import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdStar, MdShoppingBag, MdArrowForward, MdRateReview, MdMessage, MdClose,
  MdOutlineRateReview, MdSentimentVerySatisfied, MdEdit, MdDelete, MdCheckCircle,
  MdHourglassEmpty
} from 'react-icons/md';
import { Card, Badge, Skeleton } from '../../components/common/DashboardUI';
import customerService from '../../services/customerService';
import SafeImage from '../../components/common/SafeImage';
import { toast } from 'react-hot-toast';

/* ─── Star display helper ─── */
const StarRow = ({ count, size = 'text-lg' }) =>
  Array(5).fill(0).map((_, i) => (
    <MdStar key={i} className={`${size} ${i < count ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-700'}`} />
  ));

/* ─── Interactive star picker ─── */
const StarPicker = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          className="focus:outline-none transition-transform hover:scale-125 active:scale-95"
        >
          <MdStar className={`text-3xl sm:text-4xl transition-colors ${s <= (hovered || value) ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-700'}`} />
        </button>
      ))}
    </div>
  );
};

const Reviews = () => {
  const [myReviews, setMyReviews] = useState([]);
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // Write-review state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Edit-review state
  const [editingReview, setEditingReview] = useState(null); // { id, rating, comment }
  const [isEditLoading, setIsEditLoading] = useState(false);

  // ── Fetch data ──────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewsData, ordersData] = await Promise.all([
          customerService.getMyReviews(),
          customerService.getMyOrders()
        ]);

        setMyReviews(Array.isArray(reviewsData) ? reviewsData : []);

        // Extract unique products from all order items
        const productsMap = new Map();
        (Array.isArray(ordersData) ? ordersData : []).forEach(order => {
          // Backend may use `items` or `orderItems`
          const items = order.items || order.orderItems || [];
          console.log('[Reviews] Order', order.id, '→ items:', items);
          items.forEach(item => {
            const product = item.product;
            console.log('[Reviews] item.product:', product);
            if (product?.id && !productsMap.has(product.id)) {
              productsMap.set(product.id, {
                id: product.id,
                name: product.name,
                mainImage: product.mainImage || product.image || null,
              });
            }
          });
        });
        const productsList = Array.from(productsMap.values());
        console.log('[Reviews] Purchased products:', productsList);
        setPurchasedProducts(productsList);
      } catch (err) {
        console.error('Failed to fetch review data:', err);
        toast.error('Could not load reviews');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Submit new review ────────────────────────────────────────
  // API: POST /api/reviews  Body: { productId: Long, rating: Integer, comment: String }
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsSubmitLoading(true);
    try {
      const rawId = selectedProduct?.id || selectedProduct?.productId;
      const parsedId = Number(rawId);

      if (!parsedId || isNaN(parsedId)) {
        console.error('[Reviews] Missing or invalid ID:', selectedProduct);
        toast.error('Could not identify the product ID');
        setIsSubmitLoading(false);
        return;
      }

      const payload = {
        productId: parsedId,        // Primary (camelCase)
        product_id: parsedId,       // Fallback 1 (snake_case)
        id: parsedId,               // Fallback 2 (plain)
        product: { id: parsedId },  // Fallback 3 (nested, if expecting entity partial)
        rating: Number(rating),
        comment: String(comment).trim(),
      };
      
      console.log('[Reviews] Submitting Review...', payload);
      
      const newReview = await customerService.postReview(payload);
      toast.success('Review submitted!');
      setMyReviews(prev => [newReview, ...prev]);
      setSelectedProduct(null);
      setRating(5);
      setComment('');
    } catch (err) {
      console.error('[Reviews] Error response:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || err.message || 'Failed to submit review');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // ── Save edited review ───────────────────────────────────────
  // API: PUT /api/reviews/{id}  Body: { rating, comment }
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingReview) return;

    setIsEditLoading(true);
    try {
      // Backend: PUT /api/reviews/{id} expects @RequestBody Review (entity)
      // ReviewService reads only rating & comment from it
      const updated = await customerService.updateReview(editingReview.id, {
        rating: Number(editingReview.rating),
        comment: String(editingReview.comment).trim(),
      });
      setMyReviews(prev => prev.map(r => r.id === updated.id ? updated : r));
      toast.success('Review updated!');
      setEditingReview(null);
    } catch (err) {
      toast.error('Failed to update review');
    } finally {
      setIsEditLoading(false);
    }
  };

  // ── Delete review ────────────────────────────────────────────
  // API: DELETE /api/reviews/{id}
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await customerService.deleteReview(id);
      setMyReviews(prev => prev.filter(r => r.id !== id));
      toast.success('Review deleted');
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  // ── Helpers ──────────────────────────────────────────────────
  // Check if customer already reviewed a given product
  const alreadyReviewed = (productId) =>
    myReviews.some(r => r.product?.id === productId || r.productId === productId);

  return (
    <div className="px-3 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-6 max-w-[1600px] mx-auto min-h-screen">

      {/* ─── Page Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-main)] tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <MdStar className="text-yellow-600 text-xl sm:text-2xl lg:text-3xl" />
            </div>
            Reviews
          </h1>
          <p className="text-[var(--text-muted)] font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] ml-1 sm:ml-14 opacity-70">
            Rate purchases &amp; share feedback
          </p>
        </div>
        <div className="flex items-center gap-3 sm:ml-14">
          <div className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl flex items-center gap-2 shadow-sm">
            <MdStar className="text-yellow-400 text-lg" />
            <span className="text-sm font-black text-[var(--text-main)]">{myReviews.length}</span>
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Reviews</span>
          </div>
        </div>
      </div>

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left Column: Products to Rate ── */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-0 overflow-hidden border-orange-500/10 shadow-xl">
            <div className="p-5 border-b border-[var(--border-main)] bg-[var(--bg-app)]/50">
              <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-widest flex items-center gap-2">
                <MdRateReview className="text-orange-500" />
                Rate a Purchase
              </h3>
              <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-tighter mt-1 opacity-60">
                Products you've bought
              </p>
            </div>

            <div className="p-4 max-h-[500px] overflow-y-auto space-y-3">
              {isLoading ? (
                [1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
              ) : purchasedProducts.length > 0 ? (
                purchasedProducts.map((product) => {
                  const done = alreadyReviewed(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => !done && setSelectedProduct(product)}
                      className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                        done
                          ? 'opacity-60 cursor-default bg-slate-50 dark:bg-slate-900 border-[var(--border-subtle)]'
                          : selectedProduct?.id === product.id
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 shadow-lg shadow-yellow-500/10 cursor-pointer'
                            : 'bg-white dark:bg-slate-900 border-[var(--border-main)] hover:border-yellow-400 cursor-pointer'
                      }`}
                    >
                      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden border border-[var(--border-main)] shrink-0">
                        <SafeImage src={product.mainImage} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[10px] font-black text-[var(--text-main)] truncate uppercase">{product.name}</h4>
                        {done ? (
                          <p className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                            <MdCheckCircle /> Reviewed
                          </p>
                        ) : (
                          <p className="text-[9px] text-teal-600 font-bold">Tap to review</p>
                        )}
                      </div>
                      {!done && (
                        <MdArrowForward
                          className={`text-lg transition-transform ${selectedProduct?.id === product.id ? 'text-yellow-600 translate-x-1' : 'text-slate-300'}`}
                        />
                      )}
                    </div>
                  );
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-10 px-4 flex flex-col items-center gap-3"
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
                    <MdShoppingBag className="text-3xl text-slate-200" />
                  </div>
                  <h4 className="text-xs font-black text-[var(--text-main)] uppercase tracking-widest">No Purchases Yet</h4>
                  <p className="text-[10px] font-medium text-[var(--text-muted)] leading-relaxed max-w-[180px]">
                    Buy a product to unlock the ability to share your review.
                  </p>
                </motion.div>
              )}
            </div>
          </Card>
        </div>

        {/* ── Right Column: Form & History ── */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">

            {/* ─── Write Review Form ─── */}
            {selectedProduct ? (
              <motion.div key="write-form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Card className="p-6 sm:p-8 border-yellow-500/20 shadow-2xl relative">
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                  >
                    <MdClose className="text-xl text-[var(--text-muted)]" />
                  </button>

                  <div className="flex flex-col sm:flex-row gap-6 mb-8">
                    <div className="w-28 h-28 sm:w-36 sm:h-36 bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden border border-[var(--border-main)] shrink-0">
                      <SafeImage src={selectedProduct.mainImage} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <Badge variant="warning" className="mb-2">Writing Review</Badge>
                        <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] uppercase tracking-tight leading-tight">
                          {selectedProduct.name}
                        </h2>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block">
                          Your Rating
                        </label>
                        <StarPicker value={rating} onChange={setRating} />
                        <p className="text-[10px] font-bold text-yellow-500">{rating} / 5 stars</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitReview} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block">
                        Share Your Experience
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="What did you like or dislike about this product? How's the quality and durability?"
                        className="w-full min-h-[130px] p-4 bg-slate-50 dark:bg-slate-900 border-2 border-[var(--border-subtle)] rounded-2xl text-sm font-medium focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 outline-none transition-all resize-none dark:text-white"
                        required
                        minLength={10}
                      />
                      <p className="text-[10px] text-[var(--text-muted)] font-medium text-right">{comment.length} chars</p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={isSubmitLoading}
                        className="flex-1 sm:flex-none px-10 py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-yellow-400/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmitLoading ? (
                          <><span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> Submitting...</>
                        ) : (
                          <><MdMessage /> Post Review</>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedProduct(null)}
                        className="px-6 py-4 border-2 border-[var(--border-main)] text-[var(--text-muted)] rounded-2xl font-black text-xs uppercase tracking-widest hover:border-slate-400 transition-all"
                      >
                        Cancel
                      </button>
                    </div>

                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <MdHourglassEmpty className="text-amber-400" />
                      Reviews go live after admin approval
                    </p>
                  </form>
                </Card>
              </motion.div>

            ) : editingReview ? (
              /* ─── Edit Review Form ─── */
              <motion.div key="edit-form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Card className="p-6 sm:p-8 border-teal-500/20 shadow-2xl relative">
                  <button
                    onClick={() => setEditingReview(null)}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                  >
                    <MdClose className="text-xl text-[var(--text-muted)]" />
                  </button>

                  <Badge variant="primary" className="mb-4">Editing Review</Badge>
                  <h2 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tight mb-6">
                    Update Your Feedback
                  </h2>

                  <form onSubmit={handleSaveEdit} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block">Rating</label>
                      <StarPicker value={editingReview.rating} onChange={(v) => setEditingReview(r => ({ ...r, rating: v }))} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block">Comment</label>
                      <textarea
                        value={editingReview.comment}
                        onChange={(e) => setEditingReview(r => ({ ...r, comment: e.target.value }))}
                        className="w-full min-h-[120px] p-4 bg-slate-50 dark:bg-slate-900 border-2 border-[var(--border-subtle)] rounded-2xl text-sm font-medium focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all resize-none dark:text-white"
                        required
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={isEditLoading}
                        className="flex-1 sm:flex-none px-10 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-teal-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isEditLoading ? 'Saving...' : <><MdEdit /> Save Changes</>}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingReview(null)}
                        className="px-6 py-4 border-2 border-[var(--border-main)] text-[var(--text-muted)] rounded-2xl font-black text-xs uppercase tracking-widest hover:border-slate-400 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </Card>
              </motion.div>

            ) : (
              /* ─── Feedback History List ─── */
              <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-[0.2em]">Your Feedback History</h3>
                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none">
                      {myReviews.length} Total
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {isLoading ? (
                      [1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
                    ) : myReviews.length > 0 ? (
                      myReviews.map((rev) => (
                        <motion.div key={rev.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                          <Card className="p-5 border-l-4 border-l-yellow-400 group hover:shadow-lg transition-all">
                            <div className="flex gap-4">
                              {/* Product image */}
                              <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden border border-[var(--border-main)] shrink-0 grayscale group-hover:grayscale-0 transition-all">
                                <SafeImage
                                  src={rev.product?.mainImage || rev.product?.images?.[0]}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Content */}
                              <div className="flex-1 space-y-2 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <h4 className="text-xs font-black text-[var(--text-main)] uppercase tracking-tight truncate">
                                      {rev.product?.name || 'Product'}
                                    </h4>
                                    {rev.product?.brand && (
                                      <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
                                        {typeof rev.product.brand === 'string' ? rev.product.brand : rev.product.brand?.name}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex shrink-0">
                                    <StarRow count={rev.rating} />
                                  </div>
                                </div>

                                <p className="text-[11px] sm:text-xs text-[var(--text-muted)] font-medium italic leading-relaxed">
                                  &ldquo;{rev.comment}&rdquo;
                                </p>

                                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                                  <div className="flex items-center gap-2">
                                    {rev.approved ? (
                                      <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1">
                                        <MdCheckCircle /> Approved &amp; Public
                                      </span>
                                    ) : (
                                      <span className="text-[8px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-1">
                                        <MdHourglassEmpty /> Pending Approval
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-bold text-slate-400 uppercase">
                                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                                    </span>
                                    {/* Edit / Delete actions */}
                                    <button
                                      onClick={() => setEditingReview({ id: rev.id, rating: rev.rating, comment: rev.comment })}
                                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-teal-600 transition-all"
                                      title="Edit review"
                                    >
                                      <MdEdit className="text-sm" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(rev.id)}
                                      className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 transition-all"
                                      title="Delete review"
                                    >
                                      <MdDelete className="text-sm" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="py-16 bg-[var(--bg-card)] rounded-3xl border border-dashed border-[var(--border-main)] flex flex-col items-center px-6 relative overflow-hidden"
                      >
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-48 h-48 bg-yellow-400/5 rounded-full blur-3xl" />
                        </div>

                        <div className="flex gap-1.5 mb-6">
                          {[1, 2, 3, 4, 5].map((s, i) => (
                            <motion.div
                              key={s}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.07, type: 'spring' }}
                            >
                              <MdStar className="text-3xl text-slate-100 dark:text-slate-800" />
                            </motion.div>
                          ))}
                        </div>

                        <div className="w-20 h-20 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-100 rounded-[1.5rem] flex items-center justify-center mb-5 shadow-lg relative">
                          <MdOutlineRateReview className="text-4xl text-yellow-300" />
                          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-[9px] font-black text-slate-900">0</span>
                          </div>
                        </div>

                        <h3 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight mb-2">
                          No Reviews Written Yet
                        </h3>
                        <p className="text-[11px] font-medium text-[var(--text-muted)] text-center max-w-xs leading-relaxed mb-6">
                          Select a product on the left and share your honest experience. Your voice matters!
                        </p>
                        <MdSentimentVerySatisfied className="text-5xl text-yellow-200 animate-bounce" />
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
