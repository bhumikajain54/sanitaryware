import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdCheckCircle, MdError, MdLock, MdSecurity,
  MdRefresh, MdArrowBack
} from 'react-icons/md';
import { useCart } from '../../context/CartContext';
import { saveOrder } from '../../utils/orderService';
import customerService from '../../services/customerService';
import additionalServices from '../../services/additionalServices';
import { toast } from 'react-hot-toast';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PaymentGateways = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();

  const state = location.state || {};
  const amount = state.amount || 0;
  const orderData = state.orderData || null;
  const orderId = state.orderId || orderData?.id || 'N/A';
  const orderNumber = state.orderNumber || orderData?.orderNumber || orderId;

  // We rely on standard statuses
  const [currentStatus, setCurrentStatus] = useState('initiating');
  const [loadProgress, setLoadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    startRazorpayPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (['initiating', 'processing', 'verifying'].includes(currentStatus)) {
      const iv = setInterval(() => setLoadProgress(p => p < 90 ? p + 1 : p), 50);
      return () => clearInterval(iv);
    } else if (currentStatus === 'success') { 
      setLoadProgress(100); 
    }
  }, [currentStatus]);

  useEffect(() => {
    if (currentStatus === 'success') {
      const t = setTimeout(() => navigate('/customer/orders'), 3000);
      return () => clearTimeout(t);
    }
  }, [currentStatus, navigate]);

  const startRazorpayPayment = async () => {
    try {
      setCurrentStatus('initiating');

      if (orderData?.paymentStatus?.toLowerCase() === 'completed') {
        toast.error('This order has already been paid.');
        setTimeout(() => navigate('/customer/orders'), 2000);
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      const paymentData = {
        orderId,
        amount,
        paymentMethod: 'RAZORPAY',
        currency: 'INR'
      };

      // 1. Initiate order in backend
      const initiateResponse = await customerService.initiatePayment(paymentData);
      
      if (!initiateResponse || initiateResponse.status === "FAILED") {
        throw new Error(initiateResponse?.message || 'Failed to initiate secure connection.');
      }

      // 2. Configure Razorpay options
      const options = {
        key: initiateResponse.key, // Your razorpay key id from backend config
        amount: initiateResponse.amount,
        currency: initiateResponse.currency,
        name: "Sanitary Ware Co.",
        description: `Payment for Order #${orderNumber}`,
        order_id: initiateResponse.razorpayOrderId,
        retry: { enabled: false },
        
        // 3. Handle physical payment success
        handler: async function (response) {
          try {
            setCurrentStatus('verifying');
            const verifyRes = await additionalServices.verifyRazorpayPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              effectiveOrderId: orderId
            });

            if (verifyRes.status === "SUCCESS") {
              setCurrentStatus('success');
              if (orderData) {
                try {
                  await saveOrder({ ...orderData, status: 'confirmed', paymentStatus: 'completed' });
                } catch (e) {
                   console.warn('Sync failed', e);
                }
              }
              clearCart();
              toast.success('Payment successful!');
            } else {
              throw new Error(verifyRes.message || 'Signature verification failed');
            }
          } catch (err) {
            setErrorMessage(err.message || 'Payment Verification Failed');
            setCurrentStatus('failed');
            toast.error('Payment Verification Failed');
          }
        },
        
        prefill: {
          name: orderData?.user?.firstName || 'Customer',
          email: orderData?.user?.email || '',
        },
        theme: { color: "#0d9488" } // Matches teal-600 outline
      };

      // Provide a hook for when the modal is closed by the user without paying
      options.modal = {
        ondismiss: function () {
          setErrorMessage('Payment cancelled by user. You can try again.');
          setCurrentStatus('failed');
          toast('Payment window closed');
        }
      };

      setCurrentStatus('input_required');
      const razorpayWindow = new window.Razorpay(options);
      
      // If payment fails within the popup 
      razorpayWindow.on('payment.failed', function (response) {
        setErrorMessage(response.error.description || 'Payment Failed');
        setCurrentStatus('failed');
        toast.error(response.error.description || 'Payment Failed');
      });

      razorpayWindow.open();

    } catch (error) {
      setErrorMessage(error.message || 'Payment initiation failed');
      setCurrentStatus('failed');
      toast.error(error.message || 'Payment initiation failed');
    }
  };

  const handleRetry = () => {
    setErrorMessage('');
    startRazorpayPayment();
  };

  const getStatusContent = () => ({
    initiating: { title: 'Connecting to SafeGate', desc: 'Starting secure Razorpay session...', icon: <MdLock className="text-2xl sm:text-3xl text-blue-500 animate-pulse" />, color: 'text-blue-500' },
    input_required: { title: 'Checkout Window Open', desc: 'Please complete your transaction in the secure Razorpay popup.', icon: <MdSecurity className="text-2xl sm:text-3xl text-teal-600 animate-pulse" />, color: 'text-teal-600' },
    processing: { title: 'Processing Payment', desc: "Validating transaction signatures...", icon: <MdSecurity className="text-2xl sm:text-3xl text-teal-600 animate-pulse" />, color: 'text-teal-600' },
    verifying: { title: 'Verifying Security', desc: 'Confirming with backend records...', icon: <MdRefresh className="text-2xl sm:text-3xl text-teal-600 animate-spin" />, color: 'text-teal-600' },
    failed: { title: 'Transaction Failed / Cancelled', desc: errorMessage || 'Payment process was interrupted.', icon: <MdError className="text-3xl sm:text-4xl text-red-500" />, color: 'text-red-500' },
    success: { title: 'Payment Successful', desc: 'Order confirmed! Redirecting...', icon: <MdCheckCircle className="text-3xl sm:text-4xl text-green-500" />, color: 'text-green-500' }
  }[currentStatus] || {});

  const content = getStatusContent();

  return (
    <div className="min-h-screen bg-[var(--bg-app)] py-4 sm:py-6 md:py-8 lg:py-16 px-3 sm:px-5 md:px-6 flex items-start sm:items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full"
      >
        <div className="bg-[var(--bg-card)] rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-[var(--border-subtle)]">
          <div className="flex flex-col md:flex-row min-h-[auto] md:min-h-[500px]">
            
            {/* ── Left: Summary Panel ── */}
            <div className="bg-slate-900 md:w-5/12 p-5 sm:p-6 md:p-8 lg:p-10 text-white relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-80 h-80 bg-teal-600/20 rounded-full -mr-40 -mt-40 blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-600/10 rounded-full -ml-30 -mb-30 blur-3xl" />

              <div className="relative z-10 flex flex-col justify-between h-full gap-5 sm:gap-6 md:gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-5 sm:mb-10">
                    <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
                      <MdLock className="text-teal-400 text-xl" />
                    </div>
                    <span className="text-sm font-black tracking-widest uppercase text-teal-50">Razorpay Check-out</span>
                  </div>

                  <div className="space-y-5 sm:space-y-8">
                    <div>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-2">Total Amount</p>
                      <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">₹{amount.toLocaleString()}</h2>
                    </div>

                    <div className="space-y-0">
                      <div className="flex justify-between items-center py-2 sm:py-3 border-b border-white/5 gap-3">
                        <span className="text-xs text-slate-400 font-bold uppercase">Reference</span>
                        <span className="text-xs sm:text-sm font-bold text-teal-400 font-mono">#{orderNumber}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 sm:py-3 border-b border-white/5 gap-3">
                        <span className="text-xs text-slate-400 font-bold uppercase">Method</span>
                        <span className="text-xs sm:text-sm font-bold text-white truncate">Online API</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm mt-auto">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <MdSecurity className="text-teal-500 text-base" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">PCI-DSS Compliant</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed italic">
                    Payments are handled securely by Razorpay. We do not store any sensitive card data on our servers.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Right: Interaction Panel ── */}
            <div className="md:w-7/12 p-5 sm:p-7 md:p-9 lg:p-12 flex flex-col items-center justify-center text-center bg-white relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStatus}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full space-y-4 sm:space-y-6 flex flex-col items-center"
                >
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-2">
                    {['initiating', 'processing', 'verifying', 'input_required'].includes(currentStatus) && (
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="36" stroke="#f1f5f9" strokeWidth="4" fill="transparent" />
                        <motion.circle cx="40" cy="40" r="36" stroke="#0d9488" strokeWidth="4" fill="transparent"
                          strokeDasharray="226" strokeDashoffset="226"
                          animate={{ strokeDashoffset: 226 - (226 * loadProgress) / 100 }}
                        />
                      </svg>
                    )}
                    <div className={`absolute inset-0 flex items-center justify-center rounded-full ${
                      currentStatus === 'failed' ? 'bg-red-50' : currentStatus === 'success' ? 'bg-green-50' : 'bg-slate-50'
                    }`}>
                      {content.icon}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <h3 className={`text-xl sm:text-2xl font-black ${content.color} tracking-tight`}>{content.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-[250px] mx-auto">{content.desc}</p>
                  </div>

                  <div className="w-full max-w-sm space-y-3">
                    {currentStatus === 'failed' && (
                      <>
                        <button onClick={handleRetry}
                          className="w-full py-3 sm:py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-black transition-all active:scale-95 text-[10px] tracking-widest uppercase flex items-center justify-center gap-2"
                        >
                          <MdRefresh className="text-xl" /> Retry Payment
                        </button>
                        <button onClick={() => navigate('/customer/orders')}
                          className="w-full py-3 sm:py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-bold hover:bg-slate-50 transition-all uppercase text-[10px] tracking-widest"
                        >
                          Back to My Orders
                        </button>
                      </>
                    )}
                    
                    {currentStatus === 'input_required' && (
                      <button onClick={handleRetry}
                        className="w-full py-3 sm:py-4 bg-teal-600 text-white rounded-2xl font-bold shadow-lg hover:bg-teal-700 transition-all active:scale-95 text-[10px] tracking-widest uppercase flex items-center justify-center gap-2"
                      >
                         Open Checkout Window again
                      </button>
                    )}

                    {currentStatus === 'success' && (
                      <button onClick={() => navigate('/customer/orders')}
                        className="w-full py-3 sm:py-4 bg-green-600 text-white rounded-2xl font-bold shadow-xl hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                      >
                        Track My Order
                      </button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {(currentStatus === 'input_required' || currentStatus === 'initiating') && (
                <button onClick={() => navigate('/customer/orders')}
                  className="mt-8 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <MdArrowBack /> Cancel Transaction
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentGateways;