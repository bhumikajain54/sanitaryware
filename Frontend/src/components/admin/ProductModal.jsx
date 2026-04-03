import { useState, useEffect } from 'react';
import { MdClose, MdSave, MdCancel, MdKeyboardArrowDown, MdCloudUpload } from 'react-icons/md';
import adminService from '../../services/adminService';

const ProductModal = ({ product, brands = [], categories = [], onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    brand: '',
    category: '',
    image: '',
    status: 'active',
    features: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString().replace(/[^0-9.]/g, '') || '',
        stock: product.stock?.toString().replace(/[^0-9]/g, '') || '',
        brand: product.brand && typeof product.brand === 'object' ? product.brand.name : (product.brand || ''),
        category: product.category && typeof product.category === 'object' ? product.category.name : (product.category || ''),
        image: product.image || product.mainImage || '',
        status: product.status || 'active',
        features: Array.isArray(product.features) ? product.features.join(', ') : (product.features || ''),
      });
      setPreview(product.image || product.mainImage || null);
    } else {
      // Reset for new product
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        brand: brands.length > 0 ? brands[0].name : '',
        category: categories.length > 0 ? categories[0].name : '',
        image: '',
        status: 'active',
        features: '',
      });
      setPreview(null);
    }
    setImageFile(null);
  }, [product, brands, categories]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let finalImageUrl = formData.image;

      // 1. Upload new image if selected
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('file', imageFile);
        const uploadRes = await adminService.uploadMedia(uploadData);
        finalImageUrl = uploadRes.url;
      }

      // 2. Process features string into a clean string for backend
      const processedData = {
        ...formData,
        mainImage: finalImageUrl,
        description: formData.description || '',
        features: formData.features || '',
      };

      await onSave(processedData);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (checked ? 'active' : 'inactive') : value,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-all overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-[var(--admin-bg-secondary)] rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700 w-full max-w-[98%] md:max-w-4xl lg:max-w-5xl mx-auto overflow-hidden animate-fadeIn my-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-10 sm:py-6 border-b border-slate-50 dark:border-slate-700 bg-[var(--admin-bg-secondary)]">
          <div>
            <h3 className="text-sm sm:text-2xl font-black text-[#0d9488] leading-tight tracking-tight uppercase">
              {product ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p className="text-[8px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1 font-bold uppercase tracking-[0.2em] opacity-80 italic">
              {product ? 'Updating existing inventory item' : 'Create new inventory item'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 sm:p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full transition-all active:scale-95"
          >
            <MdClose className="text-xl sm:text-2xl" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            {/* Left Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* Product Name */}
              <div className="space-y-1 sm:space-y-2">
                <label className="text-[8px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 sm:px-5 py-2.5 sm:py-3.5 bg-[#f8fafc] dark:bg-slate-900/50 border-2 border-transparent focus:border-[#0d9488]/20 focus:bg-white rounded-xl outline-none transition-all dark:text-white font-bold text-[10px] sm:text-sm shadow-sm"
                  placeholder="e.g. Modern Faucet"
                />
              </div>

              {/* Image Upload Area */}
              <div className="space-y-1 sm:space-y-4">
                <label className="text-[8px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Product Image</label>
                
                <div className="relative group cursor-pointer border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-6 bg-slate-50/50 hover:bg-white transition-all overflow-hidden flex flex-col items-center justify-center min-h-[120px] sm:min-h-[160px]">
                   <input 
                      type="file" 
                      onChange={handleFileChange}
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                   />
                   
                   {preview ? (
                     <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-inner bg-white">
                        <img 
                          src={preview} 
                          alt="Preview" 
                          className="w-full h-full object-contain"
                          onError={(e) => { e.target.src = '/Logo2.png'; }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <p className="text-white font-black text-[8px] sm:text-xs uppercase tracking-widest">Replace Photo</p>
                        </div>
                     </div>
                   ) : (
                     <div className="text-center">
                        <MdCloudUpload className="mx-auto text-3xl sm:text-5xl text-slate-300 group-hover:text-teal-500 transition-colors mb-2 sm:mb-4" />
                        <p className="text-[8px] sm:text-xs font-black text-slate-400 uppercase tracking-tighter">Click to upload product image</p>
                        <p className="text-[6px] sm:text-[9px] text-slate-300 mt-1">Recommended: Square format, PNG/JPG</p>
                     </div>
                   )}
                </div>
                
                {isUploading && (
                   <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                      <div className="bg-teal-500 h-full animate-pulse w-full"></div>
                   </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1 sm:space-y-2">
                <label className="text-[8px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-[#f8fafc] dark:bg-slate-900/50 border-2 border-transparent focus:border-[#0d9488]/20 focus:bg-white rounded-xl sm:rounded-2xl outline-none transition-all dark:text-white font-bold text-[10px] sm:text-sm shadow-sm resize-none min-h-[100px] sm:min-h-[120px]"
                  placeholder="Detailed overview..."
                />
              </div>

              {/* Features */}
              <div className="space-y-1 sm:space-y-2">
                <label className="text-[8px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Features (comma separated)</label>
                <input
                  type="text"
                  name="features"
                  value={formData.features}
                  onChange={handleChange}
                  className="w-full px-4 sm:px-5 py-2.5 sm:py-3.5 bg-[#f8fafc] dark:bg-slate-900/50 border-2 border-transparent focus:border-[#0d9488]/20 focus:bg-white rounded-xl outline-none transition-all dark:text-white font-bold text-[10px] sm:text-sm shadow-sm"
                  placeholder="Durable, Eco-friendly, Smart flow"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-[8px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Price (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xs sm:text-sm">₹</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      step="0.01"
                      className="w-full pl-8 pr-4 py-2.5 sm:py-3.5 bg-[#f8fafc] dark:bg-slate-900/50 border-2 border-transparent focus:border-[#0d9488]/20 focus:bg-white rounded-xl outline-none transition-all dark:text-white font-bold text-[10px] sm:text-sm shadow-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Stock */}
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-[8px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Initial Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    className="w-full px-4 sm:px-5 py-2.5 sm:py-3.5 bg-[#f8fafc] dark:bg-slate-900/50 border-2 border-transparent focus:border-[#0d9488]/20 focus:bg-white rounded-xl outline-none transition-all dark:text-white font-bold text-[10px] sm:text-sm shadow-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Brand */}
              <div className="space-y-1 sm:space-y-2">
                <label className="text-[8px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Product Brand</label>
                <div className="relative">
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                    className="w-full px-4 sm:px-5 py-2.5 sm:py-3.5 bg-[#f8fafc] dark:bg-slate-900/50 border-2 border-transparent focus:border-[#0d9488]/20 focus:bg-white rounded-xl outline-none transition-all dark:text-white font-bold text-[10px] sm:text-sm appearance-none shadow-sm cursor-pointer"
                  >
                    <option value="">Select Brand</option>
                    {brands.map((b) => (
                      <option key={b.id || b.name} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <MdKeyboardArrowDown size={20} />
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1 sm:space-y-2">
                <label className="text-[8px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Product Category</label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 sm:px-5 py-2.5 sm:py-3.5 bg-[#f8fafc] dark:bg-slate-900/50 border-2 border-transparent focus:border-[#0d9488]/20 focus:bg-white rounded-xl outline-none transition-all dark:text-white font-bold text-[10px] sm:text-sm appearance-none shadow-sm cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <MdKeyboardArrowDown size={20} />
                  </div>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-4 bg-[#f8fafc] dark:bg-slate-900/50 rounded-xl border-2 border-transparent">
                <div>
                  <label className="text-[8px] sm:text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 block mb-1">Product Status</label>
                  <p className="text-[7px] sm:text-[10px] text-slate-400 font-bold uppercase italic">Toggle visibility on client side</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="status"
                    checked={formData.status === 'active'} 
                    onChange={handleChange}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
                  <span className="ml-3 text-[9px] sm:text-xs font-black uppercase tracking-widest text-teal-600">
                    {formData.status === 'active' ? 'Active' : 'Draft'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-row items-center gap-3 sm:gap-6 mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 sm:py-4 border-2 border-slate-200 dark:border-slate-700 text-slate-500 font-black rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest text-[9px] sm:text-xs flex items-center justify-center gap-2"
            >
              <MdCancel size={20} />
              Discard
            </button>
              <button
                type="submit"
                disabled={isUploading}
                className="flex-1 py-3 sm:py-4 bg-teal-600 text-white font-black rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 uppercase tracking-widest text-[9px] sm:text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <MdSave size={20} />
                {isUploading ? 'Uploading...' : (product ? 'Update Changes' : 'Save Product')}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
