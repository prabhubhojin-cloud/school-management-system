const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
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
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'halfDay', 'sickLeave', 'authorizedLeave'],
    required: true,
    default: 'present',
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  remarks: {
    type: String,
    maxlength: 500,
  },
  // For quick monthly queries
  month: {
    type: Number, // 1-12
    required: true,
  },
  year: {
    type: Number, // e.g., 2024
    required: true,
  },
}, {
  timestamps: true,
});

// Compound index to ensure one attendance record per student per date
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

// Index for quick class-wise queries
attendanceSchema.index({ class: 1, date: 1 });

// Index for monthly queries
attendanceSchema.index({ student: 1, month: 1, year: 1, academicYear: 1 });
attendanceSchema.index({ class: 1, month: 1, year: 1 });

// Pre-save hook to automatically set month and year from date
attendanceSchema.pre('save', function(next) {
  if (this.date) {
    this.month = this.date.getMonth() + 1; // getMonth() returns 0-11
    this.year = this.date.getFullYear();
  }
  next();
});

// Virtual for attendance percentage
attendanceSchema.virtual('isPresent').get(function() {
  return this.status === 'present' || this.status === 'late' || this.status === 'halfDay';
});

module.exports = mongoose.model('Attendance', attendanceSchema);
