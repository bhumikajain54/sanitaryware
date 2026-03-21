import { useState, useCallback, useMemo } from 'react';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdImage, 
  MdSearch, 
  MdRefresh, 
  MdGridView, 
  MdList,
  MdCloudUpload,
  MdCheckCircle
} from 'react-icons/md';
import MediaModal from '../../components/admin/MediaModal';
import { 
  useAdminFetch, 
  useAdminSearch, 
  useAdminPagination, 
  useAdminToast,
  useAdminModal,
  useAdminConfirm
} from '../../hooks/useAdmin';
import adminService from '../../services/adminService';

const AdminMedia = () => {
  const { success, error, info } = useAdminToast();
  const { confirm, isConfirming, confirmData, handleConfirm, handleCancel } = useAdminConfirm();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Data fetching
  const fetchMedia = useCallback(() => adminService.getMediaFiles(), []);
  const { data: initialMedia, loading, refetch } = useAdminFetch(
    fetchMedia,
    []
  );

  // Stabilize data items and transform strings to objects if necessary
  const mediaItems = useMemo(() => {
    if (!initialMedia) return [];
    
    // Normalize data: backend returns List<String> (filenames)
    // but the component expects objects with id, url, fileName, etc.
    const normalized = initialMedia.map((item, index) => {
      if (typeof item === 'string') {
        const type = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(item) ? 'Image' : 'Document';
        return {
          id: item, // Filename is the identifier for deletion
          fileName: item,
          url: `/api/media/${item}`,
          type: type,
          uploaded: 'Recent' // Backend doesn't provide date in the list
        };
      }
      return item;
    });

    // Filter out duplicates based on ID or URL
    const uniqueFiles = [];
    const seen = new Set();
    
    normalized.forEach(file => {
      const identifier = file.id || file.url || file.fileName;
      if (!seen.has(identifier)) {
        seen.add(identifier);
        uniqueFiles.push(file);
      }
    });
    
    return uniqueFiles;
  }, [initialMedia]);
  const searchKeys = useMemo(() => ['fileName', 'type', 'url'], []);
  const { searchTerm, setSearchTerm, filteredItems: searchedMedia } = useAdminSearch(
    mediaItems,
    searchKeys
  );

  // Pagination
  const { 
    currentItems: mediaFiles, 
    currentPage, 
    totalPages, 
    goToPage, 
    nextPage, 
    prevPage,
    hasNextPage,
    hasPrevPage 
  } = useAdminPagination(searchedMedia, 12);

  // Modal State
  const { isOpen, modalData: editingMedia, openModal, closeModal } = useAdminModal();
  const handleDeleteMedia = async (mediaId) => {
    if (!mediaId || mediaId === 'undefined') {
      error('Cannot delete: Invalid media identifier');
      return;
    }

    const confirmed = await confirm({
      title: 'Delete Media',
      message: 'Are you sure you want to delete this file? This might break links in products or posts.',
      confirmText: 'Delete',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await adminService.deleteMedia(mediaId);
        success('Media file deleted');
        refetch();
      } catch (err) {
        error('Failed to delete media');
      }
    }
  };

  const handleSaveMedia = useCallback(async (data) => {
    try {
      if (!data.file && !editingMedia) {
        error('Please select a file to upload');
        return;
      }

      if (data.file) {
        const formData = new FormData();
        formData.append('file', data.file);
        // If the user changed the filename in the modal, we can't easily change it on disk
        // without a backend update endpoint, so we just upload the file as is.
        await adminService.uploadMedia(formData);
        success('Media uploaded successfully');
      } else {
        // Fallback or metadata update (if backend supported it)
        info('Metadata updates are not yet supported by the server');
      }
      
      refetch();
      closeModal();
    } catch (err) {
      error(err.message || 'Failed to save media');
    }
  }, [success, refetch, closeModal, error, info, editingMedia]);

  return (
    <div className="bg-[var(--admin-bg-primary)] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-1 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-[14px] sm:text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight tracking-tight">Media Library</h1>
            <p className="text-[9px] sm:text-sm font-black text-slate-500 mt-0.5 sm:mt-1 uppercase tracking-widest opacity-60">Manage your images, banners, and multimedia assets.</p>
          </div>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-6 sm:py-2.5 bg-teal-600 text-white font-black rounded-lg sm:rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 active:scale-95 text-[9px] sm:text-[10px] uppercase tracking-widest whitespace-nowrap"
          >
            <MdCloudUpload className="text-sm sm:text-xl" />
            <span className="hidden sm:inline">Upload Media</span>
            <span className="sm:hidden">Upload</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-xl sm:rounded-2xl p-2 sm:p-4 mb-4 sm:mb-6 flex items-center justify-between gap-2 sm:gap-4">
          <div className="relative flex-1 w-full max-w-[150px] sm:max-w-md group">
            <MdSearch className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] sm:text-xl group-focus-within:text-teal-500 transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2.5 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-lg sm:rounded-xl outline-none transition-all dark:text-white text-[10px] sm:text-sm font-medium"
            />
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="bg-[var(--admin-bg-primary)] p-0.5 sm:p-1.5 rounded-lg sm:rounded-2xl flex items-center gap-0.5">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1 sm:p-2 rounded-md sm:rounded-xl transition-all ${viewMode === 'grid' ? 'bg-[var(--admin-bg-secondary)] text-teal-600 dark:text-teal-400 shadow-sm sm:shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              >
                <MdGridView className="text-sm sm:text-xl" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1 sm:p-2 rounded-md sm:rounded-xl transition-all ${viewMode === 'list' ? 'bg-[var(--admin-bg-secondary)] text-teal-600 dark:text-teal-400 shadow-sm sm:shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              >
                <MdList className="text-sm sm:text-xl" />
              </button>
            </div>

          </div>
        </div>

        {/* Media Grid/List Content */}
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-24 sm:h-44 bg-[var(--admin-bg-primary)] animate-pulse rounded-xl sm:rounded-[2rem]"></div>
            ))}
          </div>
        ) : mediaFiles.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4 animate-fadeIn">
              {mediaFiles.map((file, index) => (
                <div key={file.id || index} className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-xl sm:rounded-[2rem] overflow-hidden relative group shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="aspect-square bg-[var(--admin-bg-primary)]/50 flex items-center justify-center p-2 sm:p-6">
                     {(() => {
                        const isImage = file.type?.toLowerCase().includes('image') || 
                                      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.fileName || '') ||
                                      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.url || '');
                        
                        return isImage ? (
                          <img 
                            src={file.url} 
                            alt={file.fileName} 
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" 
                            onError={(e) => {
                              e.target.onerror = null; 
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                        ) : null;
                     })()}
                     <MdImage className="text-2xl sm:text-5xl text-slate-200 dark:text-slate-700 hidden" style={{ display: 'none' }} />
                     {/* Fallback if not image or error */}
                     <MdImage className={`text-2xl sm:text-5xl text-slate-200 dark:text-slate-700 ${
                        (file.type?.toLowerCase().includes('image') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.fileName || '')) ? 'hidden' : 'block'
                     }`} />
                  </div>
                  <div className="p-1.5 sm:p-3 border-t border-[var(--border-subtle)] bg-white/80 dark:bg-slate-700/80 backdrop-blur-md">
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-700 dark:text-slate-300 truncate uppercase tracking-tight">{file.fileName}</p>
                    <p className="text-[7px] sm:text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 sm:mt-1 uppercase tracking-widest">{file.uploaded}</p>
                  </div>
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-3">
                    <button 
                      onClick={() => openModal(file)}
                      className="p-1.5 sm:p-3 bg-white text-teal-600 rounded-md sm:rounded-2xl hover:bg-teal-50 transform hover:scale-110 transition-all shadow-xl"
                    >
                      <MdEdit className="text-[10px] sm:text-xl" />
                    </button>
                    <button 
                      onClick={() => handleDeleteMedia(file.id)}
                      className="p-1.5 sm:p-3 bg-white text-red-600 rounded-md sm:rounded-2xl hover:bg-red-50 transform hover:scale-110 transition-all shadow-xl"
                    >
                      <MdDelete className="text-[10px] sm:text-xl" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-xl sm:rounded-[2rem] overflow-hidden shadow-md">
               <div className="overflow-x-auto scrollbar-hide">
                 <table className="w-full border-separate border-spacing-0">
                   <thead>
                      <tr className="bg-[var(--admin-bg-primary)]/50">
                         <th className="px-1.5 sm:px-6 py-2 sm:py-4 text-[8px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left whitespace-nowrap">Preview</th>
                         <th className="px-1.5 sm:px-6 py-2 sm:py-4 text-[8px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left whitespace-nowrap">File Name</th>
                         <th className="px-1.5 sm:px-6 py-2 sm:py-4 text-[8px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left whitespace-nowrap">Type</th>
                         <th className="px-1.5 sm:px-6 py-2 sm:py-4 text-[8px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left whitespace-nowrap">URL</th>
                         <th className="px-1.5 sm:px-6 py-2 sm:py-4 text-[8px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left whitespace-nowrap">Uploaded</th>
                         <th className="px-1.5 sm:px-6 py-2 sm:py-4 text-[8px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-right whitespace-nowrap">Actions</th>
                      </tr>
                   </thead>
                   <tbody>
                      {mediaFiles.map((file, index) => (
                        <tr key={file.id || index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                           <td className="px-1.5 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                             <div className="w-6 h-6 sm:w-12 sm:h-12 bg-[var(--admin-bg-primary)] rounded-md sm:rounded-2xl overflow-hidden flex items-center justify-center ring-1 sm:ring-2 ring-slate-100 dark:ring-slate-800 shadow-sm sm:shadow-md">
                                {file.type?.toLowerCase() === 'image' ? <img src={file.url} className="w-full h-full object-cover" alt="" /> : <MdImage className="text-xs sm:text-2xl text-slate-300 dark:text-slate-600" />}
                             </div>
                           </td>
                           <td className="px-1.5 sm:px-6 py-2 sm:py-4 font-black text-[var(--admin-text-primary)] text-[9px] sm:text-sm uppercase tracking-tight whitespace-nowrap">{file.fileName}</td>
                           <td className="px-1.5 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                              <span className="px-1 py-0.5 sm:px-2.5 sm:py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-md sm:rounded-lg text-[7px] sm:text-[10px] font-black uppercase tracking-widest">
                                {file.type}
                              </span>
                           </td>
                           <td className="px-1.5 sm:px-6 py-2 sm:py-4 text-[8px] sm:text-[10px] text-teal-600 dark:text-teal-400 font-bold max-w-[60px] sm:max-w-[150px] truncate italic whitespace-nowrap">{file.url}</td>
                           <td className="px-1.5 sm:px-6 py-2 sm:py-4 text-[7px] sm:text-[10px] text-[var(--admin-text-secondary)] font-bold uppercase tracking-widest whitespace-nowrap">{file.uploaded}</td>
                           <td className="px-1.5 sm:px-6 py-2 sm:py-4 text-right whitespace-nowrap">
                             <div className="flex items-center justify-end gap-0.5">
                                <button onClick={() => openModal(file)} className="p-1.5 sm:p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-md sm:rounded-xl transition-all"><MdEdit className="text-[10px] sm:text-xl" /></button>
                                <button onClick={() => handleDeleteMedia(file.id)} className="p-1.5 sm:p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md sm:rounded-xl transition-all"><MdDelete className="text-[10px] sm:text-xl" /></button>
                             </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )
        ) : (
          <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-xl sm:rounded-[3rem] p-8 sm:p-24 text-center animate-fadeIn shadow-lg">
             <div className="w-16 h-16 sm:w-32 sm:h-32 bg-[var(--admin-bg-primary)] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-8 shadow-inner">
                <MdImage className="text-3xl sm:text-7xl text-slate-200 dark:text-slate-700" />
             </div>
             <h3 className="text-sm sm:text-2xl font-black text-[var(--admin-text-primary)] uppercase tracking-tight">No media found</h3>
             <p className="text-[10px] sm:text-[var(--admin-text-secondary)] mt-2 sm:mt-4 max-w-md mx-auto font-medium italic">Your media library is empty or no files match your search criteria.</p>
             <button 
                onClick={() => openModal()} 
                className="mt-6 sm:mt-10 px-6 sm:px-10 py-2 sm:py-4 bg-teal-600 text-white font-black rounded-lg sm:rounded-2xl hover:bg-teal-700 transition-all shadow-xl shadow-teal-500/30 active:scale-95 text-[9px] sm:text-xs uppercase tracking-widest inline-flex items-center gap-2 sm:gap-3"
              >
                <MdCloudUpload className="text-sm sm:text-2xl" />
                <span>Upload Now</span>
             </button>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && totalPages > 1 && (
          <div className="px-2 sm:px-6 py-4 sm:py-12 flex items-center justify-between border-t border-[var(--border-subtle)] mt-4 sm:mt-12 bg-slate-50/30 dark:bg-slate-800/20 rounded-b-2xl">
            <p className="text-[8px] sm:text-[10px] text-[var(--admin-text-secondary)] font-black uppercase tracking-widest">
              <span className="text-teal-600">{mediaFiles.length}</span> of <span className="text-teal-600">{searchedMedia.length}</span>
            </p>
            <div className="flex items-center gap-1.5 sm:gap-3">
              <button
                onClick={prevPage}
                disabled={!hasPrevPage}
                className={`px-2 py-1 sm:px-4 sm:py-2 border sm:border-2 border-[var(--border-main)] text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded-md sm:rounded-xl transition-all ${!hasPrevPage ? 'opacity-30 cursor-not-allowed' : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-primary)]'}`}
              >
                Prev
              </button>
               <div className="hidden sm:flex items-center gap-2">
                 {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20 scale-110' : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-primary)]'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={nextPage}
                disabled={!hasNextPage}
                className={`px-2 py-1 sm:px-4 sm:py-2 border sm:border-2 border-[var(--border-main)] text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded-md sm:rounded-xl transition-all ${!hasNextPage ? 'opacity-30 cursor-not-allowed' : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-primary)]'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Media Modal */}
      {isOpen && (
        <MediaModal
          media={editingMedia}
          onClose={closeModal}
          onSave={handleSaveMedia}
        />
      )}

      {/* Confirmation Modal */}
      {isConfirming && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 bg-slate-900/60 backdrop-blur-sm transition-all">
          <div className="bg-[var(--admin-bg-secondary)] rounded-2xl p-4 sm:p-8 max-w-[280px] sm:max-w-sm w-full shadow-2xl border border-[var(--border-main)] transform transition-all animate-fadeIn">
            <div className="text-center">
              <div className={`w-12 h-12 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg transform transition-all hover:scale-110 ${
                confirmData.type === 'danger' 
                ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 shadow-rose-500/10' 
                : 'bg-teal-50 dark:bg-teal-900/20 text-teal-500 shadow-teal-500/10'
              }`}>
                {confirmData.type === 'danger' ? <MdDelete className="text-2xl sm:text-4xl" /> : <MdCheckCircle className="text-2xl sm:text-4xl" />}
              </div>
              <h1 className="text-[12px] sm:text-xl font-black text-[var(--admin-text-primary)] mb-1 sm:mb-2 uppercase tracking-tight leading-tight">{confirmData.title}</h1>
              <p className="text-[9px] sm:text-sm font-medium text-[var(--admin-text-secondary)] mb-6 sm:mb-8 leading-relaxed italic">{confirmData.message}</p>
              <div className="flex items-center gap-2 sm:gap-4">
                <button 
                  onClick={handleCancel}
                  className="flex-1 py-2 sm:py-3.5 px-3 sm:px-6 border-2 border-[var(--border-subtle)] text-slate-500 font-bold rounded-lg sm:rounded-2xl hover:bg-[var(--admin-bg-primary)] transition-all uppercase tracking-widest text-[8px] sm:text-[10px]"
                >
                  Cancel
                </button>
                <button 
                   onClick={handleConfirm} 
                   className={`flex-1 py-2 sm:py-3.5 px-3 sm:px-6 font-bold rounded-lg sm:rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-widest text-[8px] sm:text-[10px] ${
                     confirmData.type === 'danger' 
                     ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20' 
                     : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/20'
                   }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMedia;
