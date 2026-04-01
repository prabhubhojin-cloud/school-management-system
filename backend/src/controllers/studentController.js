const Student = require('../models/Student');
const User = require('../models/User');
const FeeConfiguration = require('../models/FeeConfiguration');
const FeeInstallment = require('../models/FeeInstallment');
const { uploadToS3 } = require('../middleware/upload');

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

    // Upload documents to S3 if provided
    if (req.files) {
      const s3File = async (fieldName) => {
        const f = req.files[fieldName]?.[0] || req.files[fieldName];
        return f ? await uploadToS3(f, 'students') : undefined;
      };

      studentData.studentDocuments = {
        birthCertificate:    await s3File('birthCertificate'),
        aadharCard:          await s3File('aadharCard'),
        transferCertificate: await s3File('transferCertificate'),
        studentPhoto:        await s3File('studentPhoto'),
        additionalDoc1:      await s3File('additionalDoc1'),
        additionalDoc2:      await s3File('additionalDoc2'),
      };

      if (studentData.father) {
        studentData.father.idProof      = await s3File('fatherIdProof');
        studentData.father.addressProof = await s3File('fatherAddressProof');
        studentData.father.photo        = await s3File('fatherPhoto');
      }

      if (studentData.mother) {
        studentData.mother.idProof      = await s3File('motherIdProof');
        studentData.mother.addressProof = await s3File('motherAddressProof');
        studentData.mother.photo        = await s3File('motherPhoto');
      }

      if (includeGuardian && studentData.guardian) {
        studentData.guardian.idProof      = await s3File('guardianIdProof');
        studentData.guardian.addressProof = await s3File('guardianAddressProof');
        studentData.guardian.photo        = await s3File('guardianPhoto');
      } else if (!includeGuardian) {
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

    // Upload new files to S3 (only replaces fields where new file is provided)
    if (req.files) {
      if (!studentData.studentDocuments) studentData.studentDocuments = {};

      const s3File = async (fieldName) => {
        const f = req.files[fieldName]?.[0] || req.files[fieldName];
        return f ? await uploadToS3(f, 'students') : undefined;
      };

      const updateIfUploaded = async (obj, key, fieldName) => {
        const url = await s3File(fieldName);
        if (url) obj[key] = url;
      };

      await updateIfUploaded(studentData.studentDocuments, 'birthCertificate',    'birthCertificate');
      await updateIfUploaded(studentData.studentDocuments, 'aadharCard',          'aadharCard');
      await updateIfUploaded(studentData.studentDocuments, 'transferCertificate', 'transferCertificate');
      await updateIfUploaded(studentData.studentDocuments, 'studentPhoto',        'studentPhoto');
      await updateIfUploaded(studentData.studentDocuments, 'additionalDoc1',      'additionalDoc1');
      await updateIfUploaded(studentData.studentDocuments, 'additionalDoc2',      'additionalDoc2');

      if (studentData.father) {
        await updateIfUploaded(studentData.father, 'idProof',      'fatherIdProof');
        await updateIfUploaded(studentData.father, 'addressProof', 'fatherAddressProof');
        await updateIfUploaded(studentData.father, 'photo',        'fatherPhoto');
      }

      if (studentData.mother) {
        await updateIfUploaded(studentData.mother, 'idProof',      'motherIdProof');
        await updateIfUploaded(studentData.mother, 'addressProof', 'motherAddressProof');
        await updateIfUploaded(studentData.mother, 'photo',        'motherPhoto');
      }

      if (includeGuardian && studentData.guardian) {
        await updateIfUploaded(studentData.guardian, 'idProof',      'guardianIdProof');
        await updateIfUploaded(studentData.guardian, 'addressProof', 'guardianAddressProof');
        await updateIfUploaded(studentData.guardian, 'photo',        'guardianPhoto');
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
