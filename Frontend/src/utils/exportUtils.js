/**
 * Utility to download a file from a Blob or URL
 * @param {Blob|string} data - The blob data or URL to download
 * @param {string} filename - The name of the file
 */
export const downloadFile = (data, filename) => {
    if (!data) return;

    const url = data instanceof Blob ? window.URL.createObjectURL(data) : data;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    if (data instanceof Blob) {
        window.URL.revokeObjectURL(url);
    }
};

/**
 * Common export handler for admin pages
 * @param {Promise} exportPromise - The promise from the export API call
 * @param {string} prefix - Filename prefix
 * @param {string} extension - File extension (default: csv)
 * @param {Object} toast - Admin toast object (success/error functions)
 */
export const handleExportDownload = async (exportPromise, prefix, extension = 'csv', toast = null) => {
    try {
        const filename = `${prefix}_${new Date().toISOString().split('T')[0]}.${extension}`;
        const blob = await exportPromise;

        if (!(blob instanceof Blob)) {
            throw new Error('Response is not a blob');
        }

        downloadFile(blob, filename);
        if (toast?.success) toast.success(`${prefix} exported successfully`);
    } catch (err) {
        console.error(`Export failed for ${prefix}:`, err);
        if (toast?.error) toast.error(`Failed to export ${prefix}`);
    }
};
