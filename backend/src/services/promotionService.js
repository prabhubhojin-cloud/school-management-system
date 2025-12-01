const Student = require('../models/Student');
const Class = require('../models/Class');
const AcademicYear = require('../models/AcademicYear');

/**
 * Promote students to next academic year
 */
exports.promoteStudents = async (currentYearId, nextYearId, promotionData) => {
  try {
    const promotedStudents = [];
    const errors = [];

    for (const data of promotionData) {
      try {
        const student = await Student.findById(data.studentId);

        if (!student) {
          errors.push({ studentId: data.studentId, error: 'Student not found' });
          continue;
        }

        // Get the next class
        const nextClass = await Class.findById(data.nextClassId);

        if (!nextClass) {
          errors.push({ studentId: data.studentId, error: 'Next class not found' });
          continue;
        }

        // Update current enrollment status
        const currentEnrollment = student.enrollments.find(
          e => e.academicYear.toString() === currentYearId.toString()
        );

        if (currentEnrollment) {
          currentEnrollment.status = data.status || 'promoted';
        }

        // Add new enrollment
        student.enrollments.push({
          academicYear: nextYearId,
          class: data.nextClassId,
          rollNumber: data.rollNumber,
          status: 'active',
        });

        // Update current fields
        student.currentClass = data.nextClassId;
        student.currentAcademicYear = nextYearId;
        student.currentRollNumber = data.rollNumber;

        await student.save();
        promotedStudents.push(student);

      } catch (error) {
        errors.push({ studentId: data.studentId, error: error.message });
      }
    }

    // Mark academic year promotion as done
    await AcademicYear.findByIdAndUpdate(currentYearId, { promotionDone: true });

    return {
      success: true,
      promoted: promotedStudents.length,
      errors: errors.length,
      details: { promotedStudents, errors }
    };

  } catch (error) {
    throw new Error(`Promotion failed: ${error.message}`);
  }
};
