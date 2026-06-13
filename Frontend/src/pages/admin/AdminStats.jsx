import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdQueryStats, 
  MdSearch,
  MdCheckCircle,
  MdCancel,
  MdSave,
  MdClose,
  MdStar,
  MdVerified,
  MdOutlineWorkspacePremium,
  MdLocationOn,
  MdSecurity,
  MdHandshake,
  MdInventory,
  MdLocalShipping,
  MdShoppingCart,
  MdPhone,
  MdEmail
} from 'react-icons/md';
import { 
  useAdminSearch, 
  useAdminPagination, 
  useAdminToast,
  useAdminModal,
  useAdminConfirm
} from '../../hooks/useAdmin';
import adminService from '../../services/adminService';

const iconMap = {
  MdStar: <MdStar />,
  MdVerified: <MdVerified />,
  MdOutlineWorkspacePremium: <MdOutlineWorkspacePremium />,
  MdLocationOn: <MdLocationOn />,
  MdSecurity: <MdSecurity />,
  MdHandshake: <MdHandshake />,
  MdInventory: <MdInventory />,
  MdLocalShipping: <MdLocalShipping />,
  MdShoppingCart: <MdShoppingCart />,
  MdPhone: <MdPhone />,
  MdEmail: <MdEmail />
};

const renderIcon = (iconName, className) => {
  if (!iconName) return <MdQueryStats className={className} />;
  
  if (iconName.startsWith('http') || iconName.startsWith('/')) {
    return <img src={iconName} alt="icon" className={`w-full h-full object-contain p-1 ${className}`} />;
  }
  if (iconName.includes('<img') || iconName.includes('src=')) {
    const match = iconName.match(/src=["'](.*?)["']/);
    if (match && match[1]) {
      return <img src={match[1]} alt="icon" className={`w-full h-full object-contain p-1 ${className}`} />;
    }
  }
  
  const IconComponent = iconMap[iconName];
  if (IconComponent) {
    return <IconComponent.type className={className} />;
  }
  
  return <MdQueryStats className={className} />;
};

// Modal component for creating/editing stats
const StatModal = ({ content, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: null,
    label: '',
    value: '',
    icon: 'MdStar',
    iconColor: 'text-yellow-400'
  });

  useEffect(() => {
    if (content) {
      setFormData({
        id: content.id || null,
        label: content.label || '',
        value: content.value || '',
        icon: content.icon || 'MdStar',
        iconColor: content.iconColor || 'text-yellow-400'
      });
    }
  }, [content]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 bg-slate-900/60 backdrop-blur-sm transition-all overflow-y-auto">
      <div className="bg-[var(--admin-bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border-main)] w-[95vw] max-w-[500px] animate-fadeIn">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-50 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/20">
          <h3 className="text-sm sm:text-[16px] font-black text-[var(--admin-text-primary)] uppercase tracking-tighter">
            {content ? 'Edit Stat' : 'Add New Stat'}
          </h3>
          <button onClick={onClose} className="p-1 sm:p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all">
            <MdClose className="text-lg sm:text-xl" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
              Value (e.g. 10k+, 50+)
            </label>
            <input
              type="text"
              name="value"
              value={formData.value}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-xl outline-none transition-all dark:text-white text-xs sm:text-sm font-bold placeholder:text-slate-300"
              placeholder="e.g. 10k+"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
              Label
            </label>
            <input
              type="text"
              name="label"
              value={formData.label}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-xl outline-none transition-all dark:text-white text-xs sm:text-sm font-bold placeholder:text-slate-300"
              placeholder="e.g. HAPPY CLIENTS"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                Icon Name or Image URL
              </label>
              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-xl outline-none transition-all dark:text-white text-[10px] sm:text-xs font-mono"
                placeholder="e.g. MdStar or https://..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                Icon Color Class
              </label>
              <input
                type="text"
                name="iconColor"
                value={formData.iconColor}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-xl outline-none transition-all dark:text-white text-[10px] sm:text-xs font-mono"
                placeholder="e.g. text-yellow-400"
              />
            </div>
          </div>
          <div className="flex gap-3 sm:gap-4 mt-6 pt-4 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border-2 border-[var(--border-subtle)] text-[var(--admin-text-secondary)] font-black rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-[10px] uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-teal-600 text-white font-black rounded-xl hover:bg-teal-700 transition-all shadow-xl shadow-teal-500/30 text-[10px] uppercase tracking-widest"
            >
              {content ? 'Update Stat' : 'Save Stat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminStats = () => {
  const { success, error } = useAdminToast();
  const { confirm, isConfirming, confirmData, handleConfirm, handleCancel } = useAdminConfirm();
  
  const [initialContent, setInitialContent] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getStats();
      setInitialContent(data || []);
    } catch (err) {
      error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const searchKeys = useMemo(() => ['label', 'value'], []);
  const { searchTerm, setSearchTerm, filteredItems: searchedContent } = useAdminSearch(
    initialContent,
    searchKeys
  );
  
  const { currentItems: contentPages, totalPages, prevPage, nextPage, hasNextPage, hasPrevPage } = useAdminPagination(searchedContent, 10);
  const { isOpen, modalData: editingContent, openModal, closeModal } = useAdminModal();

  const handleDeleteContent = async (contentId) => {
    const confirmed = await confirm({
      title: 'Delete Stat',
      message: 'Are you sure you want to delete this stat? This action cannot be undone.',
      confirmText: 'Delete',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await adminService.deleteStat(contentId);
        success('Stat deleted');
        fetchContent();
      } catch (err) {
        error('Failed to delete stat');
      }
    }
  };

  return (
    <div className="bg-[var(--admin-bg-primary)] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-1 sm:px-6 py-4 sm:py-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-[14px] sm:text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight tracking-tight">Landing Page Stats</h1>
            <p className="text-[9px] sm:text-sm font-black text-slate-500 mt-0.5 sm:mt-1 uppercase tracking-widest opacity-60">Manage the statistics shown on the home page.</p>
          </div>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-6 sm:py-2.5 bg-teal-600 text-white font-black rounded-lg sm:rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 active:scale-95 text-[9px] sm:text-[10px] uppercase tracking-widest whitespace-nowrap"
          >
            <MdAdd className="text-sm sm:text-xl" />
            <span className="hidden sm:inline">Add Stat</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-xl sm:rounded-2xl p-2 sm:p-4 mb-4 sm:mb-6 flex items-center justify-between gap-2 sm:gap-4">
          <div className="relative flex-1 w-full max-w-[150px] sm:max-w-md group">
            <MdSearch className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] sm:text-xl group-focus-within:text-teal-500 transition-colors" />
            <input
              type="text"
              placeholder="Search stats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2.5 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-lg sm:rounded-xl outline-none transition-all dark:text-white text-[10px] sm:text-sm font-medium"
            />
          </div>
        </div>

        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-[var(--admin-bg-primary)]/50">
                  <th className="px-2 sm:px-6 py-2 sm:py-4 text-[9px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left whitespace-nowrap">Stat Information</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-4 text-[9px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left whitespace-nowrap">Icon config</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-4 text-[9px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan="3" className="px-2 sm:px-6 py-2 sm:py-6">
                        <div className="h-6 sm:h-10 bg-[var(--admin-bg-primary)] animate-pulse rounded-lg sm:rounded-2xl"></div>
                      </td>
                    </tr>
                  ))
                ) : contentPages.length > 0 ? (
                  contentPages.map((page) => (
                    <tr key={page.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 sm:gap-4">
                           <div className="w-6 h-6 sm:w-12 sm:h-12 bg-cyan-50 dark:bg-cyan-900/20 rounded-md sm:rounded-2xl flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-800 shadow-sm transition-transform group-hover:scale-110">
                             {renderIcon(page.icon, "text-sm sm:text-2xl")}
                           </div>
                           <div>
                              <span className="font-black text-[var(--admin-text-primary)] uppercase tracking-tight text-[10px] sm:text-sm block leading-none">{page.value}</span>
                              <span className="text-[7px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 sm:mt-1 block italic opacity-70">{page.label}</span>
                           </div>
                        </div>
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          <span className={`px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[8px] sm:text-[10px] font-black tracking-widest w-fit bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 truncate max-w-[150px] inline-block`} title={page.icon}>
                            {page.icon?.startsWith('http') || page.icon?.includes('<img') ? 'Custom Image' : page.icon}
                          </span>
                          <span className={`px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[7px] sm:text-[9px] font-black tracking-widest w-fit bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400`}>
                            {page.iconColor}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                          <button onClick={() => openModal(page)} className="p-1.5 sm:p-2.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 rounded-lg sm:rounded-xl transition-all"><MdEdit className="text-sm sm:text-xl" /></button>
                          <button onClick={() => handleDeleteContent(page.id)} className="p-1.5 sm:p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg sm:rounded-xl transition-all"><MdDelete className="text-sm sm:text-xl" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="p-10 sm:p-20 text-center text-slate-300">
                      <MdQueryStats className="mx-auto text-4xl sm:text-7xl mb-4 sm:mb-6 opacity-20" />
                      <p className="font-black uppercase tracking-widest text-xs sm:text-lg text-slate-400">No stats available</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {!loading && totalPages > 1 && (
            <div className="px-2 sm:px-6 py-4 sm:py-6 border-t border-[var(--border-subtle)] flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/20 rounded-b-xl">
              <p className="text-[8px] sm:text-[10px] text-[var(--admin-text-secondary)] font-black uppercase tracking-widest">
                <span className="text-teal-600">{contentPages.length}</span> of <span className="text-teal-600">{searchedContent.length}</span>
              </p>
              <div className="flex items-center gap-1.5 sm:gap-4">
                <button onClick={prevPage} disabled={!hasPrevPage} className={`px-2 py-1 sm:px-4 sm:py-2 border sm:border-2 border-[var(--border-main)] text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg sm:rounded-xl transition-all ${!hasPrevPage ? 'opacity-30 cursor-not-allowed' : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-primary)]'}`}>Prev</button>
                <button onClick={nextPage} disabled={!hasNextPage} className={`px-2 py-1 sm:px-4 sm:py-2 border sm:border-2 border-[var(--border-main)] text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg sm:rounded-xl transition-all ${!hasNextPage ? 'opacity-30 cursor-not-allowed' : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-primary)]'}`}>Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <StatModal
          content={editingContent}
          onClose={closeModal}
          onSave={async (data) => {
            try {
               await adminService.saveStat(data);
               success('Stat saved successfully');
               fetchContent();
               closeModal();
            } catch (err) {
               error('Failed to save stat');
            }
          }}
        />
      )}

      {isConfirming && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 bg-slate-900/60 backdrop-blur-sm transition-all">
          <div className="bg-[var(--admin-bg-secondary)] rounded-2xl p-4 sm:p-8 max-w-[280px] sm:max-w-sm w-full shadow-2xl border border-[var(--border-main)] transform transition-all animate-fadeIn">
            <div className="text-center">
              <div className={`w-12 h-12 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg transform transition-all hover:scale-110 ${confirmData.type === 'danger' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 shadow-rose-500/10' : 'bg-teal-50 dark:bg-teal-900/20 text-teal-500 shadow-teal-500/10'}`}>
                {confirmData.type === 'danger' ? <MdDelete className="text-2xl sm:text-4xl" /> : <MdCheckCircle className="text-2xl sm:text-4xl" />}
              </div>
              <h1 className="text-[12px] sm:text-xl font-black text-[var(--admin-text-primary)] mb-1 sm:mb-2 uppercase tracking-tight leading-tight">{confirmData.title}</h1>
              <p className="text-[9px] sm:text-sm font-medium text-[var(--admin-text-secondary)] mb-6 sm:mb-8 leading-relaxed italic">{confirmData.message}</p>
              <div className="flex items-center gap-2 sm:gap-4">
                <button onClick={handleCancel} className="flex-1 py-2 sm:py-3.5 px-3 sm:px-6 border sm:border-2 border-[var(--border-subtle)] text-slate-500 font-bold rounded-lg sm:rounded-2xl hover:bg-[var(--admin-bg-primary)] transition-all uppercase tracking-widest text-[8px] sm:text-[10px]">Cancel</button>
                <button onClick={handleConfirm} className={`flex-1 py-2 sm:py-3.5 px-3 sm:px-6 font-bold rounded-lg sm:rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-widest text-[8px] sm:text-[10px] ${confirmData.type === 'danger' ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20' : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/20'}`}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStats;
