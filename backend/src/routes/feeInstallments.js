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
const { upload } = require('../middleware/upload');

const router = express.Router();

router
  .route('/')
  .get(protect, getFeeInstallments);

router.post('/fix-existing', protect, authorize('admin'), fixExistingInstallments);
router.post('/generate-for-student', protect, authorize('admin'), generateFeesForStudent);

router.get('/student/:studentId/summary', protect, getStudentFeeSummary);

router.post('/:id/payment', protect, authorize('admin', 'accountant', 'office_incharge'), upload.single('receiptImage'), processPayment);
router.post('/:id/skip', protect, authorize('admin', 'office_incharge'), skipInstallment);
router.post('/:id/unskip', protect, authorize('admin', 'office_incharge'), unskipInstallment);
router.post('/:id/discount', protect, authorize('admin', 'office_incharge'), applyDiscount);

router
  .route('/:id')
  .get(protect, getFeeInstallment)
  .put(protect, authorize('admin', 'office_incharge'), updateFeeInstallment)
  .delete(protect, authorize('admin', 'office_incharge'), deleteFeeInstallment);

module.exports = router;
