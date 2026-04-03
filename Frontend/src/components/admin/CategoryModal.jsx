import { useState, useEffect } from 'react';
import { 
  MdClose, 
  MdCategory, 
  MdDescription, 
  MdSave, 
  MdCheckCircle,
  MdInfo
} from 'react-icons/md';

const CategoryModal = ({ category, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(category?.image || null);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        status: category.status || 'active',
      });
      setPreview(category.image || null);
    }
  }, [category]);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalImage = preview;
      if (imageFile) {
        finalImage = await fileToBase64(imageFile);
      }
      onSave({ ...formData, image: finalImage });
    } catch (err) {
      console.error('Category save error:', err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-1 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#f8fafc] dark:bg-slate-800 w-full max-w-5xl rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-admin-slide-up border border-white/20 mx-2 sm:mx-0">
        {/* Modal Header */}
        <div className="px-3 py-2 sm:px-10 sm:py-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-[var(--admin-bg-secondary)]">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg sm:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <MdCategory className="text-base sm:text-2xl" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black text-[var(--admin-text-primary)] tracking-tight leading-none uppercase">
                {category ? 'Edit Category' : 'Create New Category'}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-[var(--admin-text-secondary)] font-bold uppercase tracking-widest mt-1 opacity-80">
                {category ? 'Update classification' : 'Add a new group for your inventory'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 sm:p-3 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg sm:rounded-2xl text-slate-400 dark:text-slate-500 transition-all hover:text-red-500 active:scale-95"
          >
            <MdClose className="text-lg sm:text-3xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-10 max-h-[90vh] overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-10">
            {/* Main Form Area (Left) */}
            <div className="md:col-span-2 space-y-3 sm:space-y-8">
              {/* Category Name */}
              <div className="space-y-1 sm:space-y-3">
                <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-2 sm:ml-4">
                  Category Name
                </label>
                <div className="relative group">
                  <div className="absolute left-2.5 sm:left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors">
                    <MdCategory className="text-[10px] sm:text-xl" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Faucets, Shower Heads"
                    className="w-full pl-7 sm:pl-14 pr-3 sm:pr-6 py-2 sm:py-5 bg-white dark:bg-slate-900 border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-xl sm:rounded-3xl outline-none transition-all dark:text-white font-bold text-[8px] sm:text-lg placeholder:text-slate-300 shadow-sm"
                  />
                </div>
              </div>

               {/* Category Image Upload (Base64 Armor) */}
               <div className="space-y-1 sm:space-y-3">
                <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-2 sm:ml-4">
                  Category Thumbnail
                </label>
                <div className="relative group border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-4 sm:p-8 bg-white dark:bg-slate-900/50 hover:bg-slate-50 transition-all flex flex-col items-center justify-center min-h-[140px] sm:min-h-[180px] cursor-pointer overflow-hidden">
                   <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                   {preview ? (
                      <div className="w-full h-full absolute inset-0">
                         <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-white font-black text-xs uppercase tracking-widest bg-slate-900/50 px-4 py-2 rounded-full backdrop-blur-md">Secure Armor Active</p>
                         </div>
                      </div>
                   ) : (
                      <div className="text-center">
                        <MdCategory className="mx-auto text-3xl sm:text-5xl text-slate-300 group-hover:text-teal-500 transition-colors mb-2" />
                        <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-tighter">Click to link permanent image</p>
                      </div>
                   )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1 sm:space-y-3">
                <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-2 sm:ml-4">
                  Description
                </label>
                <div className="relative group">
                  <div className="absolute left-2.5 sm:left-5 top-3 sm:top-6 text-slate-300 group-focus-within:text-teal-500 transition-colors">
                    <MdDescription className="text-[10px] sm:text-xl" />
                  </div>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what kind of products belong to this category..."
                    className="w-full pl-7 sm:pl-14 pr-3 sm:pr-6 py-2.5 sm:py-5 bg-white dark:bg-slate-900 border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-xl sm:rounded-3xl outline-none transition-all dark:text-white font-bold text-[8px] sm:text-base placeholder:text-slate-300 shadow-sm resize-none h-20 sm:h-auto"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-4 pt-2 sm:pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 sm:py-4 border-2 border-slate-100 dark:border-slate-700 text-[var(--admin-text-secondary)] font-black rounded-xl sm:rounded-2xl hover:bg-[var(--admin-bg-primary)]/50 transition-all uppercase tracking-widest text-[9px] sm:text-[11px]"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3 sm:py-4 bg-teal-600 text-white font-black rounded-xl sm:rounded-2xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 active:scale-95 uppercase tracking-widest text-[10px] sm:text-[12px] flex items-center justify-center gap-1 sm:gap-2"
                >
                  <MdSave className="text-sm sm:text-lg" />
                  <span>{category ? 'Update Category' : 'Create Category'}</span>
                </button>
              </div>
            </div>

            {/* Sidebar / Info Panel (Right) */}
            <div className="md:col-span-1 space-y-3 sm:space-y-8">
              {/* Status Selector */}
              <div className="bg-white dark:bg-slate-900/50 rounded-xl sm:rounded-[2rem] p-4 sm:p-8 border border-white dark:border-slate-700 shadow-sm">
                <h3 className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 sm:mb-6 flex items-center gap-1 sm:gap-2">
                  <MdInfo className="text-base" /> Visibility Status
                </h3>
                <div className="space-y-1 sm:space-y-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'active' })}
                    className={`w-full flex items-center justify-between p-1.5 sm:p-4 rounded-lg sm:rounded-2xl border transition-all group ${
                      formData.status === 'active' 
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 shadow-md translate-y-[-1px] sm:translate-y-[-2px]' 
                        : 'border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    <span className="font-black text-[6px] sm:text-xs uppercase tracking-widest">Active</span>
                    <MdCheckCircle className={`text-[8px] sm:text-xl transition-all ${formData.status === 'active' ? 'scale-110 opacity-100' : 'scale-75 opacity-0'}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'inactive' })}
                    className={`w-full flex items-center justify-between p-1.5 sm:p-4 rounded-lg sm:rounded-2xl border transition-all group ${
                      formData.status === 'inactive' 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 shadow-md translate-y-[-1px] sm:translate-y-[-2px]' 
                        : 'border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    <span className="font-black text-[6px] sm:text-xs uppercase tracking-widest">Inactive</span>
                    <MdCheckCircle className={`text-[8px] sm:text-xl transition-all ${formData.status === 'inactive' ? 'scale-110 opacity-100' : 'scale-75 opacity-0'}`} />
                  </button>
                </div>
                <p className="text-[5px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-bold italic mt-2 sm:mt-6 leading-relaxed">
                  Inactive items will be hidden.
                </p>
              </div>

              {/* Tips Card */}
              <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl sm:rounded-[2rem] p-2.5 sm:p-8 text-white shadow-xl shadow-teal-500/20">
                <MdCategory className="text-xl sm:text-4xl mb-1 sm:mb-4 opacity-40" />
                <h3 className="text-[8px] sm:text-lg font-black leading-tight mb-0.5 sm:mb-2 tracking-tight">Inventory Scaling</h3>
                <p className="text-[6px] sm:text-xs font-medium opacity-80 leading-relaxed italic">
                  Organizing categories makes searching easier for customers.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
