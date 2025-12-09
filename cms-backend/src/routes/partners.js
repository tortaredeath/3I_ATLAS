const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  getPartners,
  getPartner,
  createPartner,
  updatePartner,
  deletePartner
} = require('../controllers/partnerController');
const { authenticate, checkPermission } = require('../middleware/auth');
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
router.get('/', getPartners);
router.get('/:id', getPartner);

// Partner validation rules
const partnerValidation = [
  body('name').notEmpty().withMessage('Partner name is required'),
  body('websiteUrl').isURL().withMessage('Valid website URL is required'),
  body('category').isIn(['technology', 'academic', 'industry', 'government', 'nonprofit', 'media', 'sponsor', 'other']).withMessage('Invalid category'),
  body('partnershipType').isIn(['strategic', 'technology', 'academic', 'media', 'sponsor', 'vendor', 'community']).withMessage('Invalid partnership type')
];

// Protected routes
router.post('/', 
  authenticate, 
  checkPermission('partners', 'create'),
  upload.single('logo'),
  handleUploadError,
  partnerValidation,
  handleValidationErrors,
  createPartner
);

router.put('/:id',
  authenticate,
  checkPermission('partners', 'update'),
  upload.single('logo'),
  handleUploadError,
  updatePartner
);

router.delete('/:id',
  authenticate,
  checkPermission('partners', 'delete'),
  deletePartner
);

module.exports = router;