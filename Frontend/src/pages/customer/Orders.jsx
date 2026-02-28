import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdLocalShipping, 
  MdCheckCircle, 
  MdCancel, 
  MdDownload, 
  MdVisibility, 
  MdShoppingBag, 
  MdClose,
  MdPayment,
  MdLocationOn,
  MdInfo,
  MdOutlineReceipt,
  MdFilterList,
  MdHistory,
  MdSmartphone,
  MdCreditCard,
  MdAccountBalance,
  MdError
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import customerService from '../../services/customerService';
import { getOrders as getLocalOrders } from '../../utils/orderService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Card, Badge, Skeleton } from '../../components/common/DashboardUI';

const Orders = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    minPrice: '',
    maxPrice: ''
  });
  const filterRef = useRef(null);

  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);

  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
        if (!isAuthenticated || isAdmin) {
            setIsLoading(false);
            return;
        }
        try {
            // Fetch Backend Orders
            let backendOrders = [];
            try {
                const rawData = await customerService.getOrders();
                backendOrders = Array.isArray(rawData) ? rawData : (rawData?.content || rawData?.data || []);
            } catch (err) { console.warn('Backend fetch failed', err); }
            
            // Fetch Local Simulation Orders
            const localOrders = getLocalOrders() || [];

            // Normalize Backend Data
            const normalizedBackend = backendOrders.map(order => {
                const totalVal = Number(order.totalAmount ?? order.total ?? order.amount ?? 0);
                return {
                    ...order,
                    id: order.id,
                    orderNumber: order.orderNumber || `ORD-${order.id}`,
                    total: totalVal,
                    formattedTotal: totalVal > 0 ? `₹${totalVal.toLocaleString('en-IN')}` : 'Calculating...',
                    status: (order.status || 'pending').toLowerCase(),
                    paymentStatus: (order.paymentStatus || order.payment_status || 'unpaid').toLowerCase(),
                    paymentMethod: order.paymentMethod || 'COD',
                    date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : (order.date || 'N/A'),
                    items: (order.items || []).map(item => ({
                        ...item,
                        name: item.product?.name || item.name || 'Product',
                        image: item.product?.mainImage || item.image || '/Logo2.png',
                        price: item.price || item.product?.price || 0,
                        quantity: item.quantity || 1
                    })),
                    shippingAddress: typeof order.shippingAddress === 'object' ? {
                        name: order.shippingAddress?.fullName || order.user?.firstName || 'Customer',
                        address: [
                            order.shippingAddress?.streetAddress,
                            order.shippingAddress?.city,
                            order.shippingAddress?.state,
                            order.shippingAddress?.zipCode
                        ].filter(Boolean).join(', ') || order.address || 'N/A'
                    } : {
                        name: order.user?.firstName || 'Customer',
                        address: order.shippingAddress || order.address || 'N/A'
                    }
                };
            });

            // Merge: Local overrides Backend (to reflect 'confirmed' status from simulation)
            const orderMap = new Map();
            normalizedBackend.forEach(o => orderMap.set(o.orderNumber, o));
            
            // Track which local orders should be kept
            const remainingLocal = [];
            
            localOrders.forEach(o => {
                 const existing = orderMap.get(o.orderNumber);
                 if (existing) {
                    // Merge: Backend usually wins, but keep 'completed' status
                    const isCompleted = existing.paymentStatus === 'completed' || o.paymentStatus === 'completed' || o.paymentStatus === 'success';
                    orderMap.set(o.orderNumber, { 
                        ...o, 
                        ...existing,
                        paymentStatus: isCompleted ? 'completed' : existing.paymentStatus
                    });
                 } else {
                    const isJunk = !o.total || o.total <= 0;
                    if (!isJunk) {
                        orderMap.set(o.orderNumber, o);
                        remainingLocal.push(o);
                    }
                 }
            });

            // Cleanup: update localStorage
            if (remainingLocal.length !== localOrders.length) {
                localStorage.setItem('sanitaryware_orders', JSON.stringify(remainingLocal));
            }
            
            const mergedOrders = Array.from(orderMap.values())
               .sort((a,b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

            setOrders(mergedOrders);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setIsLoading(false);
        }
    };
    fetchOrders();
  }, [isAuthenticated, isAdmin]);

  const handlePaymentSelection = (method) => {
    if (!selectedOrderForPayment) return;
    setShowPaymentModal(false);
    navigate('/payment-gateway', { 
      state: { 
        method: method, 
        amount: selectedOrderForPayment.total,
        orderId: selectedOrderForPayment.id || selectedOrderForPayment.orderId,
        orderNumber: selectedOrderForPayment.orderNumber,
        orderData: selectedOrderForPayment 
      } 
    });
  };

  const handleDownloadInvoice = (order) => {
    if (!order) return;
    
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(13, 148, 136); // Teal 600
      doc.text('SANITARY WARE', 20, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Premium Bath & Kitchen Solutions', 20, 26);
      doc.line(20, 32, 190, 32);

      // Order Info
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.setFont('helvetica', 'bold');
      doc.text('INVOICE', 20, 45);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Order Number: ${order.orderNumber || order.id || 'N/A'}`, 20, 52);
      doc.text(`Date: ${order.date || 'N/A'}`, 20, 58);
      
      // Shipping
      doc.setFont('helvetica', 'bold');
      doc.text('SHIP TO:', 120, 45);
      doc.setFont('helvetica', 'normal');
      doc.text(order.shippingAddress?.name || 'Customer', 120, 52);
      doc.text(order.shippingAddress?.address || 'Shipping Address Not Provided', 120, 58);

      // Items Table
      const tableRows = (order.items || []).map(item => [
        item.name || 'Unnamed Product',
        (item.quantity || 0).toString(),
        `INR ${(item.price || 0).toLocaleString()}`,
        `INR ${((item.quantity || 0) * (item.price || 0)).toLocaleString()}`
      ]);

      autoTable(doc, {
        startY: 70,
        head: [['Product', 'QTY', 'Price', 'Total']],
        body: tableRows,
        headStyles: { fillColor: [13, 148, 136] },
        theme: 'grid'
      });

      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Amount: INR ${(order.total || 0).toLocaleString()}`, 140, finalY + 10);
      
      doc.save(`Invoice_${order.orderNumber || order.id || 'order'}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const tabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'transit', label: 'In Transit' },
    { id: 'delivered', label: 'Delivered' },
  ];

  const filteredOrders = selectedTab === 'all' 
    ? orders 
    : orders.filter(order => {
        const s = order.status.toLowerCase();
        if (selectedTab === 'pending') return s.includes('pending') || s.includes('confirm') || s.includes('process');
        if (selectedTab === 'transit') return s.includes('ship') || s.includes('transit') || s.includes('way');
        if (selectedTab === 'delivered') return s.includes('deliver');
        return s === selectedTab;
      });

  // Apply advanced filters
  const finalFilteredOrders = filteredOrders.filter(order => {
    // Price filter
    if (filters.minPrice && order.total < parseFloat(filters.minPrice)) return false;
    if (filters.maxPrice && order.total > parseFloat(filters.maxPrice)) return false;
    
    return true;
  });

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      minPrice: '',
      maxPrice: ''
    });
  };

  return (
    <div className="p-4 md:p-10 space-y-8 md:space-y-12 max-w-[1800px] mx-auto min-h-screen bg-white dark:bg-slate-950">
      
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white font-serif tracking-tighter">Order Management</h1>
          <p className="text-sm md:text-base text-slate-400 font-bold uppercase tracking-[0.1em]">Track, manage and download invoices for your purchases.</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md group">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Last updated: Just now</span>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex bg-slate-50 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 p-1 rounded-[2rem] w-full lg:w-fit overflow-x-auto custom-scrollbar no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-6 md:px-8 py-3 rounded-[1.8rem] text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                selectedTab === tab.id
                  ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-md shadow-slate-200/60 dark:shadow-none translate-z-0'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-3 px-6 py-3.5 bg-white dark:bg-slate-900 border-2 rounded-[1.8rem] text-xs font-black uppercase tracking-[0.2em] transition-all shadow-lg hover:scale-105 active:scale-95 ${
                showFilters 
                  ? 'border-teal-500 text-teal-600 shadow-teal-500/10' 
                  : 'border-slate-50 dark:border-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-slate-100/50 dark:shadow-none'
              }`}
            >
              <MdFilterList className="text-lg" />
              <span>Advanced Filters</span>
            </button>
            
            {/* Filters Dropdown */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-4 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-2xl p-8 z-50 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-teal-500" />
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                    <div className="p-1 bg-teal-50 rounded-md"><MdFilterList className="text-teal-600" /></div>
                    Filters
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Date Range</label>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="date"
                          value={filters.dateFrom}
                          onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[10px] font-black uppercase text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                        <input
                          type="date"
                          value={filters.dateTo}
                          onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[10px] font-black uppercase text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Price Range (₹)</label>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          value={filters.minPrice}
                          onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[10px] font-black uppercase text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                          placeholder="MIN"
                        />
                        <input
                          type="number"
                          value={filters.maxPrice}
                          onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[10px] font-black uppercase text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                          placeholder="MAX"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => { clearFilters(); setShowFilters(false); }}
                        className="flex-1 px-4 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="flex-1 px-4 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest shadow-xl transition-all"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Results Content */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : finalFilteredOrders.length > 0 ? (
        <Card noPadding className="overflow-hidden border-none shadow-xl shadow-slate-200/50">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[900px] lg:min-w-0">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Order ID</th>
                  <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Product</th>
                  <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                  <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Total</th>
                  <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Payment</th>
                  <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {finalFilteredOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-slate-50/20 transition-all duration-300">
                    <td className="px-6 py-7 whitespace-nowrap">
                      <span className="text-sm font-black text-slate-900 uppercase tracking-tight">#{String(order.orderNumber || order.id || '').toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-7">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0 group-hover:scale-110 transition-transform duration-500 p-2">
                          <img src={order.items[0]?.image} className="w-full h-full object-contain" alt="" />
                        </div>
                        <div className="max-w-[180px]">
                          <p className="text-sm font-black text-slate-900 truncate tracking-tight uppercase leading-none">{order.items[0]?.name}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5">{order.items.length > 1 ? `+ ${order.items.length - 1} more items` : 'Single Item'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-7 whitespace-nowrap">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{order.date}</p>
                    </td>
                    <td className="px-6 py-7 whitespace-nowrap">
                      <p className="text-sm font-black text-slate-900 tracking-tighter italic">
                          {order.formattedTotal || `₹${order.total.toLocaleString()}`}
                      </p>
                    </td>
                    <td className="px-6 py-7 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5">
                         <div className="flex items-center gap-2">
                           {/* Payment Method Badge */}
                           {order.paymentMethod === 'UPI' && <span className="text-[10px] font-black text-teal-600 tracking-wider uppercase bg-teal-50 px-2 py-0.5 rounded">UPI</span>}
                           {order.paymentMethod === 'CARD' && <span className="text-[10px] font-black text-blue-600 tracking-wider uppercase bg-blue-50 px-2 py-0.5 rounded">CARD</span>}
                           {(!['UPI', 'CARD'].includes(order.paymentMethod)) && <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase bg-slate-100 px-2 py-0.5 rounded">{order.paymentMethod || 'COD'}</span>}
                           
                           {/* Payment Status Badge */}
                           {(order.paymentStatus === 'completed' || order.paymentStatus === 'paid' || order.paymentStatus === 'success') && (
                             <span className="text-[10px] font-black text-green-600 uppercase tracking-wider flex items-center gap-1">
                               <MdCheckCircle /> Paid
                             </span>
                           )}
                         </div>
                         {order.paymentStatus === 'failed' && (
                           <span className="text-[10px] font-black text-rose-500 uppercase tracking-tighter animate-pulse flex items-center gap-1">
                             <MdError /> Failed
                           </span>
                         )}
                         {(order.paymentStatus === 'pending' || order.paymentStatus === 'unpaid') && order.paymentMethod !== 'COD' && (
                            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Payment Pending</span>
                         )}
                      </div>
                    </td>
                    <td className="px-6 py-7 whitespace-nowrap">
                       <span className={`px-5 py-2 rounded-full text-[10px] font-black tracking-[0.1em] uppercase ${
                         order.status?.toLowerCase().includes('deliver') ? 'bg-emerald-50 text-emerald-600' :
                         order.status?.toLowerCase().includes('pending') ? 'bg-blue-50 text-blue-500' :
                         order.status?.toLowerCase().includes('confirm') ? 'bg-orange-50 text-orange-500' :
                         order.status?.toLowerCase().includes('transit') || order.status?.toLowerCase().includes('ship') ? 'bg-indigo-50 text-indigo-600' :
                         'bg-slate-50 text-slate-500'
                       }`}>
                         {order.status.replace('_', ' ')}
                       </span>
                    </td>
                    <td className="px-6 py-7 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-3 md:gap-4">
                        {(order.status === 'pending' || order.status === 'confirmed') && 
                         !['completed', 'paid', 'success'].includes(order.paymentStatus?.toLowerCase()) && 
                         order.paymentMethod?.toUpperCase() !== 'COD' &&
                         order.status !== 'delivered' && (
                          <button 
                            onClick={() => {
                               setSelectedOrderForPayment(order);
                               setShowPaymentModal(true);
                            }}
                            className="p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-all shadow-xl shadow-teal-500/40 hover:scale-110 active:scale-95"
                            title="Pay Now"
                          >
                            <MdPayment className="text-xl" />
                          </button>
                        )}
                        <button 
                          onClick={() => { setSelectedOrder(order); setShowDetails(true); }}
                          className="p-2 text-slate-300 hover:text-slate-900 transition-all hover:scale-125"
                          title="View Details"
                        >
                          <MdVisibility className="text-2xl" />
                        </button>
                        <button 
                          onClick={() => handleDownloadInvoice(order)}
                          className="p-2 text-slate-300 hover:text-slate-900 transition-all hover:scale-125"
                          title="Download Invoice"
                        >
                          <MdDownload className="text-2xl" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="bg-[var(--bg-card)] rounded-3xl p-20 text-center border border-[var(--border-main)]">
          <div className="w-20 h-20 bg-[var(--border-subtle)] rounded-full flex items-center justify-center mx-auto mb-6">
            <MdOutlineReceipt className="text-4xl text-[var(--text-muted)]" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-main)] mb-2">No Orders Found</h2>
          <p className="text-[var(--text-muted)] max-w-sm mx-auto mb-8">We couldn't find any orders matching your current filter.</p>
          <button onClick={() => setSelectedTab('all')} className="text-teal-600 font-bold hover:text-teal-700">Clear all filters</button>
        </div>
      )}

      {/* Payment Method Selection Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedOrderForPayment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden z-10"
            >
               <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                 <div>
                    <h3 className="text-xl font-bold text-gray-900">Choose Payment Method</h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">Order #{selectedOrderForPayment.orderNumber || selectedOrderForPayment.id}</p>
                 </div>
                 <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <MdClose className="text-xl text-gray-400" />
                 </button>
               </div>
               
               <div className="p-6 space-y-3">
                 <button onClick={() => handlePaymentSelection('upi')} className="w-full flex items-center gap-4 p-4 border-2 border-transparent bg-gray-50 hover:bg-teal-50 hover:border-teal-500 rounded-2xl transition-all group text-left">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform"><MdSmartphone size={24}/></div>
                    <div><p className="font-bold text-gray-800">UPI</p><p className="text-[10px] uppercase font-bold text-gray-400 group-hover:text-teal-600">Google Pay, PhonePe, Paytm</p></div>
                 </button>

                 <button onClick={() => handlePaymentSelection('card')} className="w-full flex items-center gap-4 p-4 border-2 border-transparent bg-gray-50 hover:bg-blue-50 hover:border-blue-500 rounded-2xl transition-all group text-left">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform"><MdCreditCard size={24}/></div>
                    <div><p className="font-bold text-gray-800">Credit / Debit Card</p><p className="text-[10px] uppercase font-bold text-gray-400 group-hover:text-blue-600">Visa, Mastercard, Rupay</p></div>
                 </button>

                 <button onClick={() => handlePaymentSelection('netbanking')} className="w-full flex items-center gap-4 p-4 border-2 border-transparent bg-gray-50 hover:bg-indigo-50 hover:border-indigo-500 rounded-2xl transition-all group text-left">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform"><MdAccountBalance size={24}/></div>
                    <div><p className="font-bold text-gray-800">Net Banking</p><p className="text-[10px] uppercase font-bold text-gray-400 group-hover:text-indigo-600">All Major Banks Supported</p></div>
                 </button>
               </div>
               
               <div className="p-4 bg-gray-50 text-center">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2"><MdPayment /> Secure Payment Gateway</p>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Details Modal */}
      <AnimatePresence>
        {showDetails && selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetails(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 w-full md:max-w-4xl h-full md:h-auto md:max-h-[95vh] md:rounded-[3rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col border border-slate-100 dark:border-slate-800 transition-all duration-500"
            >
              {/* Header */}
              <div className="p-8 md:p-12 flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50">
                 <div>
                    <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white font-serif tracking-tighter">Order Details</h3>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white bg-teal-500 px-4 py-1.5 rounded-md shadow-lg shadow-teal-500/20">Reference</span>
                      <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">{selectedOrder.orderNumber || selectedOrder.id}</p>
                    </div>
                 </div>
                 <button onClick={() => setShowDetails(false)} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all group">
                    <MdClose className="text-3xl text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-16">
                {/* Status Tracker */}
                <div className="relative mb-24 px-4 md:px-12">
                  <div className="absolute top-6 left-12 right-12 h-1.5 bg-slate-50 dark:bg-slate-800/50 -z-0 rounded-full" />
                  <div 
                    className="absolute top-6 left-12 h-1.5 bg-teal-500 -z-0 rounded-full transition-all duration-1000 ease-in-out" 
                    style={{ width: `${(Math.min((selectedOrder.statusHistory || []).filter(s => s.completed).length, 4) - 1) * 25 + 12.5}%` }}
                  />
                  
                  <div className="flex justify-between relative z-10">
                    {(selectedOrder.statusHistory || [
                      { label: 'ORDER PLACED', completed: true },
                      { label: 'CONFIRMED', completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(selectedOrder.status?.toLowerCase()) },
                      { label: 'SHIPPED', completed: ['shipped', 'delivered'].includes(selectedOrder.status?.toLowerCase()) },
                      { label: 'OUT FOR DELIVERY', completed: ['delivered'].includes(selectedOrder.status?.toLowerCase()) },
                      { label: 'DELIVERED', completed: ['delivered'].includes(selectedOrder.status?.toLowerCase()) }
                    ]).map((step, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-5">
                        <div className={`w-12 h-12 rounded-full border-[8px] ${step.completed ? 'bg-teal-500 border-white dark:border-slate-900 shadow-2xl shadow-teal-500/40' : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800'} flex items-center justify-center transition-all duration-700 ease-out`}>
                          {step.completed ? <MdCheckCircle className="text-white text-lg" /> : <div className="w-3 h-3 rounded-full bg-slate-50 dark:bg-slate-800" />}
                        </div>
                        <p className={`text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-center w-16 md:w-28 leading-tight transition-colors duration-700 ${step.completed ? 'text-teal-600' : 'text-slate-300'}`}>
                          {step.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-14 mb-20">
                  {/* Styled Shipping Info */}
                  <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-[3rem] p-10 md:p-12 border border-slate-100 dark:border-white/5 transition-transform hover:scale-[1.01]">
                    <div className="flex items-center gap-5 mb-8">
                      <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-md border border-slate-100 dark:border-slate-800">
                        <MdLocationOn className="text-teal-500 text-2xl" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Delivery Address</span>
                    </div>
                    <div className="space-y-3">
                      <p className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{selectedOrder.shippingAddress?.name || 'Bhumika Jain'}</p>
                      <p className="text-base text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                        {selectedOrder.shippingAddress?.address || 'Veerodaya Society, New, Grant Rd, Rajaram Patil Nagar, Vitthal Nagar, Kharadi, Pune, Maharashtra 411014'}
                      </p>
                    </div>
                  </div>

                  {/* Styled Payment Info */}
                  <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-[3rem] p-10 md:p-12 border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-5 mb-8">
                      <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-md border border-slate-100 dark:border-slate-800">
                        <MdPayment className="text-indigo-500 text-2xl" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Payment Summary</span>
                    </div>
                    <div className="space-y-5 pt-2">
                       <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/50">
                          <span className="text-slate-400 uppercase tracking-widest text-[11px] font-black">Method</span>
                          <span className="text-slate-900 dark:text-white tracking-[0.2em] uppercase font-black text-sm">{selectedOrder.paymentMethod || 'UPI'}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-slate-400 uppercase tracking-widest text-[11px] font-black">Status</span>
                          <span className="text-amber-500 bg-amber-50 dark:bg-amber-900/40 px-5 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase border border-amber-100">
                             {selectedOrder.paymentStatus === 'paid' ? 'COMPLETED' : 'AWAITING'}
                          </span>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Items Section */}
                <div className="space-y-10">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-2 h-8 bg-teal-500 rounded-full shadow-lg shadow-teal-500/30" />
                    <h4 className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-[0.4em]">Ordered Items</h4>
                  </div>
                  
                  <div className="grid gap-6">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-50 dark:border-slate-800 hover:border-teal-500/30 hover:shadow-2xl hover:shadow-slate-200/40 transition-all duration-500 group">
                        <div className="flex items-center gap-8">
                          <div className="w-24 h-24 rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center p-4 group-hover:scale-110 transition-transform duration-700 shadow-sm border border-slate-100">
                             <img src={item.image} className="w-full h-full object-contain" alt="" />
                          </div>
                          <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">{item.name}</p>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                           <p className="text-3xl font-black text-teal-600 font-serif italic tracking-tighter">₹{(item.price || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="mt-20 pt-16 border-t-2 border-slate-50 dark:border-slate-800 space-y-8 px-6">
                    <div className="flex justify-between text-base font-bold">
                      <span className="text-slate-400 uppercase tracking-[0.3em] text-[11px] font-black">Subtotal</span>
                      <span className="text-slate-900 dark:text-white font-black text-2xl font-serif italic">₹{(selectedOrder.total || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold items-center">
                      <span className="text-slate-400 uppercase tracking-[0.3em] text-[11px] font-black">Delivery Fee</span>
                      <span className="text-teal-500 uppercase tracking-[0.3em] text-[11px] font-black bg-teal-50 px-4 py-1.5 rounded-full border border-teal-100">Free Shipping</span>
                    </div>
                    <div className="flex justify-between items-center py-12 border-t border-slate-100 dark:border-slate-800 mt-10">
                      <span className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Grand Total</span>
                      <span className="text-5xl md:text-8xl font-black text-teal-600 font-serif italic tracking-tighter scale-x-110 origin-right transition-transform hover:scale-125 duration-700">₹{(selectedOrder.total || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 md:p-14 bg-white dark:bg-slate-900 border-t border-slate-50">
                <button 
                  onClick={() => setShowDetails(false)}
                  className="w-full py-7 bg-[#0f172a] text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-[0_20px_60px_-15px_rgba(15,23,42,0.4)] hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Close Reference
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;
