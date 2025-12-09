const express = require('express');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Admin dashboard middleware
router.use(authenticate);
router.use(authorize('admin', 'editor', 'author'));

// Serve admin dashboard
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/dashboard.html'));
});

router.get('/events', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/events.html'));
});

router.get('/articles', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/articles.html'));
});

router.get('/banners', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/banners.html'));
});

router.get('/partners', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/partners.html'));
});

router.get('/association', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/association.html'));
});

router.get('/users', authorize('admin'), (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/users.html'));
});

module.exports = router;