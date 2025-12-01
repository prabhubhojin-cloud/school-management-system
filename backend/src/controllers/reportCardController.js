const ReportCard = require('../models/ReportCard');

// @desc    Get all report cards
// @route   GET /api/reportcards
// @access  Private
exports.getReportCards = async (req, res) => {
  try {
    const { student, academicYear, class: classId, examType, term } = req.query;

    let query = {};

    if (student) query.student = student;
    if (academicYear) query.academicYear = academicYear;
    if (classId) query.class = classId;
    if (examType) query.examType = examType;
    if (term) query.term = term;

    // Students can only see their own published report cards
    if (req.user.role === 'student') {
      query.student = req.user.roleRef;
      query.isPublished = true;
    }

    const reportCards = await ReportCard.find(query)
      .populate('student', 'firstName lastName admissionNumber')
      .populate('academicYear', 'year')
      .populate('class', 'name section')
      .sort('-createdAt');

    res.json({
      success: true,
      count: reportCards.length,
      data: reportCards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single report card
// @route   GET /api/reportcards/:id
// @access  Private
exports.getReportCard = async (req, res) => {
  try {
    const reportCard = await ReportCard.findById(req.params.id)
      .populate('student')
      .populate('academicYear')
      .populate('class');

    if (!reportCard) {
      return res.status(404).json({
        success: false,
        message: 'Report card not found'
      });
    }

    // Students can only view their own published report cards
    if (req.user.role === 'student' &&
        (reportCard.student._id.toString() !== req.user.roleRef.toString() ||
         !reportCard.isPublished)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this report card'
      });
    }

    res.json({
      success: true,
      data: reportCard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create report card
// @route   POST /api/reportcards
// @access  Private (Admin, Teacher)
exports.createReportCard = async (req, res) => {
  try {
    const reportCard = await ReportCard.create(req.body);

    res.status(201).json({
      success: true,
      data: reportCard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update report card
// @route   PUT /api/reportcards/:id
// @access  Private (Admin, Teacher)
exports.updateReportCard = async (req, res) => {
  try {
    let reportCard = await ReportCard.findById(req.params.id);

    if (!reportCard) {
      return res.status(404).json({
        success: false,
        message: 'Report card not found'
      });
    }

    reportCard = await ReportCard.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: reportCard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Publish report card
// @route   PUT /api/reportcards/:id/publish
// @access  Private (Admin)
exports.publishReportCard = async (req, res) => {
  try {
    const reportCard = await ReportCard.findById(req.params.id);

    if (!reportCard) {
      return res.status(404).json({
        success: false,
        message: 'Report card not found'
      });
    }

    reportCard.isPublished = true;
    reportCard.publishedDate = new Date();
    await reportCard.save();

    res.json({
      success: true,
      data: reportCard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete report card
// @route   DELETE /api/reportcards/:id
// @access  Private (Admin)
exports.deleteReportCard = async (req, res) => {
  try {
    const reportCard = await ReportCard.findById(req.params.id);

    if (!reportCard) {
      return res.status(404).json({
        success: false,
        message: 'Report card not found'
      });
    }

    await reportCard.deleteOne();

    res.json({
      success: true,
      message: 'Report card deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get class performance
// @route   GET /api/reportcards/class/:classId/performance
// @access  Private (Admin, Teacher)
exports.getClassPerformance = async (req, res) => {
  try {
    const { examType, term } = req.query;

    const query = {
      class: req.params.classId,
      isPublished: true,
    };

    if (examType) query.examType = examType;
    if (term) query.term = term;

    const reportCards = await ReportCard.find(query);

    const performance = {
      totalStudents: reportCards.length,
      averagePercentage: 0,
      passed: 0,
      failed: 0,
      averageAttendance: 0,
      gradeDistribution: { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 },
    };

    if (reportCards.length > 0) {
      let totalPercentage = 0;
      let totalAttendance = 0;

      reportCards.forEach(card => {
        totalPercentage += card.percentage;
        totalAttendance += card.attendancePercentage;
        if (card.result === 'pass' || card.result === 'promoted') performance.passed++;
        else performance.failed++;
        if (performance.gradeDistribution[card.grade] !== undefined) {
          performance.gradeDistribution[card.grade]++;
        }
      });

      performance.averagePercentage = (totalPercentage / reportCards.length).toFixed(2);
      performance.averageAttendance = (totalAttendance / reportCards.length).toFixed(2);
    }

    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
