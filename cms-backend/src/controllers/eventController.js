const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      featured,
      published = true,
      search,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (published === 'true') {
      query.isPublished = true;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    // Status filter (upcoming, ongoing, past)
    if (status) {
      const now = new Date();
      switch (status) {
        case 'upcoming':
          query.date = { $gt: now };
          break;
        case 'past':
          query.date = { $lt: now };
          break;
        case 'ongoing':
          query.$and = [
            { date: { $lte: now } },
            { 
              $or: [
                { endDate: { $gte: now } },
                { endDate: { $exists: false } }
              ]
            }
          ];
          break;
      }
    }

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const events = await Event.find(query)
      .populate('createdBy', 'username profile.firstName profile.lastName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError') || 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'username profile.firstName profile.lastName')
      .populate('updatedBy', 'username profile.firstName profile.lastName');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: req.t('events.notFound') || 'Event not found'
      });
    }

    res.json({
      success: true,
      data: { event }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError') || 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user.id
    };

    const event = new Event(eventData);
    await event.save();

    await event.populate('createdBy', 'username profile.firstName profile.lastName');

    res.status(201).json({
      success: true,
      message: req.t('events.created') || 'Event created successfully',
      data: { event }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: req.t('errors.validation') || 'Validation error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: req.t('events.notFound') || 'Event not found'
      });
    }

    // Check if user has permission to update this event
    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: req.t('errors.forbidden') || 'Access denied'
      });
    }

    Object.assign(event, req.body);
    event.updatedBy = req.user.id;

    await event.save();
    await event.populate([
      { path: 'createdBy', select: 'username profile.firstName profile.lastName' },
      { path: 'updatedBy', select: 'username profile.firstName profile.lastName' }
    ]);

    res.json({
      success: true,
      message: req.t('events.updated') || 'Event updated successfully',
      data: { event }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: req.t('errors.validation') || 'Validation error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: req.t('events.notFound') || 'Event not found'
      });
    }

    // Check if user has permission to delete this event
    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: req.t('errors.forbidden') || 'Access denied'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: req.t('events.deleted') || 'Event deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError') || 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get featured events for homepage
// @route   GET /api/events/featured
// @access  Public
const getFeaturedEvents = async (req, res) => {
  try {
    const events = await Event.find({
      isPublished: true,
      isFeatured: true,
      date: { $gte: new Date() } // Only upcoming events
    })
      .sort({ date: 1 })
      .limit(5)
      .populate('createdBy', 'username profile.firstName profile.lastName');

    res.json({
      success: true,
      data: { events }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError') || 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getFeaturedEvents
};