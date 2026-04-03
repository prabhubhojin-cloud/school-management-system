const mongoose = require('mongoose');

const feeConfigurationSchema = new mongoose.Schema({
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  feeStructure: {
    // Monthly tuition fees (April to March)
    tuitionFee: {
      type: Number,
      required: true,
      default: 0,
    },

    // Exam fees (4 terms/exams)
    examFees: [{
      name: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
    }],

    // Other fee heads
    otherFees: [{
      name: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      frequency: {
        type: String,
        enum: ['one-time', 'annual', 'monthly'],
        default: 'one-time',
      },
    }],
  },
  // Discount policies defined at configuration level
  discounts: {
    // General named discount presets (e.g. Staff Ward, Merit)
    general: [{
      name: { type: String, required: true },           // e.g. "Staff Ward Discount"
      type: { type: String, enum: ['percentage', 'flat'], required: true },
      value: { type: Number, required: true },           // 10 for 10% or 500 for flat ₹500
      appliesTo: { type: String, enum: ['tuition', 'exam', 'all'], default: 'all' },
    }],

    // Sibling discount — auto-applied when student.isSibling = true
    sibling: {
      enabled: { type: Boolean, default: false },
      type: { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
      value: { type: Number, default: 0 },              // e.g. 10 for 10%
      appliesTo: { type: String, enum: ['tuition', 'exam', 'all'], default: 'tuition' },
    },
  },

  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Compound index to ensure one configuration per class per academic year
feeConfigurationSchema.index({ academicYear: 1, class: 1 }, { unique: true });

module.exports = mongoose.model('FeeConfiguration', feeConfigurationSchema);
