const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  getAssociation,
  updateAssociation
} = require('../controllers/associationController');
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

// Public route
router.get('/', getAssociation);

// Association validation rules
const associationValidation = [
  body('name.zh').notEmpty().withMessage('Chinese name is required'),
  body('establishedYear').isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Valid establishment year is required'),
  body('mission.zh').notEmpty().withMessage('Chinese mission is required'),
  body('description.zh').notEmpty().withMessage('Chinese description is required'),
  body('contact.email').isEmail().withMessage('Valid email is required')
];

// Protected route
router.put('/', 
  authenticate, 
  checkPermission('association', 'update'),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'images', maxCount: 10 },
    { name: 'memberPhotos', maxCount: 20 }
  ]),
  handleUploadError,
  associationValidation,
  handleValidationErrors,
  updateAssociation
);

module.exports = router;