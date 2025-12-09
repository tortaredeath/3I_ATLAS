const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: Map,
    of: String,
    required: true,
    validate: {
      validator: function(v) {
        return v.has('zh') || v.has('en');
      },
      message: 'Event name must have at least one language (zh or en)'
    }
  },
  date: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  location: {
    type: Map,
    of: String,
    required: true
  },
  description: {
    type: Map,
    of: String,
    required: true
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
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  category: {
    type: String,
    enum: ['conference', 'workshop', 'seminar', 'social', 'other'],
    default: 'other'
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  registrationUrl: {
    type: String
  },
  maxParticipants: {
    type: Number
  },
  tags: [String],
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

// Virtual for event status
eventSchema.virtual('status').get(function() {
  const now = new Date();
  if (now < this.date) {
    return 'upcoming';
  } else if (this.endDate && now <= this.endDate) {
    return 'ongoing';
  } else if (!this.endDate && now.toDateString() === this.date.toDateString()) {
    return 'ongoing';
  } else {
    return 'past';
  }
});

// Index for better query performance
eventSchema.index({ date: -1 });
eventSchema.index({ isPublished: 1, isFeatured: -1 });
eventSchema.index({ 'name.zh': 'text', 'name.en': 'text', 'description.zh': 'text', 'description.en': 'text' });

module.exports = mongoose.model('Event', eventSchema);