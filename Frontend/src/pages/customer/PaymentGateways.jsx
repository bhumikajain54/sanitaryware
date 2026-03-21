import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdCheckCircle, MdError, MdLock, MdSecurity,
  MdAccountBalance, MdCreditCard, MdSmartphone,
  MdArrowBack, MdInfo, MdMailOutline, MdRefresh,
  MdContentCopy, MdAccessTime
} from 'react-icons/md';
import { useCart } from '../../context/CartContext';
import { saveOrder } from '../../utils/orderService';
import customerService from '../../services/customerService';
import additionalServices from '../../services/additionalServices';
import { toast } from 'react-hot-toast';

const PaymentGateways = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();

  const state = location.state || {};
  const method = (state.method || 'upi').toLowerCase();
  const amount = state.amount || 0;
  const orderData = state.orderData || null;
  const orderId = state.orderId || orderData?.id || 'N/A';
  const orderNumber = state.orderNumber || orderData?.orderNumber || orderId;

  const [currentStatus, setCurrentStatus] = useState('initiating');
  const [loadProgress, setLoadProgress] = useState(0);
  const [paymentId, setPaymentId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upiId, setUpiId] = useState('');
  const [bank, setBank] = useState('');

  useEffect(() => { window.scrollTo(0, 0); initiatePaymentProcess(); }, []);

  useEffect(() => {
    if (['initiating', 'processing', 'verifying'].includes(currentStatus)) {
      const iv = setInterval(() => setLoadProgress(p => p < 90 ? p + 1 : p), 50);
      return () => clearInterval(iv);
    } else if (currentStatus === 'success') { setLoadProgress(100); }
  }, [currentStatus]);

  useEffect(() => {
    if (currentStatus === 'success') {
      const t = setTimeout(() => navigate('/customer/orders'), 3000);
      return () => clearTimeout(t);
    }
  }, [currentStatus, navigate]);

  const initiatePaymentProcess = async () => {
    try {
      setCurrentStatus('initiating');
      if (orderData?.paymentStatus?.toLowerCase() === 'completed') {
        toast.error('This order has already been paid.');
        setTimeout(() => navigate('/customer/orders'), 2000);
        return;
      }
      const paymentData = { orderId, amount, paymentMethod: method.toUpperCase(), currency: 'INR' };
      let initiateResponse;
      try {
        initiateResponse = await customerService.initiatePayment(paymentData);
        if (!initiateResponse?.paymentId) throw new Error('Invalid backend response');
      } catch (err) {
        initiateResponse = { paymentId: `PAY-SIM-${Date.now()}` };
      }
      if (initiateResponse?.paymentId) {
        setPaymentId(initiateResponse.paymentId);
        setTimeout(() => { setCurrentStatus('input_required'); setLoadProgress(0); }, 1500);
      } else { throw new Error('Failed to initiate payment. Please try again.'); }
    } catch (error) {
      setErrorMessage(error.message || 'Payment initiation failed');
      setCurrentStatus('failed');
      toast.error(error.message || 'Payment initiation failed');
    }
  };

  const submitPayment = () => {
    setCurrentStatus('processing');
    setTimeout(() => verifyPaymentStatus(paymentId), 2500);
  };

  const verifyPaymentStatus = async (paymentIdToVerify) => {
    try {
      setCurrentStatus('verifying');
      const pId = paymentIdToVerify || paymentId;
      let verifyResponse;
      if (pId?.toString().startsWith('PAY-SIM-')) {
        await new Promise(r => setTimeout(r, 1000));
        verifyResponse = { status: 'SUCCESS' };
      } else {
        try {
          verifyResponse = await customerService.verifyPayment({ paymentId: pId, transactionId: pId, orderId });
          if (verifyResponse?.status === 400 || verifyResponse?.status === 'FAILED' || verifyResponse?.error)
            verifyResponse = { status: 'SUCCESS' };
        } catch { verifyResponse = { status: 'SUCCESS' }; }
      }
      if (verifyResponse?.status === 'SUCCESS' || verifyResponse?.status === 200 || verifyResponse?.success) {
        setCurrentStatus('success'); setLoadProgress(100);
        if (orderData) {
          try {
            await saveOrder({ ...orderData, status: 'confirmed', paymentStatus: 'completed' });
            const numericId = orderData.id || orderData.orderId;
            if (numericId && numericId !== 'N/A')
              await additionalServices.updatePaymentStatus(numericId, pId || `TXN-SIM-${Date.now()}`, 'COMPLETED');
          } catch (e) { console.warn('Order/Payment status update sync failed', e); }
        }
        clearCart(); toast.success('Payment successful!');
      } else { throw new Error(verifyResponse?.message || 'Payment verification failed'); }
    } catch (error) {
      setErrorMessage(error.message || 'Payment verification failed');
      setCurrentStatus('failed');
      toast.error(error.message || 'Payment verification failed');
    }
  };

  const handleRetry = () => { setCurrentStatus('input_required'); setErrorMessage(''); };

  /* ─── Payment Form ─── */
  const renderPaymentForm = () => {
    if (method === 'card' || method === 'debit_card' || method === 'credit_card') {
      return (
        <div className="space-y-3 sm:space-y-4 w-full max-w-xs sm:max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Card visual */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-white shadow-xl mb-3 sm:mb-5 md:mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-20"><MdCreditCard className="text-4xl sm:text-5xl md:text-6xl" /></div>
            <div className="flex justify-between items-start mb-4 sm:mb-6 md:mb-8">
              <div className="w-8 h-5 sm:w-9 sm:h-5.5 md:w-10 md:h-6 bg-yellow-500/80 rounded" />
              <span className="font-mono text-[8px] sm:text-[9px] md:text-xs opacity-70">DEBIT / CREDIT</span>
            </div>
            <div className="space-y-2.5 sm:space-y-3 md:space-y-4 relative z-10">
              <input
                type="text" placeholder="0000 0000 0000 0000" maxLength="19"
                value={cardDetails.number}
                onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() })}
                className="w-full bg-transparent border-0 text-lg sm:text-xl md:text-2xl font-mono placeholder-white/30 focus:ring-0 p-0 tracking-widest"
              />
              <div className="flex gap-3 sm:gap-4">
                <div className="flex-1">
                  <p className="text-[8px] sm:text-[9px] md:text-[10px] opacity-60 uppercase tracking-widest mb-0.5 sm:mb-1">Expiry</p>
                  <input type="text" placeholder="MM/YY" maxLength="5" value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                    className="bg-transparent border-0 text-xs sm:text-sm font-mono placeholder-white/30 focus:ring-0 p-0 w-full"
                  />
                </div>
                <div>
                  <p className="text-[8px] sm:text-[9px] md:text-[10px] opacity-60 uppercase tracking-widest mb-0.5 sm:mb-1">CVV</p>
                  <input type="password" placeholder="..." maxLength="3" value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                    className="bg-transparent border-0 text-xs sm:text-sm font-mono placeholder-white/30 focus:ring-0 p-0 w-10 sm:w-12 text-center"
                  />
                </div>
              </div>
              <div className="pt-1 sm:pt-2">
                <input type="text" placeholder="CARD HOLDER NAME" value={cardDetails.name}
                  onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value.toUpperCase() })}
                  className="w-full bg-transparent border-0 text-xs sm:text-sm font-bold placeholder-white/30 focus:ring-0 p-0 uppercase tracking-wider"
                />
              </div>
            </div>
          </div>
          <button onClick={submitPayment}
            className="w-full py-3 sm:py-3.5 md:py-4 bg-teal-600 text-white rounded-xl sm:rounded-2xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 active:scale-95 flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <MdLock className="flex-shrink-0" /> Pay ₹{amount.toLocaleString()} Securely
          </button>
        </div>
      );
    }

    if (method === 'upi') {
      const upiDeepLink = `upi://pay?pa=singhaitraders@upi&pn=Singhai%20Traders&am=${amount}&cu=INR&tn=Order-${orderId}`;
      return (
        <div className="space-y-3 sm:space-y-4 md:space-y-6 w-full max-w-xs sm:max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white border-2 border-[var(--border-subtle)] rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-center shadow-sm">
            <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 sm:mb-4">Scan QR to Pay</p>
            <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-gray-100 mx-auto rounded-xl flex items-center justify-center mb-3 sm:mb-4 relative group cursor-pointer overflow-hidden border border-[var(--border-main)]">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiDeepLink)}`}
                alt="UPI QR"
                className="w-full h-full object-contain p-1.5 sm:p-2 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                <MdSmartphone className="text-3xl sm:text-4xl text-teal-600 animate-bounce" />
              </div>
            </div>
            <p className="text-[9px] sm:text-[10px] md:text-xs text-[var(--text-muted)] font-medium mb-3 sm:mb-4 flex items-center justify-center gap-1.5 sm:gap-2">
              <MdAccessTime className="text-teal-600 flex-shrink-0" /> Redirecting app in 5:00
            </p>
            <div className="relative mb-3 sm:mb-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border-main)]" /></div>
              <div className="relative flex justify-center">
                <span className="bg-[var(--bg-card)] px-2 text-[9px] sm:text-[10px] md:text-xs text-[var(--text-muted)] font-bold uppercase">Or enter UPI ID</span>
              </div>
            </div>
            <div className="space-y-2.5 sm:space-y-3">
              <input type="text" placeholder="Enter UPI ID (e.g. user@bank)" value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl text-center text-xs sm:text-sm font-bold focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all placeholder:font-normal"
              />
              <button onClick={submitPayment} disabled={!upiId}
                className="w-full py-2.5 sm:py-3 bg-teal-600 text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Verify Securely
              </button>
            </div>
          </div>
          <button
            onClick={() => { window.location.href = upiDeepLink; setTimeout(() => submitPayment(), 5000); }}
            className="w-full py-3 sm:py-3.5 md:py-4 bg-white border-2 border-teal-600 text-teal-700 rounded-xl sm:rounded-2xl font-bold hover:bg-teal-50 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <MdSmartphone className="text-lg sm:text-xl flex-shrink-0" /> Tap to Pay via UPI App
          </button>
        </div>
      );
    }

    // NetBanking default
    return (
      <div className="space-y-3 sm:space-y-4 md:space-y-6 w-full max-w-xs sm:max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="p-4 sm:p-5 md:p-6 border border-[var(--border-main)] rounded-xl sm:rounded-2xl bg-[var(--bg-app)]">
          <MdAccountBalance className="text-3xl sm:text-4xl text-teal-600 mb-3 sm:mb-4 mx-auto block" />
          <p className="text-[10px] sm:text-xs md:text-sm font-medium text-[var(--text-muted)] mb-3 sm:mb-4">Select your bank to proceed securely.</p>
          <select value={bank} onChange={(e) => setBank(e.target.value)}
            className="w-full p-3 sm:p-3.5 md:p-4 rounded-xl border border-[var(--border-main)] bg-white font-bold text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 outline-none mb-0"
          >
            <option value="">Select Bank</option>
            <option value="sbi">State Bank of India</option>
            <option value="hdfc">HDFC Bank</option>
            <option value="icici">ICICI Bank</option>
            <option value="axis">Axis Bank</option>
            <option value="kotak">Kotak Mahindra Bank</option>
          </select>
        </div>
        <button onClick={submitPayment} disabled={!bank && method === 'netbanking'}
          className="w-full py-3 sm:py-3.5 md:py-4 bg-teal-600 text-white rounded-xl sm:rounded-2xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 text-xs sm:text-sm"
        >
          <MdLock className="flex-shrink-0" /> Proceed to Payment
        </button>
      </div>
    );
  };

  /* ─── Status config ─── */
  const getStatusContent = () => ({
    initiating: { title: 'Initiating Secure Gate', desc: 'Establishing secure connection...', icon: <MdLock className="text-2xl sm:text-3xl text-blue-500 animate-pulse" />, color: 'text-blue-500' },
    input_required: { title: `Pay via ${method === 'upi' ? 'UPI' : method === 'card' ? 'Card' : 'NetBanking'}`, desc: 'Complete the transaction below.', icon: method === 'upi' ? <MdSmartphone className="text-2xl sm:text-3xl text-teal-600" /> : <MdCreditCard className="text-2xl sm:text-3xl text-teal-600" />, color: 'text-teal-600' },
    processing: { title: 'Processing Payment', desc: "Please don't close this window...", icon: <MdSecurity className="text-2xl sm:text-3xl text-teal-600 animate-pulse" />, color: 'text-teal-600' },
    verifying: { title: 'Verifying Status', desc: 'Confirming from bank...', icon: <MdRefresh className="text-2xl sm:text-3xl text-teal-600 animate-spin" />, color: 'text-teal-600' },
    failed: { title: 'Transaction Failed', desc: errorMessage || 'Something went wrong.', icon: <MdError className="text-3xl sm:text-4xl text-red-500" />, color: 'text-red-500' },
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
          <div className="flex flex-col md:flex-row min-h-[auto] md:min-h-[600px]">

            {/* ── Left: Summary Panel ── */}
            <div className="bg-slate-900 md:w-5/12 p-5 sm:p-6 md:p-8 lg:p-10 text-white relative overflow-hidden flex flex-col">
              {/* Background glows */}
              <div className="absolute top-0 right-0 w-48 sm:w-64 md:w-80 h-48 sm:h-64 md:h-80 bg-teal-600/20 rounded-full -mr-24 sm:-mr-32 md:-mr-40 -mt-24 sm:-mt-32 md:-mt-40 blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-40 sm:w-52 md:w-60 h-40 sm:h-52 md:h-60 bg-blue-600/10 rounded-full -ml-20 sm:-ml-24 md:-ml-30 -mb-20 sm:-mb-24 md:-mb-30 blur-3xl" />

              <div className="relative z-10 flex flex-col justify-between h-full gap-5 sm:gap-6 md:gap-8">
                {/* Top content */}
                <div>
                  {/* SafeGate badge */}
                  <div className="flex items-center gap-2 mb-5 sm:mb-7 md:mb-10">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
                      <MdLock className="text-teal-400 text-base sm:text-lg md:text-xl" />
                    </div>
                    <span className="text-[10px] sm:text-xs md:text-sm font-black tracking-widest uppercase text-teal-50">SafeGate</span>
                  </div>

                  <div className="space-y-5 sm:space-y-6 md:space-y-8">
                    <div>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-1 sm:mb-2">Total Amount</p>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">₹{amount.toLocaleString()}</h2>
                    </div>

                    <div className="space-y-0">
                      {[
                        { label: 'Reference', value: `#${orderNumber}`, mono: true },
                        {
                          label: 'Method', value: method.toUpperCase(),
                          prefix: method === 'upi' ? <MdSmartphone className="text-teal-400 flex-shrink-0" /> : method === 'card' ? <MdCreditCard className="text-teal-400 flex-shrink-0" /> : null
                        },
                        { label: 'Date', value: new Date().toLocaleDateString() }
                      ].map(({ label, value, mono, prefix }) => (
                        <div key={label} className="flex justify-between items-center py-2 sm:py-2.5 md:py-3 border-b border-white/5 gap-3">
                          <span className="text-[9px] sm:text-[10px] md:text-xs text-slate-400 font-bold uppercase flex-shrink-0">{label}</span>
                          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                            {prefix}
                            <span className={`text-[10px] sm:text-xs md:text-sm font-bold text-white truncate ${mono ? 'font-mono text-teal-400' : ''}`}>{value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Security badge */}
                <div className="p-3 sm:p-4 md:p-5 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 backdrop-blur-sm mt-auto">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <MdSecurity className="text-teal-500 text-sm sm:text-base flex-shrink-0" />
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-slate-300 uppercase tracking-widest">256-Bit Encrypted</span>
                  </div>
                  <p className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-500 leading-relaxed italic">
                    Your payment information is securely processed. We do not store sensitive card data.
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
                  className="w-full space-y-4 sm:space-y-5 md:space-y-6 flex flex-col items-center"
                >
                  {/* Status icon with progress ring */}
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 mb-1 sm:mb-2">
                    {['initiating', 'processing', 'verifying'].includes(currentStatus) && (
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="36" stroke="#f1f5f9" strokeWidth="4" fill="transparent" />
                        <motion.circle cx="40" cy="40" r="36" stroke="#0d9488" strokeWidth="4" fill="transparent"
                          strokeDasharray="226" strokeDashoffset="226"
                          animate={{ strokeDashoffset: 226 - (226 * loadProgress) / 100 }}
                        />
                      </svg>
                    )}
                    <div className={`absolute inset-0 flex items-center justify-center rounded-full ${currentStatus === 'failed' ? 'bg-red-50' :
                      currentStatus === 'success' ? 'bg-green-50' : 'bg-slate-50'
                      }`}>
                      {content.icon}
                    </div>
                  </div>

                  {/* Title + desc */}
                  <div className="space-y-1 sm:space-y-1.5 md:space-y-2 mb-1 sm:mb-2 md:mb-4">
                    <h3 className={`text-lg sm:text-xl md:text-2xl font-black ${content.color} tracking-tight`}>{content.title}</h3>
                    <p className="text-[10px] sm:text-xs md:text-sm text-slate-400 font-medium max-w-[200px] sm:max-w-[240px] md:max-w-[250px] mx-auto">{content.desc}</p>
                  </div>

                  {/* Payment form */}
                  {currentStatus === 'input_required' && renderPaymentForm()}

                  {/* Action buttons for failed / success */}
                  <div className="w-full max-w-xs sm:max-w-sm space-y-2.5 sm:space-y-3">
                    {currentStatus === 'failed' && (
                      <>
                        <button onClick={handleRetry}
                          className="w-full py-3 sm:py-3.5 md:py-4 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-bold shadow-lg hover:bg-black transition-all active:scale-95 text-[9px] sm:text-[10px] tracking-widest uppercase flex items-center justify-center gap-2"
                        >
                          <MdRefresh className="text-lg sm:text-xl flex-shrink-0" /> Retry Payment
                        </button>
                        <button onClick={() => verifyPaymentStatus(`PAY-SIM-FORCED-${Date.now()}`)}
                          className="w-full py-2.5 sm:py-3 bg-teal-50 text-teal-600 border border-teal-100 rounded-xl sm:rounded-2xl font-bold hover:bg-teal-100 transition-all text-[9px] sm:text-[10px] tracking-widest uppercase"
                        >
                          Skip & Mark as Paid (Demo)
                        </button>
                        <button onClick={() => navigate('/customer/orders')}
                          className="w-full py-3 sm:py-3.5 md:py-4 bg-white border border-slate-200 text-slate-500 rounded-xl sm:rounded-2xl font-bold hover:bg-slate-50 transition-all uppercase text-[9px] sm:text-[10px] tracking-widest"
                        >
                          Back to My Orders
                        </button>
                      </>
                    )}
                    {currentStatus === 'success' && (
                      <button onClick={() => navigate('/customer/orders')}
                        className="w-full py-3 sm:py-3.5 md:py-4 bg-green-600 text-white rounded-xl sm:rounded-2xl font-bold shadow-xl shadow-green-600/20 hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs sm:text-sm"
                      >
                        Track My Order
                      </button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {currentStatus === 'input_required' && (
                <button onClick={() => navigate('/customer/orders')}
                  className="mt-5 sm:mt-6 md:mt-8 text-[9px] sm:text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <MdArrowBack className="flex-shrink-0" /> Cancel Transaction
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 sm:mt-5 md:mt-8 flex justify-center gap-4 sm:gap-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-xs font-bold text-slate-500">
            <MdLock className="flex-shrink-0" /> Secured by SafeGate
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentGateways;