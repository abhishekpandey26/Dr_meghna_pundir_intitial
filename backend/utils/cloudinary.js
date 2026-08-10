const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to create Cloudinary storage for different folders
const createCloudinaryStorage = (folderName) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folderName,
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4'],
      transformation: [
        { width: 1920, crop: 'limit' },
        { quality: 'auto', fetch_format: 'webp' }
      ]
    }
  });
};

module.exports = {
  cloudinary,
  createCloudinaryStorage
};
