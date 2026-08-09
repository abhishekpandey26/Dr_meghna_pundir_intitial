const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const InstagramPost = require('../models/InstagramPost');
const { createCloudinaryStorage, cloudinary } = require('../utils/cloudinary');

// Multer storage configuration for instagram media using Cloudinary
const storage = createCloudinaryStorage('dermelixir_instagram');
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Helper to parse Instagram post/reel URLs and extract embed + media cover URLs
const parseInstagramUrl = (url) => {
  if (!url) return null;
  // Regex to capture shortcode from /p/, /reel/, or /tv/ URLs
  const regex = /instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i;
  const match = url.match(regex);
  if (match && match[1]) {
    const shortcode = match[1];
    return {
      shortcode,
      embedUrl: `https://www.instagram.com/p/${shortcode}/embed/`,
      thumbnailUrl: `https://www.instagram.com/p/${shortcode}/media/?size=l`
    };
  }
  return null;
};

// Helper to download Instagram thumbnail image to bypass CORP restriction and upload to Cloudinary
const downloadThumbnail = async (shortcode) => {
  try {
    const response = await axios({
      method: 'get',
      url: `https://www.instagram.com/p/${shortcode}/media/?size=l`,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    return new Promise((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'dermelixir_instagram' },
        (error, result) => {
          if (error) {
            console.error('Error uploading thumbnail to Cloudinary:', error);
            resolve(null);
          } else {
            resolve(result.secure_url);
          }
        }
      );
      response.data.pipe(uploadStream);
    });
  } catch (err) {
    console.error('Error downloading Instagram thumbnail:', err.message);
    return null;
  }
};

/**
 * @route GET /api/instagram-posts
 * @desc Public: Get paginated published posts
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const posts = await InstagramPost.find({ isPublished: true })
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await InstagramPost.countDocuments({ isPublished: true });

    res.json({
      posts,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/instagram-posts/admin
 * @desc Admin only: Get all posts
 */
router.get('/admin', async (req, res) => {
  try {
    const posts = await InstagramPost.find().sort({ order: 1, createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/instagram-posts/admin
 * @desc Admin only: Add a post (can upload media OR paste an instagram URL)
 */
router.post('/admin', upload.single('mediaFile'), async (req, res) => {
  try {
    const { mediaType, caption, order, isPublished, instagramUrl, directUrl } = req.body;
    let fullMediaUrl = directUrl || '';
    let thumbnailUrl = directUrl || '';
    let parsedUrl = instagramUrl || '';

    // If an Instagram Post link is entered
    if (parsedUrl) {
      const parsed = parseInstagramUrl(parsedUrl);
      if (parsed) {
        fullMediaUrl = parsed.embedUrl;
        if (req.file) {
          // If the admin uploaded a custom thumbnail file, use it
          thumbnailUrl = req.file.path; // Cloudinary URL
        } else {
          // Otherwise, auto-download the Instagram cover thumbnail
          const localThumb = await downloadThumbnail(parsed.shortcode);
          thumbnailUrl = localThumb || parsed.thumbnailUrl;
        }
      } else {
        return res.status(400).json({ error: 'Invalid Instagram URL format.' });
      }
    } else if (req.file) {
      // Direct raw media upload fallback
      fullMediaUrl = req.file.path; // Cloudinary URL
      thumbnailUrl = req.file.path;

      if (mediaType === 'reel') {
        // Cloudinary automatically generates thumbnails for videos by replacing extension
        thumbnailUrl = fullMediaUrl.replace(/\.(mp4|mov|avi|wmv)$/i, '.jpg');
      }
    }

    if (!fullMediaUrl) {
      return res.status(400).json({ error: 'Please enter an Instagram post link, direct media URL, or upload a file.' });
    }

    const newPost = await InstagramPost.create({
      instagramUrl: parsedUrl || fullMediaUrl,
      mediaType: mediaType || 'image',
      thumbnailUrl,
      fullMediaUrl,
      caption: caption || '',
      order: parseInt(order) || 0,
      isPublished: isPublished === 'true' || isPublished === true
    });

    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route PUT /api/instagram-posts/admin/:id
 * @desc Admin only: Update order, publishing, caption, etc
 */
router.put('/admin/:id', async (req, res) => {
  try {
    const updated = await InstagramPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Instagram post not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route DELETE /api/instagram-posts/admin/:id
 * @desc Admin only: Delete post
 */
router.delete('/admin/:id', async (req, res) => {
  try {
    const deleted = await InstagramPost.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Instagram post not found' });
    }
    res.json({ success: true, message: 'Instagram post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
