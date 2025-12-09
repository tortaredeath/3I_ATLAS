const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: Map,
    of: String
  },
  description: {
    type: Map,
    of: String
  },
  image: {
    desktop: {
      type: String,
      required: true
    },
    mobile: {
      type: String
    },
    tablet: {
      type: String
    }
  },
  alt: {
    type: Map,
    of: String
  },
  link: {
    url: {
      type: String
    },
    text: {
      type: Map,
      of: String
    },
    target: {
      type: String,
      enum: ['_self', '_blank', '_parent', '_top'],
      default: '_self'
    }
  },
  displayPeriod: {
    startDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  displaySettings: {
    showOnPages: [{
      type: String,
      enum: ['homepage', 'events', 'articles', 'about', 'all'],
      default: 'homepage'
    }],
    position: {
      type: String,
      enum: ['top', 'middle', 'bottom', 'sidebar'],
      default: 'top'
    },
    autoSlide: {
      type: Boolean,
      default: true
    },
    slideDuration: {
      type: Number,
      default: 5000, // milliseconds
      min: 1000,
      max: 30000
    }
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  clickCount: {
    type: Number,
    default: 0
  },
  impressionCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
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

// Virtual for banner status
bannerSchema.virtual('status').get(function() {
  const now = new Date();
  if (now < this.displayPeriod.startDate) {
    return 'scheduled';
  } else if (now >= this.displayPeriod.startDate && now <= this.displayPeriod.endDate) {
    return 'active';
  } else {
    return 'expired';
  }
});

// Virtual for click-through rate
bannerSchema.virtual('ctr').get(function() {
  return this.impressionCount > 0 ? (this.clickCount / this.impressionCount * 100).toFixed(2) : 0;
});

// Index for active banners query optimization
bannerSchema.index({ 
  isActive: 1, 
  'displayPeriod.startDate': 1, 
  'displayPeriod.endDate': 1,
  priority: -1 
});

// Middleware to validate end date is after start date
bannerSchema.pre('save', function(next) {
  if (this.displayPeriod.endDate <= this.displayPeriod.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

module.exports = mongoose.model('Banner', bannerSchema);