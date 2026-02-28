import { useState, useEffect, useRef } from 'react';
import { MdClose, MdCloudUpload, MdImage, MdSave, MdCancel, MdDelete } from 'react-icons/md';

const MediaModal = ({ media, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    fileName: '',
    type: 'Image',
    url: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (media) {
      setFormData({
        fileName: media.fileName,
        type: media.type,
        url: media.url,
      });
      setPreview(media.url);
    }
  }, [media]);

  // Handle file selection
  const handleFileSelect = (file) => {
    if (file) {
      setSelectedFile(file);
      
      // Auto-fill file name if empty
      if (!formData.fileName) {
        setFormData(prev => ({
          ...prev,
          fileName: file.name
        }));
      }

      // Detect file type
      const fileType = file.type.split('/')[0];
      if (fileType === 'image') {
        setFormData(prev => ({ ...prev, type: 'Image' }));
      } else if (fileType === 'video') {
        setFormData(prev => ({ ...prev, type: 'Video' }));
      } else {
        setFormData(prev => ({ ...prev, type: 'Document' }));
      }

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
          setFormData(prev => ({
            ...prev,
            url: reader.result // Store base64 for mockup
          }));
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
        setFormData(prev => ({
          ...prev,
          url: `/uploads/${file.name}`
        }));
      }
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      uploaded: new Date().toISOString().split('T')[0]
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 bg-slate-900/60 backdrop-blur-sm transition-all overflow-y-auto">
      {/* Modal */}
      <div className="bg-[var(--admin-bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border-main)] w-[90vw] max-w-[320px] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-slate-50 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/20">
          <div>
            <h3 className="text-[14px] font-black text-[var(--admin-text-primary)] uppercase tracking-tighter">
              {media ? 'Audit Asset' : 'New Library Asset'}
            </h3>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-0.5 italic">
              {media ? 'Update metadata' : 'Drop high-res files'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
          >
            <MdClose className="text-base" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer group relative overflow-hidden active:scale-[0.98] ${
                isDragging 
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' 
                  : 'border-[var(--border-subtle)] hover:border-teal-500 dark:hover:border-teal-500'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <div className="space-y-2 animate-fadeIn">
                  <div className="relative inline-block">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="max-h-24 mx-auto rounded-lg shadow-lg ring-2 ring-white dark:ring-slate-800 object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreview(null);
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute -top-1.5 -right-1.5 p-1 bg-rose-500 text-white rounded-full shadow-md hover:bg-rose-600 transition-all"
                    >
                      <MdDelete className="text-xs" />
                    </button>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[var(--admin-text-primary)] truncate max-w-[200px] mx-auto uppercase tracking-tight">
                      {selectedFile?.name || formData.fileName}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-[var(--admin-bg-secondary)] rounded-xl shadow-md mx-auto flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:text-teal-500 transition-all">
                    <MdCloudUpload className="text-2xl" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-[var(--admin-text-primary)] uppercase tracking-tight">
                      Selection Channel
                    </p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mt-0.5 italic">Click or drag & drop</p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </div>

            {/* File Details */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                  File Metadata
                </label>
                <input
                  type="text"
                  name="fileName"
                  value={formData.fileName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-lg outline-none transition-all dark:text-white text-[10px] font-bold placeholder:text-slate-300"
                  placeholder="Asset Name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                    Taxonomy
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-lg outline-none transition-all dark:text-white text-[10px] font-bold cursor-pointer"
                  >
                    <option value="Image">Image</option>
                    <option value="Video">Video</option>
                    <option value="Document">Doc</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                    System Path
                  </label>
                  <input
                    type="text"
                    name="url"
                    value={formData.url}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-slate-50/50 dark:bg-slate-800/20 border-2 border-transparent rounded-lg outline-none text-slate-400 text-[9px] font-bold italic"
                    placeholder="URL Path"
                    readOnly={!!selectedFile}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border-2 border-[var(--border-subtle)] text-[var(--admin-text-secondary)] font-black rounded-lg hover:bg-slate-50 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-1"
            >
              <MdCancel className="text-base" />
              <span>Discard</span>
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-teal-600 text-white font-black rounded-lg hover:bg-teal-700 transition-all shadow-xl shadow-teal-500/20 active:scale-95 text-[10px] uppercase tracking-widest flex items-center justify-center gap-1"
            >
              <MdSave className="text-base" />
              <span>{media ? 'Update' : 'Commit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MediaModal;
