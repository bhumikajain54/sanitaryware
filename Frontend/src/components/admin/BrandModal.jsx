import { useState, useEffect } from 'react';
import { MdClose, MdBusiness, MdDescription, MdLanguage, MdImage, MdCloudUpload } from 'react-icons/md';
import adminService from '../../services/adminService';
import { toast } from 'react-hot-toast';

const BrandModal = ({ brand, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    logo: '',
    status: 'active',
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || '',
        description: brand.description || '',
        website: brand.website || '',
        logo: brand.logo || '',
        status: brand.status || 'active',
      });
    }
  }, [brand]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      setUploading(true);
      const response = await adminService.uploadMedia(uploadData);
      
      // Assuming the backend returns the URL in response.url or response.path
      const imageUrl = response.url || response.path || response;
      
      setFormData(prev => ({ ...prev, logo: imageUrl }));
      toast.success('Logo uploaded successfully');
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-md transition-all">
      <div className="bg-[var(--admin-bg-secondary)] rounded-3xl sm:rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 max-w-lg w-full mx-auto overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 sm:px-8 sm:py-5 border-b border-slate-50 dark:border-slate-700">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-12 sm:h-12 bg-[#f0fdfa] dark:bg-teal-900/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-[#0d9488] shadow-sm border border-[#ccfbf1] dark:border-teal-800/50">
              <MdBusiness className="text-lg sm:text-2xl" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0d9488] leading-tight tracking-tight uppercase">
                {brand ? 'Edit Brand' : 'Add New Brand'}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5 opacity-80">
                {brand ? 'UPDATE MANUFACTURER DETAILS' : 'REGISTER A NEW OFFICIAL PARTNER'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 sm:p-2 hover:bg-[var(--admin-bg-primary)] rounded-lg sm:rounded-xl text-slate-300 hover:text-slate-500 transition-all"
          >
            <MdClose className="text-lg sm:text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 sm:px-10 sm:py-8 space-y-4 sm:space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Brand Name */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] text-[#0d9488]/70 flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
              <MdBusiness className="text-sm sm:text-base" /> BRAND NAME
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-[#f8fafc] dark:bg-slate-900/50 border-2 border-transparent focus:border-[#0d9488]/20 focus:bg-white rounded-xl sm:rounded-2xl outline-none transition-all dark:text-white font-bold tracking-tight text-xs sm:text-sm placeholder:text-slate-300"
              placeholder="e.g., Jaquar, Kohler"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Logo URL */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] text-[#0d9488]/70 flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
              <MdImage className="text-sm sm:text-base" /> BRAND LOGO
            </label>
            
            <div className="space-y-4">
              {/* File Upload Area */}
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="logo-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="logo-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 px-4 transition bg-[#f8fafc] dark:bg-slate-900/50 border-2 border-dashed rounded-2xl cursor-pointer hover:bg-white dark:hover:bg-slate-900/80 border-slate-200 dark:border-slate-700 hover:border-[#0d9488]/30 group ${uploading ? 'opacity-50 cursor-wait' : ''}`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploading ? (
                      <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    ) : (
                      <MdCloudUpload className="w-8 h-8 mb-2 text-slate-400 group-hover:text-teal-500 transition-colors" />
                    )}
                    <p className="mb-1 text-xs sm:text-sm text-slate-500">
                      <span className="font-black text-teal-600 uppercase tracking-widest">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                  </div>
                </label>
              </div>

              {/* URL Input (Optional) */}
              <div className="flex gap-3 sm:gap-4 items-center">
                <div className="flex-1">
                  <div className="relative">
                    <MdLanguage className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      className="w-full pl-11 pr-4 py-3 bg-[#f8fafc] dark:bg-slate-900/50 border-2 border-transparent focus:border-[#0d9488]/20 focus:bg-white rounded-xl outline-none transition-all dark:text-white font-bold text-[11px] placeholder:text-slate-300"
                      placeholder="Or enter logo URL manually..."
                      value={formData.logo}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    />
                  </div>
                </div>
                {formData.logo && (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 border-[#f1f5f9] dark:border-slate-700 bg-white flex items-center justify-center p-1.5 shadow-sm overflow-hidden bg-white">
                    <img src={formData.logo} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] text-[#0d9488]/70 flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
              <MdDescription className="text-sm sm:text-base" /> DESCRIPTION
            </label>
            <textarea
              className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-[#f8fafc] dark:bg-slate-900/50 border-2 border-transparent focus:border-[#0d9488]/20 focus:bg-white rounded-xl sm:rounded-2xl outline-none transition-all dark:text-white font-bold tracking-tight text-xs sm:text-sm placeholder:text-slate-300 min-h-[100px] sm:min-h-[120px] resize-none"
              placeholder="Brief overview of the brand and its products..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Website */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] text-[#0d9488]/70 flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
              <MdLanguage className="text-sm sm:text-base" /> BRAND WEBSITE
            </label>
            <input
              type="url"
              className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-[#f8fafc] dark:bg-slate-900/50 border-2 border-transparent focus:border-[#0d9488]/20 focus:bg-white rounded-xl sm:rounded-2xl outline-none transition-all dark:text-white font-bold tracking-tight text-xs sm:text-sm placeholder:text-slate-300"
              placeholder="https://examplebrand.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>

          {/* Status Select */}
          <div className="space-y-3 sm:space-y-4">
            <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
              STATUS
            </label>
            <div className="flex gap-6 sm:gap-10">
               <label className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="radio" 
                      name="status" 
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="peer w-5 h-5 sm:w-6 sm:h-6 opacity-0 absolute cursor-pointer"
                    />
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-[var(--border-main)] peer-checked:border-[#0d9488] peer-checked:bg-[#0d9488] transition-all flex items-center justify-center">
                      <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                    </div>
                  </div>
                  <span className="text-[11px] sm:text-sm font-black uppercase tracking-widest text-[var(--admin-text-secondary)] group-hover:text-[#0d9488] transition-colors">ACTIVE</span>
               </label>
               <label className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="radio" 
                      name="status" 
                      value="inactive"
                      checked={formData.status === 'inactive'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="peer w-5 h-5 sm:w-6 sm:h-6 opacity-0 absolute cursor-pointer"
                    />
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-[var(--border-main)] peer-checked:border-slate-300 transition-all flex items-center justify-center">
                      <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-slate-200 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                    </div>
                  </div>
                  <span className="text-[11px] sm:text-sm font-black uppercase tracking-widest text-[var(--admin-text-secondary)] group-hover:text-slate-400 transition-colors">INACTIVE</span>
               </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-slate-100 dark:border-slate-700 mt-2 sm:mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 sm:py-4 px-4 sm:px-6 border-2 border-[#f1f5f9] dark:border-slate-700 text-slate-500 font-extrabold rounded-xl sm:rounded-2xl hover:bg-[var(--admin-bg-primary)] transition-all uppercase tracking-[0.2em] text-[11px] sm:text-[13px]"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-[#0d9488] text-white font-extrabold rounded-xl sm:rounded-2xl hover:bg-[#09796f] transition-all shadow-xl shadow-teal-500/10 active:scale-95 uppercase tracking-[0.2em] text-[11px] sm:text-[13px]"
            >
              {brand ? 'UPDATE' : 'ADD BRAND'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandModal;
