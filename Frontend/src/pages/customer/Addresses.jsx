import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdLocationOn, 
  MdEdit, 
  MdDelete, 
  MdAdd, 
  MdClose, 
  MdPhone
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import customerService from '../../services/customerService';

const Addresses = () => {
  const { user } = useAuth();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAddresses = async () => {
        try {
            const data = await customerService.getAddresses();
            setAddresses(data || []);
        } catch (err) {
            console.error('Failed to fetch addresses:', err);
        } finally {
            setLoading(false);
        }
    };
    fetchAddresses();
  }, []);

  const [addressFormData, setAddressFormData] = useState({
    type: 'Home',
    fullName: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false
  });

  const handleAddressAction = async (e) => {
    e.preventDefault();
    try {
      // The backend error reveals it expects these specific keys:
      // fullName, isDefault, streetAddress, zipCode, city, state, country, phone
      // Note: user_id is handled by the server from your session.
      const payload = {
        fullName: addressFormData.fullName,
        phone: addressFormData.phone,
        streetAddress: addressFormData.streetAddress,
        city: addressFormData.city,
        state: addressFormData.state,
        zipCode: addressFormData.zipCode,
        country: addressFormData.country,
        isDefault: addressFormData.isDefault,
        // We also include snake_case versions as fallbacks for the DB constraints
        full_name: addressFormData.fullName,
        street_address: addressFormData.streetAddress,
        zip_code: addressFormData.zipCode,
        is_default: addressFormData.isDefault
      };

      console.log('🚀 Attempting Address Action with payload:', payload);

      if (editingAddressId) {
        await customerService.updateAddress(editingAddressId, payload);
        toast.success('Address updated successfully');
      } else {
        await customerService.createAddress(payload);
        toast.success('Address added successfully');
      }
      
      const data = await customerService.getAddresses();
      setAddresses(data || []);
      setShowAddressForm(false);
      setEditingAddressId(null);
      resetAddressForm();
    } catch (err) {
      console.error('❌ Address Action Error:', err);
      // If you see "Field 'is_default' doesn't have a default value", 
      // it means your database 'addresses' table has redundant columns.
      // One column is 'isDefault' (which the backend fills) and another is 'is_default' (which is empty).
      toast.error('Failed to save address. Please check database constraints.');
    }
  };

  const resetAddressForm = () => {
    setAddressFormData({
      type: 'Home',
      fullName: user?.name || '',
      phone: user?.phone || '',
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      isDefault: false
    });
  };

  const handleEditAddress = (addr) => {
    // Normalize data from backend which might use snake_case
    const normalizedAddr = {
      ...addr,
      fullName: addr.fullName || addr.full_name || addr.name || '',
      streetAddress: addr.streetAddress || addr.street_address || addr.address || '',
      zipCode: addr.zipCode || addr.zip_code || addr.pincode || '',
      isDefault: addr.isDefault || addr.is_default || false,
      country: addr.country || 'India'
    };
    
    setEditingAddressId(addr.id);
    setAddressFormData(normalizedAddr);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await customerService.deleteAddress(id);
        toast.success('Address deleted');
        const data = await customerService.getAddresses();
        setAddresses(data || []);
      } catch (err) {
        toast.error('Failed to delete address');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] py-4 md:py-16 px-2 md:px-8 font-inter overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 md:mb-10 flex flex-row items-end justify-between gap-3 md:gap-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg md:text-5xl font-black text-[var(--text-main)] mb-0.5 md:mb-3 tracking-tighter" style={{ fontFamily: 'Playfair Display, serif' }}>
              My Addresses
            </h1>
            <p className="text-[9px] md:text-lg text-[var(--text-muted)] font-medium leading-none">Manage your shipping and billing locations.</p>
          </div>
          <button 
            onClick={() => { resetAddressForm(); setShowAddressForm(true); }}
            className="flex items-center gap-1 md:gap-2 bg-teal-600 text-white px-2 md:px-6 py-1.5 md:py-4 rounded-lg md:rounded-2xl font-black uppercase tracking-tight md:tracking-widest text-[7px] md:text-[10px] hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all active:scale-95 flex-shrink-0"
          >
            <MdAdd className="text-[10px] md:text-xl" /> <span className="hidden sm:inline">Add New</span><span className="sm:hidden">ADD</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <motion.div 
              key={addr.id}
              layout
              className="bg-[var(--bg-card)] p-4 md:p-8 rounded-xl md:rounded-[2.5rem] border-2 border-[var(--border-main)] shadow-md hover:border-teal-500 hover:shadow-xl transition-all duration-300 relative group overflow-hidden"
            >
              {addr.isDefault && (
                <div className="absolute top-0 right-0">
                  <div className="bg-teal-600 text-white text-[5px] md:text-[8px] font-black uppercase tracking-widest px-4 md:px-8 py-0.5 md:py-1 rotate-45 translate-x-1.5 md:translate-x-3 translate-y-1 md:translate-y-2 shadow-sm whitespace-nowrap">
                    Primary
                  </div>
                </div>
              )}

              <div className="flex justify-between items-start mb-4 md:mb-6">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-[var(--bg-app)] rounded-lg md:rounded-2xl flex items-center justify-center text-teal-600 group-hover:bg-teal-500/10 transition-colors">
                  <MdLocationOn className="text-sm md:text-2xl" />
                </div>
                <div className="flex gap-1 md:gap-2">
                  <button 
                    onClick={() => handleEditAddress(addr)}
                    className="p-1.5 md:p-3 text-teal-600 hover:bg-teal-500/10 rounded-lg md:rounded-xl transition-all"
                  >
                    <MdEdit className="text-[10px] md:text-[18px]" />
                  </button>
                  <button 
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="p-1.5 md:p-3 text-red-500 hover:bg-red-500/10 rounded-lg md:rounded-xl transition-all"
                  >
                    <MdDelete className="text-[10px] md:text-[18px]" />
                  </button>
                </div>
              </div>

              <div className="space-y-1 md:space-y-2">
                <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-4">
                  <span className="text-[6px] md:text-[10px] font-black text-teal-600 uppercase tracking-widest bg-teal-500/10 px-1.5 md:px-3 py-0.5 md:py-1 rounded-full">{addr.type}</span>
                </div>
                <p className="text-[10px] md:text-xl font-black text-[var(--text-main)] leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {addr.fullName || addr.full_name || addr.name}
                </p>
                <p className="text-[var(--text-muted)] text-[8px] md:text-sm font-medium leading-tight">
                  {addr.streetAddress || addr.street_address || addr.address}, {addr.city}
                </p>
                <p className="text-[var(--text-muted)] text-[8px] md:text-sm font-medium">
                  {addr.state}, {addr.country || 'India'} - {addr.zipCode || addr.zip_code || addr.pincode}
                </p>
                
                <div className="pt-2 md:pt-6 mt-2 md:mt-6 border-t border-[var(--border-main)] flex items-center gap-1 md:gap-2 text-teal-600">
                  <MdPhone className="text-[8px] md:text-[14px]" />
                  <span className="text-[7px] md:text-xs font-black tracking-widest">{addr.phone}</span>
                </div>
              </div>
            </motion.div>
          ))}
          
          <div 
            onClick={() => { resetAddressForm(); setShowAddressForm(true); }}
            className="border-2 border-dashed border-[var(--border-main)] rounded-xl md:rounded-[2.5rem] p-4 md:p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-teal-500 hover:bg-teal-500/10 transition-all min-h-[150px] md:min-h-[250px]"
          >
            <div className="w-8 h-8 md:w-16 md:h-16 bg-[var(--bg-app)] rounded-full flex items-center justify-center text-[var(--text-muted)] group-hover:text-teal-500 group-hover:bg-[var(--bg-card)] transition-all mb-2 md:mb-4">
              <MdAdd className="text-xl md:text-3xl" />
            </div>
            <p className="text-[6px] md:text-xs font-black text-[var(--text-muted)] uppercase tracking-tighter md:tracking-widest group-hover:text-teal-600">Add New Address</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddressForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddressForm(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[var(--bg-card)] w-full max-w-xl rounded-2xl md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-[var(--border-main)] my-auto"
            >
              <div className="bg-gradient-to-r from-teal-600 to-cyan-700 p-5 md:p-8 text-white">
                <div className="flex justify-between items-center md:items-start">
                  <div>
                    <h2 className="text-lg md:text-2xl font-black mb-0.5 md:mb-1">{editingAddressId ? 'Update Address' : 'New Address'}</h2>
                    <p className="text-teal-100 text-[8px] md:text-xs font-medium uppercase tracking-[0.2em]">Delivery Location</p>
                  </div>
                  <button 
                    onClick={() => setShowAddressForm(false)}
                    className="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-lg md:rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
                  >
                    <MdClose size={18} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddressAction} className="p-5 md:p-8 space-y-4 md:space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 md:space-y-1.5">
                    <label className="text-[8px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Label (e.g. Home)</label>
                    <input 
                      type="text" 
                      required
                      value={addressFormData.type}
                      onChange={(e) => setAddressFormData({...addressFormData, type: e.target.value})}
                      className="w-full px-4 md:px-5 py-2.5 md:py-3.5 bg-[var(--bg-app)] border-2 border-[var(--border-main)] rounded-lg md:rounded-xl focus:bg-[var(--bg-card)] focus:border-teal-500 outline-none transition-all font-bold text-xs md:text-sm text-[var(--text-main)] placeholder-[var(--text-muted)]"
                      placeholder="Home / Office"
                    />
                  </div>
                  <div className="space-y-1 md:space-y-1.5">
                    <label className="text-[8px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={addressFormData.fullName}
                      onChange={(e) => setAddressFormData({...addressFormData, fullName: e.target.value})}
                      className="w-full px-4 md:px-5 py-2.5 md:py-3.5 bg-[var(--bg-app)] border-2 border-[var(--border-main)] rounded-lg md:rounded-xl focus:bg-[var(--bg-card)] focus:border-teal-500 outline-none transition-all font-bold text-xs md:text-sm text-[var(--text-main)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 md:space-y-1.5">
                    <label className="text-[8px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      value={addressFormData.phone}
                      onChange={(e) => setAddressFormData({...addressFormData, phone: e.target.value})}
                      className="w-full px-4 md:px-5 py-2.5 md:py-3.5 bg-[var(--bg-app)] border-2 border-[var(--border-main)] rounded-lg md:rounded-xl focus:bg-[var(--bg-card)] focus:border-teal-500 outline-none transition-all font-bold text-xs md:text-sm text-[var(--text-main)]"
                    />
                  </div>
                  <div className="space-y-1 md:space-y-1.5">
                    <label className="text-[8px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Country</label>
                    <input 
                      type="text" 
                      required
                      value={addressFormData.country}
                      onChange={(e) => setAddressFormData({...addressFormData, country: e.target.value})}
                      className="w-full px-4 md:px-5 py-2.5 md:py-3.5 bg-[var(--bg-app)] border-2 border-[var(--border-main)] rounded-lg md:rounded-xl focus:bg-[var(--bg-card)] focus:border-teal-500 outline-none transition-all font-bold text-xs md:text-sm text-[var(--text-main)]"
                    />
                  </div>
                </div>

                <div className="space-y-1 md:space-y-1.5">
                  <label className="text-[8px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Street Address</label>
                  <textarea 
                    required
                    rows="2"
                    value={addressFormData.streetAddress}
                    onChange={(e) => setAddressFormData({...addressFormData, streetAddress: e.target.value})}
                    className="w-full px-4 md:px-5 py-2.5 md:py-3.5 bg-[var(--bg-app)] border-2 border-[var(--border-main)] rounded-lg md:rounded-xl focus:bg-[var(--bg-card)] focus:border-teal-500 outline-none transition-all font-bold text-xs md:text-sm text-[var(--text-main)] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1 md:space-y-1.5">
                    <label className="md:hidden text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">City</label>
                    <input 
                      type="text" 
                      placeholder="City" 
                      required
                      value={addressFormData.city}
                      onChange={(e) => setAddressFormData({...addressFormData, city: e.target.value})}
                      className="w-full px-4 md:px-5 py-2.5 md:py-3.5 bg-[var(--bg-app)] border-2 border-[var(--border-main)] rounded-lg md:rounded-xl focus:bg-[var(--bg-card)] focus:border-teal-500 outline-none transition-all font-bold text-xs md:text-sm text-[var(--text-main)]"
                    />
                  </div>
                  <div className="space-y-1 md:space-y-1.5">
                    <label className="md:hidden text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">State</label>
                    <input 
                      type="text" 
                      placeholder="State" 
                      required
                      value={addressFormData.state}
                      onChange={(e) => setAddressFormData({...addressFormData, state: e.target.value})}
                      className="w-full px-4 md:px-5 py-2.5 md:py-3.5 bg-[var(--bg-app)] border-2 border-[var(--border-main)] rounded-lg md:rounded-xl focus:bg-[var(--bg-card)] focus:border-teal-500 outline-none transition-all font-bold text-xs md:text-sm text-[var(--text-main)]"
                    />
                  </div>
                  <div className="space-y-1 md:space-y-1.5">
                    <label className="md:hidden text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Zip Code</label>
                    <input 
                      type="text" 
                      placeholder="Zip" 
                      required
                      value={addressFormData.zipCode}
                      onChange={(e) => setAddressFormData({...addressFormData, zipCode: e.target.value})}
                      className="w-full px-4 md:px-5 py-2.5 md:py-3.5 bg-[var(--bg-app)] border-2 border-[var(--border-main)] rounded-lg md:rounded-xl focus:bg-[var(--bg-card)] focus:border-teal-500 outline-none transition-all font-bold text-xs md:text-sm text-[var(--text-main)]"
                    />
                  </div>
                </div>

                <div className="pt-1 md:pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={addressFormData.isDefault}
                      onChange={(e) => setAddressFormData({...addressFormData, isDefault: e.target.checked})}
                      className="w-5 h-5 md:w-6 md:h-6 border-2 border-[var(--border-main)] rounded-lg checked:bg-teal-600 accent-teal-600 cursor-pointer"
                    />
                    <span className="text-[8px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest group-hover:text-teal-600 transition-colors">Set as Default Address</span>
                  </label>
                </div>

                <div className="pt-4 md:pt-6 flex gap-3 md:gap-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="flex-1 py-3 md:py-4 text-[var(--text-muted)] font-black uppercase tracking-widest text-[8px] md:text-[10px] hover:text-[var(--text-main)] transition-all border-2 border-transparent hover:border-[var(--border-main)] rounded-xl md:rounded-2xl"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] bg-teal-600 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-[10px] shadow-xl shadow-teal-500/20 hover:bg-teal-700 active:scale-[0.98] transition-all"
                  >
                    {editingAddressId ? 'Update & Save' : 'Save Address'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Addresses;
