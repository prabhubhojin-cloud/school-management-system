const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');

// @desc    Mark daily attendance for a class
// @route   POST /api/attendance/mark-daily
// @access  Private (Teacher/Admin)
exports.markDailyAttendance = async (req, res) => {
  try {
    const { classId, date, attendanceRecords, academicYearId } = req.body;

    // Validate input
    if (!classId || !date || !attendanceRecords || !academicYearId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide classId, date, academicYearId, and attendanceRecords'
      });
    }

    // Verify class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Get teacher ID from user
    let teacherId;
    if (req.user.role === 'teacher') {
      teacherId = req.user.roleRef;
    } else if (req.user.role === 'admin') {
      // For admin, we can use a default or require teacherId in request
      teacherId = req.body.teacherId || req.user.roleRef;
    }

    const attendanceDate = new Date(date);
    const results = [];
    const errors = [];

    // Process each attendance record
    for (const record of attendanceRecords) {
      try {
        const { studentId, status, remarks } = record;

        // Check if attendance already exists for this student on this date
        const existingAttendance = await Attendance.findOne({
          student: studentId,
          date: {
            $gte: new Date(attendanceDate.setHours(0, 0, 0, 0)),
            $lt: new Date(attendanceDate.setHours(23, 59, 59, 999))
          }
        });

        if (existingAttendance) {
          // Update existing attendance
          existingAttendance.status = status;
          existingAttendance.remarks = remarks || '';
          existingAttendance.markedBy = teacherId;
          existingAttendance.class = classId;
          existingAttendance.academicYear = academicYearId;
          await existingAttendance.save();
          results.push(existingAttendance);
        } else {
          // Create new attendance record
          const attendance = await Attendance.create({
            student: studentId,
            class: classId,
            academicYear: academicYearId,
            date: new Date(date),
            status,
            markedBy: teacherId,
            remarks: remarks || ''
          });
          results.push(attendance);
        }
      } catch (error) {
        errors.push({
          studentId: record.studentId,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get attendance for a class on a specific date
// @route   GET /api/attendance/daily/:classId/:date
// @access  Private (Teacher/Admin)
exports.getAttendanceByDate = async (req, res) => {
  try {
    const { classId, date } = req.params;

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      class: classId,
      date: {
        $gte: startDate,
        $lt: endDate
      }
    })
      .populate('student', 'firstName lastName admissionNumber currentRollNumber')
      .populate('markedBy', 'firstName lastName')
      .sort('student.currentRollNumber');

    // Get all students in the class
    const allStudents = await Student.find({
      currentClass: classId,
      status: 'active'
    }).select('firstName lastName admissionNumber currentRollNumber');

    // Create a map of students who have attendance marked
    const markedStudents = new Set(attendance.map(a => a.student._id.toString()));

    // Find students without attendance
    const unmarkedStudents = allStudents.filter(
      student => !markedStudents.has(student._id.toString())
    );

    res.json({
      success: true,
      data: {
        attendance,
        unmarkedStudents,
        stats: {
          total: allStudents.length,
          marked: attendance.length,
          unmarked: unmarkedStudents.length,
          present: attendance.filter(a => a.status === 'present').length,
          absent: attendance.filter(a => a.status === 'absent').length,
          late: attendance.filter(a => a.status === 'late').length,
          halfDay: attendance.filter(a => a.status === 'halfDay').length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get monthly attendance for a student
// @route   GET /api/attendance/student/:studentId/monthly
// @access  Private
exports.getStudentMonthlyAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { month, year, academicYearId } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide month and year'
      });
    }

    const query = {
      student: studentId,
      month: parseInt(month),
      year: parseInt(year)
    };

    if (academicYearId) {
      query.academicYear = academicYearId;
    }

    const attendance = await Attendance.find(query)
      .populate('class', 'name section')
      .populate('markedBy', 'firstName lastName')
      .sort('date');

    // Calculate statistics
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a =>
      ['present', 'late', 'halfDay'].includes(a.status)
    ).length;
    const absentDays = attendance.filter(a => a.status === 'absent').length;
    const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        attendance,
        stats: {
          totalDays,
          presentDays,
          absentDays,
          percentage,
          breakdown: {
            present: attendance.filter(a => a.status === 'present').length,
            absent: attendance.filter(a => a.status === 'absent').length,
            late: attendance.filter(a => a.status === 'late').length,
            halfDay: attendance.filter(a => a.status === 'halfDay').length,
            sickLeave: attendance.filter(a => a.status === 'sickLeave').length,
            authorizedLeave: attendance.filter(a => a.status === 'authorizedLeave').length
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get monthly attendance summary for a class
// @route   GET /api/attendance/class/:classId/monthly
// @access  Private (Teacher/Admin)
exports.getClassMonthlyAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide month and year'
      });
    }

    const attendance = await Attendance.find({
      class: classId,
      month: parseInt(month),
      year: parseInt(year)
    })
      .populate('student', 'firstName lastName admissionNumber currentRollNumber')
      .sort('date');

    // Get all students in the class
    const students = await Student.find({
      currentClass: classId,
      status: 'active'
    }).select('firstName lastName admissionNumber currentRollNumber');

    // Calculate per-student statistics
    const studentStats = students.map(student => {
      const studentAttendance = attendance.filter(
        a => a.student._id.toString() === student._id.toString()
      );

      const totalDays = studentAttendance.length;
      const presentDays = studentAttendance.filter(a =>
        ['present', 'late', 'halfDay'].includes(a.status)
      ).length;
      const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

      return {
        student: {
          _id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          admissionNumber: student.admissionNumber,
          rollNumber: student.currentRollNumber
        },
        totalDays,
        presentDays,
        absentDays: studentAttendance.filter(a => a.status === 'absent').length,
        percentage,
        breakdown: {
          present: studentAttendance.filter(a => a.status === 'present').length,
          absent: studentAttendance.filter(a => a.status === 'absent').length,
          late: studentAttendance.filter(a => a.status === 'late').length,
          halfDay: studentAttendance.filter(a => a.status === 'halfDay').length,
          sickLeave: studentAttendance.filter(a => a.status === 'sickLeave').length,
          authorizedLeave: studentAttendance.filter(a => a.status === 'authorizedLeave').length
        }
      };
    });

    res.json({
      success: true,
      data: {
        studentStats,
        classStats: {
          totalStudents: students.length,
          averageAttendance: studentStats.reduce((sum, s) => sum + parseFloat(s.percentage), 0) / students.length || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update single attendance record
// @route   PUT /api/attendance/:id
// @access  Private (Teacher/Admin)
exports.updateAttendance = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    let attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Update fields
    if (status) attendance.status = status;
    if (remarks !== undefined) attendance.remarks = remarks;

    await attendance.save();

    attendance = await Attendance.findById(req.params.id)
      .populate('student', 'firstName lastName admissionNumber')
      .populate('class', 'name section')
      .populate('markedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Attendance updated successfully',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (Admin only)
exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    await attendance.deleteOne();

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get attendance statistics for a student
// @route   GET /api/attendance/student/:studentId/stats
// @access  Private
exports.getStudentAttendanceStats = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYearId } = req.query;

    const query = { student: studentId };
    if (academicYearId) {
      query.academicYear = academicYearId;
    }

    const attendance = await Attendance.find(query);

    const totalDays = attendance.length;
    const presentDays = attendance.filter(a =>
      ['present', 'late', 'halfDay'].includes(a.status)
    ).length;
    const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

    // Monthly breakdown
    const monthlyData = {};
    attendance.forEach(record => {
      const key = `${record.year}-${record.month}`;
      if (!monthlyData[key]) {
        monthlyData[key] = {
          month: record.month,
          year: record.year,
          total: 0,
          present: 0,
          absent: 0
        };
      }
      monthlyData[key].total++;
      if (['present', 'late', 'halfDay'].includes(record.status)) {
        monthlyData[key].present++;
      } else {
        monthlyData[key].absent++;
      }
    });

    res.json({
      success: true,
      data: {
        overall: {
          totalDays,
          presentDays,
          absentDays: attendance.filter(a => a.status === 'absent').length,
          percentage,
          breakdown: {
            present: attendance.filter(a => a.status === 'present').length,
            absent: attendance.filter(a => a.status === 'absent').length,
            late: attendance.filter(a => a.status === 'late').length,
            halfDay: attendance.filter(a => a.status === 'halfDay').length,
            sickLeave: attendance.filter(a => a.status === 'sickLeave').length,
            authorizedLeave: attendance.filter(a => a.status === 'authorizedLeave').length
          }
        },
        monthly: Object.values(monthlyData).sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.month - b.month;
        })
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
