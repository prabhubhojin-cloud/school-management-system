const mongoose = require('mongoose');

const staffCheckInSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['teacher', 'accountant', 'office_incharge'],
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD — for easy daily grouping
    required: true,
  },
  checkInTime: {
    type: Date,
    required: true,
  },
  checkOutTime: {
    type: Date,
    default: null,
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  isWithinRange: {
    type: Boolean,
    required: true,
  },
  distanceMeters: {
    type: Number, // distance from school at time of check-in
    required: true,
  },
  note: {
    type: String,
    default: '',
  },
  deviceInfo: {
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  // Set true if another user checked in from the same device (IP+UA) on the same day
  suspiciousDevice: {
    type: Boolean,
    default: false,
  },
  suspiciousNote: {
    type: String,
    default: '',
  },
}, { timestamps: true });

// One check-in per user per day
staffCheckInSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('StaffCheckIn', staffCheckInSchema);
