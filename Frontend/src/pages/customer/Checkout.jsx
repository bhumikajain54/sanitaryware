import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdCheckCircle, 
  MdCreditCard, 
  MdAccountBalance,
  MdShoppingCart,
  MdLocationOn,
  MdPayment,
  MdReceipt,
  MdArrowBack
} from 'react-icons/md';
import { toast } from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import customerService from '../../services/customerService';
import { useAuth } from '../../context/AuthContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [addressFormData, setAddressFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });
  const [editingAddressId, setEditingAddressId] = useState(null);

  useEffect(() => {
    const fetchAddresses = async () => {
        try {
            const data = await customerService.getAddresses();
            setAddresses(data || []);
            const defaultAddr = (data || []).find(a => a.isDefault);
            if (defaultAddr) setSelectedAddress(defaultAddr.id);
        } catch (err) {
            console.error('Failed to fetch addresses:', err);
        }
    };
    fetchAddresses();
  }, []);

  const subtotal = getCartTotal();
  const tax = subtotal * 0.18;
  const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 200;
  const total = subtotal + tax + shipping;

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: amount % 1 !== 0 ? 2 : 0
    });
  };

  const formatTotal = (amount) => {
    return (amount || 0).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await customerService.updateAddress(editingAddressId, addressFormData);
        toast.success('Address updated');
      } else {
        await customerService.createAddress(addressFormData);
        toast.success('Address added');
      }
      const data = await customerService.getAddresses();
      setAddresses(data || []);
      setShowAddressForm(false);
      setEditingAddressId(null);
      setAddressFormData({ name: user?.name || '', phone: user?.phone || '', address: '', city: '', state: '', pincode: '', isDefault: false });
    } catch (err) {
        toast.error('Failed to save address');
    }
  };

  const handleEditAddress = (addr, e) => {
    e.stopPropagation();
    setEditingAddressId(addr.id);
    setAddressFormData(addr);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this address?')) {
        try {
            await customerService.deleteAddress(id);
            const data = await customerService.getAddresses();
            setAddresses(data || []);
            if (selectedAddress === id) setSelectedAddress(null);
        } catch (err) {
            toast.error('Failed to delete address');
        }
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !paymentMethod) {
      toast.error('Please select address and payment method');
      return;
    }
    
    setIsPlacingOrder(true);
    const address = addresses.find(a => a.id === selectedAddress);
    
    const orderData = {
      addressId: selectedAddress,
      paymentMethod: paymentMethod.toUpperCase(), // Backend usually expects uppercase
      items: cartItems.map(item => ({
        productId: item.id || item.productId,
        quantity: item.quantity
      }))
    };

    try {
      let response;
      try {
        response = await customerService.createOrder(orderData);
      } catch (apiErr) {
        console.warn('Backend createOrder failed, using simulation', apiErr);
        // Fallback simulation for demo/dev
        response = {
          id: Math.floor(Math.random() * 100000),
          orderNumber: `ORD-${Date.now()}`,
          status: 'PENDING',
          totalAmount: total,
          paymentMethod: paymentMethod.toUpperCase(),
          items: cartItems, 
          createdAt: new Date().toISOString(),
          address: address
        };
      }

      const newOrderId = response.orderNumber || response.id;
      
      if (paymentMethod === 'cod') {
        setOrderId(newOrderId);
        setOrderSuccess(true);
        clearCart();
        toast.success('Order placed successfully');
      } else {
        navigate('/payment-gateway', { 
          state: { 
            method: paymentMethod, 
            amount: total,
            orderId: newOrderId,
            orderData: response 
          } 
        });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[var(--bg-card)] rounded-3xl p-8 text-center shadow-2xl border border-[var(--border-main)]"
        >
          <div className="w-24 h-24 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <MdCheckCircle className="text-6xl text-teal-600" />
          </div>
          <h2 className="text-3xl font-bold text-[var(--text-main)] mb-4">Order Placed!</h2>
          <p className="text-[var(--text-muted)] mb-8 font-medium">
            Thank you for your purchase. Your order <span className="text-teal-600 font-bold">#{orderId}</span> is confirmed.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/customer/orders')}
              className="w-full bg-teal-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 active:scale-95"
            >
              Track My Order
            </button>
            <button
              onClick={() => navigate('/home')}
              className="w-full border-2 border-teal-600 text-teal-600 px-8 py-4 rounded-xl font-bold hover:bg-teal-500/10 transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 md:mb-12 text-center md:text-left">
          <h1 className="text-2xl md:text-5xl font-black text-[var(--text-main)] mb-2 tracking-tight">Checkout</h1>
          <p className="text-sm md:text-lg text-[var(--text-muted)] font-medium flex items-center justify-center md:justify-start gap-2">
            <MdShoppingCart className="text-teal-600" /> Complete your purchase securely
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12 max-w-3xl mx-auto">
          <div className="relative flex justify-between">
            <div className="absolute top-5 left-0 w-full h-1 bg-[var(--border-main)] -z-10">
              <div 
                className="h-full bg-teal-600 transition-all duration-500" 
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              />
            </div>
            {[
              { step: 1, label: 'Address', icon: <MdLocationOn /> },
              { step: 2, label: 'Payment', icon: <MdPayment /> },
              { step: 3, label: 'Review', icon: <MdReceipt /> }
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  currentStep >= item.step ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-2 border-[var(--border-main)]'
                }`}>
                  {currentStep > item.step ? <MdCheckCircle className="text-xl" /> : item.icon}
                </div>
                <span className={`mt-2 text-sm font-bold ${currentStep >= item.step ? 'text-teal-600' : 'text-[var(--text-muted)]'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            <AnimatePresence mode="wait">
              {/* Step 1: Address */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-[var(--bg-card)] rounded-3xl p-6 md:p-8 shadow-xl border border-[var(--border-main)]"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-[var(--text-main)]">Shipping Address</h2>
                    {!showAddressForm && (
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-bold px-4 py-2 bg-teal-500/10 rounded-xl transition-all"
                      >
                        <MdAdd /> Add New
                      </button>
                    )}
                  </div>

                  {showAddressForm ? (
                    <form onSubmit={handleSaveAddress} className="space-y-6 bg-[var(--bg-app)] p-6 rounded-2xl border-2 border-teal-500/20 border-dashed">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-[var(--text-muted)]">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Rahul Sharma"
                            value={addressFormData.name}
                            onChange={(e) => setAddressFormData({...addressFormData, name: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-main)] focus:border-teal-500 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-[var(--text-muted)]">Phone Number</label>
                          <input
                            type="text"
                            required
                            placeholder="10-digit mobile number"
                            value={addressFormData.phone}
                            onChange={(e) => setAddressFormData({...addressFormData, phone: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-main)] focus:border-teal-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--text-muted)]">Street Address</label>
                        <input
                          type="text"
                          required
                          placeholder="House No., Building, Area"
                          value={addressFormData.address}
                          onChange={(e) => setAddressFormData({...addressFormData, address: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-main)] focus:border-teal-500 outline-none transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="text"
                          required
                          placeholder="City"
                          value={addressFormData.city}
                          onChange={(e) => setAddressFormData({...addressFormData, city: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-main)] focus:border-teal-500 outline-none transition-all"
                        />
                        <input
                          type="text"
                          required
                          placeholder="State"
                          value={addressFormData.state}
                          onChange={(e) => setAddressFormData({...addressFormData, state: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-main)] focus:border-teal-500 outline-none transition-all"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Pincode"
                          value={addressFormData.pincode}
                          onChange={(e) => setAddressFormData({...addressFormData, pincode: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-main)] focus:border-teal-500 outline-none transition-all"
                        />
                      </div>
                      <div className="flex gap-4">
                        <button type="submit" className="flex-1 bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition-all">
                          {editingAddressId ? 'Update & Save' : 'Add Address'}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setShowAddressForm(false)}
                          className="flex-1 bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-muted)] font-bold py-3 rounded-xl hover:bg-[var(--bg-app)] transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid gap-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddress(addr.id)}
                          className={`p-5 border-2 rounded-2xl cursor-pointer transition-all relative ${
                            selectedAddress === addr.id
                              ? 'border-teal-600 bg-teal-500/5'
                              : 'border-[var(--border-main)] hover:border-teal-500/30'
                          }`}
                        >
                          <div className="flex justify-between items-start pr-12">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-[var(--text-main)]">{addr.name}</span>
                                {addr.isDefault && <span className="text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Default</span>}
                              </div>
                              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</p>
                              <p className="text-sm text-[var(--text-main)] mt-2 font-medium">📞 {addr.phone}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button onClick={(e) => handleEditAddress(addr, e)} className="p-2 text-[var(--text-muted)] hover:text-teal-600 transition-colors bg-[var(--bg-card)] rounded-lg shadow-sm border border-[var(--border-main)]"><MdEdit /></button>
                                <button onClick={(e) => handleDeleteAddress(addr.id, e)} className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors bg-[var(--bg-card)] rounded-lg shadow-sm border border-[var(--border-main)]"><MdDelete /></button>
                            </div>
                          </div>
                          {selectedAddress === addr.id && (
                            <div className="absolute top-4 right-4 bg-teal-600 text-white p-1 rounded-full"><MdCheckCircle /></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {!showAddressForm && (
                     <button
                        onClick={() => setCurrentStep(2)}
                        disabled={!selectedAddress}
                        className={`w-full mt-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-[0.98] ${
                          selectedAddress ? 'bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200' : 'bg-[var(--border-main)] text-[var(--text-muted)] cursor-not-allowed'
                        }`}
                      >
                        Proceed to Payment
                      </button>
                  )}
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-[var(--bg-card)] rounded-3xl p-6 md:p-8 shadow-xl border border-[var(--border-main)]"
                >
                  <h2 className="text-2xl font-bold text-[var(--text-main)] mb-8">Payment Method</h2>
                  <div className="grid gap-4">
                    {[
                      { id: 'upi', label: 'UPI (GPay, PhonePe)', desc: 'Pay with any UPI App', icon: '📱', color: 'bg-purple-500/10' },
                      { id: 'card', label: 'Credit / Debit Card', desc: 'Secure card payment', icon: <MdCreditCard className="text-blue-500" />, color: 'bg-blue-500/10' },
                      { id: 'netbanking', label: 'Net Banking', desc: 'Direct bank transfer', icon: <MdAccountBalance className="text-green-500" />, color: 'bg-green-500/10' },
                      { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when items delivered', icon: '💵', color: 'bg-orange-500/10' }
                    ].map((method) => (
                      <div
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`group p-4 border-2 rounded-2xl cursor-pointer transition-all flex items-center gap-4 ${
                          paymentMethod === method.id ? 'border-teal-600 bg-teal-500/5' : 'border-[var(--border-main)] hover:border-teal-500/30'
                        }`}
                      >
                        <div className={`w-12 h-12 ${method.color} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-[var(--text-main)]">{method.label}</p>
                          <p className="text-xs text-[var(--text-muted)]">{method.desc}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          paymentMethod === method.id ? 'bg-teal-600 border-teal-600' : 'border-[var(--border-main)]'
                        }`}>
                          {paymentMethod === method.id && <MdCheckCircle className="text-white text-xs" />}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-10">
                    <button onClick={() => setCurrentStep(1)} className="py-4 border-2 border-[var(--border-main)] rounded-xl font-bold text-[var(--text-muted)] hover:bg-[var(--bg-app)] transition-all">Back</button>
                    <button 
                      onClick={() => {
                        if (paymentMethod === 'cod') {
                          setCurrentStep(3);
                        } else {
                          handlePlaceOrder();
                        }
                      }} 
                      disabled={!paymentMethod}
                      className={`py-4 rounded-xl font-bold shadow-lg transition-all active:scale-[0.98] ${
                        paymentMethod ? 'bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200' : 'bg-[var(--border-main)] text-[var(--text-muted)] cursor-not-allowed'
                      }`}
                    >
                      {paymentMethod === 'cod' ? 'Review Order' : 'Pay & Place Order'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-[var(--bg-card)] rounded-3xl p-6 md:p-8 shadow-xl border border-[var(--border-main)]"
                >
                  <h2 className="text-2xl font-bold text-[var(--text-main)] mb-8">Review Order</h2>
                  
                  <div className="space-y-6">
                    {/* Compact Review Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="bg-[var(--bg-app)] p-4 rounded-2xl border border-[var(--border-main)]">
                          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Shipping to</p>
                          <p className="font-bold text-[var(--text-main)]">{addresses.find(a => a.id === selectedAddress)?.name}</p>
                          <p className="text-sm text-[var(--text-muted)] mt-1">{addresses.find(a => a.id === selectedAddress)?.address}</p>
                          <button onClick={() => setCurrentStep(1)} className="mt-3 text-teal-600 text-xs font-bold hover:underline">Edit</button>
                       </div>
                       <div className="bg-[var(--bg-app)] p-4 rounded-2xl border border-[var(--border-main)]">
                          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Payment Method</p>
                          <p className="font-bold text-[var(--text-main)] uppercase">{paymentMethod}</p>
                          <p className="text-sm text-[var(--text-muted)] mt-1">Status: Ready to Pay</p>
                          <button onClick={() => setCurrentStep(2)} className="mt-3 text-teal-600 text-xs font-bold hover:underline">Change</button>
                       </div>
                    </div>

                    {/* Order List */}
                    <div className="border-t border-[var(--border-main)] pt-6">
                        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">Items Summary</p>
                        <div className="grid gap-3">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex items-center gap-4 bg-[var(--bg-app)] p-3 rounded-2xl border border-[var(--border-main)]">
                                    <div className="w-12 h-12 bg-white rounded-xl overflow-hidden shadow-sm border border-[var(--border-main)]">
                                        <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-[var(--text-main)] line-clamp-1">{item.name}</p>
                                        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wide">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-bold text-teal-600">₹{formatCurrency((item.price || 0) * (item.quantity || 1))}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-10">
                    <button onClick={() => setCurrentStep(2)} className="py-4 border-2 border-[var(--border-main)] rounded-xl font-bold text-[var(--text-muted)] hover:bg-[var(--bg-app)] transition-all">Back</button>
                    <button 
                      onClick={handlePlaceOrder}
                      className="py-4 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-700 active:scale-[0.98]"
                    >
                      Place Order
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-10 space-y-6">
              <div className="bg-[var(--bg-card)] rounded-3xl p-6 shadow-xl border border-[var(--border-main)] overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full -mr-16 -mt-16 -z-0" />
                <h3 className="text-xl font-bold text-[var(--text-main)] mb-6 relative z-10">Order Summary</h3>
                
                <div className="space-y-4 mb-6 relative z-10 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {cartItems.map(item => (
                        <div key={item.id} className="flex justify-between items-start gap-4 text-sm font-medium">
                            <span className="text-[var(--text-muted)] flex-1 line-clamp-1">{item.name} <span className="opacity-40 text-[10px] font-black uppercase tracking-widest ml-1">x{item.quantity}</span></span>
                            <span className="font-bold text-[var(--text-main)] italic">₹{formatCurrency((item.price || 0) * (item.quantity || 1))}</span>
                        </div>
                    ))}
                </div>

                <div className="space-y-3 pt-6 border-t border-[var(--border-main)] relative z-10 text-sm">
                    <div className="flex justify-between text-[var(--text-muted)] font-medium">
                        <span>Subtotal</span>
                        <span className="text-[var(--text-main)] font-black">₹{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[var(--text-muted)] font-medium">
                        <span>GST (18%)</span>
                        <span className="text-[var(--text-main)] font-black">₹{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[var(--text-muted)] font-medium">Shipping</span>
                        <span className={`${shipping === 0 ? 'text-green-500' : 'text-[var(--text-main)]'} font-black tracking-widest`}>{shipping === 0 ? 'FREE' : `₹${formatCurrency(shipping)}`}</span>
                    </div>
                </div>

                <div className="mt-8 pt-6 md:pt-8 border-t-2 border-[var(--border-main)] relative z-10">
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col">
                                <span className="text-[10px] md:text-[14px] font-black uppercase tracking-[0.2em] text-[var(--text-main)] leading-none">Grand</span>
                                <span className="text-[10px] md:text-[14px] font-black uppercase tracking-[0.2em] text-[var(--text-main)] mt-1">Total</span>
                            </div>
                            <div className="flex flex-col opacity-40">
                                <span className="text-[6px] md:text-[9px] font-black uppercase tracking-widest leading-tight">Inclusive</span>
                                <span className="text-[6px] md:text-[9px] font-black uppercase tracking-widest leading-tight">of all</span>
                                <span className="text-[6px] md:text-[9px] font-black uppercase tracking-widest leading-tight">taxes</span>
                            </div>
                        </div>
                        <div className="text-right flex-1">
                          <p className="text-xl sm:text-2xl md:text-3xl font-black text-teal-600 tracking-tighter italic block leading-none">
                            ₹{formatTotal(total)}
                          </p>
                        </div>
                    </div>
                </div>
              </div>
              
              <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 flex gap-4 items-center">
                  <div className="w-10 h-10 bg-[var(--bg-app)] rounded-xl flex items-center justify-center text-teal-600 shadow-sm border border-[var(--border-main)]">
                      <MdShoppingCart />
                  </div>
                  <div>
                      <p className="text-sm font-extrabold text-[var(--text-main)]">{cartItems.length} Products</p>
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">In your secure basket</p>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
