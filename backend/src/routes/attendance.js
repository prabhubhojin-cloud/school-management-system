const express = require('express');
const {
  markDailyAttendance,
  getAttendanceByDate,
  getStudentMonthlyAttendance,
  getClassMonthlyAttendance,
  updateAttendance,
  deleteAttendance,
  getStudentAttendanceStats,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Mark daily attendance for a class (bulk operation)
router.post('/mark-daily', protect, authorize('admin', 'teacher'), markDailyAttendance);

// Get attendance for a class on a specific date
router.get('/daily/:classId/:date', protect, authorize('admin', 'teacher'), getAttendanceByDate);

// Get monthly attendance for a student
router.get('/student/:studentId/monthly', protect, getStudentMonthlyAttendance);

// Get monthly attendance summary for a class
router.get('/class/:classId/monthly', protect, authorize('admin', 'teacher'), getClassMonthlyAttendance);

// Get attendance statistics for a student
router.get('/student/:studentId/stats', protect, getStudentAttendanceStats);

// Update and delete specific attendance record
router
  .route('/:id')
  .put(protect, authorize('admin', 'teacher'), updateAttendance)
  .delete(protect, authorize('admin'), deleteAttendance);

module.exports = router;
