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
