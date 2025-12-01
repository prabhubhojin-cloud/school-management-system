const AcademicYear = require('../models/AcademicYear');
const { promoteStudents } = require('../services/promotionService');

// @desc    Get all academic years
// @route   GET /api/academicyears
// @access  Private
exports.getAcademicYears = async (req, res) => {
  try {
    const academicYears = await AcademicYear.find().sort('-startDate');

    res.json({
      success: true,
      count: academicYears.length,
      data: academicYears
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get active academic year
// @route   GET /api/academicyears/active
// @access  Private
exports.getActiveAcademicYear = async (req, res) => {
  try {
    const academicYear = await AcademicYear.findOne({ isActive: true });

    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: 'No active academic year found'
      });
    }

    res.json({
      success: true,
      data: academicYear
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single academic year
// @route   GET /api/academicyears/:id
// @access  Private
exports.getAcademicYear = async (req, res) => {
  try {
    const academicYear = await AcademicYear.findById(req.params.id);

    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: 'Academic year not found'
      });
    }

    res.json({
      success: true,
      data: academicYear
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create academic year
// @route   POST /api/academicyears
// @access  Private (Admin)
exports.createAcademicYear = async (req, res) => {
  try {
    const academicYear = await AcademicYear.create(req.body);

    res.status(201).json({
      success: true,
      data: academicYear
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update academic year
// @route   PUT /api/academicyears/:id
// @access  Private (Admin)
exports.updateAcademicYear = async (req, res) => {
  try {
    let academicYear = await AcademicYear.findById(req.params.id);

    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: 'Academic year not found'
      });
    }

    academicYear = await AcademicYear.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: academicYear
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete academic year
// @route   DELETE /api/academicyears/:id
// @access  Private (Admin)
exports.deleteAcademicYear = async (req, res) => {
  try {
    const academicYear = await AcademicYear.findById(req.params.id);

    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: 'Academic year not found'
      });
    }

    await academicYear.deleteOne();

    res.json({
      success: true,
      message: 'Academic year deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Promote students to next year
// @route   POST /api/academicyears/:id/promote
// @access  Private (Admin)
exports.promoteStudentsToNextYear = async (req, res) => {
  try {
    const { nextYearId, promotionData } = req.body;

    const result = await promoteStudents(req.params.id, nextYearId, promotionData);

    res.json({
      success: true,
      message: `Promoted ${result.promoted} students. ${result.errors} errors occurred.`,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
