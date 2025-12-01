import { useState, useEffect } from 'react';
import { academicYearAPI } from '../services/api';
import { toast } from 'react-toastify';
import '../styles/Table.css';

const AcademicYears = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    year: '',
    startDate: '',
    endDate: '',
    isActive: false,
  });

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      const response = await academicYearAPI.getAll();
      setAcademicYears(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch academic years');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await academicYearAPI.create(formData);
      toast.success('Academic year created successfully');
      setShowForm(false);
      setFormData({ year: '', startDate: '', endDate: '', isActive: false });
      fetchAcademicYears();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create academic year');
    }
  };

  const handleSetActive = async (id) => {
    try {
      await academicYearAPI.update(id, { isActive: true });
      toast.success('Academic year set as active');
      fetchAcademicYears();
    } catch (error) {
      toast.error('Failed to update academic year');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this academic year?')) {
      try {
        await academicYearAPI.delete(id);
        toast.success('Academic year deleted successfully');
        fetchAcademicYears();
      } catch (error) {
        toast.error('Failed to delete academic year');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Academic Years</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Academic Year'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>Add New Academic Year</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Year (e.g., 2024-2025) *</label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="2024-2025"
                  required
                />
              </div>
              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>End Date *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ width: 'auto' }}
                  />
                  Set as Active Year
                </label>
              </div>
            </div>
            <button type="submit" className="btn-primary">Create Academic Year</button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Year</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Promotion Done</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {academicYears.map((year) => (
              <tr key={year._id}>
                <td><strong>{year.year}</strong></td>
                <td>{new Date(year.startDate).toLocaleDateString()}</td>
                <td>{new Date(year.endDate).toLocaleDateString()}</td>
                <td>
                  {year.isActive ? (
                    <span className="status-badge status-active">Active</span>
                  ) : (
                    <span className="status-badge status-inactive">Inactive</span>
                  )}
                </td>
                <td>
                  {year.promotionDone ? (
                    <span className="status-badge status-active">Yes</span>
                  ) : (
                    <span className="status-badge status-pending">No</span>
                  )}
                </td>
                <td>
                  {!year.isActive && (
                    <button className="btn-small" onClick={() => handleSetActive(year._id)}>
                      Set Active
                    </button>
                  )}
                  <button className="btn-small btn-danger" onClick={() => handleDelete(year._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {academicYears.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            No academic years found. Click "Add Academic Year" to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicYears;
