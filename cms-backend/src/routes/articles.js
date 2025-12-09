const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  getFeaturedArticles,
  getLatestArticles
} = require('../controllers/articleController');
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
router.get('/', getArticles);
router.get('/featured', getFeaturedArticles);
router.get('/latest', getLatestArticles);
router.get('/:id', getArticle);

// Article validation rules
const articleValidation = [
  body('title.zh').notEmpty().withMessage('Chinese title is required'),
  body('content.zh').notEmpty().withMessage('Chinese content is required'),
  body('author.name').notEmpty().withMessage('Author name is required'),
  body('category').isIn(['news', 'announcement', 'research', 'technology', 'event-report', 'other']).withMessage('Invalid category')
];

// Protected routes
router.post('/', 
  authenticate, 
  checkPermission('articles', 'create'),
  upload.fields([
    { name: 'featuredImage', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]),
  handleUploadError,
  articleValidation,
  handleValidationErrors,
  createArticle
);

router.put('/:id',
  authenticate,
  checkPermission('articles', 'update'),
  upload.fields([
    { name: 'featuredImage', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]),
  handleUploadError,
  updateArticle
);

router.delete('/:id',
  authenticate,
  checkPermission('articles', 'delete'),
  deleteArticle
);

module.exports = router;