import { useState, useCallback, useMemo, useRef } from 'react';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdRefresh, 
  MdImage,
  MdViewCarousel,
  MdLayers,
  MdClose,
  MdCloudUpload
} from 'react-icons/md';
import { 
  useAdminFetch, 
  useAdminSearch, 
  useAdminPagination, 
  useAdminToast,
  useAdminModal,
  useAdminConfirm
} from '../../hooks/useAdmin';
import adminService from '../../services/adminService';

const AdminBanners = () => {
  const { success, error } = useAdminToast();
  const { confirm, isConfirming, confirmData, handleConfirm, handleCancel } = useAdminConfirm();
  const fileInputRef = useRef(null);
  
  // Data fetching
  const fetchBanners = useCallback(() => adminService.getBanners(), []);
  const { data: initialBanners, loading, refetch } = useAdminFetch(
    fetchBanners,
    []
  );

  // Search
  const searchKeys = useMemo(() => ['title', 'description'], []);
  const { searchTerm, setSearchTerm, filteredItems: searchedBanners } = useAdminSearch(
    initialBanners || [],
    searchKeys
  );

  // Pagination
  const { 
    currentItems: banners, 
    currentPage, 
    totalPages, 
    goToPage, 
    nextPage, 
    prevPage,
    hasNextPage,
    hasPrevPage 
  } = useAdminPagination(searchedBanners, 10);

  // Modal State
  const { isOpen, modalData, openModal, closeModal } = useAdminModal();

  const handleDeleteBanner = async (id) => {
    const confirmed = await confirm({
      title: 'Delete Banner',
      message: 'Are you sure you want to remove this slider? This will affect the home page visibility.',
      confirmText: 'Remove',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await adminService.deleteBanner(id);
        success('Slider removed');
        refetch();
      } catch (err) {
        error('Failed to remove');
      }
    }
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        await adminService.importBanners(file);
        success('Banners imported successfully');
        refetch();
      } catch (err) {
        console.error('Import failed:', err);
        error('Failed to import banners');
      }
      // Reset input
      event.target.value = '';
    }
  };

  return (
    <div className="bg-[var(--admin-bg-primary)] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-1 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-[14px] sm:text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight tracking-tight">Home Page Sliders</h1>
            <p className="text-[6px] sm:text-sm font-black text-slate-500 mt-0.5 sm:mt-1 uppercase tracking-widest opacity-60">Manage the hero section banners and promotional slides.</p>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
              accept=".csv,.xlsx,.xls,.json"
            />
            <button
              onClick={handleImportClick}
              className="inline-flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-6 sm:py-2.5 bg-white text-teal-600 border-2 border-teal-600 font-black rounded-lg sm:rounded-xl hover:bg-teal-50 transition-all shadow-md active:scale-95 text-[6px] sm:text-[10px] uppercase tracking-widest whitespace-nowrap"
            >
              <MdCloudUpload className="text-[10px] sm:text-xl" />
              <span>Import</span>
            </button>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-6 sm:py-2.5 bg-teal-600 text-white font-black rounded-lg sm:rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 active:scale-95 text-[6px] sm:text-[10px] uppercase tracking-widest whitespace-nowrap"
            >
              <MdAdd className="text-[10px] sm:text-xl" />
              <span>Add Slide</span>
            </button>
          </div>
        </div>

        {/* Grid Display */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-8">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-32 sm:h-64 bg-[var(--admin-bg-primary)] animate-pulse rounded-xl sm:rounded-[2.5rem]"></div>
            ))
          ) : banners.length > 0 ? (
            banners.map((slide) => (
              <div key={slide.id} className="bg-[var(--admin-bg-secondary)] rounded-xl sm:rounded-[2.5rem] overflow-hidden group border border-[var(--border-subtle)] shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <div className="h-24 sm:h-56 relative overflow-hidden">
                    <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-slate-900 to-transparent"></div>
                    <div className="absolute bottom-2 sm:bottom-6 left-2 sm:left-6 right-2 sm:right-6">
                        <h3 className="text-white font-black text-[8px] sm:text-xl truncate uppercase tracking-tight">{slide.title}</h3>
                        <p className="text-slate-300 text-[5px] sm:text-[10px] font-bold uppercase tracking-widest line-clamp-1 mt-0.5 sm:mt-1">{slide.description}</p>
                    </div>
                </div>
                
                <div className="p-2 sm:p-5 flex items-center justify-between bg-[var(--admin-bg-secondary)]">
                    <span className={`px-1 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[5px] sm:text-[10px] font-black uppercase tracking-widest ${
                      slide.active 
                      ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' 
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                    }`}>
                        {slide.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    <div className="flex items-center gap-1 sm:gap-2">
                        <button 
                            onClick={() => openModal(slide)}
                            className="p-1 sm:p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-md sm:rounded-xl transition-all"
                        >
                            <MdEdit className="text-[10px] sm:text-xl" />
                        </button>
                        <button 
                            onClick={() => handleDeleteBanner(slide.id)}
                            className="p-1 sm:p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-md sm:rounded-xl transition-all"
                        >
                            <MdDelete className="text-[10px] sm:text-xl" />
                        </button>
                    </div>
                </div>
              </div>
            ))
          ) : (
             <div className="col-span-full p-8 sm:p-24 text-center text-slate-300 bg-[var(--admin-bg-secondary)] rounded-2xl sm:rounded-[3rem] border-2 sm:border-4 border-dashed border-[var(--border-subtle)] shadow-inner">
                <MdViewCarousel className="mx-auto text-5xl sm:text-9xl mb-3 sm:mb-6 opacity-20" />
                <h3 className="font-black text-sm sm:text-2xl uppercase tracking-tighter text-slate-400">No banners found</h3>
                <p className="text-[8px] sm:text-sm font-bold text-slate-500 mt-1 sm:mt-2 mb-4 sm:mb-8 italic">Your storefront looks empty. Let's add some visual flair!</p>
                <button 
                  onClick={() => openModal()} 
                  className="px-4 py-2 sm:px-8 sm:py-3.5 bg-teal-600 text-white font-black rounded-lg sm:rounded-2xl hover:bg-teal-700 transition-all shadow-xl shadow-teal-500/20 active:scale-95 text-[7px] sm:text-xs uppercase tracking-widest"
                >
                  Create Your First Slide
                </button>
             </div>
          )}
        </div>

        {/* Pagination placeholder if needed */}
        {!loading && searchedBanners.length > 10 && (
           <div className="mt-6 sm:mt-12 flex justify-center">
             <div className="bg-[var(--admin-bg-secondary)] px-3 py-2 sm:px-8 sm:py-5 rounded-lg sm:rounded-[2rem] border border-[var(--border-subtle)] shadow-xl flex items-center gap-3 sm:gap-6">
                <button 
                    disabled 
                    className="px-3 py-1 sm:px-6 sm:py-2.5 border-2 border-[var(--border-subtle)] text-[6px] sm:text-[10px] font-black uppercase tracking-widest rounded-md sm:rounded-xl transition-all opacity-30 cursor-not-allowed"
                >
                    Prev
                </button>
                <span className="text-[6px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Page 1 of 1</span>
                <button 
                    disabled 
                    className="px-3 py-1 sm:px-6 sm:py-2.5 border-2 border-[var(--border-subtle)] text-[6px] sm:text-[10px] font-black uppercase tracking-widest rounded-md sm:rounded-xl transition-all opacity-30 cursor-not-allowed"
                >
                    Next
                </button>
             </div>
           </div>
        )}
      </div>

      {isOpen && (
        <BannerModal
          banner={modalData}
          onClose={closeModal}
          onSave={async (data) => {
            try {
               await adminService.saveBanner(data);
               success('Banner saved successfully');
               refetch();
               closeModal();
            } catch (err) {
               error('Failed to save');
            }
          }}
        />
      )}

      {isConfirming && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 bg-slate-900/60 backdrop-blur-sm transition-all">
          <div className="bg-[var(--admin-bg-secondary)] rounded-2xl p-4 sm:p-10 max-w-[320px] sm:max-w-sm w-full shadow-2xl border border-[var(--border-main)] transform transition-all animate-fadeIn">
             <div className="w-12 h-12 sm:w-24 sm:h-24 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full mx-auto mb-4 sm:mb-8 flex items-center justify-center shadow-lg shadow-rose-500/10">
                <MdDelete className="text-2xl sm:text-5xl" />
             </div>
             <h3 className="text-sm sm:text-2xl font-black text-[var(--admin-text-primary)] mb-1 sm:mb-2 uppercase tracking-tight leading-tight text-center">{confirmData.title}</h3>
             <p className="text-[8px] sm:text-sm font-medium text-[var(--admin-text-secondary)] mb-6 sm:mb-10 leading-relaxed italic text-center">{confirmData.message}</p>
             <div className="flex gap-2 sm:gap-4">
                <button 
                  onClick={handleCancel}
                  className="flex-1 py-1.5 sm:py-4 border-2 border-[var(--border-subtle)] text-slate-500 font-black rounded-lg sm:rounded-2xl hover:bg-[var(--admin-bg-primary)] transition-all uppercase tracking-widest text-[7px] sm:text-[10px]"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirm} 
                  className="flex-1 py-1.5 sm:py-4 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-lg sm:rounded-2xl transition-all shadow-xl shadow-rose-500/20 active:scale-95 uppercase tracking-widest text-[7px] sm:text-[10px]"
                >
                  Remove
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BannerModal = ({ banner, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        id: banner?.id || null,
        title: banner?.title || '',
        description: banner?.description || '',
        imageUrl: banner?.imageUrl || '',
        linkUrl: banner?.linkUrl || '',
        active: banner?.active ?? true
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 bg-slate-900/60 backdrop-blur-sm transition-all overflow-y-auto">
            <div className="bg-[var(--admin-bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border-main)] w-[95vw] md:w-[700px] lg:w-[900px] max-h-[90vh] overflow-y-auto animate-fadeIn scrollbar-hide">
                <div className="flex items-center justify-between p-3 border-b border-slate-50 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/20">
                    <div>
                        <h2 className="text-[14px] font-black text-[var(--admin-text-primary)] uppercase tracking-tighter">
                            {banner ? 'Configure Slide' : 'New Hero Slide'}
                        </h2>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-0.5 italic">
                            {banner ? 'Refine slide details' : 'Design landing presence'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all">
                      <MdClose className="text-base" />
                    </button>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title & Description Column */}
                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Banner Title (Primary Heading)</label>
                                <input 
                                  className="w-full px-4 py-3 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-xl outline-none transition-all dark:text-white text-xs md:text-sm font-black uppercase tracking-tight placeholder:text-slate-300 dark:placeholder:text-slate-600" 
                                  value={formData.title} 
                                  onChange={e => setFormData({ ...formData, title: e.target.value })} 
                                  required 
                                  placeholder="e.g. Elegance Redefined" 
                                />
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Description (Catchphrase)</label>
                                <textarea 
                                  className="w-full px-4 py-3 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-xl outline-none transition-all dark:text-white text-xs md:text-sm font-bold resize-none min-h-[120px] leading-relaxed italic" 
                                  value={formData.description} 
                                  onChange={e => setFormData({ ...formData, description: e.target.value })} 
                                  required 
                                  placeholder="A brief catchphrase for this slide..." 
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Link URL</label>
                                <input 
                                  className="w-full px-4 py-3 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-xl outline-none transition-all dark:text-white text-xs md:text-sm font-black uppercase tracking-tight" 
                                  value={formData.linkUrl} 
                                  onChange={e => setFormData({ ...formData, linkUrl: e.target.value })} 
                                  placeholder="/shop" 
                                />
                            </div>
                        </div>

                        {/* Image Column */}
                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Background Image</label>
                                <div className="space-y-3">
                                    {formData.imageUrl && (
                                        <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-[var(--border-subtle)] shadow-inner group">
                                            <img src={formData.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Preview" />
                                            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                <span className="text-white font-black text-[10px] uppercase tracking-widest bg-slate-900/60 px-4 py-2 rounded-full backdrop-blur-md">Preview Active</span>
                                            </div>
                                        </div>
                                    )}
                                    <input 
                                      className="w-full px-4 py-3 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-xl outline-none transition-all dark:text-white text-xs italic placeholder:text-slate-300 dark:placeholder:text-slate-600 truncate" 
                                      value={formData.imageUrl} 
                                      onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} 
                                      required 
                                      placeholder="https://images.unsplash.com/..." 
                                    />
                                    
                                    <div className="relative">
                                        <input 
                                            type="file" 
                                            id="banner-image-upload-modal"
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const uploadFormData = new FormData();
                                                    uploadFormData.append('file', file);
                                                    try {
                                                        const response = await adminService.uploadMedia(uploadFormData);
                                                        const imageUrl = response.url || response.data?.url || response;
                                                        setFormData({ ...formData, imageUrl: imageUrl });
                                                    } catch (err) {
                                                        console.error('Upload failed:', err);
                                                    }
                                                }
                                            }}
                                        />
                                        <label 
                                            htmlFor="banner-image-upload-modal"
                                            className="flex items-center justify-center gap-3 w-full py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-all text-xs font-black text-slate-500 uppercase tracking-widest"
                                        >
                                            <MdCloudUpload className="text-xl text-teal-500" />
                                            <span>Upload Locally</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-teal-50/30 dark:bg-teal-900/10 rounded-xl border border-teal-100/50 dark:border-teal-500/10">
                                <input 
                                    type="checkbox" 
                                    id="banner-active-modal"
                                    checked={formData.active}
                                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                    className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 transition-all cursor-pointer"
                                />
                                <label htmlFor="banner-active-modal" className="text-xs font-black text-teal-700 dark:text-teal-400 uppercase tracking-widest cursor-pointer select-none">Make this slide active</label>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
                        <button 
                          type="button" 
                          onClick={onClose} 
                          className="flex-1 py-4 border-2 border-[var(--border-subtle)] text-[var(--admin-text-secondary)] font-black rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <MdRefresh className="text-lg" />
                          <span>Discard Changes</span>
                        </button>
                        <button 
                          type="submit" 
                          className="flex-[2] py-4 bg-teal-600 text-white font-black rounded-xl hover:bg-teal-700 transition-all shadow-xl shadow-teal-500/30 active:scale-[0.98] text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <MdAdd className="text-lg" />
                          <span>{banner ? 'Update Slide' : 'Publish to Storefront'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminBanners;
