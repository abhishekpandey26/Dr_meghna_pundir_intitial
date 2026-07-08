const mongoose = require('mongoose');

const InstagramPostSchema = new mongoose.Schema({
  instagramUrl: { 
    type: String, 
    required: true 
  },
  mediaType: { 
    type: String, 
    enum: ['image', 'reel'], 
    default: 'image' 
  },
  thumbnailUrl: { 
    type: String 
  },
  fullMediaUrl: { 
    type: String 
  },
  caption: { 
    type: String 
  },
  order: { 
    type: Number, 
    default: 0 
  },
  isPublished: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('InstagramPost', InstagramPostSchema);
