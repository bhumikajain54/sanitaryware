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

/* ─── Input field helper ─── */
const Field = ({ label, children }) => (
  <div className="space-y-1 sm:space-y-1.5">
    <label className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1 block">
      {label}
    </label>
    {children}
  </div>
);

const inputCls = "w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-3.5 bg-[var(--bg-app)] border-2 border-[var(--border-main)] rounded-lg sm:rounded-xl focus:bg-[var(--bg-card)] focus:border-teal-500 outline-none transition-all font-bold text-xs sm:text-sm text-[var(--text-main)] placeholder-[var(--text-muted)]";

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
    type: 'Home', fullName: '', phone: '',
    streetAddress: '', city: '', state: '', zipCode: '',
    country: 'India', isDefault: false
  });

  const set = (key, val) => setAddressFormData(prev => ({ ...prev, [key]: val }));

  const handleAddressAction = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        fullName: addressFormData.fullName,
        phone: addressFormData.phone,
        streetAddress: addressFormData.streetAddress,
        city: addressFormData.city,
        state: addressFormData.state,
        zipCode: addressFormData.zipCode,
        country: addressFormData.country,
        isDefault: addressFormData.isDefault,
        full_name: addressFormData.fullName,
        street_address: addressFormData.streetAddress,
        zip_code: addressFormData.zipCode,
        is_default: addressFormData.isDefault
      };
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
      console.error('Address Action Error:', err);
      toast.error('Failed to save address. Please check database constraints.');
    }
  };

  const resetAddressForm = () => {
    setAddressFormData({
      type: 'Home', fullName: user?.name || '', phone: user?.phone || '',
      streetAddress: '', city: '', state: '', zipCode: '',
      country: 'India', isDefault: false
    });
  };

  const handleEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressFormData({
      ...addr,
      fullName: addr.fullName || addr.full_name || addr.name || '',
      streetAddress: addr.streetAddress || addr.street_address || addr.address || '',
      zipCode: addr.zipCode || addr.zip_code || addr.pincode || '',
      isDefault: addr.isDefault || addr.is_default || false,
      country: addr.country || 'India'
    });
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
    <div className="min-h-screen bg-[var(--bg-app)] py-4 sm:py-6 md:py-10 lg:py-16 px-3 sm:px-5 md:px-6 lg:px-8 font-inter overflow-x-hidden">
      <div className="max-w-6xl mx-auto">

        {/* ─── Header ─── */}
        <div className="mb-5 sm:mb-7 md:mb-10 flex items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-black text-[var(--text-main)] mb-0.5 sm:mb-1 md:mb-3 tracking-tighter truncate"
              style={{ fontFamily: 'Playfair Display, serif' }}>
              My Addresses
            </h1>
            <p className="text-[10px] sm:text-xs md:text-sm lg:text-lg text-[var(--text-muted)] font-medium leading-snug">
              Manage your shipping and billing locations.
            </p>
          </div>
          <button
            onClick={() => { resetAddressForm(); setShowAddressForm(true); }}
            className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 bg-teal-600 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all active:scale-95"
          >
            <MdAdd className="text-sm sm:text-base md:text-xl flex-shrink-0" />
            <span>Add New</span>
          </button>
        </div>

        {/* ─── Address Cards Grid ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          {addresses.map((addr) => (
            <motion.div
              key={addr.id}
              layout
              className="bg-[var(--bg-card)] p-4 sm:p-5 md:p-6 lg:p-8 rounded-2xl md:rounded-[2.5rem] border-2 border-[var(--border-main)] shadow-md hover:border-teal-500 hover:shadow-xl transition-all duration-300 relative group overflow-hidden"
            >
              {/* Default badge ribbon */}
              {addr.isDefault && (
                <div className="absolute top-0 right-0 overflow-hidden w-14 sm:w-16 md:w-20 h-14 sm:h-16 md:h-20">
                  <div className="bg-teal-600 text-white text-[6px] sm:text-[7px] md:text-[8px] font-black uppercase tracking-widest absolute top-3 sm:top-3.5 -right-4 sm:-right-5 rotate-45 px-6 sm:px-7 md:px-8 py-0.5 shadow-sm whitespace-nowrap">
                    Primary
                  </div>
                </div>
              )}

              {/* Card top: icon + actions */}
              <div className="flex justify-between items-start mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-[var(--bg-app)] rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center text-teal-600 group-hover:bg-teal-500/10 transition-colors flex-shrink-0">
                  <MdLocationOn className="text-base sm:text-lg md:text-xl lg:text-2xl" />
                </div>
                <div className="flex gap-1 sm:gap-1.5 md:gap-2">
                  <button
                    onClick={() => handleEditAddress(addr)}
                    className="p-1.5 sm:p-2 md:p-2.5 lg:p-3 text-teal-600 hover:bg-teal-500/10 rounded-lg md:rounded-xl transition-all"
                  >
                    <MdEdit className="text-sm sm:text-base md:text-[16px] lg:text-[18px]" />
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="p-1.5 sm:p-2 md:p-2.5 lg:p-3 text-red-500 hover:bg-red-500/10 rounded-lg md:rounded-xl transition-all"
                  >
                    <MdDelete className="text-sm sm:text-base md:text-[16px] lg:text-[18px]" />
                  </button>
                </div>
              </div>

              {/* Address info */}
              <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
                <div className="mb-2 sm:mb-2.5 md:mb-3 lg:mb-4">
                  <span className="text-[9px] sm:text-[10px] font-black text-teal-600 uppercase tracking-widest bg-teal-500/10 px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full">
                    {addr.type}
                  </span>
                </div>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-[var(--text-main)] leading-tight"
                  style={{ fontFamily: 'Playfair Display, serif' }}>
                  {addr.fullName || addr.full_name || addr.name}
                </p>
                <p className="text-[var(--text-muted)] text-[10px] sm:text-xs md:text-sm font-medium leading-snug">
                  {addr.streetAddress || addr.street_address || addr.address}, {addr.city}
                </p>
                <p className="text-[var(--text-muted)] text-[10px] sm:text-xs md:text-sm font-medium">
                  {addr.state}, {addr.country || 'India'} — {addr.zipCode || addr.zip_code || addr.pincode}
                </p>
                <div className="pt-2 sm:pt-3 md:pt-4 lg:pt-6 mt-2 sm:mt-3 md:mt-4 lg:mt-6 border-t border-[var(--border-main)] flex items-center gap-1.5 sm:gap-2 text-teal-600">
                  <MdPhone className="text-xs sm:text-sm md:text-[14px] flex-shrink-0" />
                  <span className="text-[9px] sm:text-[10px] md:text-xs font-black tracking-widest">{addr.phone}</span>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Add new card */}
          <div
            onClick={() => { resetAddressForm(); setShowAddressForm(true); }}
            className="border-2 border-dashed border-[var(--border-main)] rounded-2xl md:rounded-[2.5rem] p-5 sm:p-6 md:p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-teal-500 hover:bg-teal-500/10 transition-all min-h-[140px] sm:min-h-[180px] md:min-h-[220px] lg:min-h-[250px]"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-[var(--bg-app)] rounded-full flex items-center justify-center text-[var(--text-muted)] group-hover:text-teal-500 group-hover:bg-[var(--bg-card)] transition-all mb-2 sm:mb-3 md:mb-4">
              <MdAdd className="text-xl sm:text-2xl md:text-3xl" />
            </div>
            <p className="text-[9px] sm:text-[10px] md:text-xs font-black text-[var(--text-muted)] uppercase tracking-widest group-hover:text-teal-600 transition-colors">
              Add New Address
            </p>
          </div>
        </div>
      </div>

      {/* ─── Address Form Modal ─── */}
      <AnimatePresence>
        {showAddressForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddressForm(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[var(--bg-card)] w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl rounded-2xl md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-[var(--border-main)] my-auto"
            >
              {/* Modal header */}
              <div className="bg-gradient-to-r from-teal-600 to-cyan-700 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 md:py-8 text-white">
                <div className="flex justify-between items-center gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg md:text-2xl font-black mb-0.5 sm:mb-1 truncate">
                      {editingAddressId ? 'Update Address' : 'New Address'}
                    </h2>
                    <p className="text-teal-100 text-[8px] sm:text-[9px] md:text-xs font-medium uppercase tracking-[0.2em]">
                      Delivery Location
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddressForm(false)}
                    className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white/10 rounded-lg md:rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
                  >
                    <MdClose className="text-base sm:text-lg" />
                  </button>
                </div>
              </div>

              {/* Modal form */}
              <form onSubmit={handleAddressAction} className="px-4 sm:px-5 md:px-8 py-4 sm:py-5 md:py-6 lg:py-8 space-y-3 sm:space-y-4 md:space-y-5 max-h-[70vh] sm:max-h-[75vh] overflow-y-auto">

                {/* Label + Full Name */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <Field label="Label (e.g. Home)">
                    <input
                      type="text" required
                      value={addressFormData.type}
                      onChange={(e) => set('type', e.target.value)}
                      placeholder="Home / Office"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Full Name">
                    <input
                      type="text" required
                      value={addressFormData.fullName}
                      onChange={(e) => set('fullName', e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>

                {/* Phone + Country */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <Field label="Phone Number">
                    <input
                      type="tel" required
                      value={addressFormData.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Country">
                    <input
                      type="text" required
                      value={addressFormData.country}
                      onChange={(e) => set('country', e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>

                {/* Street Address */}
                <Field label="Street Address">
                  <textarea
                    required rows={2}
                    value={addressFormData.streetAddress}
                    onChange={(e) => set('streetAddress', e.target.value)}
                    className={`${inputCls} resize-none`}
                  />
                </Field>

                {/* City / State / Zip — 3 columns on sm+, stacked on xs */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                  <Field label="City">
                    <input
                      type="text" placeholder="City" required
                      value={addressFormData.city}
                      onChange={(e) => set('city', e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="State">
                    <input
                      type="text" placeholder="State" required
                      value={addressFormData.state}
                      onChange={(e) => set('state', e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Zip Code">
                    <input
                      type="text" placeholder="Zip" required
                      value={addressFormData.zipCode}
                      onChange={(e) => set('zipCode', e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>

                {/* Default checkbox */}
                <div className="pt-1 sm:pt-2">
                  <label className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group w-fit">
                    <input
                      type="checkbox"
                      checked={addressFormData.isDefault}
                      onChange={(e) => set('isDefault', e.target.checked)}
                      className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 border-2 border-[var(--border-main)] rounded-lg checked:bg-teal-600 accent-teal-600 cursor-pointer flex-shrink-0"
                    />
                    <span className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest group-hover:text-teal-600 transition-colors">
                      Set as Default Address
                    </span>
                  </label>
                </div>

                {/* Actions */}
                <div className="pt-3 sm:pt-4 md:pt-5 lg:pt-6 flex gap-2.5 sm:gap-3 md:gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="flex-1 py-2.5 sm:py-3 md:py-4 text-[var(--text-muted)] font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:text-[var(--text-main)] transition-all border-2 border-transparent hover:border-[var(--border-main)] rounded-xl md:rounded-2xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-teal-600 text-white py-2.5 sm:py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] shadow-xl shadow-teal-500/20 hover:bg-teal-700 active:scale-[0.98] transition-all"
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