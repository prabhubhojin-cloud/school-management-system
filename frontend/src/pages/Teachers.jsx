import { useState, useEffect } from 'react';
import { teacherAPI } from '../services/api';
import { toast } from 'react-toastify';
import TeacherForm from '../components/teachers/TeacherForm';
import '../styles/Table.css';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await teacherAPI.getAll({ search });
      setTeachers(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTeachers();
  };

  const handleAddTeacher = () => {
    setSelectedTeacher(null);
    setShowForm(true);
  };

  const handleEditTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedTeacher(null);
  };

  const handleFormSuccess = () => {
    fetchTeachers();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await teacherAPI.delete(id);
        toast.success('Teacher deleted successfully');
        fetchTeachers();
      } catch (error) {
        toast.error('Failed to delete teacher');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Teachers</h1>
        <button className="btn-primary" onClick={handleAddTeacher}>
          Add Teacher
        </button>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search teachers..."
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
              <th>Employee ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Qualification</th>
              <th>Joining Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher._id}>
                <td>{teacher.employeeId}</td>
                <td>{teacher.firstName} {teacher.lastName}</td>
                <td>{teacher.email}</td>
                <td>{teacher.phone}</td>
                <td>{teacher.qualification}</td>
                <td>{new Date(teacher.joiningDate).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge status-${teacher.isActive ? 'active' : 'inactive'}`}>
                    {teacher.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button className="btn-small" onClick={() => handleEditTeacher(teacher)}>
                    Edit
                  </button>
                  <button className="btn-small btn-danger" onClick={() => handleDelete(teacher._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {teachers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            No teachers found. Click "Add Teacher" to get started.
          </div>
        )}
      </div>

      <TeacherForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
        teacher={selectedTeacher}
      />
    </div>
  );
};

export default Teachers;
