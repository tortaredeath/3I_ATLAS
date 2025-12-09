const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  getBanners,
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner,
  trackImpression,
  trackClick
} = require('../controllers/bannerController');
const { authenticate, checkPermission, optionalAuth } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: req.t('errors.validation') || 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Public routes
router.get('/', optionalAuth, getBanners);
router.post('/:id/impression', trackImpression);
router.post('/:id/click', trackClick);

// Admin routes
router.get('/:id', authenticate, checkPermission('banners', 'read'), getBanner);

// Banner validation rules
const bannerValidation = [
  body('image.desktop').notEmpty().withMessage('Desktop image is required'),
  body('displayPeriod.startDate').isISO8601().withMessage('Valid start date is required'),
  body('displayPeriod.endDate').isISO8601().withMessage('Valid end date is required')
];

router.post('/', 
  authenticate, 
  checkPermission('banners', 'create'),
  upload.fields([
    { name: 'desktop', maxCount: 1 },
    { name: 'mobile', maxCount: 1 },
    { name: 'tablet', maxCount: 1 }
  ]),
  handleUploadError,
  bannerValidation,
  handleValidationErrors,
  createBanner
);

router.put('/:id',
  authenticate,
  checkPermission('banners', 'update'),
  upload.fields([
    { name: 'desktop', maxCount: 1 },
    { name: 'mobile', maxCount: 1 },
    { name: 'tablet', maxCount: 1 }
  ]),
  handleUploadError,
  updateBanner
);

router.delete('/:id',
  authenticate,
  checkPermission('banners', 'delete'),
  deleteBanner
);

module.exports = router;