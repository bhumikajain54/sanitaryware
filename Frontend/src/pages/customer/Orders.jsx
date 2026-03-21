import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdShoppingBag, MdSearch, MdFilterList, MdVisibility,
  MdLocalShipping, MdCheckCircle, MdCancel, MdInfo,
  MdArrowForward, MdHistory, MdClose, MdLocationOn,
  MdPayment, MdReceipt, MdArrowBack
} from 'react-icons/md';
import { Card, Badge, Skeleton } from '../../components/common/DashboardUI';
import { toast } from 'react-hot-toast';
import customerService from '../../services/customerService';
import SafeImage from '../../components/common/SafeImage';
import { useAuth } from '../../context/AuthContext';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await customerService.getMyOrders();
        setOrders(data || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const loadRazorpayScript = () => new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handleRetryPayment = async (order) => {
    try {
      const res = await loadRazorpayScript();
      if (!res) { alert('Razorpay SDK failed to load. Are you online?'); return; }
      const paymentInit = await customerService.initiatePayment({
        orderId: order.id, amount: order.totalAmount,
        paymentMethod: order.paymentMethod || 'RAZORPAY'
      });
      if (paymentInit.status === 'FAILED') { 
        toast.error(paymentInit.message || 'Payment initiation failed'); 
        return; 
      }

      const rzp = new window.Razorpay({
        key: paymentInit.key, amount: paymentInit.amount, currency: paymentInit.currency,
        name: 'Sanitaryware Store',
        description: `Payment for Order ${order.orderNumber || order.id}`,
        order_id: paymentInit.razorpayOrderId,
        handler: async (response) => {
          try {
            const verifyRes = await customerService.verifyRazorpayPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              internalOrderId: order.id
            });
            if (verifyRes.status === 'SUCCESS') { 
              toast.success('Payment successful!'); 
              setTimeout(() => window.location.reload(), 1500);
            }
            else toast.error(verifyRes.message || 'Payment verification failed');
          } catch { toast.error('Error verifying payment'); }
        },
        prefill: {
          name: user?.name || undefined,
          email: user?.email || undefined,
          contact: user?.phone || undefined
        },
        theme: { color: '#0d9488' }
      });

      rzp.on('payment.failed', function (response) {
        console.error('Razorpay Retry Payment Failed:', response.error);
        toast.error(`Payment Failed: ${response.error.description}`);
      });

      rzp.open();
    } catch (err) { 
      console.error('Retry Payment Error:', err);
      toast.error('Failed to start payment process'); 
    }
  };

  const handleViewDetails = (order) => { setSelectedOrder(order); setIsModalOpen(true); };

  const getStatusVariant = (status) => {
    if (!status) return 'neutral';
    const s = status.toLowerCase();
    if (s.includes('deliver')) return 'success';
    if (s.includes('ship') || s.includes('transit')) return 'info';
    if (s.includes('process') || s.includes('confirm')) return 'warning';
    if (s.includes('cancel')) return 'error';
    return 'neutral';
  };

  const getPaymentStatusVariant = (status) => {
    if (!status) return 'neutral';
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'success') return 'success';
    if (s === 'pending' || s === 'processing') return 'warning';
    if (s === 'failed' || s === 'cancelled') return 'error';
    return 'neutral';
  };

  const getStatusIcon = (status) => {
    if (!status) return <MdInfo />;
    const s = status.toLowerCase();
    if (s.includes('deliver')) return <MdCheckCircle className="text-emerald-500" />;
    if (s.includes('ship') || s.includes('transit')) return <MdLocalShipping className="text-blue-500" />;
    if (s.includes('cancel')) return <MdCancel className="text-rose-500" />;
    return <MdInfo className="text-amber-500" />;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      (order.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.items || []).some(item => (item.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || (order.status || '').toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const STATUS_TABS = ['all', 'pending', 'confirmed', 'delivered'];

  return (
    <div className="px-3 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-5 sm:space-y-6 md:space-y-8 max-w-[1600px] mx-auto">

      {/* ─── Header ─── */}
      <div className="flex flex-col gap-3 sm:gap-4 md:gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-main)] tracking-tight flex items-center gap-2 sm:gap-3">
              <MdHistory className="text-teal-600 flex-shrink-0 text-xl sm:text-2xl md:text-3xl lg:text-4xl" />
              <span className="truncate">My Orders</span>
            </h1>
            <p className="text-[var(--text-muted)] font-bold mt-0.5 sm:mt-1 text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest opacity-60">
              Track and manage your order history.
            </p>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 md:gap-4">
          <div className="relative group flex-1 sm:max-w-xs md:max-w-sm lg:max-w-md">
            <MdSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-lg sm:text-xl transition-colors group-focus-within:text-teal-600 z-10" />
            <input
              type="text"
              placeholder="Search order or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-12 pr-4 py-2.5 sm:py-3 md:py-3.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-[var(--text-main)] outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm placeholder:font-black placeholder:uppercase placeholder:tracking-widest placeholder:text-[9px] placeholder:opacity-40"
            />
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 bg-[var(--bg-card)] border border-[var(--border-main)] p-1 sm:p-1.5 rounded-xl sm:rounded-2xl shadow-sm overflow-x-auto no-scrollbar flex-shrink-0">
            {STATUS_TABS.map((status) => (
              <button key={status} onClick={() => setFilterStatus(status)}
                className={`flex-shrink-0 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterStatus === status
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-app)]'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── List ─── */}
      <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="p-0 overflow-hidden">
              <div className="p-4 sm:p-5 md:p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <Skeleton className="h-5 sm:h-6 w-28 sm:w-32" />
                <Skeleton className="h-5 sm:h-6 w-20 sm:w-24" />
              </div>
              <div className="p-4 sm:p-5 md:p-6">
                <Skeleton className="h-16 sm:h-20 w-full rounded-xl" />
              </div>
            </Card>
          ))
        ) : filteredOrders.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order, index) => (
              <motion.div key={order.id || index}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.05 }}
              >
                <Card noPadding className="hover:shadow-xl hover:border-teal-500/20 transition-all duration-300 group overflow-hidden">

                  {/* Top bar */}
                  <div className="flex flex-col xs:flex-row flex-wrap items-start xs:items-center justify-between gap-2.5 sm:gap-3 md:gap-4 p-3.5 sm:p-4 md:p-5 lg:p-6 bg-[var(--bg-app)]/50 border-b border-[var(--border-main)]">
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 md:gap-4 lg:gap-6 w-full xs:w-auto">
                      {/* Order ID */}
                      <div className="min-w-0">
                        <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Order ID</p>
                        <p className="text-[10px] sm:text-xs md:text-sm font-black text-[var(--text-main)] truncate max-w-[110px] sm:max-w-none">
                          {order.orderNumber || `#${String(order.id || '').toUpperCase().slice(-10)}`}
                        </p>
                      </div>
                      {/* Date */}
                      <div className="min-w-0">
                        <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Date</p>
                        <p className="text-[10px] sm:text-xs md:text-sm font-bold text-[var(--text-main)] opacity-70 whitespace-nowrap">
                          {new Date(order.createdAt || order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      {/* Total */}
                      <div className="min-w-0">
                        <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Total</p>
                        <p className="text-[10px] sm:text-xs md:text-sm font-black text-teal-600 whitespace-nowrap">
                          ₹{(order.totalAmount || order.total || 0).toLocaleString()}
                        </p>
                      </div>
                      {/* Payment */}
                      <div className="min-w-0">
                        <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Payment</p>
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="text-[9px] font-bold text-[var(--text-main)] opacity-60 uppercase tracking-tighter">{order.paymentMethod || 'COD'}</span>
                          <Badge variant={getPaymentStatusVariant(order.paymentStatus)} className="text-[7px] px-1.5 py-0.5 leading-none">
                            {order.paymentStatus || 'PENDING'}
                          </Badge>
                          {(order.paymentStatus === 'PENDING' || order.paymentStatus === 'FAILED') && order.paymentMethod !== 'COD' && (
                            <button onClick={(e) => { e.stopPropagation(); handleRetryPayment(order); }}
                              className="text-[8px] font-black text-teal-600 hover:text-teal-700 underline uppercase tracking-widest whitespace-nowrap"
                            >
                              Pay Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 flex-shrink-0">
                      <Badge variant={getStatusVariant(order.status)}
                        className="px-2 sm:px-2.5 md:px-3 lg:px-4 py-0.5 sm:py-1 md:py-1.5 uppercase tracking-widest text-[8px] sm:text-[9px] md:text-[10px] whitespace-nowrap"
                      >
                        {order.status || 'PENDING'}
                      </Badge>
                      <button onClick={() => handleViewDetails(order)}
                        className="p-1.5 sm:p-2 md:p-2.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg sm:rounded-xl text-[var(--text-muted)] hover:text-teal-600 hover:border-teal-500/30 transition-all active:scale-95 shadow-sm flex-shrink-0"
                      >
                        <MdArrowForward className="text-sm sm:text-base md:text-lg lg:text-xl" />
                      </button>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-3.5 sm:p-4 md:p-5 lg:p-6 space-y-2.5 sm:space-y-3 md:space-y-4">
                    {(order.items || []).map((item, idx) => {
                      const product = item.product || item;
                      return (
                        <div key={idx} className="flex items-center gap-2.5 sm:gap-3 md:gap-4 lg:gap-6 group/item">
                          <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50 border border-[var(--border-main)] shadow-sm flex-shrink-0 group-hover/item:scale-105 transition-transform duration-500">
                            <SafeImage src={product.mainImage || product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[10px] sm:text-xs md:text-sm lg:text-base font-black text-[var(--text-main)] truncate group-hover/item:text-teal-600 transition-colors">
                              {product.name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 mt-0.5 sm:mt-1">
                              <p className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-bold text-[var(--text-muted)]">
                                Qty: <span className="text-[var(--text-main)]">{item.quantity}</span>
                              </p>
                              <p className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-bold text-[var(--text-muted)]">
                                Price: <span className="text-[var(--text-main)]">₹{(item.price || product.price || 0).toLocaleString()}</span>
                              </p>
                              {item.variant && (
                                <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60">
                                  {item.variant}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-0.5 sm:mb-1">Status</p>
                            <div className="flex items-center justify-end gap-1 sm:gap-1.5 md:gap-2 text-[9px] sm:text-[10px] md:text-xs font-bold text-[var(--text-main)]">
                              {getStatusIcon(order.status)}
                              <span className="hidden xs:inline">{order.status || 'Processing'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {(!order.items || order.items.length === 0) && (
                      <div className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5 md:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-dashed border-slate-200">
                        <MdInfo className="text-slate-400 text-base sm:text-lg md:text-xl flex-shrink-0" />
                        <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-500">No items details available for this order.</p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="py-12 sm:py-14 md:py-16 lg:py-20 text-center flex flex-col items-center justify-center bg-[var(--bg-card)] rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] border border-[var(--border-main)] shadow-2xl shadow-teal-500/5 px-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-full flex items-center justify-center mb-3 sm:mb-4 md:mb-5 lg:mb-6">
              <MdShoppingBag className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-slate-200" />
            </div>
            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-[var(--text-main)] mb-1 sm:mb-1.5 md:mb-2">No orders found</h3>
            <p className="text-[var(--text-muted)] font-medium max-w-[260px] sm:max-w-sm md:max-w-md mx-auto text-[10px] sm:text-xs md:text-sm px-2">
              {searchTerm
                ? `No orders matching "${searchTerm}". Try a different term or clear filters.`
                : "You haven't placed any orders yet. Start building your dream space today."}
            </p>
            {searchTerm && (
              <button onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                className="mt-4 sm:mt-5 md:mt-6 text-teal-600 font-black text-[10px] sm:text-xs uppercase tracking-widest hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ─── Order Detail Modal ─── */}
      <AnimatePresence>
        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-[var(--bg-card)] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[var(--border-main)] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 md:p-6 border-b border-[var(--border-main)] flex items-center justify-between bg-gradient-to-r from-teal-500/5 to-transparent flex-shrink-0">
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg md:text-xl font-serif font-black text-[var(--text-main)] truncate">Order Details</h3>
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-[var(--text-muted)] mt-0.5">
                    #{selectedOrder.orderNumber || selectedOrder.id}
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)}
                  className="flex-shrink-0 p-1.5 sm:p-2 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-colors"
                >
                  <MdClose className="text-xl sm:text-2xl" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">

                {/* Status + Date */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
                  <div className="p-3 sm:p-4 bg-[var(--bg-app)] rounded-xl sm:rounded-2xl border border-[var(--border-main)]">
                    <p className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 sm:mb-1.5">Status</p>
                    <Badge variant={getStatusVariant(selectedOrder.status)} className="text-[8px] sm:text-[9px] md:text-[10px]">
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  <div className="p-3 sm:p-4 bg-[var(--bg-app)] rounded-xl sm:rounded-2xl border border-[var(--border-main)]">
                    <p className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 sm:mb-1.5">Order Date</p>
                    <p className="text-[10px] sm:text-xs md:text-sm font-bold text-[var(--text-main)]">
                      {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                  <p className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                    Items ({selectedOrder.items?.length || 0})
                  </p>
                  <div className="space-y-2 sm:space-y-2.5">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 sm:gap-3 md:gap-4 p-2.5 sm:p-3 md:p-4 bg-[var(--bg-app)]/50 rounded-xl sm:rounded-2xl border border-[var(--border-main)] hover:border-teal-500/20 transition-all">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-white p-0.5 sm:p-1 border border-[var(--border-main)] overflow-hidden flex-shrink-0">
                          <SafeImage src={item.product?.image || item.image} alt={item.product?.name || item.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] sm:text-xs md:text-sm font-bold text-[var(--text-main)] truncate">{item.product?.name || item.name}</p>
                          <p className="text-[9px] sm:text-[10px] text-[var(--text-muted)] font-medium">
                            Qty: {item.quantity} × <span className="text-teal-600">₹{item.price?.toLocaleString()}</span>
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px] sm:text-xs md:text-sm font-black text-[var(--text-main)] font-serif italic whitespace-nowrap">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping + Payment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-[var(--bg-app)]/50 rounded-xl sm:rounded-2xl border border-[var(--border-main)]">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-2.5">
                      <MdLocationOn className="text-teal-500 text-sm sm:text-base flex-shrink-0" />
                      <p className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Shipping Address</p>
                    </div>
                    {selectedOrder.shippingAddress ? (
                      <div className="text-[9px] sm:text-[10px] md:text-xs text-[var(--text-main)] font-medium space-y-0.5 sm:space-y-1 opacity-80 leading-relaxed">
                        <p className="font-black text-[9px] sm:text-[10px] uppercase">{selectedOrder.shippingAddress.name || 'Default Address'}</p>
                        <p>{selectedOrder.shippingAddress.streetAddress || selectedOrder.shippingAddress.addressLine1}</p>
                        <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} — {selectedOrder.shippingAddress.pincode}</p>
                      </div>
                    ) : (
                      <p className="text-[9px] sm:text-[10px] md:text-xs text-[var(--text-muted)] italic">No address provided</p>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 bg-[var(--bg-app)]/50 rounded-xl sm:rounded-2xl border border-[var(--border-main)]">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-2.5">
                      <MdPayment className="text-teal-500 text-sm sm:text-base flex-shrink-0" />
                      <p className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Payment Info</p>
                    </div>
                    <div className="space-y-1 sm:space-y-1.5">
                      <p className="text-[10px] sm:text-xs font-bold text-[var(--text-main)] uppercase tracking-tighter opacity-80">
                        {selectedOrder.paymentMethod || 'COD'}
                      </p>
                      <Badge variant={getPaymentStatusVariant(selectedOrder.paymentStatus)} className="text-[8px] sm:text-[9px] uppercase tracking-widest">
                        {selectedOrder.paymentStatus || 'Pending'}
                      </Badge>
                      {(selectedOrder.paymentStatus === 'PENDING' || selectedOrder.paymentStatus === 'FAILED') && selectedOrder.paymentMethod !== 'COD' && (
                        <button onClick={(e) => { e.stopPropagation(); handleRetryPayment(selectedOrder); }}
                          className="block text-[10px] font-black text-teal-600 hover:text-teal-700 underline uppercase tracking-widest mt-2"
                        >
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer — totals */}
              <div className="p-4 sm:p-5 md:p-6 bg-[var(--bg-app)] border-t border-[var(--border-main)] flex-shrink-0">
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-[var(--text-muted)]">Subtotal</p>
                    <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-[var(--text-main)]">
                      ₹{(selectedOrder.totalAmount - (selectedOrder.taxAmount || 0) - (selectedOrder.deliveryFee || 0)).toLocaleString()}
                    </p>
                  </div>
                  {selectedOrder.taxAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-[var(--text-muted)]">Tax (GST)</p>
                      <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-[var(--text-main)]">₹{selectedOrder.taxAmount.toLocaleString()}</p>
                    </div>
                  )}
                  {selectedOrder.deliveryFee > 0 && (
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-[var(--text-muted)]">Delivery Fee</p>
                      <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-[var(--text-main)]">₹{selectedOrder.deliveryFee.toLocaleString()}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between pt-3 sm:pt-4 mt-2 sm:mt-2.5 border-t border-[var(--border-main)] border-dashed">
                  <p className="text-xs sm:text-sm font-black text-[var(--text-muted)] uppercase tracking-tighter">Total Amount</p>
                  <p className="text-xl sm:text-2xl font-serif font-black text-teal-600 italic">
                    ₹{selectedOrder.totalAmount?.toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;