const mongoose = require('mongoose');

const reportCardSchema = new mongoose.Schema({
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
  examType: {
    type: String,
    enum: ['midterm', 'final', 'unit_test', 'quarterly', 'half_yearly', 'annual'],
    required: true,
  },
  term: {
    type: String,
    enum: ['term1', 'term2', 'term3'],
    required: true,
  },

  // Subject-wise marks
  subjects: [{
    subject: {
      type: String,
      required: true,
    },
    maxMarks: {
      type: Number,
      required: true,
    },
    marksObtained: {
      type: Number,
      required: true,
    },
    grade: String,
    remarks: String,
  }],

  // Overall performance
  totalMarks: {
    type: Number,
    required: true,
  },
  marksObtained: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  grade: String,
  rank: Number,

  // Attendance
  totalDays: {
    type: Number,
    required: true,
  },
  presentDays: {
    type: Number,
    required: true,
  },
  attendancePercentage: {
    type: Number,
    required: true,
  },

  // Teacher's remarks
  remarks: {
    classTeacher: String,
    principal: String,
  },

  // Co-curricular activities
  activities: [{
    name: String,
    grade: String,
  }],

  result: {
    type: String,
    enum: ['pass', 'fail', 'promoted', 'detained'],
    required: true,
  },

  isPublished: {
    type: Boolean,
    default: false,
  },

  publishedDate: Date,

}, {
  timestamps: true,
});

// Calculate percentage and grade before saving
reportCardSchema.pre('save', function(next) {
  // Calculate total marks and marks obtained
  this.totalMarks = this.subjects.reduce((sum, subject) => sum + subject.maxMarks, 0);
  this.marksObtained = this.subjects.reduce((sum, subject) => sum + subject.marksObtained, 0);

  // Calculate percentage
  this.percentage = (this.marksObtained / this.totalMarks) * 100;

  // Calculate attendance percentage
  this.attendancePercentage = (this.presentDays / this.totalDays) * 100;

  // Assign grade based on percentage
  if (this.percentage >= 90) this.grade = 'A+';
  else if (this.percentage >= 80) this.grade = 'A';
  else if (this.percentage >= 70) this.grade = 'B+';
  else if (this.percentage >= 60) this.grade = 'B';
  else if (this.percentage >= 50) this.grade = 'C';
  else if (this.percentage >= 40) this.grade = 'D';
  else this.grade = 'F';

  // Determine result
  if (this.percentage >= 40 && this.attendancePercentage >= 75) {
    this.result = 'pass';
  } else {
    this.result = 'fail';
  }

  next();
});

// Ensure unique report card per student per exam per term per academic year
reportCardSchema.index({ student: 1, academicYear: 1, examType: 1, term: 1 }, { unique: true });

module.exports = mongoose.model('ReportCard', reportCardSchema);
