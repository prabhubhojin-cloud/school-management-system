const FeeConfiguration = require('../models/FeeConfiguration');
const FeeInstallment = require('../models/FeeInstallment');
const Student = require('../models/Student');

// @desc    Get all fee configurations
// @route   GET /api/fee-configurations
// @access  Private (Admin)
exports.getFeeConfigurations = async (req, res) => {
  try {
    const { academicYear, class: classId } = req.query;

    let query = {};
    if (academicYear) query.academicYear = academicYear;
    if (classId) query.class = classId;

    const configurations = await FeeConfiguration.find(query)
      .populate('academicYear', 'year')
      .populate('class', 'name section')
      .sort('-createdAt');

    res.json({
      success: true,
      count: configurations.length,
      data: configurations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single fee configuration
// @route   GET /api/fee-configurations/:id
// @access  Private (Admin)
exports.getFeeConfiguration = async (req, res) => {
  try {
    const configuration = await FeeConfiguration.findById(req.params.id)
      .populate('academicYear')
      .populate('class');

    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: 'Fee configuration not found'
      });
    }

    res.json({
      success: true,
      data: configuration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create fee configuration
// @route   POST /api/fee-configurations
// @access  Private (Admin)
exports.createFeeConfiguration = async (req, res) => {
  try {
    const configuration = await FeeConfiguration.create(req.body);

    res.status(201).json({
      success: true,
      data: configuration
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Fee configuration already exists for this class and academic year'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update fee configuration
// @route   PUT /api/fee-configurations/:id
// @access  Private (Admin)
exports.updateFeeConfiguration = async (req, res) => {
  try {
    let configuration = await FeeConfiguration.findById(req.params.id);

    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: 'Fee configuration not found'
      });
    }

    configuration = await FeeConfiguration.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      data: configuration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete fee configuration
// @route   DELETE /api/fee-configurations/:id
// @access  Private (Admin)
exports.deleteFeeConfiguration = async (req, res) => {
  try {
    const configuration = await FeeConfiguration.findById(req.params.id);

    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: 'Fee configuration not found'
      });
    }

    await configuration.deleteOne();

    res.json({
      success: true,
      message: 'Fee configuration deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Generate fees for all students in a class
// @route   POST /api/fee-configurations/:id/generate-fees
// @access  Private (Admin)
exports.generateFeesForClass = async (req, res) => {
  try {
    const configuration = await FeeConfiguration.findById(req.params.id)
      .populate('academicYear')
      .populate('class');

    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: 'Fee configuration not found'
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

    // Find all active students in this class and academic year
    const students = await Student.find({
      currentClass: configuration.class._id,
      currentAcademicYear: configuration.academicYear._id,
      status: 'active'
    });

    if (students.length === 0) {
      return res.json({
        success: true,
        message: 'No active students found in this class',
        data: {
          studentsCount: 0,
          installmentsCount: 0
        }
      });
    }

    const months = ['April', 'May', 'June', 'July', 'August', 'September',
                    'October', 'November', 'December', 'January', 'February', 'March'];

    let feeInstallments = [];
    let skippedCount = 0;

    for (const student of students) {
      // Check if fees already exist for this student
      const existingFees = await FeeInstallment.findOne({
        student: student._id,
        academicYear: configuration.academicYear._id,
        class: configuration.class._id
      });

      if (existingFees) {
        console.log(`Fees already exist for student ${student._id}, skipping`);
        skippedCount++;
        continue;
      }

      // Generate monthly tuition fees
      for (let i = 0; i < 12; i++) {
        const month = months[i];
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        dueDate.setDate(10); // Due on 10th of each month
        const amount = configuration.feeStructure.tuitionFee;
        const status = new Date() > dueDate ? 'overdue' : 'pending';

        feeInstallments.push({
          student: student._id,
          academicYear: configuration.academicYear._id,
          class: configuration.class._id,
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
          student: student._id,
          academicYear: configuration.academicYear._id,
          class: configuration.class._id,
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
            student: student._id,
            academicYear: configuration.academicYear._id,
            class: configuration.class._id,
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
              student: student._id,
              academicYear: configuration.academicYear._id,
              class: configuration.class._id,
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
    }

    // Bulk insert all fee installments
    if (feeInstallments.length > 0) {
      await FeeInstallment.insertMany(feeInstallments);
    }

    const processedCount = students.length - skippedCount;
    let message = '';
    if (skippedCount > 0) {
      message = `Generated ${feeInstallments.length} fee installments for ${processedCount} students. Skipped ${skippedCount} students (fees already exist).`;
    } else {
      message = `Generated ${feeInstallments.length} fee installments for ${processedCount} students`;
    }

    res.json({
      success: true,
      message: message,
      data: {
        studentsCount: students.length,
        processedCount: processedCount,
        skippedCount: skippedCount,
        installmentsCount: feeInstallments.length
      }
    });
  } catch (error) {
    console.error('Error generating fees:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
