import { useState } from 'react';
import { MdImage } from 'react-icons/md';
import { formatMediaUrl } from '../../utils/mediaUtils';

/**
 * Senior-level Robust Image Component.
 * Automatically cleans backend URLs, handles proxying,
 * and provides a fallback skeleton if the image is missing (404/500).
 */
const SafeImage = ({ src, alt, className, ...props }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const cleanSrc = formatMediaUrl(src);

  // Fallback for errors or missing source
  if (error || !src) {
    const placeholderText = encodeURIComponent(alt || 'Product Image');
    const placeholderUrl = `https://placehold.co/400x400/f1f5f9/64748b?text=${placeholderText}`;
    
    return (
      <div className={`${className} bg-slate-50 flex flex-col items-center justify-center border border-slate-100 overflow-hidden relative group`}>
        <img 
          src={placeholderUrl} 
          alt="Placeholder"
          className="w-full h-full object-cover opacity-50 grayscale"
        />
        <div className="absolute inset-0 flex items-center justify-center">
            <MdImage className="text-slate-300 text-3xl opacity-40 group-hover:scale-110 transition-transform" />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-slate-50 animate-pulse flex items-center justify-center z-10">
            <div className="w-1/3 h-1/3 bg-slate-200 rounded-full opacity-20" />
        </div>
      )}
      <img 
        src={cleanSrc} 
        alt={alt} 
        className={`w-full h-full object-cover ${loading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} transition-all duration-500`} 
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
