const cloudinary = require("cloudinary").v2;

/**
 * Checks if Cloudinary configuration is present in environment variables.
 * Supports both CLOUDINARY_URL and individual credentials (CLOUD_NAME, API_KEY, API_SECRET).
 */
const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET)
  );
};

// Configure Cloudinary SDK dynamically based on environment
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
  });
} else if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Uploads a multer file object to Cloudinary.
 * Handles both disk files (file.path) and memory buffers (file.buffer).
 *
 * @param {Object} file - Express request file object from Multer
 * @param {String} folder - Cloudinary folder destination
 * @returns {Promise<String>} - Secure Cloudinary HTTPS URL
 */
const uploadToCloudinary = (file, folder = "farmer-marketplace") => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(
        new Error(
          "Cloudinary is not configured. Please set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file."
        )
      );
    }

    const options = {
      folder,
      resource_type: "auto",
    };

    if (file.path) {
      cloudinary.uploader.upload(file.path, options, (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      });
    } else if (file.buffer) {
      const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      });
      stream.end(file.buffer);
    } else {
      reject(new Error("Invalid file object: Neither file path nor file buffer found."));
    }
  });
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadToCloudinary,
};
