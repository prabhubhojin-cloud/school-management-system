const express = require('express');
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  enrollStudent,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Configure file upload fields
const uploadFields = upload.fields([
  { name: 'birthCertificate', maxCount: 1 },
  { name: 'aadharCard', maxCount: 1 },
  { name: 'transferCertificate', maxCount: 1 },
  { name: 'studentPhoto', maxCount: 1 },
  { name: 'additionalDoc1', maxCount: 1 },
  { name: 'additionalDoc2', maxCount: 1 },
  { name: 'fatherIdProof', maxCount: 1 },
  { name: 'fatherAddressProof', maxCount: 1 },
  { name: 'fatherPhoto', maxCount: 1 },
  { name: 'motherIdProof', maxCount: 1 },
  { name: 'motherAddressProof', maxCount: 1 },
  { name: 'motherPhoto', maxCount: 1 },
  { name: 'guardianIdProof', maxCount: 1 },
  { name: 'guardianAddressProof', maxCount: 1 },
  { name: 'guardianPhoto', maxCount: 1 },
]);

router
  .route('/')
  .get(protect, authorize('admin', 'teacher'), getStudents)
  .post(protect, authorize('admin'), uploadFields, createStudent);

router
  .route('/:id')
  .get(protect, getStudent)
  .put(protect, authorize('admin'), uploadFields, updateStudent)
  .delete(protect, authorize('admin'), deleteStudent);

router.post('/:id/enroll', protect, authorize('admin'), enrollStudent);

module.exports = router;
