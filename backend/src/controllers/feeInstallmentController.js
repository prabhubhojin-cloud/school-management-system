const FeeInstallment = require('../models/FeeInstallment');
const FeeConfiguration = require('../models/FeeConfiguration');

// @desc    Get all fee installments
// @route   GET /api/fee-installments
// @access  Private
exports.getFeeInstallments = async (req, res) => {
  try {
    const { student, academicYear, class: classId, feeType, status, month } = req.query;

    let query = {};
    if (student) query.student = student;
    if (academicYear) query.academicYear = academicYear;
    if (classId) query.class = classId;
    if (feeType) query.feeType = feeType;
    if (status) query.status = status;
    if (month) query.month = month;

    const installments = await FeeInstallment.find(query)
      .populate('student', 'firstName lastName admissionNumber')
      .populate('academicYear', 'year')
      .populate('class', 'name section')
      .sort('dueDate');

    res.json({
      success: true,
      count: installments.length,
      data: installments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get fee summary for a student
// @route   GET /api/fee-installments/student/:studentId/summary
// @access  Private
exports.getStudentFeeSummary = async (req, res) => {
  try {
    const { academicYear } = req.query;

    let query = { student: req.params.studentId };
    if (academicYear) query.academicYear = academicYear;

    const installments = await FeeInstallment.find(query);

    const summary = {
      total: installments.reduce((sum, inst) => sum + inst.amount, 0),
      paid: installments.reduce((sum, inst) => sum + inst.paidAmount, 0),
      pending: installments.filter(inst => inst.status === 'pending').reduce((sum, inst) => sum + inst.balance, 0),
      overdue: installments.filter(inst => inst.status === 'overdue').reduce((sum, inst) => sum + inst.balance, 0),
      installments: installments
    };

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

// @desc    Get single fee installment
// @route   GET /api/fee-installments/:id
// @access  Private
exports.getFeeInstallment = async (req, res) => {
  try {
    const installment = await FeeInstallment.findById(req.params.id)
      .populate('student')
      .populate('academicYear')
      .populate('class');

    if (!installment) {
      return res.status(404).json({
        success: false,
        message: 'Fee installment not found'
      });
    }

    res.json({
      success: true,
      data: installment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Process payment for fee installment
// @route   POST /api/fee-installments/:id/payment
// @access  Private (Admin, Accountant)
exports.processPayment = async (req, res) => {
  try {
    const { amount, paymentMethod, paymentDate, transactionId, remarks } = req.body;

    const installment = await FeeInstallment.findById(req.params.id);

    if (!installment) {
      return res.status(404).json({
        success: false,
        message: 'Fee installment not found'
      });
    }

    // Calculate new paid amount
    installment.paidAmount = (installment.paidAmount || 0) + parseFloat(amount);
    installment.paymentMethod = paymentMethod;
    installment.paymentDate = paymentDate || new Date();
    if (transactionId) installment.transactionId = transactionId;
    if (remarks) installment.remarks = remarks;

    // Add receipt image if uploaded
    if (req.file) {
      installment.receiptImage = req.file.path;
    }

    // Track who processed the payment
    installment.processedBy = req.user._id;

    await installment.save(); // This will trigger the pre-save hook

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: installment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Skip fee installment
// @route   POST /api/fee-installments/:id/skip
// @access  Private (Admin)
exports.skipInstallment = async (req, res) => {
  try {
    const { reason } = req.body;

    const installment = await FeeInstallment.findById(req.params.id);

    if (!installment) {
      return res.status(404).json({
        success: false,
        message: 'Fee installment not found'
      });
    }

    installment.isSkipped = true;
    installment.skippedReason = reason;
    installment.skippedDate = new Date();

    await installment.save(); // This will trigger the pre-save hook

    res.json({
      success: true,
      message: 'Fee installment skipped successfully',
      data: installment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Unskip fee installment
// @route   POST /api/fee-installments/:id/unskip
// @access  Private (Admin)
exports.unskipInstallment = async (req, res) => {
  try {
    const installment = await FeeInstallment.findById(req.params.id);

    if (!installment) {
      return res.status(404).json({
        success: false,
        message: 'Fee installment not found'
      });
    }

    installment.isSkipped = false;
    installment.skippedReason = undefined;
    installment.skippedDate = undefined;

    await installment.save(); // This will trigger the pre-save hook

    res.json({
      success: true,
      message: 'Fee installment unskipped successfully',
      data: installment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Apply discount to fee installment
// @route   POST /api/fee-installments/:id/discount
// @access  Private (Admin)
exports.applyDiscount = async (req, res) => {
  try {
    const { amount, reason } = req.body;

    const installment = await FeeInstallment.findById(req.params.id);

    if (!installment) {
      return res.status(404).json({
        success: false,
        message: 'Fee installment not found'
      });
    }

    installment.discount = parseFloat(amount);
    installment.discountReason = reason;

    await installment.save(); // This will trigger the pre-save hook

    res.json({
      success: true,
      message: 'Discount applied successfully',
      data: installment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update fee installment
// @route   PUT /api/fee-installments/:id
// @access  Private (Admin)
exports.updateFeeInstallment = async (req, res) => {
  try {
    const installment = await FeeInstallment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!installment) {
      return res.status(404).json({
        success: false,
        message: 'Fee installment not found'
      });
    }

    res.json({
      success: true,
      data: installment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete fee installment
// @route   DELETE /api/fee-installments/:id
// @access  Private (Admin)
exports.deleteFeeInstallment = async (req, res) => {
  try {
    const installment = await FeeInstallment.findById(req.params.id);

    if (!installment) {
      return res.status(404).json({
        success: false,
        message: 'Fee installment not found'
      });
    }

    await installment.deleteOne();

    res.json({
      success: true,
      message: 'Fee installment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Fix existing fee installments (recalculate balance and status)
// @route   POST /api/fee-installments/fix-existing
// @access  Private (Admin)
exports.fixExistingInstallments = async (req, res) => {
  try {
    const installments = await FeeInstallment.find({});
    let updatedCount = 0;

    for (const installment of installments) {
      // Calculate balance
      const effectiveAmount = installment.amount - (installment.discount || 0);
      installment.balance = effectiveAmount - (installment.paidAmount || 0);

      // Update status based on payment
      if (installment.isSkipped) {
        installment.status = 'skipped';
      } else if (installment.balance <= 0) {
        installment.status = 'paid';
      } else if (installment.paidAmount > 0) {
        installment.status = 'partial';
      } else if (new Date() > installment.dueDate) {
        installment.status = 'overdue';
      } else {
        installment.status = 'pending';
      }

      await installment.save({ validateBeforeSave: false });
      updatedCount++;
    }

    res.json({
      success: true,
      message: `Fixed ${updatedCount} fee installments`,
      data: { updatedCount }
    });
  } catch (error) {
    console.error('Error fixing installments:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Generate fees for a specific student
// @route   POST /api/fee-installments/generate-for-student
// @access  Private (Admin)
exports.generateFeesForStudent = async (req, res) => {
  try {
    const { studentId, academicYearId, classId } = req.body;

    // Check if fees already exist for this student
    const existingFees = await FeeInstallment.findOne({
      student: studentId,
      academicYear: academicYearId,
      class: classId
    });

    if (existingFees) {
      return res.status(400).json({
        success: false,
        message: 'Fees already exist for this student in this academic year and class'
      });
    }

    // Get fee configuration for this class and academic year
    const configuration = await FeeConfiguration.findOne({
      academicYear: academicYearId,
      class: classId
    }).populate('academicYear');

    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: 'Fee configuration not found for this class and academic year'
      });
    }

    // Validate that academicYear has a valid startDate
    if (!configuration.academicYear || !configuration.academicYear.startDate) {
      return res.status(400).json({
        success: false,
        message: 'Academic year or start date is missing'
      });
    }

    // Validate the start date
    const startDate = new Date(configuration.academicYear.startDate);
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Academic year has an invalid start date'
      });
    }

    const months = ['April', 'May', 'June', 'July', 'August', 'September',
                    'October', 'November', 'December', 'January', 'February', 'March'];

    let feeInstallments = [];

    // Generate monthly tuition fees
    for (let i = 0; i < 12; i++) {
      const month = months[i];
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      dueDate.setDate(10); // Due on 10th of each month
      const amount = configuration.feeStructure.tuitionFee;
      const status = new Date() > dueDate ? 'overdue' : 'pending';

      feeInstallments.push({
        student: studentId,
        academicYear: academicYearId,
        class: classId,
        feeType: 'tuition',
        feeName: `${month} Tuition Fee`,
        month: month,
        amount: amount,
        paidAmount: 0,
        balance: amount,
        dueDate: dueDate,
        status: status,
      });
    }

    // Generate exam fees
    configuration.feeStructure.examFees.forEach((exam, index) => {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + (index * 3)); // Quarterly
      const status = new Date() > dueDate ? 'overdue' : 'pending';

      feeInstallments.push({
        student: studentId,
        academicYear: academicYearId,
        class: classId,
        feeType: 'exam',
        feeName: exam.name,
        term: exam.name,
        amount: exam.amount,
        paidAmount: 0,
        balance: exam.amount,
        dueDate: dueDate,
        status: status,
      });
    });

    // Generate other fees
    configuration.feeStructure.otherFees.forEach((fee) => {
      if (fee.frequency === 'one-time' || fee.frequency === 'annual') {
        const dueDate = new Date(startDate);
        const status = new Date() > dueDate ? 'overdue' : 'pending';

        feeInstallments.push({
          student: studentId,
          academicYear: academicYearId,
          class: classId,
          feeType: 'other',
          feeName: fee.name,
          amount: fee.amount,
          paidAmount: 0,
          balance: fee.amount,
          dueDate: dueDate,
          status: status,
        });
      } else if (fee.frequency === 'monthly') {
        for (let i = 0; i < 12; i++) {
          const month = months[i];
          const dueDate = new Date(startDate);
          dueDate.setMonth(dueDate.getMonth() + i);
          const status = new Date() > dueDate ? 'overdue' : 'pending';

          feeInstallments.push({
            student: studentId,
            academicYear: academicYearId,
            class: classId,
            feeType: 'other',
            feeName: `${month} ${fee.name}`,
            month: month,
            amount: fee.amount,
            paidAmount: 0,
            balance: fee.amount,
            dueDate: dueDate,
            status: status,
          });
        }
      }
    });

    // Insert all fee installments
    const created = await FeeInstallment.insertMany(feeInstallments);

    res.json({
      success: true,
      message: `Generated ${created.length} fee installments for the student`,
      data: created
    });
  } catch (error) {
    console.error('Error generating fees for student:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
