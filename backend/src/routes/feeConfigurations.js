const express = require('express');
const {
  getFeeConfigurations,
  getFeeConfiguration,
  createFeeConfiguration,
  updateFeeConfiguration,
  deleteFeeConfiguration,
  generateFeesForClass,
} = require('../controllers/feeConfigurationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('admin'), getFeeConfigurations)
  .post(protect, authorize('admin'), createFeeConfiguration);

router.post('/:id/generate-fees', protect, authorize('admin'), generateFeesForClass);

router
  .route('/:id')
  .get(protect, authorize('admin'), getFeeConfiguration)
  .put(protect, authorize('admin'), updateFeeConfiguration)
  .delete(protect, authorize('admin'), deleteFeeConfiguration);

module.exports = router;
