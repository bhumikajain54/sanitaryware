import { useState, useRef, useEffect } from 'react';
import {
  MdClose,
  MdBusiness,
  MdLanguage,
  MdDescription,
  MdCloudUpload,
  MdImage,
  MdCheckCircle,
  MdDelete
} from 'react-icons/md';
import SafeImage from '../common/SafeImage';

const BrandModal = ({ brand, onClose, onSave }) => {
  const [name, setName] = useState(brand?.name || '');
  const [description, setDescription] = useState(brand?.description || '');
  const [website, setWebsite] = useState(brand?.website || '');
  const [logoFile, setLogoFile] = useState(null);          // actual File object
  const [logoPreview, setLogoPreview] = useState(brand?.logo || null); // preview URL
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Revoke object URL on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  /* ─── Image selection ─── */
  const handleFileSelect = (file) => {
    if (!file) return;
    // Validate type
    const allowed = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      alert('Please select an image file (SVG, PNG, JPG, GIF or WEBP)');
      return;
    }
    // Revoke previous blob URL
    if (logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleInputChange = (e) => handleFileSelect(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]); };
  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleRemoveLogo = () => {
    if (logoPreview && logoPreview.startsWith('blob:')) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ─── Save ─── */
  const handleSubmit = async () => {
    if (!name.trim()) { alert('Brand name is required'); return; }
    setSaving(true);
    try {
      let finalLogo = logoPreview;

      // 1. If we have a newly selected file, convert it to Base64
      if (logoFile) {
        finalLogo = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(logoFile);
        });
      }

      // 2. Build the data object
      const brandData = {
        name: name.trim(),
        description: description.trim(),
        website: website.trim(),
        // Send either the new Base64 or the existing server logo string
        logo: (finalLogo && finalLogo.startsWith('blob:')) ? null : finalLogo
      };

      await onSave(brandData);
    } catch (err) {
      console.error('BrandModal save error:', err);
      alert('Failed to save brand. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--admin-bg-secondary)] rounded-2xl sm:rounded-3xl shadow-2xl border border-[var(--border-main)] w-full max-w-xs sm:max-w-sm md:max-w-md max-h-[95vh] overflow-y-auto animate-in fade-in zoom-in duration-200">

        {/* ─── Header ─── */}
        <div className="sticky top-0 z-10 bg-[var(--admin-bg-secondary)] px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-[var(--border-subtle)] flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <MdBusiness className="text-lg sm:text-xl" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base md:text-lg font-black text-[var(--admin-text-primary)] uppercase tracking-tight">
                {brand ? 'Edit Brand' : 'Add Brand'}
              </h2>
              <p className="text-[8px] sm:text-[9px] font-bold text-[var(--admin-text-secondary)] uppercase tracking-widest mt-0.5">
                {brand ? 'Update Manufacturer Details' : 'New Brand Partner'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 sm:p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <MdClose className="text-lg sm:text-xl" />
          </button>
        </div>

        {/* ─── Body ─── */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">

          {/* Brand Name */}
          <div className="space-y-1.5">
            <label className="text-[9px] sm:text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest block">
              Brand Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. CERA, Asian Paints..."
              className="w-full h-10 sm:h-11 md:h-12 px-3 sm:px-4 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 rounded-xl outline-none transition-all text-xs sm:text-sm font-bold text-[var(--admin-text-primary)] placeholder:font-normal placeholder:text-slate-400"
            />
          </div>

          {/* Brand Logo Upload */}
          <div className="space-y-2">
            <label className="text-[9px] sm:text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest flex items-center gap-1.5">
              <MdImage className="text-teal-500 text-sm" />
              Brand Logo
            </label>

            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !logoPreview && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl sm:rounded-2xl transition-all ${dragOver
                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/10 scale-[1.01]'
                : logoPreview
                  ? 'border-teal-400 bg-teal-50/50 dark:bg-teal-900/10'
                  : 'border-[var(--border-main)] hover:border-teal-400 hover:bg-[var(--admin-bg-primary)] cursor-pointer'
                }`}
            >
              {logoPreview ? (
                /* ── Preview ── */
                <div className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 flex items-center justify-center p-1.5 sm:p-2 flex-shrink-0 shadow-sm overflow-hidden">
                    <SafeImage
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs font-black text-teal-600 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                      <MdCheckCircle className="text-sm flex-shrink-0" />
                      {logoFile ? 'New image selected' : 'Current logo'}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-[var(--admin-text-secondary)] truncate">
                      {logoFile ? logoFile.name : logoPreview}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        className="text-[9px] sm:text-[10px] font-black text-teal-600 underline uppercase tracking-widest hover:text-teal-700"
                      >
                        Change
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRemoveLogo(); }}
                        className="text-[9px] sm:text-[10px] font-black text-red-400 underline uppercase tracking-widest hover:text-red-600 flex items-center gap-0.5"
                      >
                        <MdDelete className="text-xs" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Upload prompt ── */
                <div className="py-6 sm:py-8 px-4 flex flex-col items-center text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                    <MdCloudUpload className="text-xl sm:text-2xl text-slate-400" />
                  </div>
                  <p className="text-[10px] sm:text-xs font-black text-teal-600 uppercase tracking-widest">
                    <span className="underline cursor-pointer" onClick={() => fileInputRef.current?.click()}>Click to upload</span>
                    <span className="text-[var(--admin-text-secondary)] font-normal normal-case tracking-normal"> or drag and drop</span>
                  </p>
                  <p className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    SVG, PNG, JPG or GIF (max. 800×400px)
                  </p>
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/svg+xml,image/png,image/jpeg,image/gif,image/webp"
              className="hidden"
              onChange={handleInputChange}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[9px] sm:text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest flex items-center gap-1.5">
              <MdDescription className="text-teal-500 text-sm" />
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview of the brand and its products..."
              rows={3}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 rounded-xl outline-none transition-all text-xs sm:text-sm font-medium text-[var(--admin-text-primary)] placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Website */}
          <div className="space-y-1.5">
            <label className="text-[9px] sm:text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest flex items-center gap-1.5">
              <MdLanguage className="text-teal-500 text-sm" />
              Brand Website
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://examplebrand.com"
              className="w-full h-10 sm:h-11 md:h-12 px-3 sm:px-4 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 rounded-xl outline-none transition-all text-xs sm:text-sm font-bold text-[var(--admin-text-primary)] placeholder:font-normal placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* ─── Footer ─── */}
        <div className="sticky bottom-0 bg-[var(--admin-bg-secondary)] px-4 sm:px-6 pt-3 pb-4 sm:pb-5 border-t border-[var(--border-subtle)] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 sm:py-3 border-2 border-[var(--border-subtle)] text-[var(--admin-text-secondary)] font-black rounded-xl hover:bg-[var(--admin-bg-primary)] hover:text-[var(--admin-text-primary)] transition-all uppercase tracking-widest text-[9px] sm:text-[10px]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-[2] py-2.5 sm:py-3 bg-teal-600 text-white font-black rounded-xl hover:bg-teal-700 transition-all shadow-xl shadow-teal-500/20 uppercase tracking-widest text-[9px] sm:text-[10px] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>{brand ? 'Update Brand' : 'Save Brand'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandModal;