import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdChevronLeft,
  MdLocationOn,
  MdPayment,
  MdVerified,
  MdLocalShipping,
  MdAdd,
  MdCheckCircle,
  MdOutlineShoppingBag
} from 'react-icons/md';
import { toast } from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import customerService from '../../services/customerService';
import { Card, Badge, Skeleton } from '../../components/common/DashboardUI';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('Confirming...');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const addrData = await customerService.getAddresses();
        setAddresses(addrData || []);
        const defaultAddr = (addrData || []).find(a => a.isDefault || a.is_default);
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        else if (addrData?.length > 0) setSelectedAddressId(addrData[0].id);
      } catch (err) {
        console.error('Failed to fetch checkout data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const subtotal = getCartTotal();
  const deliveryFee = subtotal > 5000 ? 0 : 500;
  const tax = subtotal * 0.18;
  const grandTotal = subtotal + deliveryFee + tax;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }

    setIsPlacingOrder(true);
    setProcessingMessage('Creating order...');
    try {
      // 1. Create Local Order
      const orderData = {
        addressId: selectedAddressId,
        paymentMethod: paymentMethod === 'COD' ? 'COD' : 'RAZORPAY',
        items: cartItems.map(item => ({
          productId: item.id || item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: grandTotal,
        taxAmount: tax,
        deliveryFee
      };

      const orderResponse = await customerService.createOrder(orderData);
      const orderId = orderResponse.id || orderResponse.orderId;

      if (!orderId) throw new Error('Failed to create order tracking ID');

      // 2. Handle Payment Flow
      if (paymentMethod === 'COD') {
        toast.success('Order placed successfully!');
        clearCart();
        navigate('/customer/orders', { state: { newOrder: true } });
        return;
      }

      // 3. Initiate Online Payment (Razorpay)
      setProcessingMessage('Starting payment...');
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setIsPlacingOrder(false);
        return;
      }

      const paymentInit = await customerService.initiatePayment({
        orderId: orderId,
        amount: grandTotal,
        paymentMethod: paymentMethod // 'UPI', 'CARD', etc.
      });

      if (paymentInit.status === 'FAILED') {
        throw new Error(paymentInit.message || 'Payment initiation failed');
      }

      setProcessingMessage('Awaiting payment...');
      const options = {
        key: paymentInit.key,
        amount: paymentInit.amount,
        currency: paymentInit.currency,
        name: 'Sanitaryware Store',
        description: `Payment for Order #${orderResponse.orderNumber || orderId}`,
        order_id: paymentInit.razorpayOrderId,
        handler: async (response) => {
          setProcessingMessage('Verifying payment...');
          try {
            const verifyRes = await customerService.verifyRazorpayPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              internalOrderId: orderId
            });

            if (verifyRes.status === 'SUCCESS') {
              toast.success('Payment successful!');
              clearCart();
              navigate('/customer/orders', { state: { newOrder: true } });
            } else {
              toast.error(verifyRes.message || 'Payment verification failed');
              navigate('/customer/orders'); // Go to orders anyway to see pending payment
            }
          } catch (err) {
            console.error('Verification error:', err);
            toast.error('Error verifying payment');
            navigate('/customer/orders');
          }
        },
        prefill: {
          name: user?.name || undefined,
          email: user?.email || undefined,
          contact: user?.phone || undefined
        },
        theme: {
          color: '#0d9488' // Teal 600
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled');
            setIsPlacingOrder(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      // Add error listener for debugging
      rzp.on('payment.failed', function (response) {
        console.error('Razorpay Payment Failed:', response.error);
        toast.error(`Payment Failed: ${response.error.description}`);
        setIsPlacingOrder(false);
      });

      rzp.open();

    } catch (err) {
      console.error('Checkout error:', err);
      toast.error(err.message || 'Failed to place order. Please try again.');
      setIsPlacingOrder(false);
    } finally {
      // Note: we don't always set isPlacingOrder to false here because
      // the Razorpay modal is async and has its own dismiss handler.
    }
  };

  /* Empty cart */
  if (cartItems.length === 0 && !isPlacingOrder) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 sm:p-8 bg-[var(--bg-app)]">
        <MdOutlineShoppingBag className="text-5xl sm:text-6xl text-slate-200 mb-3 sm:mb-4" />
        <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] mb-3 sm:mb-4 text-center">Your cart is empty</h2>
        <Link to="/products" className="btn-primary px-6 sm:px-8 py-2.5 sm:py-3 text-sm">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-5 sm:space-y-6 md:space-y-8 max-w-[1400px] mx-auto min-h-screen">

      {/* ─── Back + Header ─── */}
      <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-1.5 sm:gap-2 text-[var(--text-muted)] font-black hover:text-teal-600 transition-colors uppercase tracking-widest text-[9px] sm:text-[10px] w-fit"
        >
          <MdChevronLeft className="text-lg sm:text-xl flex-shrink-0" />
          Back to Cart
        </button>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-main)] tracking-tight">Checkout</h1>
      </div>

      {/* ─── Main Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-7 lg:gap-8 items-start">

        {/* ── Left: Delivery + Payment ── */}
        <div className="lg:col-span-2 space-y-5 sm:space-y-6 md:space-y-8">

          {/* Delivery Address */}
          <section className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm sm:text-base md:text-lg font-black text-[var(--text-main)] flex items-center gap-1.5 sm:gap-2 uppercase tracking-widest">
                <MdLocationOn className="text-teal-600 text-lg sm:text-xl md:text-2xl flex-shrink-0" />
                <span>1. Delivery Address</span>
              </h2>
              <Link
                to="/customer/addresses"
                className="text-[9px] sm:text-xs font-black text-teal-600 hover:text-teal-700 uppercase tracking-widest flex items-center gap-1 flex-shrink-0 whitespace-nowrap"
              >
                <MdAdd className="text-sm sm:text-base" />
                Manage
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {isLoading ? (
                Array(2).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-32 sm:h-36 md:h-40 rounded-2xl" />
                ))
              ) : addresses.length > 0 ? (
                addresses.map((addr) => (
                  <label key={addr.id} className="relative cursor-pointer group transition-all duration-300">
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="sr-only"
                    />
                    <Card noPadding className={`h-full border-2 transition-all ${selectedAddressId === addr.id
                      ? 'border-teal-500 shadow-xl shadow-teal-500/5 bg-teal-50/10'
                      : 'border-[var(--border-main)]'
                      }`}>
                      <div className="p-4 sm:p-5 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-2 sm:mb-3 gap-2">
                          <span className={`text-[7px] sm:text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0 ${selectedAddressId === addr.id ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                            {addr.type || 'Address'}
                          </span>
                          {selectedAddressId === addr.id && (
                            <MdCheckCircle className="text-teal-600 text-lg sm:text-xl flex-shrink-0" />
                          )}
                        </div>
                        <p className="font-black text-[var(--text-main)] text-xs sm:text-sm mb-1">{addr.fullName || addr.full_name}</p>
                        <p className="text-[10px] sm:text-xs text-[var(--text-muted)] font-medium leading-normal line-clamp-2">
                          {addr.streetAddress || addr.street_address}, {addr.city}, {addr.state} — {addr.zipCode || addr.zip_code}
                        </p>
                        <div className="mt-auto pt-3 sm:pt-4 flex items-center gap-1.5 text-teal-600 font-black text-[9px] sm:text-[10px] tracking-widest">
                          {addr.phone}
                        </div>
                      </div>
                    </Card>
                  </label>
                ))
              ) : (
                <div className="sm:col-span-2 py-8 sm:py-10 text-center bg-[var(--bg-card)] rounded-2xl border-2 border-dashed border-[var(--border-main)] flex flex-col items-center gap-3 sm:gap-4">
                  <p className="text-[var(--text-muted)] font-bold text-xs sm:text-sm">No addresses found in your account.</p>
                  <Link
                    to="/customer/addresses"
                    className="px-5 sm:px-6 py-2 bg-teal-600 text-white rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest"
                  >
                    Add First Address
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Payment Method */}
          <section className="space-y-3 sm:space-y-4">
            <h2 className="text-sm sm:text-base md:text-lg font-black text-[var(--text-main)] flex items-center gap-1.5 sm:gap-2 uppercase tracking-widest">
              <MdPayment className="text-teal-600 text-lg sm:text-xl md:text-2xl flex-shrink-0" />
              2. Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {[
                { id: 'UPI', label: 'UPI / QR Code', desc: 'Secure Instant Payment', icon: '📱' },
                { id: 'CARD', label: 'Credit / Debit Card', desc: 'All Major Cards Accepted', icon: '💳' },
                { id: 'COD', label: 'Cash On Delivery', desc: 'Pay when items arrive', icon: '📦' }
              ].map((method) => (
                <label key={method.id} className="cursor-pointer group">
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="sr-only"
                  />
                  <Card noPadding className={`transition-all border-2 ${paymentMethod === method.id
                    ? 'border-teal-500 shadow-xl bg-teal-50/10'
                    : 'border-[var(--border-main)]'
                    }`}>
                    <div className="p-3.5 sm:p-4 md:p-5 flex items-center gap-3 sm:gap-4">
                      <span className="text-2xl sm:text-3xl flex-shrink-0">{method.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-[var(--text-main)] text-xs sm:text-sm uppercase tracking-tight truncate">{method.label}</p>
                        <p className="text-[9px] sm:text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest opacity-60 leading-none mt-0.5 sm:mt-1">{method.desc}</p>
                      </div>
                      {paymentMethod === method.id && (
                        <MdCheckCircle className="text-teal-600 text-lg sm:text-xl flex-shrink-0" />
                      )}
                    </div>
                  </Card>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* ── Right: Order Summary ── */}
        <div className="lg:sticky lg:top-6 xl:top-8 space-y-4 sm:space-y-5 md:space-y-6">
          <Card className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
            <h3 className="text-base sm:text-lg md:text-xl font-black text-[var(--text-main)] tracking-tight">Summary</h3>

            {/* Cart item list */}
            <div className="space-y-3 sm:space-y-4 border-b border-[var(--border-subtle)] pb-4 sm:pb-5 md:pb-6 max-h-48 sm:max-h-56 md:max-h-60 overflow-y-auto pr-1 sm:pr-2 scrollbar-thin">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 bg-[var(--bg-app)] text-[var(--text-main)] text-[9px] sm:text-[10px] font-black rounded-md sm:rounded-lg flex items-center justify-center border border-[var(--border-main)] flex-shrink-0">
                      {item.quantity}×
                    </span>
                    <p className="text-[10px] sm:text-xs font-bold text-[var(--text-main)] truncate max-w-[90px] sm:max-w-[110px] md:max-w-[120px]">{item.name}</p>
                  </div>
                  <p className="text-[10px] sm:text-xs font-black text-[var(--text-main)] flex-shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="space-y-2 sm:space-y-3 pt-1 sm:pt-2">
              {[
                { label: 'Bag Total', value: `₹${subtotal.toLocaleString()}`, color: '' },
                { label: 'Delivery', value: deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`, color: deliveryFee === 0 ? 'text-emerald-500' : '' },
                { label: 'GST (18%)', value: `₹${Math.round(tax).toLocaleString()}`, color: '' }
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center">
                  <p className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{label}</p>
                  <p className={`text-xs sm:text-sm font-black ${color || 'text-[var(--text-main)]'}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Grand total */}
            <div className="pt-3 sm:pt-4 border-t border-[var(--border-main)]">
              <p className="text-[9px] sm:text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] mb-0.5 sm:mb-1 italic">Amount Payable</p>
              <h4 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight">
                ₹{Math.round(grandTotal).toLocaleString()}
              </h4>
            </div>

            {/* Place order button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || addresses.length === 0}
              className={`w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[9px] sm:text-xs shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 sm:gap-3 ${isPlacingOrder || addresses.length === 0
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}
            >
              {isPlacingOrder ? (
                <>
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  {processingMessage}
                </>
              ) : (
                <>
                  Confirm & Place Order
                  <MdCheckCircle className="text-base sm:text-lg flex-shrink-0" />
                </>
              )}
            </button>

            {/* Trust info */}
            <div className="pt-2 sm:pt-3 md:pt-4 space-y-2.5 sm:space-y-3 md:space-y-4">
              <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 bg-emerald-50/50 p-3 sm:p-4 rounded-xl border border-emerald-500/10">
                <MdVerified className="text-emerald-500 text-lg sm:text-xl flex-shrink-0 mt-0.5 sm:mt-0" />
                <p className="text-[8px] sm:text-[9px] font-bold text-emerald-800 uppercase tracking-widest leading-relaxed">
                  Safe Checkout: All transactions are encrypted and audited for security.
                </p>
              </div>
              <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 bg-blue-50/50 p-3 sm:p-4 rounded-xl border border-blue-500/10">
                <MdLocalShipping className="text-blue-500 text-lg sm:text-xl flex-shrink-0 mt-0.5 sm:mt-0" />
                <p className="text-[8px] sm:text-[9px] font-bold text-blue-800 uppercase tracking-widest leading-relaxed">
                  Delivery Estimate:{' '}
                  {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  {' — '}
                  {new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;