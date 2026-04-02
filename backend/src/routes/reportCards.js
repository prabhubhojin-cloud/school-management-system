const express = require('express');
const {
  getReportCards,
  getReportCard,
  createReportCard,
  updateReportCard,
  publishReportCard,
  deleteReportCard,
  getClassPerformance,
} = require('../controllers/reportCardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getReportCards)
  .post(protect, authorize('admin', 'teacher', 'office_incharge'), createReportCard);

router.get('/class/:classId/performance', protect, authorize('admin', 'teacher', 'office_incharge'), getClassPerformance);

router
  .route('/:id')
  .get(protect, getReportCard)
  .put(protect, authorize('admin', 'teacher', 'office_incharge'), updateReportCard)
  .delete(protect, authorize('admin'), deleteReportCard);

router.put('/:id/publish', protect, authorize('admin', 'office_incharge'), publishReportCard);

module.exports = router;
