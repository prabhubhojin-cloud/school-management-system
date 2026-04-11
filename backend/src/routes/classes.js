const express = require('express');
const {
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
  getMyClass,
} = require('../controllers/classController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/my-class', protect, authorize('teacher'), getMyClass);

router
  .route('/')
  .get(protect, getClasses)
  .post(protect, authorize('admin'), createClass);

router
  .route('/:id')
  .get(protect, getClass)
  .put(protect, authorize('admin'), updateClass)
  .delete(protect, authorize('admin'), deleteClass);

module.exports = router;
