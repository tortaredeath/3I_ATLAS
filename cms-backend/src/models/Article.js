const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: Map,
    of: String,
    required: true,
    validate: {
      validator: function(v) {
        return v.has('zh') || v.has('en');
      },
      message: 'Article title must have at least one language (zh or en)'
    }
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  content: {
    type: Map,
    of: String,
    required: true
  },
  summary: {
    type: Map,
    of: String
  },
  author: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String
    },
    bio: {
      type: Map,
      of: String
    }
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  category: {
    type: String,
    required: true,
    enum: ['news', 'announcement', 'research', 'technology', 'event-report', 'other']
  },
  featuredImage: {
    url: {
      type: String
    },
    alt: {
      type: Map,
      of: String
    },
    caption: {
      type: Map,
      of: String
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: Map,
      of: String
    },
    caption: {
      type: Map,
      of: String
    }
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  seoMeta: {
    description: {
      type: Map,
      of: String
    },
    keywords: [String]
  },
  relatedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for reading time estimation
articleSchema.virtual('readingTime').get(function() {
  const contentZh = this.content.get('zh') || '';
  const contentEn = this.content.get('en') || '';
  const totalWords = (contentZh.length / 2) + (contentEn.split(' ').length); // Rough estimation for Chinese + English
  return Math.ceil(totalWords / 200); // Assume 200 words per minute
});

// Indexes for better performance
articleSchema.index({ publishDate: -1 });
articleSchema.index({ isPublished: 1, isFeatured: -1, isPinned: -1 });
articleSchema.index({ slug: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ 'title.zh': 'text', 'title.en': 'text', 'content.zh': 'text', 'content.en': 'text' });

// Pre-save middleware to generate slug
articleSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('title')) {
    const titleEn = this.title.get('en') || this.title.get('zh') || '';
    this.slug = titleEn.toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .trim();
  }
  next();
});

module.exports = mongoose.model('Article', articleSchema);