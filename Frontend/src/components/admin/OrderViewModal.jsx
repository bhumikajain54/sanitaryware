import { MdClose, MdPrint, MdCheckCircle, MdPayment, MdVerified } from 'react-icons/md';
import { Badge } from '../common/DashboardUI';

const OrderViewModal = ({ order, onClose, onConfirmPayment }) => {
  if (!order) return null;

  // Robust data mapping for the new structure
  const orderNumber = order.orderNumber || order.id || 'N/A';
  const customerName = order.user 
    ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() 
    : (order.customer || 'Unknown Customer');
  const customerEmail = order.user?.email || order.customerInfo?.email || 'No email provided';
  const customerPhone = order.user?.phone || order.customerInfo?.phone || 'No phone provided';
  
  // Format Address
  let displayAddress = 'Address not available';
  if (order.shippingAddress) {
    if (typeof order.shippingAddress === 'object') {
      const addr = order.shippingAddress;
      displayAddress = [
        addr.fullName,
        addr.streetAddress,
        addr.city,
        addr.state,
        addr.zipCode,
        addr.country
      ].filter(Boolean).join(', ');
      
      // If still empty but has city/state
      if (!displayAddress && (addr.city || addr.state)) {
          displayAddress = `${addr.city || ''}, ${addr.state || ''}`.trim().replace(/^, |, $/g, '');
      }
    } else {
      displayAddress = order.shippingAddress;
    }
  } else if (order.address) {
    displayAddress = order.address;
  }

  const orderTotal = order.totalAmount || order.total || 0;
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleString() : (order.date || 'N/A');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-all overflow-y-auto">
      {/* Modal */}
      <div className="bg-[var(--admin-bg-secondary)] rounded-xl sm:rounded-[2.5rem] shadow-2xl border border-[var(--border-main)] w-full max-w-2xl mx-1 sm:mx-4 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-3 sm:px-8 sm:py-6 bg-slate-900 dark:bg-slate-950 text-white">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-3 mb-0.5 sm:mb-1">
               <h3 className="text-[12px] sm:text-xl font-black tracking-tight">Order #{String(orderNumber).toUpperCase()}</h3>
               <span className="text-[6px] sm:text-[10px] font-black uppercase px-1.5 py-0.5 sm:px-2.5 sm:py-1 bg-teal-500 rounded-md sm:rounded-lg text-white shadow-lg shadow-teal-500/20">
                 {String(order.status || 'PENDING').toUpperCase()}
               </span>
            </div>
            <p className="text-[6px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
              Placed on {orderDate} • {order.paymentMethod || 'UPI'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2.5 bg-white/10 hover:bg-white/20 rounded-lg sm:rounded-2xl transition-all"
          >
            <MdClose className="text-sm sm:text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="px-3 py-4 sm:p-8 space-y-4 sm:space-y-8 scrollbar-hide overflow-y-auto max-h-[70vh]">
          {/* Status Progress */}
          <div className="flex items-center justify-between relative px-1 sm:px-2">
            <div className="absolute top-1/2 left-0 w-full h-0.5 sm:h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0"></div>
            {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map((step, i) => {
              const currentStatus = (order.status || '').toUpperCase();
              const steps = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
              const isActive = steps.indexOf(currentStatus) >= i;
              
              return (
                <div key={step} className="relative z-10 flex flex-col items-center gap-1 sm:gap-2">
                  <div className={`w-4 h-4 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                    isActive 
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30' 
                    : 'bg-[var(--admin-bg-primary)] text-slate-300'
                  }`}>
                    {isActive ? <MdCheckCircle className="text-[10px] sm:text-lg" /> : <div className="w-1 h-1 sm:w-2.5 sm:h-2.5 rounded-full bg-current"></div>}
                  </div>
                  <span className={`text-[5px] sm:text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-teal-600' : 'text-slate-400'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-8 pt-2 sm:pt-4">
            {/* Customer Details */}
            <div className="space-y-1.5 sm:space-y-4">
              <h4 className="text-[5px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] pb-1 sm:pb-2">Customer Details</h4>
              <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-lg sm:rounded-2xl p-2 sm:p-5 border border-[var(--border-subtle)]">
                <p className="text-[8px] sm:text-sm font-black text-[var(--admin-text-primary)] mb-1.5 sm:mb-2 uppercase tracking-tight truncate">{customerName}</p>
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-[6px] sm:text-xs text-[var(--admin-text-secondary)] font-medium flex items-center gap-1 sm:gap-3">
                    <span className="w-1 h-1 border border-teal-500 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]"></span>
                    <span className="truncate">{customerEmail}</span>
                  </p>
                  <p className="text-[6px] sm:text-xs text-[var(--admin-text-secondary)] font-medium flex items-center gap-1 sm:gap-3">
                    <span className="w-1 h-1 border border-teal-500 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]"></span>
                    <span className="truncate">{customerPhone}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="space-y-1.5 sm:space-y-4">
              <h4 className="text-[5px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] pb-1 sm:pb-2">Delivery Address</h4>
              <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-lg sm:rounded-2xl p-2 sm:p-5 border border-[var(--border-subtle)] h-full">
                <p className="text-[6px] sm:text-xs text-[var(--admin-text-secondary)] font-bold leading-relaxed italic">
                  {displayAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="space-y-1.5 sm:space-y-4">
            <h4 className="text-[5px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] pb-1 sm:pb-2">Payment Details</h4>
            <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-lg sm:rounded-2xl p-2 sm:p-5 border border-[var(--border-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                 <div className="p-1 sm:p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg sm:rounded-xl">
                    <MdPayment className="text-sm sm:text-xl" />
                 </div>
                 <div>
                    <p className="text-[5px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Method</p>
                    <p className="text-[8px] sm:text-sm font-black text-[var(--admin-text-primary)] uppercase tracking-tight">{order.paymentMethod || 'UPI'}</p>
                 </div>
              </div>
              <div className="flex flex-col items-end gap-1 sm:gap-2">
                 <p className="text-[5px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Payment Status</p>
                 <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'warning'} className="text-[6px] sm:text-[10px] px-2 sm:px-4 py-0.5 sm:py-1">
                    {order.paymentStatus === 'paid' ? 'COMPLETED / PAID' : 'AWAITING CONFIRMATION'}
                 </Badge>
              </div>
            </div>
          </div>

          {/* Tracking Section (Admin Only) */}
          <div className="space-y-1.5 sm:space-y-4">
            <h4 className="text-[5px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] pb-1 sm:pb-2">Tracking Information</h4>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const trackingData = {
                  trackingNumber: formData.get('trackingNumber'),
                  carrier: formData.get('carrier'),
                  estimatedDelivery: formData.get('estimatedDelivery'),
                  trackingUrl: formData.get('trackingUrl')
                };
                try {
                  const adminService = await import('../../services/adminService');
                  await adminService.updateOrderTracking(order.id, trackingData);
                  alert('Tracking details updated successfully');
                  if (typeof onConfirmPayment === 'function') {
                    // This is a hacky way to trigger a list refresh since this modal is controlled by AdminOrders
                    // In a real app, you'd pass a refresh function
                  }
                } catch (err) {
                  alert('Failed to update tracking details');
                }
              }}
              className="bg-slate-50/50 dark:bg-slate-800/30 rounded-lg sm:rounded-2xl p-3 sm:p-6 border border-[var(--border-subtle)] space-y-3 sm:space-y-5"
            >
              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                <div className="space-y-1">
                  <label className="text-[5px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracking Number</label>
                  <input name="trackingNumber" defaultValue={order.trackingNumber} className="w-full bg-[var(--admin-bg-primary)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[8px] sm:text-xs font-bold outline-none focus:border-teal-500" placeholder="e.g. ST12345678" />
                </div>
                <div className="space-y-1">
                  <label className="text-[5px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Carrier</label>
                  <input name="carrier" defaultValue={order.carrier} className="w-full bg-[var(--admin-bg-primary)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[8px] sm:text-xs font-bold outline-none focus:border-teal-500" placeholder="e.g. BlueDart" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                <div className="space-y-1">
                  <label className="text-[5px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Delivery</label>
                  <input name="estimatedDelivery" defaultValue={order.estimatedDelivery} className="w-full bg-[var(--admin-bg-primary)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[8px] sm:text-xs font-bold outline-none focus:border-teal-500" placeholder="e.g. 25th March" />
                </div>
                <div className="flex items-end">
                   <button type="submit" className="w-full py-2 sm:py-2.5 bg-slate-900 text-white rounded-lg sm:rounded-xl font-black text-[6px] sm:text-[10px] uppercase tracking-widest hover:opacity-90 transition-all">
                      Save Tracking
                   </button>
                </div>
              </div>
            </form>
          </div>

          {/* Items Table */}
          <div className="space-y-1.5 sm:space-y-4">
            <h4 className="text-[5px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Order Summary</h4>
            <div className="bg-[var(--admin-bg-secondary)]/30 rounded-xl sm:rounded-[2rem] overflow-hidden border border-[var(--border-subtle)] shadow-md sm:shadow-lg">
              <table className="w-full">
                <thead className="bg-[var(--admin-bg-primary)]/50 border-b border-[var(--border-subtle)] text-left">
                  <tr>
                    <th className="px-2 sm:px-6 py-2 sm:py-4 text-[5px] sm:text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest whitespace-nowrap">Product</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-4 text-[5px] sm:text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest text-center">Qty</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-4 text-[5px] sm:text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {order.items?.map((item, idx) => {
                    const productName = item.product?.name || item.name || 'Product';
                    const productImage = item.product?.mainImage || item.image || '/Logo2.png';
                    const itemPrice = item.price || item.product?.price || 0;
                    const itemQuantity = item.quantity || 1;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-2 sm:px-6 py-2 sm:py-4">
                          <div className="flex items-center gap-1.5 sm:gap-4">
                            <img src={productImage} className="w-5 h-5 sm:w-16 sm:h-16 rounded-md sm:rounded-2xl object-cover ring-1 sm:ring-2 ring-slate-100 dark:ring-slate-800 shadow-sm" alt="" />
                            <p className="text-[7px] sm:text-sm font-black text-[var(--admin-text-primary)] uppercase tracking-tight truncate max-w-[60px] sm:max-w-none">{productName}</p>
                          </div>
                        </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 text-center">
                          <span className="text-[6px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase">x{itemQuantity}</span>
                        </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 text-right">
                          <p className="text-[7px] sm:text-sm font-black text-teal-600 dark:text-teal-400 tracking-tight">₹{(itemPrice * itemQuantity).toLocaleString()}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Total Section */}
          <div className="flex justify-end pt-2 border-t border-[var(--border-subtle)]">
            <div className="text-right">
                <p className="text-[6px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount Payable</p>
                <p className="text-sm sm:text-3xl font-black text-teal-600 tracking-tighter italic">₹{(orderTotal).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-3 sm:px-8 sm:py-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1 sm:gap-2 text-[6px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 hover:text-teal-600 transition-all uppercase tracking-widest whitespace-nowrap"
          >
            <MdPrint className="text-[10px] sm:text-xl" />
            Print Invoice
          </button>
          <div className="flex items-center gap-2 sm:gap-4">
            {order.status?.toUpperCase() === 'PENDING' && (
              <button
                onClick={() => {
                  onConfirmPayment?.(order.id);
                  onClose();
                }}
                className="px-3 py-2 sm:px-8 sm:py-3 bg-emerald-600 text-white font-black rounded-lg sm:rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-[6px] sm:text-[10px] uppercase tracking-widest flex items-center gap-1 sm:gap-2"
              >
                <MdVerified className="text-[10px] sm:text-xl" />
                Confirm Payment Received
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-2 sm:px-8 sm:py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black rounded-lg sm:rounded-2xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all active:scale-95 text-[6px] sm:text-[10px] uppercase tracking-widest min-w-[80px] sm:min-w-[160px]"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderViewModal;
