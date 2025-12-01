const express = require('express');
const {
  getAcademicYears,
  getActiveAcademicYear,
  getAcademicYear,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  promoteStudentsToNextYear,
} = require('../controllers/academicYearController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getAcademicYears)
  .post(protect, authorize('admin'), createAcademicYear);

router.get('/active', protect, getActiveAcademicYear);

router
  .route('/:id')
  .get(protect, getAcademicYear)
  .put(protect, authorize('admin'), updateAcademicYear)
  .delete(protect, authorize('admin'), deleteAcademicYear);

router.post('/:id/promote', protect, authorize('admin'), promoteStudentsToNextYear);

module.exports = router;
