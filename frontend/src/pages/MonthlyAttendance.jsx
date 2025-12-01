import { useState, useEffect } from 'react';
import { attendanceAPI, classAPI, academicYearAPI } from '../services/api';
import { toast } from 'react-toastify';
import '../styles/Table.css';

const MonthlyAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - 2 + i
  );

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchMonthlyAttendance();
    }
  }, [selectedClass, selectedMonth, selectedYear]);

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getAll();
      setClasses(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch classes');
    }
  };

  const fetchMonthlyAttendance = async () => {
    setLoading(true);
    try {
      const response = await attendanceAPI.getClassMonthly(selectedClass, {
        month: selectedMonth,
        year: selectedYear
      });
      setAttendanceData(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch monthly attendance');
      setAttendanceData(null);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return '#22c55e';
    if (percentage >= 75) return '#eab308';
    if (percentage >= 60) return '#f97316';
    return '#ef4444';
  };

  const exportToCSV = () => {
    if (!attendanceData || !attendanceData.studentStats.length) {
      toast.error('No data to export');
      return;
    }

    const headers = [
      'Roll No',
      'Admission No',
      'Student Name',
      'Total Days',
      'Present',
      'Absent',
      'Attendance %',
      'Present Days',
      'Absent Days',
      'Late',
      'Half Day',
      'Sick Leave',
      'Authorized Leave'
    ];

    const rows = attendanceData.studentStats.map(stat => [
      stat.student.rollNumber || '-',
      stat.student.admissionNumber,
      `${stat.student.firstName} ${stat.student.lastName}`,
      stat.totalDays,
      stat.presentDays,
      stat.absentDays,
      stat.percentage,
      stat.breakdown.present,
      stat.breakdown.absent,
      stat.breakdown.late,
      stat.breakdown.halfDay,
      stat.breakdown.sickLeave,
      stat.breakdown.authorizedLeave
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${selectedMonth}-${selectedYear}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Monthly Attendance Report</h1>
        {attendanceData && (
          <button className="btn-primary" onClick={exportToCSV}>
            Export to CSV
          </button>
        )}
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
          <label>Month:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="filter-select"
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="filter-select"
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Loading...
        </div>
      )}

      {!loading && attendanceData && (
        <>
          {/* Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              padding: '1.5rem',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              borderRadius: '8px'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                Total Students
              </h3>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                {attendanceData.classStats.totalStudents}
              </p>
            </div>

            <div style={{
              padding: '1.5rem',
              backgroundColor: '#22c55e',
              color: 'white',
              borderRadius: '8px'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                Average Attendance
              </h3>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                {attendanceData.classStats.averageAttendance.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Admission No</th>
                  <th>Student Name</th>
                  <th>Total Days</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                  <th>Half Day</th>
                  <th>Sick Leave</th>
                  <th>Auth. Leave</th>
                  <th>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.studentStats.map((stat) => (
                  <tr key={stat.student._id}>
                    <td>{stat.student.rollNumber || '-'}</td>
                    <td>{stat.student.admissionNumber}</td>
                    <td>{stat.student.firstName} {stat.student.lastName}</td>
                    <td>{stat.totalDays}</td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#22c55e',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '0.875rem'
                      }}>
                        {stat.breakdown.present}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '0.875rem'
                      }}>
                        {stat.breakdown.absent}
                      </span>
                    </td>
                    <td>{stat.breakdown.late}</td>
                    <td>{stat.breakdown.halfDay}</td>
                    <td>{stat.breakdown.sickLeave}</td>
                    <td>{stat.breakdown.authorizedLeave}</td>
                    <td>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <div style={{
                          flex: 1,
                          height: '8px',
                          backgroundColor: '#e5e7eb',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${stat.percentage}%`,
                            backgroundColor: getAttendanceColor(parseFloat(stat.percentage)),
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                        <span style={{
                          fontWeight: 'bold',
                          color: getAttendanceColor(parseFloat(stat.percentage))
                        }}>
                          {stat.percentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {attendanceData.studentStats.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: 'var(--text-secondary)'
              }}>
                No attendance data found for the selected period.
              </div>
            )}
          </div>
        </>
      )}

      {!selectedClass && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--background-secondary)',
          borderRadius: '8px'
        }}>
          Please select a class to view monthly attendance report.
        </div>
      )}
    </div>
  );
};

export default MonthlyAttendance;
