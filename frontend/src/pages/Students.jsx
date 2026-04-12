import { useState, useEffect, useCallback } from 'react';
import { studentAPI, feeInstallmentAPI, classAPI, academicYearAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
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

const EMPTY_FILTERS = {
  academicYear: '',
  class: '',
  status: '',
  gender: '',
  bloodGroup: '',
  isSibling: '',
  admissionDateFrom: '',
  admissionDateTo: '',
  documentsIncomplete: false,
};

const Students = () => {
  const { isAdmin, isOfficeIncharge, isAccountant } = useAuth();
  const canManage = isAdmin || isAccountant || isOfficeIncharge;
  const canFilter = isAdmin || isOfficeIncharge;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    if (canFilter) {
      classAPI.getAll().then(r => setClasses(r.data.data || [])).catch(() => {});
      academicYearAPI.getAll().then(r => setAcademicYears(r.data.data || [])).catch(() => {});
    }
  }, [canFilter]);

  const fetchStudents = useCallback(async (overrideSearch) => {
    setLoading(true);
    try {
      const params = { search: overrideSearch ?? search };
      if (canFilter) {
        if (filters.academicYear) params.academicYear = filters.academicYear;
        if (filters.class) params.class = filters.class;
        if (filters.status) params.status = filters.status;
        if (filters.gender) params.gender = filters.gender;
        if (filters.bloodGroup) params.bloodGroup = filters.bloodGroup;
        if (filters.isSibling === 'true') params.isSibling = 'true';
        if (filters.admissionDateFrom) params.admissionDateFrom = filters.admissionDateFrom;
        if (filters.admissionDateTo) params.admissionDateTo = filters.admissionDateTo;
        if (filters.documentsIncomplete) params.documentsIncomplete = 'true';
      }
      const response = await studentAPI.getAll(params);
      setStudents(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [search, filters, canFilter]);

  useEffect(() => { fetchStudents(); }, [filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setSearch('');
  };

  const activeFilterCount = Object.entries(filters).filter(([k, v]) =>
    v !== '' && v !== false && v !== EMPTY_FILTERS[k]
  ).length + (search ? 1 : 0);

  const handleAddStudent = () => { setSelectedStudent(null); setShowForm(true); };
  const handleViewStudent = async (student) => {
    try {
      const response = await studentAPI.getOne(student._id);
      setSelectedStudent(response.data.data);
      setShowDetails(true);
    } catch { toast.error('Failed to fetch student details'); }
  };
  const handleEditStudent = (student) => { setSelectedStudent(student); setShowForm(true); };
  const handleCloseForm = () => { setShowForm(false); setSelectedStudent(null); };
  const handleCloseDetails = () => { setShowDetails(false); setSelectedStudent(null); };
  const handleFormSuccess = () => fetchStudents();

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await studentAPI.delete(id);
      toast.success('Student deleted successfully');
      fetchStudents();
    } catch { toast.error('Failed to delete student'); }
  };

  const handleGenerateFees = async (student) => {
    if (!student.currentClass || !student.currentAcademicYear) {
      toast.error('Student must be enrolled in a class and academic year');
      return;
    }
    if (!window.confirm(`Generate fees for ${student.firstName} ${student.lastName}?`)) return;
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
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Students</h1>
        {canManage && (
          <button className="btn-primary" onClick={handleAddStudent}>Add Student</button>
        )}
      </div>

      {/* Search + filter toggle */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: 220 }}>
          <input
            type="text"
            placeholder="Search by name, admission no, phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-secondary">Search</button>
        </form>

        {canFilter && (
          <button
            type="button"
            onClick={() => setShowFilters(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.45rem 0.9rem', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)', background: activeFilterCount > 0 ? 'var(--primary)' : 'var(--surface)',
              color: activeFilterCount > 0 ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem', whiteSpace: 'nowrap',
            }}
          >
            <FiFilter size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span style={{ background: 'rgba(255,255,255,0.3)', borderRadius: 20, padding: '1px 6px', fontSize: '0.75rem' }}>
                {activeFilterCount}
              </span>
            )}
            {showFilters ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
          </button>
        )}

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '0.45rem 0.75rem', borderRadius: 'var(--radius)',
              border: '1px solid #fca5a5', background: '#fee2e2', color: '#dc2626',
              cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
            }}
          >
            <FiX size={13} /> Clear
          </button>
        )}
      </div>

      {/* Filter panel */}
      {canFilter && showFilters && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '1.25rem',
          marginBottom: '1.25rem', display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.9rem',
        }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Academic Year</label>
            <select value={filters.academicYear} onChange={e => handleFilterChange('academicYear', e.target.value)}>
              <option value="">All Years</option>
              {academicYears.map(y => (
                <option key={y._id} value={y._id}>{y.year}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Class</label>
            <select value={filters.class} onChange={e => handleFilterChange('class', e.target.value)}>
              <option value="">All Classes</option>
              {classes.map(c => (
                <option key={c._id} value={c._id}>{c.name} — {c.section}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
            <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)}>
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="alumni">Alumni</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gender</label>
            <select value={filters.gender} onChange={e => handleFilterChange('gender', e.target.value)}>
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Blood Group</label>
            <select value={filters.bloodGroup} onChange={e => handleFilterChange('bloodGroup', e.target.value)}>
              <option value="">Any Blood Group</option>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sibling</label>
            <select value={filters.isSibling} onChange={e => handleFilterChange('isSibling', e.target.value)}>
              <option value="">All Students</option>
              <option value="true">Siblings Only</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admission From</label>
            <input
              type="date"
              value={filters.admissionDateFrom}
              onChange={e => handleFilterChange('admissionDateFrom', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admission To</label>
            <input
              type="date"
              value={filters.admissionDateTo}
              onChange={e => handleFilterChange('admissionDateTo', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Documents</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
              padding: '0.4rem 0.7rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
              background: filters.documentsIncomplete ? '#fef3c7' : 'var(--bg)',
              color: filters.documentsIncomplete ? '#92400e' : 'var(--text-secondary)',
              fontSize: '0.82rem', fontWeight: 500,
            }}>
              <input
                type="checkbox"
                checked={filters.documentsIncomplete}
                onChange={e => handleFilterChange('documentsIncomplete', e.target.checked)}
                style={{ width: 'auto', accentColor: '#f59e0b' }}
              />
              Pending Only
            </label>
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {search && <Chip label={`Search: "${search}"`} onRemove={() => { setSearch(''); fetchStudents(''); }} />}
          {filters.academicYear && <Chip label={`Year: ${academicYears.find(y => y._id === filters.academicYear)?.year || filters.academicYear}`} onRemove={() => handleFilterChange('academicYear', '')} />}
          {filters.class && <Chip label={`Class: ${classes.find(c => c._id === filters.class)?.name || filters.class}`} onRemove={() => handleFilterChange('class', '')} />}
          {filters.status && <Chip label={`Status: ${filters.status}`} onRemove={() => handleFilterChange('status', '')} />}
          {filters.gender && <Chip label={`Gender: ${filters.gender}`} onRemove={() => handleFilterChange('gender', '')} />}
          {filters.bloodGroup && <Chip label={`Blood: ${filters.bloodGroup}`} onRemove={() => handleFilterChange('bloodGroup', '')} />}
          {filters.isSibling === 'true' && <Chip label="Siblings only" onRemove={() => handleFilterChange('isSibling', '')} />}
          {filters.admissionDateFrom && <Chip label={`From: ${filters.admissionDateFrom}`} onRemove={() => handleFilterChange('admissionDateFrom', '')} />}
          {filters.admissionDateTo && <Chip label={`To: ${filters.admissionDateTo}`} onRemove={() => handleFilterChange('admissionDateTo', '')} />}
          {filters.documentsIncomplete && <Chip label="Docs pending" onRemove={() => handleFilterChange('documentsIncomplete', false)} />}
        </div>
      )}

      {/* Count */}
      {!loading && (
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          {students.length} student{students.length !== 1 ? 's' : ''} found
        </div>
      )}

      {loading ? <div>Loading...</div> : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Admission No</th>
                <th>Name</th>
                <th>Class</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>Status</th>
                {canFilter && <th>Docs</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const pending = pendingDocCount(student);
                return (
                  <tr key={student._id}>
                    <td>{student.admissionNumber}</td>
                    <td>
                      {student.firstName} {student.lastName}
                      {student.isSibling && (
                        <span style={{ marginLeft: 6, fontSize: '0.68rem', background: '#e0e7ff', color: '#4338ca', borderRadius: 10, padding: '1px 6px', fontWeight: 600 }}>
                          Sibling
                        </span>
                      )}
                    </td>
                    <td>{student.currentClass?.name || 'N/A'}</td>
                    <td>{student.gender || 'N/A'}</td>
                    <td>{student.phone || 'N/A'}</td>
                    <td>
                      <span className={`status-badge status-${student.status}`}>
                        {student.status}
                      </span>
                    </td>
                    {canFilter && (
                      <td>
                        {pending > 0 ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: '#fef3c7', color: '#92400e', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600 }}>
                            ⚠ {pending}
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: '#dcfce7', color: '#166534', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600 }}>
                            ✓
                          </span>
                        )}
                      </td>
                    )}
                    <td>
                      <button className="btn-small btn-info" onClick={() => handleViewStudent(student)}>View</button>
                      {canManage && (
                        <>
                          <button className="btn-small btn-success" onClick={() => handleGenerateFees(student)}>Fees</button>
                          <button className="btn-small" onClick={() => handleEditStudent(student)}>Edit</button>
                          <button className="btn-small btn-danger" onClick={() => handleDeleteStudent(student._id)}>Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {students.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
              {activeFilterCount > 0
                ? 'No students match the selected filters.'
                : 'No students found. Click "Add Student" to get started.'}
            </div>
          )}
        </div>
      )}

      <MultiStepStudentForm isOpen={showForm} onClose={handleCloseForm} onSuccess={handleFormSuccess} student={selectedStudent} />
      <StudentDetailsModal isOpen={showDetails} onClose={handleCloseDetails} student={selectedStudent} />
    </div>
  );
};

// Small chip for active filters
const Chip = ({ label, onRemove }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 8px', background: 'var(--bg-secondary)',
    border: '1px solid var(--border)', borderRadius: 20,
    fontSize: '0.75rem', color: 'var(--text-secondary)',
  }}>
    {label}
    <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--text-muted)', lineHeight: 1 }}>
      <FiX size={11} />
    </button>
  </span>
);

export default Students;
