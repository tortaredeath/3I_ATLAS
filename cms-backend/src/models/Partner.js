const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  displayName: {
    type: Map,
    of: String
  },
  description: {
    type: Map,
    of: String
  },
  logo: {
    url: {
      type: String,
      required: true
    },
    alt: {
      type: Map,
      of: String
    }
  },
  websiteUrl: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['technology', 'academic', 'industry', 'government', 'nonprofit', 'media', 'sponsor', 'other']
  },
  partnershipType: {
    type: String,
    required: true,
    enum: ['strategic', 'technology', 'academic', 'media', 'sponsor', 'vendor', 'community']
  },
  partnershipLevel: {
    type: String,
    enum: ['platinum', 'gold', 'silver', 'bronze', 'standard'],
    default: 'standard'
  },
  contact: {
    name: {
      type: String
    },
    email: {
      type: String
    },
    phone: {
      type: String
    },
    position: {
      type: String
    }
  },
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String
  },
  collaborationHistory: [{
    project: {
      type: String,
      required: true
    },
    description: {
      type: Map,
      of: String
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'cancelled'],
      default: 'active'
    }
  }],
  displaySettings: {
    showOnHomepage: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  partnershipDetails: {
    startDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    renewalDate: {
      type: Date
    },
    contractValue: {
      type: Number,
      min: 0
    },
    benefits: [{
      type: String
    }]
  },
  metrics: {
    referralTraffic: {
      type: Number,
      default: 0
    },
    leadGenerated: {
      type: Number,
      default: 0
    },
    eventCollaborations: {
      type: Number,
      default: 0
    }
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

// Virtual for partnership status
partnerSchema.virtual('partnershipStatus').get(function() {
  const now = new Date();
  if (this.partnershipDetails.endDate && now > this.partnershipDetails.endDate) {
    return 'expired';
  }
  if (this.partnershipDetails.renewalDate && now > this.partnershipDetails.renewalDate) {
    return 'renewal_due';
  }
  return 'active';
});

// Indexes for performance
partnerSchema.index({ category: 1, partnershipType: 1 });
partnerSchema.index({ isActive: 1, 'displaySettings.showOnHomepage': 1, 'displaySettings.order': 1 });
partnerSchema.index({ 'displaySettings.featured': -1, 'displaySettings.order': 1 });

module.exports = mongoose.model('Partner', partnerSchema);