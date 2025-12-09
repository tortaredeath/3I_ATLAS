const Banner = require('../models/Banner');

// @desc    Get active banners
// @route   GET /api/banners
// @access  Public
const getBanners = async (req, res) => {
  try {
    const { page, position = 'homepage', all = false } = req.query;
    
    const now = new Date();
    let query = {
      isActive: true,
      'displayPeriod.startDate': { $lte: now },
      'displayPeriod.endDate': { $gte: now }
    };

    // Admin view - show all banners
    if (all === 'true' && req.user && req.user.role === 'admin') {
      query = {};
    }

    if (position !== 'all') {
      query['displaySettings.showOnPages'] = { $in: [position, 'all'] };
    }

    const banners = await Banner.find(query)
      .populate('createdBy', 'username profile.firstName profile.lastName')
      .sort({ priority: -1, 'displayPeriod.startDate': -1 });

    res.json({
      success: true,
      data: { banners }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError') || 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get banner by ID
// @route   GET /api/banners/:id
// @access  Private
const getBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id)
      .populate('createdBy', 'username profile.firstName profile.lastName')
      .populate('updatedBy', 'username profile.firstName profile.lastName');

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: req.t('banners.notFound') || 'Banner not found'
      });
    }

    res.json({
      success: true,
      data: { banner }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError') || 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new banner
// @route   POST /api/banners
// @access  Private
const createBanner = async (req, res) => {
  try {
    const bannerData = {
      ...req.body,
      createdBy: req.user.id
    };

    const banner = new Banner(bannerData);
    await banner.save();

    await banner.populate('createdBy', 'username profile.firstName profile.lastName');

    res.status(201).json({
      success: true,
      message: req.t('banners.created') || 'Banner created successfully',
      data: { banner }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: req.t('errors.validation') || 'Validation error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private
const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: req.t('banners.notFound') || 'Banner not found'
      });
    }

    Object.assign(banner, req.body);
    banner.updatedBy = req.user.id;

    await banner.save();
    await banner.populate([
      { path: 'createdBy', select: 'username profile.firstName profile.lastName' },
      { path: 'updatedBy', select: 'username profile.firstName profile.lastName' }
    ]);

    res.json({
      success: true,
      message: req.t('banners.updated') || 'Banner updated successfully',
      data: { banner }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: req.t('errors.validation') || 'Validation error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Private
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: req.t('banners.notFound') || 'Banner not found'
      });
    }

    await Banner.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: req.t('banners.deleted') || 'Banner deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError') || 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Track banner impression
// @route   POST /api/banners/:id/impression
// @access  Public
const trackImpression = async (req, res) => {
  try {
    await Banner.findByIdAndUpdate(
      req.params.id,
      { $inc: { impressionCount: 1 } },
      { new: true }
    );

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// @desc    Track banner click
// @route   POST /api/banners/:id/click
// @access  Public
const trackClick = async (req, res) => {
  try {
    await Banner.findByIdAndUpdate(
      req.params.id,
      { $inc: { clickCount: 1 } },
      { new: true }
    );

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};

module.exports = {
  getBanners,
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner,
  trackImpression,
  trackClick
};