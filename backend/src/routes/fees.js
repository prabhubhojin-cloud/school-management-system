const express = require('express');
const {
  getFees,
  getFee,
  createFee,
  addPayment,
  updateFee,
  deleteFee,
  getFeeSummary,
} = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getFees)
  .post(protect, authorize('admin'), createFee);

router.get('/summary/:academicYearId', protect, authorize('admin'), getFeeSummary);

router
  .route('/:id')
  .get(protect, getFee)
  .put(protect, authorize('admin'), updateFee)
  .delete(protect, authorize('admin'), deleteFee);

router.post('/:id/payment', protect, authorize('admin'), addPayment);

module.exports = router;
