const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
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

  // Fee Structure
  feeStructure: {
    tuitionFee: {
      type: Number,
      required: true,
    },
    admissionFee: {
      type: Number,
      default: 0,
    },
    examFee: {
      type: Number,
      default: 0,
    },
    libraryFee: {
      type: Number,
      default: 0,
    },
    sportsFee: {
      type: Number,
      default: 0,
    },
    transportFee: {
      type: Number,
      default: 0,
    },
    otherFees: {
      type: Number,
      default: 0,
    },
  },

  totalAmount: {
    type: Number,
    required: true,
  },

  // Payment Information
  payments: [{
    amount: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'online', 'cheque', 'bank_transfer'],
      required: true,
    },
    transactionId: String,
    receiptNumber: {
      type: String,
      required: true,
    },
    remarks: String,
  }],

  paidAmount: {
    type: Number,
    default: 0,
  },

  dueAmount: {
    type: Number,
    required: true,
  },

  dueDate: {
    type: Date,
    required: true,
  },

  status: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'overdue'],
    default: 'pending',
  },

  discount: {
    type: Number,
    default: 0,
  },

  discountReason: String,

}, {
  timestamps: true,
});

// Calculate totals before saving
feeSchema.pre('save', function(next) {
  // Calculate total from fee structure
  if (this.isModified('feeStructure')) {
    const fees = this.feeStructure;
    this.totalAmount = (fees.tuitionFee || 0) + (fees.admissionFee || 0) +
                       (fees.examFee || 0) + (fees.libraryFee || 0) +
                       (fees.sportsFee || 0) + (fees.transportFee || 0) +
                       (fees.otherFees || 0) - (this.discount || 0);
  }

  // Calculate paid amount from payments
  this.paidAmount = this.payments.reduce((sum, payment) => sum + payment.amount, 0);

  // Calculate due amount
  this.dueAmount = this.totalAmount - this.paidAmount;

  // Update status
  if (this.dueAmount <= 0) {
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

module.exports = mongoose.model('Fee', feeSchema);
