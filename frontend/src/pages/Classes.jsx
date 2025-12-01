import { useState, useEffect } from 'react';
import { classAPI, teacherAPI, academicYearAPI } from '../services/api';
import { toast } from 'react-toastify';
import '../styles/Table.css';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    academicYear: '',
    classTeacher: '',
    capacity: 40,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, teachersRes, yearsRes] = await Promise.all([
        classAPI.getAll(),
        teacherAPI.getAll(),
        academicYearAPI.getAll(),
      ]);
      setClasses(classesRes.data.data);
      setTeachers(teachersRes.data.data);
      setAcademicYears(yearsRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await classAPI.create(formData);
      toast.success('Class created successfully');
      setShowForm(false);
      setFormData({
        name: '',
        section: '',
        academicYear: '',
        classTeacher: '',
        capacity: 40,
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create class');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await classAPI.delete(id);
        toast.success('Class deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete class');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Classes</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Class'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>Add New Class</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Class Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Class 10"
                  required
                />
              </div>
              <div className="form-group">
                <label>Section *</label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  placeholder="e.g., A, B, C"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Academic Year *</label>
                <select
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  required
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map(year => (
                    <option key={year._id} value={year._id}>{year.year}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Capacity *</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Class Teacher</label>
                <select
                  value={formData.classTeacher}
                  onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.firstName} {teacher.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary">Create Class</button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Section</th>
              <th>Academic Year</th>
              <th>Class Teacher</th>
              <th>Capacity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls) => (
              <tr key={cls._id}>
                <td><strong>{cls.name}</strong></td>
                <td>{cls.section}</td>
                <td>{cls.academicYear?.year || 'N/A'}</td>
                <td>
                  {cls.classTeacher
                    ? `${cls.classTeacher.firstName} ${cls.classTeacher.lastName}`
                    : 'Not Assigned'}
                </td>
                <td>{cls.capacity}</td>
                <td>
                  <button className="btn-small btn-danger" onClick={() => handleDelete(cls._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {classes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            No classes found. Click "Add Class" to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default Classes;
