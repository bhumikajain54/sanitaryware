/**
 * Formats a media source string into a valid URL or Data URI.
 * Handles prepending /api/media to filenames and formatting raw base64 data.
 */
export const formatMediaUrl = (src) => {
  if (!src || typeof src !== 'string') return '/Logo2.png';

  const trimmed = src.trim();
  let cleanSrc = trimmed.replace(/https?:\/\/localhost:8080/i, '');

  // Detect raw base64 data (if prefix is missing)
  // Common JPEG base64 starts with /9j/ or 9j/
  const isBase64 = cleanSrc.length > 50 && (
    cleanSrc.startsWith('iVBORw0KG') || // PNG
    cleanSrc.startsWith('/9j/') ||      // JPEG
    cleanSrc.startsWith('9j/') ||       // JPEG (no leading slash)
    cleanSrc.startsWith('R0lGODlh') ||  // GIF
    cleanSrc.startsWith('UklGR') ||     // WEBP
    cleanSrc.startsWith('9kAW3')        // Specialized / Watermarked formats
  );

  // Recovery: If it's exceptionally long and has no whitespace, it's almost certainly broken Base64
  const isLikelyBase64 = !isBase64 && cleanSrc.length > 200 && !/\s/.test(cleanSrc);

  if ((isBase64 || isLikelyBase64) && !cleanSrc.startsWith('data:')) {
    // If it starts with a slash but is clearly base64 (/9j/...), we treat it as raw data
    if (cleanSrc.startsWith('iVBORw0KG')) return `data:image/png;base64,${cleanSrc}`;
    if (cleanSrc.startsWith('/9j/') || cleanSrc.startsWith('9j/')) {
        // If it starts with /9j/, it might have been intended as a path, but it's raw data.
        // We strip the leading slash if it exists before adding the prefix for maximum compatibility.
        const dataStr = cleanSrc.startsWith('/') ? cleanSrc.substring(1) : cleanSrc;
        return `data:image/jpeg;base64,${dataStr}`;
    }
    if (cleanSrc.startsWith('R0lGODlh')) return `data:image/gif;base64,${cleanSrc}`;
    if (cleanSrc.startsWith('UklGR')) return `data:image/webp;base64,${cleanSrc}`;
    
    // Fallback for 9kAW3 or other raw formats
    return `data:image/jpeg;base64,${cleanSrc}`;
  }

  // Skip transformation for special URLs (blobs, data-uris, http, etc)
  const isSpecial = cleanSrc.startsWith('/api/') || 
                    cleanSrc.startsWith('data:') || 
                    cleanSrc.startsWith('blob:') || 
                    cleanSrc.startsWith('http') ||
                    isBase64 || isLikelyBase64;

  if (!isSpecial && cleanSrc.length > 0) {
    if (cleanSrc.startsWith('media/')) return `/api/${cleanSrc}`;
    if (cleanSrc.startsWith('/media/')) return `/api${cleanSrc}`;
    if (!cleanSrc.startsWith('/')) return `/api/media/${cleanSrc}`;
  }

  return cleanSrc || '/Logo2.png';
};
