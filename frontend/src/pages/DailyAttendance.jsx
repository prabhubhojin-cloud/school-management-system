import { useState, useEffect } from 'react';
import { attendanceAPI, classAPI, studentAPI, academicYearAPI } from '../services/api';
import { toast } from 'react-toastify';
import '../styles/Table.css';

const DailyAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [academicYear, setAcademicYear] = useState(null);
  const [hasExistingAttendance, setHasExistingAttendance] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchActiveAcademicYear();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsAndAttendance();
    }
  }, [selectedClass, selectedDate]);

  const fetchActiveAcademicYear = async () => {
    try {
      const response = await academicYearAPI.getActive();
      setAcademicYear(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch active academic year');
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getAll();
      setClasses(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch classes');
    }
  };

  const fetchStudentsAndAttendance = async () => {
    setLoading(true);
    try {
      // Fetch attendance for the selected date
      const attendanceResponse = await attendanceAPI.getByDate(selectedClass, selectedDate);
      const { attendance, unmarkedStudents } = attendanceResponse.data.data;

      // Create initial attendance records
      const records = {};

      // Add existing attendance
      attendance.forEach(record => {
        records[record.student._id] = {
          studentId: record.student._id,
          status: record.status,
          remarks: record.remarks || '',
          attendanceId: record._id
        };
      });

      // Add unmarked students with default 'present' status
      unmarkedStudents.forEach(student => {
        records[student._id] = {
          studentId: student._id,
          status: 'present',
          remarks: ''
        };
      });

      setAttendanceRecords(records);

      // Combine all students
      const allStudents = [
        ...attendance.map(a => a.student),
        ...unmarkedStudents
      ].sort((a, b) => (a.currentRollNumber || 0) - (b.currentRollNumber || 0));

      setStudents(allStudents);
      setHasExistingAttendance(attendance.length > 0);
    } catch (error) {
      toast.error('Failed to fetch students and attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedClass) {
      toast.error('Please select a class');
      return;
    }

    if (!academicYear) {
      toast.error('No active academic year found');
      return;
    }

    try {
      setLoading(true);

      const attendanceData = Object.values(attendanceRecords).map(record => ({
        studentId: record.studentId,
        status: record.status,
        remarks: record.remarks
      }));

      await attendanceAPI.markDaily({
        classId: selectedClass,
        date: selectedDate,
        academicYearId: academicYear._id,
        attendanceRecords: attendanceData
      });

      toast.success('Attendance marked successfully');
      fetchStudentsAndAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAll = (status) => {
    const updatedRecords = {};
    Object.keys(attendanceRecords).forEach(studentId => {
      updatedRecords[studentId] = {
        ...attendanceRecords[studentId],
        status
      };
    });
    setAttendanceRecords(updatedRecords);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'present': return 'status-active';
      case 'absent': return 'status-inactive';
      case 'late': return 'status-warning';
      case 'halfDay': return 'status-warning';
      case 'sickLeave': return 'status-info';
      case 'authorizedLeave': return 'status-info';
      default: return '';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Daily Attendance</h1>
      </div>

      <div className="filters-container" style={{ marginBottom: '2rem' }}>
        <div className="filter-group">
          <label>Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="filter-select"
          >
            <option value="">Select Class</option>
            {classes.map(cls => (
              <option key={cls._id} value={cls._id}>
                {cls.name} - {cls.section}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="filter-input"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {selectedClass && students.length > 0 && (
        <>
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-success"
              onClick={() => handleMarkAll('present')}
            >
              Mark All Present
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={() => handleMarkAll('absent')}
            >
              Mark All Absent
            </button>
            {hasExistingAttendance && (
              <span style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--info-color)',
                color: 'white',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}>
                Updating existing attendance
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Admission No</th>
                    <th>Student Name</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td>{student.currentRollNumber || '-'}</td>
                      <td>{student.admissionNumber}</td>
                      <td>{student.firstName} {student.lastName}</td>
                      <td>
                        <select
                          value={attendanceRecords[student._id]?.status || 'present'}
                          onChange={(e) => handleStatusChange(student._id, e.target.value)}
                          className="form-select"
                          style={{ minWidth: '150px' }}
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                          <option value="halfDay">Half Day</option>
                          <option value="sickLeave">Sick Leave</option>
                          <option value="authorizedLeave">Authorized Leave</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={attendanceRecords[student._id]?.remarks || ''}
                          onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                          placeholder="Optional remarks"
                          className="form-input"
                          style={{ minWidth: '200px' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </form>
        </>
      )}

      {selectedClass && students.length === 0 && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--background-secondary)',
          borderRadius: '8px'
        }}>
          No students found in this class.
        </div>
      )}

      {!selectedClass && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--background-secondary)',
          borderRadius: '8px'
        }}>
          Please select a class and date to mark attendance.
        </div>
      )}
    </div>
  );
};

export default DailyAttendance;
