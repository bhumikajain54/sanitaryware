import { useState, useEffect } from 'react';
import { MdClose, MdSave, MdCancel } from 'react-icons/md';

const ContentModal = ({ content, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    slug: '',
    type: 'Static Page',
    status: 'Draft',
    content: '',
    metaDescription: '',
    active: true
  });

  useEffect(() => {
    if (content) {
      setFormData({
        id: content.id || null,
        title: content.title || content.pageName || '', // Fallback for transition
        slug: content.slug || '',
        type: content.type || 'Static Page',
        status: content.status || 'Draft',
        content: content.content || '',
        metaDescription: content.metaDescription || '',
        active: content.active ?? true
      });
    }
  }, [content]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 bg-slate-900/60 backdrop-blur-sm transition-all overflow-y-auto">
      {/* Modal */}
      <div className="bg-[var(--admin-bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border-main)] w-[95vw] max-w-[800px] max-h-[90vh] overflow-y-auto animate-fadeIn scrollbar-hide">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-50 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/20 sticky top-0 z-10 backdrop-blur-md">
          <div>
            <h3 className="text-sm sm:text-[16px] font-black text-[var(--admin-text-primary)] uppercase tracking-tighter">
              {content ? 'Edit Page Content' : 'Create New Page'}
            </h3>
            <p className="text-[8px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-0.5 italic">
              {content ? 'Modify existing storefront page' : 'Draft a new section'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
          >
            <MdClose className="text-lg sm:text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                  Page Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-xl outline-none transition-all dark:text-white text-xs sm:text-sm font-bold placeholder:text-slate-300"
                  placeholder="e.g. Terms of Service"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-xl outline-none transition-all dark:text-white text-xs sm:text-sm font-mono placeholder:text-slate-300"
                  placeholder="e.g. terms-of-service"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-xl outline-none transition-all dark:text-white text-[10px] sm:text-xs font-bold cursor-pointer"
                  >
                    <option value="Static Page">Static Page</option>
                    <option value="Blog">Blog Post</option>
                    <option value="Notice">Notice</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-xl outline-none transition-all dark:text-white text-[10px] sm:text-xs font-bold cursor-pointer"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 sm:p-4 bg-teal-50/30 dark:bg-teal-900/10 rounded-xl border border-teal-100/50 dark:border-teal-500/10">
                <input 
                  type="checkbox" 
                  name="active"
                  id="active-page"
                  checked={formData.active}
                  onChange={handleChange}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 transition-all cursor-pointer"
                />
                <label htmlFor="active-page" className="text-[9px] sm:text-xs font-black text-teal-700 dark:text-teal-400 uppercase tracking-widest cursor-pointer select-none">Make this page active</label>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                  Meta Description (SEO)
                </label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-xl outline-none transition-all dark:text-white text-[10px] sm:text-xs font-medium resize-none"
                  placeholder="Enter a brief summary for search engines..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                  Body Content
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-xl outline-none transition-all dark:text-white text-[10px] sm:text-xs font-mono leading-relaxed"
                  placeholder="Write your HTML or plain text content here..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 py-2.5 sm:py-3.5 border-2 border-[var(--border-subtle)] text-[var(--admin-text-secondary)] font-black rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <MdCancel className="text-lg sm:text-xl" />
              <span>Discard Changes</span>
            </button>
            <button
              type="submit"
              className="w-full sm:flex-[2] py-2.5 sm:py-3.5 bg-teal-600 text-white font-black rounded-xl hover:bg-teal-700 transition-all shadow-xl shadow-teal-500/30 active:scale-95 text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <MdSave className="text-lg sm:text-xl" />
              <span>{content ? 'Update Page' : 'Publish Content'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentModal;
