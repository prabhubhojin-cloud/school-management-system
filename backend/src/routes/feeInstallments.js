const express = require('express');
const {
  getFeeInstallments,
  getStudentFeeSummary,
  getFeeInstallment,
  processPayment,
  skipInstallment,
  unskipInstallment,
  applyDiscount,
  updateFeeInstallment,
  deleteFeeInstallment,
  generateFeesForStudent,
  fixExistingInstallments,
} = require('../controllers/feeInstallmentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router
  .route('/')
  .get(protect, getFeeInstallments);

router.post('/fix-existing', protect, authorize('admin'), fixExistingInstallments);
router.post('/generate-for-student', protect, authorize('admin'), generateFeesForStudent);

router.get('/student/:studentId/summary', protect, getStudentFeeSummary);

router.post('/:id/payment', protect, authorize('admin', 'accountant'), upload.single('receiptImage'), processPayment);
router.post('/:id/skip', protect, authorize('admin'), skipInstallment);
router.post('/:id/unskip', protect, authorize('admin'), unskipInstallment);
router.post('/:id/discount', protect, authorize('admin'), applyDiscount);

router
  .route('/:id')
  .get(protect, getFeeInstallment)
  .put(protect, authorize('admin'), updateFeeInstallment)
  .delete(protect, authorize('admin'), deleteFeeInstallment);

module.exports = router;
