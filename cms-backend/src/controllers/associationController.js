const Association = require('../models/Association');

// @desc    Get association information
// @route   GET /api/association
// @access  Public
const getAssociation = async (req, res) => {
  try {
    const association = await Association.findOne({ isActive: true })
      .populate('updatedBy', 'username profile.firstName profile.lastName');

    if (!association) {
      return res.status(404).json({
        success: false,
        message: req.t('association.notFound') || 'Association information not found'
      });
    }

    res.json({
      success: true,
      data: { association }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError') || 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update association information
// @route   PUT /api/association
// @access  Private
const updateAssociation = async (req, res) => {
  try {
    let association = await Association.findOne({ isActive: true });

    if (!association) {
      // Create new association if none exists
      association = new Association({
        ...req.body,
        updatedBy: req.user.id,
        isActive: true
      });
    } else {
      Object.assign(association, req.body);
      association.updatedBy = req.user.id;
    }

    await association.save();
    await association.populate('updatedBy', 'username profile.firstName profile.lastName');

    res.json({
      success: true,
      message: req.t('association.updated') || 'Association information updated successfully',
      data: { association }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: req.t('errors.validation') || 'Validation error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAssociation,
  updateAssociation
};