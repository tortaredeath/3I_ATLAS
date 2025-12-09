const mongoose = require('mongoose');

const associationSchema = new mongoose.Schema({
  name: {
    type: Map,
    of: String,
    required: true
  },
  establishedYear: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear()
  },
  mission: {
    type: Map,
    of: String,
    required: true
  },
  vision: {
    type: Map,
    of: String
  },
  description: {
    type: Map,
    of: String,
    required: true
  },
  logo: {
    url: {
      type: String
    },
    alt: {
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
  members: [{
    name: {
      type: String,
      required: true
    },
    position: {
      type: Map,
      of: String,
      required: true
    },
    bio: {
      type: Map,
      of: String
    },
    photo: {
      type: String
    },
    email: {
      type: String
    },
    linkedIn: {
      type: String
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  contact: {
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String
    },
    address: {
      type: Map,
      of: String
    },
    website: {
      type: String
    },
    socialMedia: {
      facebook: String,
      twitter: String,
      linkedin: String,
      instagram: String,
      youtube: String
    }
  },
  achievements: [{
    title: {
      type: Map,
      of: String,
      required: true
    },
    description: {
      type: Map,
      of: String
    },
    year: {
      type: Number,
      required: true
    },
    image: {
      type: String
    }
  }],
  statistics: {
    memberCount: {
      type: Number,
      default: 0
    },
    projectCount: {
      type: Number,
      default: 0
    },
    partnerCount: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure only one active association document
associationSchema.index({ isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

// Sort members by order
associationSchema.pre('save', function(next) {
  if (this.members && this.members.length > 0) {
    this.members.sort((a, b) => a.order - b.order);
  }
  next();
});

module.exports = mongoose.model('Association', associationSchema);