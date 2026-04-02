const express = require('express');
const { checkIn, getMyStatus, getAllCheckIns, getSchoolLocation } = require('../controllers/checkInController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/school-location', protect, getSchoolLocation);
router.get('/my-status', protect, authorize('teacher', 'office_incharge', 'accountant'), getMyStatus);
router.post('/', protect, authorize('teacher', 'office_incharge', 'accountant'), checkIn);
router.get('/', protect, authorize('admin'), getAllCheckIns);

module.exports = router;
