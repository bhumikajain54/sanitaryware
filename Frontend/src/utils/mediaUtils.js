/**
 * Formats a media source string into a valid URL or Data URI.
 * Handles prepending /api/media to filenames and formatting raw base64 data.
 */
export const formatMediaUrl = (src) => {
  if (!src || typeof src !== 'string') return '/Logo2.png';

  const trimmed = src.trim();
  // Strip common database character leaks and ensure base64 integrity
  let cleanSrc = trimmed.replace(/[\n\r\s]/g, '').replace(/https?:\/\/localhost:8080/i, '');

  // Handle existing data URIs by peeling the prefix for deep scanning
  let dataPrefix = "";
  if (cleanSrc.startsWith('data:')) {
      const commaIdx = cleanSrc.indexOf(',');
      if (commaIdx !== -1) {
          dataPrefix = cleanSrc.substring(0, commaIdx + 1);
          cleanSrc = cleanSrc.substring(commaIdx + 1);
      }
  }

  // 1. Deep Scan: Remove specialized Vivo/Oppo/Android metadata wrappers
  // These can be at the START or the END of the string.
  if (cleanSrc.includes('9kAW3') || cleanSrc.includes('XQB3dG1r')) {
      const metadataStartIdx = cleanSrc.indexOf('9kAW3');
      const jpegStartIdx = cleanSrc.indexOf('/9j/');
      const rawJpegStartIdx = cleanSrc.indexOf('9j/');
      
      // Case A: Image starts correctly but has junk at the end
      if ((jpegStartIdx === 0 || rawJpegStartIdx === 0) && metadataStartIdx > 0) {
          cleanSrc = cleanSrc.substring(0, metadataStartIdx);
      } 
      // Case B: Junk at the start, need to find the real image
      else if (jpegStartIdx !== -1) {
          cleanSrc = cleanSrc.substring(jpegStartIdx);
          dataPrefix = "data:image/jpeg;base64,"; 
      } else if (rawJpegStartIdx !== -1) {
          cleanSrc = cleanSrc.substring(rawJpegStartIdx);
          dataPrefix = "data:image/jpeg;base64,";
      }

      // Final cleanup: if metadata marker is still there at the very end, chop it
      const finalMetadataCheck = cleanSrc.indexOf('9kAW3');
      if (finalMetadataCheck > 50) { // Only if it's not the actual start of a raw-raw string
          cleanSrc = cleanSrc.substring(0, finalMetadataCheck);
      }
  }

  // Detect raw base64 data (if prefix is missing)
  const isBase64 = cleanSrc.length > 50 && (
    cleanSrc.startsWith('iVBORw0KG') || // PNG
    cleanSrc.startsWith('/9j/') ||      // JPEG
    cleanSrc.startsWith('9j/') ||       // JPEG (no leading slash)
    cleanSrc.startsWith('R0lGODlh') ||  // GIF
    cleanSrc.startsWith('UklGR')        // WEBP
  );

  // 2. Resolve RAW missing headers OR Re-apply peeled headers
  if (isBase64) {
    if (cleanSrc.startsWith('iVBORw0KG')) return `data:image/png;base64,${cleanSrc}`;
    if (cleanSrc.startsWith('/9j/') || cleanSrc.startsWith('9j/')) {
        const dataStr = cleanSrc.startsWith('/') ? cleanSrc.substring(1) : cleanSrc;
        return `data:image/jpeg;base64,${dataStr}`;
    }
    if (cleanSrc.startsWith('R0lGODlh')) return `data:image/gif;base64,${cleanSrc}`;
    if (cleanSrc.startsWith('UklGR')) return `data:image/webp;base64,${cleanSrc}`;
  }

  // If we peeled a prefix and cleaned the body, return the re-combined string
  if (dataPrefix && cleanSrc.length > 50) {
      return dataPrefix + cleanSrc;
  }

  // 3. Length Guard: If it's a suspiciously long raw string that missed markers
  if (cleanSrc.length > 200 && !dataPrefix && !cleanSrc.includes('/') && !cleanSrc.includes('http')) {
      return `data:image/jpeg;base64,${cleanSrc}`;
  }

  // Skip transformation for special URLs (blobs, data-uris, http, etc)
  const isSpecial = cleanSrc.startsWith('/api/') || 
                    dataPrefix || 
                    cleanSrc.startsWith('blob:') || 
                    cleanSrc.startsWith('http');

  if (!isSpecial && cleanSrc.length > 0) {
    if (cleanSrc.startsWith('media/')) return `/api/${cleanSrc}`;
    if (cleanSrc.startsWith('/media/')) return `/api${cleanSrc}`;
    if (!cleanSrc.startsWith('/')) return `/api/media/${cleanSrc}`;
  }

  return cleanSrc || '/Logo2.png';
};
