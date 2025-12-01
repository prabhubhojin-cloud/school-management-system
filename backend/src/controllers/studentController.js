const Student = require('../models/Student');
const User = require('../models/User');
const FeeConfiguration = require('../models/FeeConfiguration');
const FeeInstallment = require('../models/FeeInstallment');

// Helper function to generate admission number
const generateAdmissionNumber = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `ADM-${currentYear}-`;

  // Find the latest admission number for the current year
  const lastStudent = await Student.findOne({
    admissionNumber: { $regex: `^${prefix}` }
  }).sort({ createdAt: -1 });

  let nextNumber = 1;
  if (lastStudent && lastStudent.admissionNumber) {
    const lastNumber = parseInt(lastStudent.admissionNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  // Format number with leading zeros (e.g., 0001, 0002, etc.)
  const formattedNumber = String(nextNumber).padStart(4, '0');
  return `${prefix}${formattedNumber}`;
};

// Helper function to auto-generate fees for a new student
const autoGenerateFees = async (studentId, academicYearId, classId) => {
  try {
    // Check if fees already exist for this student
    const existingFees = await FeeInstallment.findOne({
      student: studentId,
      academicYear: academicYearId,
      class: classId
    });

    if (existingFees) {
      console.log('Fees already exist for this student, skipping auto-generation');
      return;
    }

    // Get fee configuration for this class and academic year
    const configuration = await FeeConfiguration.findOne({
      academicYear: academicYearId,
      class: classId
    }).populate('academicYear');

    if (!configuration) {
      console.log('No fee configuration found for this class and academic year');
      return; // Skip if no configuration exists
    }

    // Validate that academicYear has a valid startDate
    if (!configuration.academicYear || !configuration.academicYear.startDate) {
      console.log('Academic year startDate is missing or invalid');
      return;
    }

    // Validate the start date
    const startDate = new Date(configuration.academicYear.startDate);
    if (isNaN(startDate.getTime())) {
      console.log('Academic year startDate is not a valid date');
      return;
    }

    const months = ['April', 'May', 'June', 'July', 'August', 'September',
                    'October', 'November', 'December', 'January', 'February', 'March'];

    let feeInstallments = [];

    // Generate monthly tuition fees (April to March)
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

    // Generate exam fees (4 exams)
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
    if (feeInstallments.length > 0) {
      await FeeInstallment.insertMany(feeInstallments);
      console.log(`Generated ${feeInstallments.length} fee installments for student ${studentId}`);
    }
  } catch (error) {
    console.error('Error auto-generating fees:', error);
    // Don't throw error - just log it to avoid breaking student creation
  }
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin, Teacher)
exports.getStudents = async (req, res) => {
  try {
    const { academicYear, class: classId, status, search } = req.query;

    let query = {};

    if (academicYear) query.currentAcademicYear = academicYear;
    if (classId) query.currentClass = classId;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { admissionNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(query)
      .populate('currentClass')
      .populate('currentAcademicYear')
      .sort('-createdAt');

    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('currentClass')
      .populate('currentAcademicYear')
      .populate('enrollments.class')
      .populate('enrollments.academicYear');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create student
// @route   POST /api/students
// @access  Private (Admin)
exports.createStudent = async (req, res) => {
  try {
    // Parse student data from form data
    const studentData = req.body.studentData ? JSON.parse(req.body.studentData) : req.body;
    const includeGuardian = req.body.includeGuardian === 'true';

    // Generate admission number automatically
    studentData.admissionNumber = await generateAdmissionNumber();

    // Add document paths from uploaded files
    if (req.files) {
      studentData.studentDocuments = {
        birthCertificate: req.files.birthCertificate?.[0]?.path || req.files.birthCertificate?.path,
        aadharCard: req.files.aadharCard?.[0]?.path || req.files.aadharCard?.path,
        transferCertificate: req.files.transferCertificate?.[0]?.path || req.files.transferCertificate?.path,
        studentPhoto: req.files.studentPhoto?.[0]?.path || req.files.studentPhoto?.path,
        additionalDoc1: req.files.additionalDoc1?.[0]?.path || req.files.additionalDoc1?.path,
        additionalDoc2: req.files.additionalDoc2?.[0]?.path || req.files.additionalDoc2?.path,
      };

      // Father documents
      if (studentData.father) {
        studentData.father.idProof = req.files.fatherIdProof?.[0]?.path || req.files.fatherIdProof?.path;
        studentData.father.addressProof = req.files.fatherAddressProof?.[0]?.path || req.files.fatherAddressProof?.path;
        studentData.father.photo = req.files.fatherPhoto?.[0]?.path || req.files.fatherPhoto?.path;
      }

      // Mother documents
      if (studentData.mother) {
        studentData.mother.idProof = req.files.motherIdProof?.[0]?.path || req.files.motherIdProof?.path;
        studentData.mother.addressProof = req.files.motherAddressProof?.[0]?.path || req.files.motherAddressProof?.path;
        studentData.mother.photo = req.files.motherPhoto?.[0]?.path || req.files.motherPhoto?.path;
      }

      // Guardian documents (if included)
      if (includeGuardian && studentData.guardian) {
        studentData.guardian.idProof = req.files.guardianIdProof?.[0]?.path || req.files.guardianIdProof?.path;
        studentData.guardian.addressProof = req.files.guardianAddressProof?.[0]?.path || req.files.guardianAddressProof?.path;
        studentData.guardian.photo = req.files.guardianPhoto?.[0]?.path || req.files.guardianPhoto?.path;
      } else if (!includeGuardian) {
        // Clear guardian data if not included
        studentData.guardian = undefined;
      }
    }

    // Create student
    const student = await Student.create(studentData);

    // Create user account for student if email provided
    if (studentData.email) {
      try {
        const user = await User.create({
          email: studentData.email,
          password: studentData.dateOfBirth.toString().split('T')[0].replace(/-/g, ''), // Default: YYYYMMDD
          role: 'student',
          roleRef: student._id,
          roleModel: 'Student',
        });

        student.user = user._id;
        await student.save();
      } catch (userError) {
        // If user creation fails, delete the student record
        await Student.findByIdAndDelete(student._id);
        throw userError;
      }
    }

    // Auto-generate fee installments for the student
    if (studentData.currentClass && studentData.currentAcademicYear) {
      await autoGenerateFees(student._id, studentData.currentAcademicYear, studentData.currentClass);
    }

    res.status(201).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin)
exports.updateStudent = async (req, res) => {
  try {
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Parse student data from form data
    const studentData = req.body.studentData ? JSON.parse(req.body.studentData) : req.body;
    const includeGuardian = req.body.includeGuardian === 'true';

    // Update document paths from uploaded files (if new files provided)
    if (req.files) {
      // Initialize studentDocuments if it doesn't exist
      if (!studentData.studentDocuments) {
        studentData.studentDocuments = {};
      }

      // Update only if new files are uploaded
      if (req.files.birthCertificate) {
        studentData.studentDocuments.birthCertificate = req.files.birthCertificate[0]?.path || req.files.birthCertificate.path;
      }
      if (req.files.aadharCard) {
        studentData.studentDocuments.aadharCard = req.files.aadharCard[0]?.path || req.files.aadharCard.path;
      }
      if (req.files.transferCertificate) {
        studentData.studentDocuments.transferCertificate = req.files.transferCertificate[0]?.path || req.files.transferCertificate.path;
      }
      if (req.files.studentPhoto) {
        studentData.studentDocuments.studentPhoto = req.files.studentPhoto[0]?.path || req.files.studentPhoto.path;
      }
      if (req.files.additionalDoc1) {
        studentData.studentDocuments.additionalDoc1 = req.files.additionalDoc1[0]?.path || req.files.additionalDoc1.path;
      }
      if (req.files.additionalDoc2) {
        studentData.studentDocuments.additionalDoc2 = req.files.additionalDoc2[0]?.path || req.files.additionalDoc2.path;
      }

      // Father documents
      if (studentData.father) {
        if (req.files.fatherIdProof) {
          studentData.father.idProof = req.files.fatherIdProof[0]?.path || req.files.fatherIdProof.path;
        }
        if (req.files.fatherAddressProof) {
          studentData.father.addressProof = req.files.fatherAddressProof[0]?.path || req.files.fatherAddressProof.path;
        }
        if (req.files.fatherPhoto) {
          studentData.father.photo = req.files.fatherPhoto[0]?.path || req.files.fatherPhoto.path;
        }
      }

      // Mother documents
      if (studentData.mother) {
        if (req.files.motherIdProof) {
          studentData.mother.idProof = req.files.motherIdProof[0]?.path || req.files.motherIdProof.path;
        }
        if (req.files.motherAddressProof) {
          studentData.mother.addressProof = req.files.motherAddressProof[0]?.path || req.files.motherAddressProof.path;
        }
        if (req.files.motherPhoto) {
          studentData.mother.photo = req.files.motherPhoto[0]?.path || req.files.motherPhoto.path;
        }
      }

      // Guardian documents
      if (includeGuardian && studentData.guardian) {
        if (req.files.guardianIdProof) {
          studentData.guardian.idProof = req.files.guardianIdProof[0]?.path || req.files.guardianIdProof.path;
        }
        if (req.files.guardianAddressProof) {
          studentData.guardian.addressProof = req.files.guardianAddressProof[0]?.path || req.files.guardianAddressProof.path;
        }
        if (req.files.guardianPhoto) {
          studentData.guardian.photo = req.files.guardianPhoto[0]?.path || req.files.guardianPhoto.path;
        }
      } else if (!includeGuardian) {
        studentData.guardian = undefined;
      }
    }

    student = await Student.findByIdAndUpdate(req.params.id, studentData, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Delete associated user
    if (student.user) {
      await User.findByIdAndDelete(student.user);
    }

    await student.deleteOne();

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Enroll student in class
// @route   POST /api/students/:id/enroll
// @access  Private (Admin)
exports.enrollStudent = async (req, res) => {
  try {
    const { academicYear, classId, rollNumber } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Add enrollment
    student.enrollments.push({
      academicYear,
      class: classId,
      rollNumber,
      status: 'active',
    });

    // Update current enrollment
    student.currentClass = classId;
    student.currentAcademicYear = academicYear;
    student.currentRollNumber = rollNumber;

    await student.save();

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
