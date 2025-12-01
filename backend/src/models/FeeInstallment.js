const mongoose = require('mongoose');

const feeInstallmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
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

  // Fee Details
  feeType: {
    type: String,
    enum: ['tuition', 'exam', 'admission', 'library', 'sports', 'transport', 'other'],
    required: true,
  },
  feeName: {
    type: String,
    required: true, // e.g., "April Tuition", "First Term Exam", "Annual Sports Fee"
  },
  month: {
    type: String,
    enum: ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', null],
  },
  term: {
    type: String, // For exam fees: "Term 1", "Term 2", "Midterm", "Final"
  },

  amount: {
    type: Number,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },

  // Payment Information
  paidAmount: {
    type: Number,
    default: 0,
  },
  balance: {
    type: Number,
  },

  paymentDate: Date,
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online', 'cheque', 'bank_transfer', null],
  },
  transactionId: String,
  receiptNumber: String,
  receiptImage: String, // Path to uploaded receipt image

  // Track who processed the payment
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  status: {
    type: String,
    enum: ['pending', 'paid', 'skipped', 'overdue', 'partial'],
    default: 'pending',
  },

  discount: {
    type: Number,
    default: 0,
  },
  discountReason: String,

  remarks: String,

  isSkipped: {
    type: Boolean,
    default: false,
  },
  skippedReason: String,
  skippedDate: Date,

}, {
  timestamps: true,
});

// Calculate balance before saving
feeInstallmentSchema.pre('save', function(next) {
  // Calculate balance
  const effectiveAmount = this.amount - (this.discount || 0);
  this.balance = effectiveAmount - (this.paidAmount || 0);

  // Update status based on payment
  if (this.isSkipped) {
    this.status = 'skipped';
  } else if (this.balance <= 0) {
    this.status = 'paid';
  } else if (this.paidAmount > 0) {
    this.status = 'partial';
  } else if (new Date() > this.dueDate) {
    this.status = 'overdue';
  } else {
    this.status = 'pending';
  }

  next();
});

// Indexes for better query performance
feeInstallmentSchema.index({ student: 1, academicYear: 1 });
feeInstallmentSchema.index({ student: 1, feeType: 1, month: 1 });
feeInstallmentSchema.index({ status: 1 });

module.exports = mongoose.model('FeeInstallment', feeInstallmentSchema);
