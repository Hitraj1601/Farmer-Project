const { isCloudinaryConfigured, uploadToCloudinary } = require("../config/cloudinary");

/**
 * High-level helper to process uploaded image files via Multer + Cloudinary.
 * If Cloudinary is configured, uploads directly to Cloudinary and returns the HTTPS URL.
 * If Cloudinary is not configured yet, gracefully falls back to local uploads directory.
 *
 * @param {Object} file - Multer file object (req.file)
 * @param {String} folder - Cloudinary folder (e.g., 'farmer-marketplace/crops')
 * @returns {Promise<String|null>} - Secure Cloudinary URL or local file path URL
 */
const uploadImage = async (file, folder = "farmer-marketplace") => {
  if (!file) return null;

  if (isCloudinaryConfigured()) {
    try {
      const cloudinaryUrl = await uploadToCloudinary(file, folder);
      return cloudinaryUrl;
    } catch (error) {
      console.error("Cloudinary upload failed, falling back to local file if available:", error.message);
      if (file.filename) {
        return `/uploads/${file.filename}`;
      }
      throw error;
    }
  }

  // Fallback to local storage path
  if (file.filename) {
    return `/uploads/${file.filename}`;
  }

  return null;
};

module.exports = {
  uploadImage,
};
