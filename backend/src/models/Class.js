const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    // e.g., "Class 1", "Class 2", etc.
  },
  section: {
    type: String,
    required: true,
    // e.g., "A", "B", "C"
  },
  grade: {
    type: Number,
    required: false,
    // 1 to 12 (optional)
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true,
  },
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  subjects: [{
    name: String,
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    maxMarks: {
      type: Number,
      default: 100,
    },
  }],
  capacity: {
    type: Number,
    default: 40,
  },
}, {
  timestamps: true,
});

// Compound index to ensure unique class-section combination per academic year
classSchema.index({ name: 1, section: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Class', classSchema);
