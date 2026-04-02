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
  .post(protect, authorize('admin', 'office_incharge'), createFee);

router.get('/summary/:academicYearId', protect, authorize('admin', 'office_incharge'), getFeeSummary);

router
  .route('/:id')
  .get(protect, getFee)
  .put(protect, authorize('admin', 'office_incharge'), updateFee)
  .delete(protect, authorize('admin', 'office_incharge'), deleteFee);

router.post('/:id/payment', protect, authorize('admin', 'office_incharge'), addPayment);

module.exports = router;
