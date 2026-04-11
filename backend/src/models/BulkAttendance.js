const mongoose = require('mongoose');

const bulkAttendanceSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  totalEnrolled: {
    type: Number,
    required: true,
  },
  presentCount: {
    type: Number,
    required: true,
    default: 0,
  },
  absentCount: {
    type: Number,
    default: 0,
  },
  lateCount: {
    type: Number,
    default: 0,
  },
  remarks: {
    type: String,
    default: '',
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// One bulk record per class per date
bulkAttendanceSchema.index({ class: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('BulkAttendance', bulkAttendanceSchema);
