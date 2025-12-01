import { useState, useEffect } from 'react';
import { studentAPI, feeInstallmentAPI } from '../services/api';
import { toast } from 'react-toastify';
import MultiStepStudentForm from '../components/students/MultiStepStudentForm';
import StudentDetailsModal from '../components/students/StudentDetailsModal';
import '../styles/Table.css';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await studentAPI.getAll({ search });
      setStudents(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setShowForm(true);
  };

  const handleViewStudent = async (student) => {
    try {
      // Fetch full student details
      const response = await studentAPI.getOne(student._id);
      setSelectedStudent(response.data.data);
      setShowDetails(true);
    } catch (error) {
      toast.error('Failed to fetch student details');
    }
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedStudent(null);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedStudent(null);
  };

  const handleFormSuccess = () => {
    fetchStudents();
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentAPI.delete(id);
        toast.success('Student deleted successfully');
        fetchStudents();
      } catch (error) {
        toast.error('Failed to delete student');
      }
    }
  };

  const handleGenerateFees = async (student) => {
    if (!student.currentClass || !student.currentAcademicYear) {
      toast.error('Student must be enrolled in a class and academic year to generate fees');
      return;
    }

    if (window.confirm(`Generate fees for ${student.firstName} ${student.lastName}?`)) {
      try {
        const response = await feeInstallmentAPI.generateForStudent({
          studentId: student._id,
          academicYearId: student.currentAcademicYear,
          classId: student.currentClass._id
        });
        toast.success(response.data.message || 'Fees generated successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to generate fees');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Students</h1>
        <button className="btn-primary" onClick={handleAddStudent}>
          Add Student
        </button>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="btn-secondary">Search</button>
      </form>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Admission No</th>
              <th>Name</th>
              <th>Class</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td>{student.admissionNumber}</td>
                <td>{student.firstName} {student.lastName}</td>
                <td>{student.currentClass?.name || 'N/A'}</td>
                <td>{student.email || 'N/A'}</td>
                <td>{student.phone || 'N/A'}</td>
                <td>
                  <span className={`status-badge status-${student.status}`}>
                    {student.status}
                  </span>
                </td>
                <td>
                  <button className="btn-small btn-info" onClick={() => handleViewStudent(student)}>
                    View
                  </button>
                  <button className="btn-small btn-success" onClick={() => handleGenerateFees(student)}>
                    Generate Fees
                  </button>
                  <button className="btn-small" onClick={() => handleEditStudent(student)}>
                    Edit
                  </button>
                  <button className="btn-small btn-danger" onClick={() => handleDeleteStudent(student._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            No students found. Click "Add Student" to get started.
          </div>
        )}
      </div>

      <MultiStepStudentForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
        student={selectedStudent}
      />

      <StudentDetailsModal
        isOpen={showDetails}
        onClose={handleCloseDetails}
        student={selectedStudent}
      />
    </div>
  );
};

export default Students;
