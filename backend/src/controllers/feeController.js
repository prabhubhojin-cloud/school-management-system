const Fee = require('../models/Fee');

// @desc    Get all fees
// @route   GET /api/fees
// @access  Private
exports.getFees = async (req, res) => {
  try {
    const { student, academicYear, status } = req.query;

    let query = {};

    if (student) query.student = student;
    if (academicYear) query.academicYear = academicYear;
    if (status) query.status = status;

    const fees = await Fee.find(query)
      .populate('student', 'firstName lastName admissionNumber')
      .populate('academicYear', 'year')
      .populate('class', 'name section')
      .sort('-createdAt');

    res.json({
      success: true,
      count: fees.length,
      data: fees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single fee
// @route   GET /api/fees/:id
// @access  Private
exports.getFee = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id)
      .populate('student')
      .populate('academicYear')
      .populate('class');

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    res.json({
      success: true,
      data: fee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create fee record
// @route   POST /api/fees
// @access  Private (Admin)
exports.createFee = async (req, res) => {
  try {
    const fee = await Fee.create(req.body);

    res.status(201).json({
      success: true,
      data: fee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add payment
// @route   POST /api/fees/:id/payment
// @access  Private (Admin)
exports.addPayment = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    // Add payment
    fee.payments.push(req.body);
    await fee.save();

    res.json({
      success: true,
      data: fee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update fee
// @route   PUT /api/fees/:id
// @access  Private (Admin)
exports.updateFee = async (req, res) => {
  try {
    let fee = await Fee.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    fee = await Fee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: fee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete fee record
// @route   DELETE /api/fees/:id
// @access  Private (Admin)
exports.deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    await fee.deleteOne();

    res.json({
      success: true,
      message: 'Fee record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get fee summary by academic year
// @route   GET /api/fees/summary/:academicYearId
// @access  Private (Admin)
exports.getFeeSummary = async (req, res) => {
  try {
    const fees = await Fee.find({ academicYear: req.params.academicYearId });

    const summary = {
      totalFees: 0,
      totalPaid: 0,
      totalDue: 0,
      paid: 0,
      partial: 0,
      pending: 0,
      overdue: 0,
    };

    fees.forEach(fee => {
      summary.totalFees += fee.totalAmount;
      summary.totalPaid += fee.paidAmount;
      summary.totalDue += fee.dueAmount;
      summary[fee.status]++;
    });

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
