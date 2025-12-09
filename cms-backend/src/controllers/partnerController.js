const Partner = require('../models/Partner');

// @desc    Get all partners
// @route   GET /api/partners
// @access  Public
const getPartners = async (req, res) => {
  try {
    const {
      category,
      partnershipType,
      level,
      featured,
      homepage = true,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (homepage === 'true') {
      query['displaySettings.showOnHomepage'] = true;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (partnershipType) {
      query.partnershipType = partnershipType;
    }
    
    if (level) {
      query.partnershipLevel = level;
    }
    
    if (featured === 'true') {
      query['displaySettings.featured'] = true;
    }

    const partners = await Partner.find(query)
      .populate('createdBy', 'username profile.firstName profile.lastName')
      .sort({
        'displaySettings.featured': -1,
        'displaySettings.order': 1,
        createdAt: -1
      })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Partner.countDocuments(query);

    res.json({
      success: true,
      data: {
        partners,
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

// @desc    Get partner by ID
// @route   GET /api/partners/:id
// @access  Public
const getPartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id)
      .populate('createdBy', 'username profile.firstName profile.lastName')
      .populate('updatedBy', 'username profile.firstName profile.lastName');

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: req.t('partners.notFound') || 'Partner not found'
      });
    }

    res.json({
      success: true,
      data: { partner }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError') || 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new partner
// @route   POST /api/partners
// @access  Private
const createPartner = async (req, res) => {
  try {
    const partnerData = {
      ...req.body,
      createdBy: req.user.id
    };

    const partner = new Partner(partnerData);
    await partner.save();

    await partner.populate('createdBy', 'username profile.firstName profile.lastName');

    res.status(201).json({
      success: true,
      message: req.t('partners.created') || 'Partner created successfully',
      data: { partner }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: req.t('errors.validation') || 'Validation error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update partner
// @route   PUT /api/partners/:id
// @access  Private
const updatePartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: req.t('partners.notFound') || 'Partner not found'
      });
    }

    Object.assign(partner, req.body);
    partner.updatedBy = req.user.id;

    await partner.save();
    await partner.populate([
      { path: 'createdBy', select: 'username profile.firstName profile.lastName' },
      { path: 'updatedBy', select: 'username profile.firstName profile.lastName' }
    ]);

    res.json({
      success: true,
      message: req.t('partners.updated') || 'Partner updated successfully',
      data: { partner }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: req.t('errors.validation') || 'Validation error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete partner
// @route   DELETE /api/partners/:id
// @access  Private
const deletePartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: req.t('partners.notFound') || 'Partner not found'
      });
    }

    await Partner.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: req.t('partners.deleted') || 'Partner deleted successfully'
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
  getPartners,
  getPartner,
  createPartner,
  updatePartner,
  deletePartner
};