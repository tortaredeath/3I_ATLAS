const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getFeaturedEvents
} = require('../controllers/eventController');
const { authenticate, checkPermission } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Validation middleware
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

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, ongoing, past]
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Events retrieved successfully
 */
router.get('/', getEvents);

/**
 * @swagger
 * /api/events/featured:
 *   get:
 *     summary: Get featured events for homepage
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Featured events retrieved successfully
 */
router.get('/featured', getFeaturedEvents);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event retrieved successfully
 *       404:
 *         description: Event not found
 */
router.get('/:id', getEvent);

// Event validation rules
const eventValidation = [
  body('name.zh').notEmpty().withMessage('Chinese name is required'),
  body('name.en').optional(),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('location.zh').notEmpty().withMessage('Chinese location is required'),
  body('description.zh').notEmpty().withMessage('Chinese description is required'),
  body('category').isIn(['conference', 'workshop', 'seminar', 'social', 'other']).withMessage('Invalid category')
];

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: object
 *               date:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: object
 *               description:
 *                 type: object
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Event created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', 
  authenticate, 
  checkPermission('events', 'create'),
  upload.array('images', 5),
  handleUploadError,
  eventValidation,
  handleValidationErrors,
  createEvent
);

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Update event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Event not found
 */
router.put('/:id',
  authenticate,
  checkPermission('events', 'update'),
  upload.array('images', 5),
  handleUploadError,
  updateEvent
);

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Delete event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Event not found
 */
router.delete('/:id',
  authenticate,
  checkPermission('events', 'delete'),
  deleteEvent
);

module.exports = router;