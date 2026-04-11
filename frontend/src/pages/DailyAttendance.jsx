import { useState, useEffect } from 'react';
import { attendanceAPI, classAPI, academicYearAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/Table.css';

const DailyAttendance = () => {
  const { isTeacher } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [academicYear, setAcademicYear] = useState(null);
  const [hasExistingAttendance, setHasExistingAttendance] = useState(false);
  const [mode, setMode] = useState('student'); // 'student' | 'bulk'

  // Bulk mode state
  const [bulkData, setBulkData] = useState({
    totalEnrolled: '',
    presentCount: '',
    absentCount: '',
    lateCount: '',
    remarks: '',
  });
  const [existingBulk, setExistingBulk] = useState(null);

  useEffect(() => {
    fetchActiveAcademicYear();
    if (isTeacher) {
      fetchMyClass();
    } else {
      fetchClasses();
    }
  }, [isTeacher]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsAndAttendance();
      if (mode === 'bulk') fetchBulkAttendance();
    }
  }, [selectedClass, selectedDate]);

  useEffect(() => {
    if (selectedClass && mode === 'bulk') {
      fetchBulkAttendance();
    }
  }, [mode]);

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

  const fetchMyClass = async () => {
    try {
      const response = await classAPI.getMyClass();
      const myClass = response.data.data;
      if (myClass) {
        setClasses([myClass]);
        setSelectedClass(myClass._id);
      }
    } catch (error) {
      // fallback: load all classes
      fetchClasses();
    }
  };

  const fetchStudentsAndAttendance = async () => {
    setLoading(true);
    try {
      const attendanceResponse = await attendanceAPI.getByDate(selectedClass, selectedDate);
      const { attendance, unmarkedStudents } = attendanceResponse.data.data;

      const records = {};
      attendance.forEach(record => {
        records[record.student._id] = {
          studentId: record.student._id,
          status: record.status,
          remarks: record.remarks || '',
          attendanceId: record._id,
        };
      });
      unmarkedStudents.forEach(student => {
        records[student._id] = {
          studentId: student._id,
          status: 'present',
          remarks: '',
        };
      });

      setAttendanceRecords(records);
      const allStudents = [
        ...attendance.map(a => a.student),
        ...unmarkedStudents,
      ].sort((a, b) => (a.currentRollNumber || 0) - (b.currentRollNumber || 0));
      setStudents(allStudents);
      setHasExistingAttendance(attendance.length > 0);
    } catch (error) {
      toast.error('Failed to fetch students and attendance');
    } finally {
      setLoading(false);
    }
  };

  const fetchBulkAttendance = async () => {
    try {
      const response = await attendanceAPI.getBulk(selectedClass, selectedDate);
      const record = response.data.data;
      if (record) {
        setExistingBulk(record);
        setBulkData({
          totalEnrolled: record.totalEnrolled,
          presentCount: record.presentCount,
          absentCount: record.absentCount,
          lateCount: record.lateCount,
          remarks: record.remarks || '',
        });
      } else {
        setExistingBulk(null);
        setBulkData({ totalEnrolled: students.length || '', presentCount: '', absentCount: '', lateCount: '', remarks: '' });
      }
    } catch {
      // ignore
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceRecords(prev => ({ ...prev, [studentId]: { ...prev[studentId], remarks } }));
  };

  const handleMarkAll = (status) => {
    const updatedRecords = {};
    Object.keys(attendanceRecords).forEach(id => {
      updatedRecords[id] = { ...attendanceRecords[id], status };
    });
    setAttendanceRecords(updatedRecords);
  };

  const handleSubmitStudentWise = async (e) => {
    e.preventDefault();
    if (!selectedClass) { toast.error('Please select a class'); return; }
    if (!academicYear) { toast.error('No active academic year found'); return; }
    try {
      setLoading(true);
      const attendanceData = Object.values(attendanceRecords).map(record => ({
        studentId: record.studentId,
        status: record.status,
        remarks: record.remarks,
      }));
      await attendanceAPI.markDaily({
        classId: selectedClass,
        date: selectedDate,
        academicYearId: academicYear._id,
        attendanceRecords: attendanceData,
      });
      toast.success('Attendance marked successfully');
      fetchStudentsAndAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBulk = async (e) => {
    e.preventDefault();
    if (!selectedClass) { toast.error('Please select a class'); return; }
    if (!academicYear) { toast.error('No active academic year found'); return; }
    const total = Number(bulkData.totalEnrolled);
    const present = Number(bulkData.presentCount);
    const absent = Number(bulkData.absentCount || 0);
    const late = Number(bulkData.lateCount || 0);
    if (!total || !present) { toast.error('Total enrolled and present count are required'); return; }
    if (present + absent + late > total) { toast.error('Present + Absent + Late cannot exceed total enrolled'); return; }
    try {
      setLoading(true);
      await attendanceAPI.markBulk({
        classId: selectedClass,
        date: selectedDate,
        academicYearId: academicYear._id,
        totalEnrolled: total,
        presentCount: present,
        absentCount: absent,
        lateCount: late,
        remarks: bulkData.remarks,
      });
      toast.success('Bulk attendance saved');
      fetchBulkAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save bulk attendance');
    } finally {
      setLoading(false);
    }
  };

  const presentCount = Object.values(attendanceRecords).filter(r => r.status === 'present').length;
  const absentCount = Object.values(attendanceRecords).filter(r => r.status === 'absent').length;
  const lateCount = Object.values(attendanceRecords).filter(r => r.status === 'late').length;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Daily Attendance</h1>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          type="button"
          className={mode === 'student' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setMode('student')}
        >
          Student-wise
        </button>
        <button
          type="button"
          className={mode === 'bulk' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setMode('bulk')}
        >
          Bulk Count
        </button>
      </div>

      {/* Filters */}
      <div className="filters-container" style={{ marginBottom: '2rem' }}>
        <div className="filter-group">
          <label>Class:</label>
          {isTeacher && classes.length === 1 ? (
            <div style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontWeight: 500 }}>
              {classes[0].name} — {classes[0].section}
            </div>
          ) : (
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
          )}
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

      {/* ── STUDENT-WISE MODE ── */}
      {mode === 'student' && (
        <>
          {selectedClass && students.length > 0 && (
            <>
              {/* Summary strip */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ padding: '0.5rem 1rem', background: '#dcfce7', borderRadius: 6, fontWeight: 600, color: '#166534' }}>
                  Present: {presentCount}
                </div>
                <div style={{ padding: '0.5rem 1rem', background: '#fee2e2', borderRadius: 6, fontWeight: 600, color: '#991b1b' }}>
                  Absent: {absentCount}
                </div>
                <div style={{ padding: '0.5rem 1rem', background: '#fef9c3', borderRadius: 6, fontWeight: 600, color: '#854d0e' }}>
                  Late: {lateCount}
                </div>
                <div style={{ padding: '0.5rem 1rem', background: 'var(--bg-secondary)', borderRadius: 6, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Total: {students.length}
                </div>
              </div>

              <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button type="button" className="btn-success" onClick={() => handleMarkAll('present')}>
                  Mark All Present
                </button>
                <button type="button" className="btn-danger" onClick={() => handleMarkAll('absent')}>
                  Mark All Absent
                </button>
                {hasExistingAttendance && (
                  <span style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--info-color)', color: 'white', borderRadius: '4px', fontSize: '0.9rem' }}>
                    Updating existing attendance
                  </span>
                )}
              </div>

              <form onSubmit={handleSubmitStudentWise}>
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

                <div style={{ marginTop: '2rem' }}>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Attendance'}
                  </button>
                </div>
              </form>
            </>
          )}

          {selectedClass && students.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: 8 }}>
              No students found in this class.
            </div>
          )}

          {!selectedClass && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: 8 }}>
              Please select a class and date to mark attendance.
            </div>
          )}
        </>
      )}

      {/* ── BULK COUNT MODE ── */}
      {mode === 'bulk' && (
        <div style={{ maxWidth: 500 }}>
          {!selectedClass ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: 8 }}>
              Please select a class and date first.
            </div>
          ) : (
            <form onSubmit={handleSubmitBulk}>
              <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {existingBulk ? 'Update Bulk Attendance' : 'Submit Bulk Attendance'}
                </h3>

                <div className="form-group">
                  <label>Total Enrolled *</label>
                  <input
                    type="number"
                    min="0"
                    value={bulkData.totalEnrolled}
                    onChange={e => setBulkData(p => ({ ...p, totalEnrolled: e.target.value }))}
                    placeholder={`e.g. ${students.length || 25}`}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Present *</label>
                  <input
                    type="number"
                    min="0"
                    value={bulkData.presentCount}
                    onChange={e => setBulkData(p => ({ ...p, presentCount: e.target.value }))}
                    placeholder="e.g. 20"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Absent</label>
                  <input
                    type="number"
                    min="0"
                    value={bulkData.absentCount}
                    onChange={e => setBulkData(p => ({ ...p, absentCount: e.target.value }))}
                    placeholder="e.g. 4"
                  />
                </div>

                <div className="form-group">
                  <label>Late</label>
                  <input
                    type="number"
                    min="0"
                    value={bulkData.lateCount}
                    onChange={e => setBulkData(p => ({ ...p, lateCount: e.target.value }))}
                    placeholder="e.g. 1"
                  />
                </div>

                <div className="form-group">
                  <label>Remarks</label>
                  <input
                    type="text"
                    value={bulkData.remarks}
                    onChange={e => setBulkData(p => ({ ...p, remarks: e.target.value }))}
                    placeholder="Optional note"
                  />
                </div>

                {bulkData.presentCount && bulkData.totalEnrolled && (
                  <div style={{ padding: '0.75rem', background: '#f0fdf4', borderRadius: 6, marginBottom: '1rem', fontSize: '0.9rem', color: '#166534' }}>
                    {bulkData.presentCount} present out of {bulkData.totalEnrolled} enrolled
                    {bulkData.absentCount ? ` · ${bulkData.absentCount} absent` : ''}
                    {bulkData.lateCount ? ` · ${bulkData.lateCount} late` : ''}
                  </div>
                )}

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : existingBulk ? 'Update' : 'Submit'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyAttendance;
