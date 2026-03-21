import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdLocalShipping, MdCheckCircle, MdLocationOn, MdHistory, 
  MdArrowForward, MdInfo, MdMap, MdPhone, MdPerson,
  MdOutlineExplore, MdShoppingBag, MdAccessTime, MdInventory
} from 'react-icons/md';

import { Card, Badge, Skeleton } from '../../components/common/DashboardUI';
import { useAuth } from '../../context/AuthContext';
import customerService from '../../services/customerService';
import SafeImage from '../../components/common/SafeImage';

const Deliveries = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await customerService.getMyOrders();
        // Filter for active/in-transit orders first
        const active = data?.filter(o => 
          o.status?.toLowerCase().includes('ship') || 
          o.status?.toLowerCase().includes('transit') ||
          (o.status?.toLowerCase().includes('process') && !o.status?.toLowerCase().includes('deliver'))
        ) || [];
        setOrders(data || []);
        if (active.length > 0) {
          setSelectedOrder(active[0]);
        } else if (data && data.length > 0) {
          setSelectedOrder(data[0]);
        }
      } catch (err) {
        console.error('Failed to fetch deliveries:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStepStatus = (orderStatus, step) => {
    const status = orderStatus?.toLowerCase() || '';
    const steps = ['processing', 'shipped', 'in transit', 'delivered'];
    const currentIdx = steps.indexOf(status);
    const stepIdx = steps.indexOf(step);

    if (status.includes('cancel')) return 'error';
    if (currentIdx >= stepIdx) return 'completed';
    if (currentIdx + 1 === stepIdx) return 'current';
    return 'pending';
  };

  const activeDeliveries = orders.filter(o => 
    !o.status?.toLowerCase().includes('deliver') && 
    !o.status?.toLowerCase().includes('cancel')
  );

  return (
    <div className="px-3 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-6 max-w-[1600px] mx-auto min-h-screen">
      
      {/* ─── Page Header / Brand Identity ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-main)] tracking-tight flex items-center gap-3">
             <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
               <MdLocalShipping className="text-sky-600 text-xl sm:text-2xl lg:text-3xl" />
             </div>
             Deliveries
          </h1>
          <p className="text-[var(--text-muted)] font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] ml-1 sm:ml-14 opacity-70">
            Live tracking & fulfillment
          </p>
        </div>
      </div>

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Left Column: Active Tracking ── */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <Skeleton className="h-[500px] w-full rounded-3xl" />
          ) : selectedOrder ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-0 overflow-hidden border-teal-500/10 shadow-2xl shadow-teal-500/5">
                {/* Tracking Progress Header */}
                <div className="p-5 sm:p-7 md:p-8 bg-gradient-to-br from-[var(--bg-app)] to-transparent border-b border-[var(--border-main)]">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                      <div>
                        <p className="text-[8px] sm:text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">Current Shipment</p>
                        <h2 className="text-lg sm:text-xl font-black text-[var(--text-main)]">
                           {selectedOrder.orderNumber || `#${String(selectedOrder.id || '').toUpperCase().slice(-10)}`}
                        </h2>
                      </div>
                      <Badge variant="info" className="w-fit px-4 py-1.5 text-[10px] uppercase">
                        {selectedOrder.status?.replace('_', ' ') || 'In Progress'}
                      </Badge>
                   </div>

                   {/* Progress Stepper */}
                   <div className="relative pt-2 pb-8 px-2 sm:px-6">
                      <div className="absolute top-[26px] left-[18px] sm:left-[38px] right-[18px] sm:right-[38px] h-0.5 bg-[var(--border-subtle)]" />
                      
                      <div className="relative flex justify-between">
                        {[
                          { label: 'Order Placed', step: 'processing', icon: MdShoppingBag },
                          { label: 'Packed & Shipped', step: 'shipped', icon: MdInventory },
                          { label: 'In Transit', step: 'in transit', icon: MdLocalShipping },
                          { label: 'Delivered', step: 'delivered', icon: MdCheckCircle },
                        ].map((item, idx) => {
                          const status = getStepStatus(selectedOrder.status, item.step);
                          return (
                            <div key={idx} className="flex flex-col items-center gap-3 relative z-10 w-1/4">
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${
                                status === 'completed' ? 'bg-teal-600 border-teal-100 text-white' :
                                status === 'current' ? 'bg-white border-teal-600 text-teal-600 animate-pulse shadow-lg shadow-teal-500/20' :
                                'bg-white border-[var(--border-subtle)] text-[var(--text-muted)]'
                              }`}>
                                <item.icon className="text-lg sm:text-xl" />
                              </div>
                              <span className={`text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-tighter text-center max-w-[60px] sm:max-w-none ${
                                status === 'completed' || status === 'current' ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'
                              }`}>
                                {item.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                   </div>
                </div>

                {/* Delivery Map / Visual Placeholder */}
                <div className="relative h-[240px] sm:h-[300px] bg-slate-100 dark:bg-slate-800 overflow-hidden group">
                   <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2000')] bg-cover bg-center opacity-30 grayscale group-hover:scale-105 transition-transform duration-[10s]" />
                   <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent" />
                   
                   {/* Delivery Agent info */}
                   <div className="absolute bottom-6 left-6 right-6">
                      <div className="bg-[var(--bg-card)]/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-4">
                         <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-xl shrink-0 border border-teal-200">
                            <MdPerson />
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-[10px] sm:text-xs font-black text-teal-600 uppercase tracking-widest leading-none mb-1">Assigned Partner</p>
                            <h4 className="text-sm sm:text-base font-black text-[var(--text-main)] truncate">Singhai Logistics Hub</h4>
                         </div>
                         <button className="p-2 sm:p-3 bg-[var(--text-main)] text-[var(--bg-app)] rounded-xl hover:opacity-90 transition-all shadow-xl">
                            <MdPhone className="text-sm sm:text-base" />
                         </button>
                      </div>
                   </div>
                </div>

                {/* Shipment Details footer */}
                <div className="p-5 sm:p-7 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <MdLocationOn className="text-teal-600 text-xl" />
                         <div>
                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Delivery Address</p>
                            <p className="text-xs font-bold text-[var(--text-main)] mt-0.5 leading-relaxed">
                               {selectedOrder.shippingAddress?.streetAddress || 'Premise not specified'},<br/>
                               {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.pincode}
                            </p>
                         </div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <MdAccessTime className="text-teal-600 text-xl" />
                         <div>
                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Estimated Arrival</p>
                            <p className="text-xs font-black text-[var(--text-main)] mt-0.5">
                               {selectedOrder.estimatedDelivery || 'Processing Shipment'}
                            </p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <MdLocalShipping className="text-sky-600 text-xl" />
                         <div>
                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Shipment Carrier</p>
                            <p className="text-xs font-black text-[var(--text-main)] mt-0.5">
                               {selectedOrder.carrier || 'Preparing Logistics'} 
                               {selectedOrder.trackingNumber && <span className="text-slate-400 font-bold ml-1">({selectedOrder.trackingNumber})</span>}
                            </p>
                         </div>
                      </div>
                   </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            /* Empty State */
            <div className="h-[400px] flex flex-col items-center justify-center text-center p-8 bg-[var(--bg-card)] rounded-3xl border border-dashed border-[var(--border-main)]">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <MdOutlineExplore className="text-4xl text-slate-200" />
               </div>
               <h3 className="text-xl font-black text-[var(--text-main)] mb-2">No Active Deliveries</h3>
               <p className="text-[var(--text-muted)] text-sm max-w-sm mx-auto mb-8 font-medium">
                 Your orders are either moving through processing or have already been delivered. 
               </p>
               <button className="px-8 py-3.5 bg-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-teal-500/20 hover:bg-teal-700 transition-all">
                 Browse New Products
               </button>
            </div>
          )}
        </div>

        {/* ── Right Column: Shipments List ── */}
        <div className="space-y-6">
          <div className="space-y-1 px-1">
             <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-widest">Recent Shipments</h3>
             <p className="text-[10px] text-[var(--text-muted)] font-medium">History of your last {orders.length} orders</p>
          </div>

          <div className="space-y-3">
             {isLoading ? (
               [1,2,3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
             ) : orders.map((order, idx) => (
               <motion.div key={order.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                 <div 
                   onClick={() => setSelectedOrder(order)}
                   className={`p-4 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${
                     selectedOrder?.id === order.id 
                     ? 'bg-white border-teal-500 shadow-xl shadow-teal-500/5 ring-1 ring-teal-500/20' 
                     : 'bg-[var(--bg-card)] border-[var(--border-main)] hover:border-teal-400'
                   }`}
                 >
                   {selectedOrder?.id === order.id && (
                     <div className="absolute top-0 right-0 w-16 h-16 bg-teal-600/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                   )}
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                        order.status?.toLowerCase().includes('deliver') 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                        : 'bg-sky-50 border-sky-100 text-sky-600'
                      }`}>
                         <MdLocalShipping className="text-xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <h4 className="text-xs font-black text-[var(--text-main)] truncate">
                           {order.orderNumber || `Order #${order.id.slice(-8)}`}
                         </h4>
                         <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-tighter mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • ₹{order.totalAmount?.toLocaleString()}
                         </p>
                      </div>
                      <MdArrowForward className={`text-lg transition-transform ${selectedOrder?.id === order.id ? 'text-teal-600 translate-x-1' : 'text-[var(--text-muted)]'}`} />
                   </div>
                   <div className="mt-3 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
                      <Badge variant={order.status?.toLowerCase().includes('deliver') ? 'success' : 'info'} className="text-[8px] font-black uppercase">
                        {order.status || 'Pending'}
                      </Badge>
                      <span className="text-[9px] font-bold text-[var(--text-muted)]">
                         {order.items?.length || 0} items
                      </span>
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

export default Deliveries;
