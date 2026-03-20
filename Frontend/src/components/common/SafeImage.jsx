import { useState } from 'react';
import { MdImage } from 'react-icons/md';

/**
 * Senior-level Robust Image Component.
 * Automatically cleans backend URLs, handles proxying,
 * and provides a fallback skeleton if the image is missing (404/500).
 */
const SafeImage = ({ src, alt, className, ...props }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  let cleanSrc = src;
  if (typeof src === 'string') {
    cleanSrc = src.replace(/https?:\/\/localhost:8080/i, '');
    
    // Skip transformation for special URLs (blobs, data-uris, etc)
    const isSpecial = cleanSrc.startsWith('/api/') || 
                      cleanSrc.startsWith('data:') || 
                      cleanSrc.startsWith('blob:') || 
                      cleanSrc.startsWith('http');

    if (!isSpecial && cleanSrc.length > 0) {
        if (cleanSrc.startsWith('media/')) cleanSrc = '/api/' + cleanSrc;
        else if (cleanSrc.startsWith('/media/')) cleanSrc = '/api' + cleanSrc;
        else if (!cleanSrc.startsWith('/')) cleanSrc = '/api/media/' + cleanSrc;
    }
  }

  // Fallback for errors or missing source
  if (error || !src) {
    return (
      <div className={`${className} bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700`}>
        <MdImage className="text-slate-300 dark:text-slate-600 text-xl sm:text-2xl" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center">
            <div className="w-1/2 h-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      )}
      <img 
        src={cleanSrc} 
        alt={alt} 
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`} 
        onLoad={() => setLoading(false)}
        onError={() => {
          console.warn(`SafeImage: Failed to load ${cleanSrc}`);
          setError(true);
          setLoading(false);
        }} 
        loading="lazy"
        {...props}
      />
    </div>
  );
};

export default SafeImage;
