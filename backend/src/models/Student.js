const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  admissionNumber: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
  },
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    pinCode: String,
    country: String,
  },
  bloodGroup: String,

  // Student Documents
  studentDocuments: {
    birthCertificate: String,
    aadharCard: String,
    transferCertificate: String,
    studentPhoto: String,
    additionalDoc1: String,
    additionalDoc2: String,
  },

  // Father Information
  father: {
    name: String,
    phone: String,
    email: String,
    occupation: String,
    address: {
      street: String,
      city: String,
      state: String,
      pinCode: String,
    },
    idProof: String,
    addressProof: String,
    photo: String,
  },

  // Mother Information
  mother: {
    name: String,
    phone: String,
    email: String,
    occupation: String,
    address: {
      street: String,
      city: String,
      state: String,
      pinCode: String,
    },
    idProof: String,
    addressProof: String,
    photo: String,
  },

  // Guardian Information (if parents not available)
  guardian: {
    name: String,
    relation: String,
    phone: String,
    email: String,
    occupation: String,
    address: {
      street: String,
      city: String,
      state: String,
      pinCode: String,
    },
    idProof: String,
    addressProof: String,
    photo: String,
  },

  // Academic Information - Year wise
  enrollments: [{
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
    rollNumber: Number,
    status: {
      type: String,
      enum: ['active', 'promoted', 'detained', 'transferred', 'passedOut'],
      default: 'active',
    },
  }],

  // Current enrollment (denormalized for quick access)
  currentClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  },
  currentAcademicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
  },
  currentRollNumber: Number,

  admissionDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'alumni'],
    default: 'active',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  documents: [{
    type: String,
    url: String,
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Student', studentSchema);
