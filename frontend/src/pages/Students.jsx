import { useState, useEffect } from 'react';
import { studentAPI, feeInstallmentAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import MultiStepStudentForm from '../components/students/MultiStepStudentForm';
import StudentDetailsModal from '../components/students/StudentDetailsModal';
import '../styles/Table.css';

const REQUIRED_DOCS = [
  s => s.studentDocuments?.birthCertificate,
  s => s.studentDocuments?.aadharCard,
  s => s.studentDocuments?.studentPhoto,
  s => s.father?.idProof,
  s => s.father?.photo,
  s => s.mother?.idProof,
  s => s.mother?.photo,
];

const pendingDocCount = (student) =>
  REQUIRED_DOCS.filter(fn => !fn(student)).length;

const Students = () => {
  const { isAdmin, isOfficeIncharge } = useAuth();
  const { isAccountant } = useAuth();
  const canManage = isAdmin || isAccountant || isOfficeIncharge;
  const canFilterDocs = isAdmin || isOfficeIncharge;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [docsFilter, setDocsFilter] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [docsFilter]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = { search };
      if (docsFilter) params.documentsIncomplete = 'true';
      const response = await studentAPI.getAll(params);
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
          classId: student.currentClass._id,
        });
        toast.success(response.data.message || 'Fees generated successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to generate fees');
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Students</h1>
        {canManage && (
          <button className="btn-primary" onClick={handleAddStudent}>
            Add Student
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: 0 }}>
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-secondary">Search</button>
        </form>

        {canFilterDocs && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', whiteSpace: 'nowrap',
            padding: '0.45rem 0.85rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            background: docsFilter ? '#fef3c7' : 'var(--surface)', color: docsFilter ? '#92400e' : 'var(--text-secondary)',
            fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.15s',
          }}>
            <input
              type="checkbox"
              checked={docsFilter}
              onChange={e => setDocsFilter(e.target.checked)}
              style={{ width: 'auto', accentColor: '#f59e0b' }}
            />
            Documents Pending
          </label>
        )}
      </div>

      {docsFilter && (
        <div style={{ marginBottom: '1rem', padding: '0.6rem 0.9rem', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, fontSize: '0.83rem', color: '#92400e' }}>
          Showing students with one or more missing required documents (Birth Certificate, Aadhar Card, Student Photo, Father/Mother ID Proof & Photo).
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Admission No</th>
                <th>Name</th>
                <th>Class</th>
                <th>Phone</th>
                <th>Status</th>
                {canFilterDocs && <th>Docs</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const pending = pendingDocCount(student);
                return (
                  <tr key={student._id}>
                    <td>{student.admissionNumber}</td>
                    <td>{student.firstName} {student.lastName}</td>
                    <td>{student.currentClass?.name || 'N/A'}</td>
                    <td>{student.phone || 'N/A'}</td>
                    <td>
                      <span className={`status-badge status-${student.status}`}>
                        {student.status}
                      </span>
                    </td>
                    {canFilterDocs && (
                      <td>
                        {pending > 0 ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: '#fef3c7', color: '#92400e', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600 }}>
                            ⚠ {pending} pending
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: '#dcfce7', color: '#166534', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600 }}>
                            ✓ Complete
                          </span>
                        )}
                      </td>
                    )}
                    <td>
                      <button className="btn-small btn-info" onClick={() => handleViewStudent(student)}>
                        View
                      </button>
                      {canManage && (
                        <>
                          <button className="btn-small btn-success" onClick={() => handleGenerateFees(student)}>
                            Generate Fees
                          </button>
                          <button className="btn-small" onClick={() => handleEditStudent(student)}>
                            Edit
                          </button>
                          <button className="btn-small btn-danger" onClick={() => handleDeleteStudent(student._id)}>
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {students.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              {docsFilter ? 'All students have complete documents.' : 'No students found. Click "Add Student" to get started.'}
            </div>
          )}
        </div>
      )}

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
