import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/Modal.css';

const FeeForm = ({ isOpen, onClose, onSuccess, fee = null, students }) => {
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    student: '',
    academicYear: '',
    feeType: 'Tuition',
    amount: '',
    dueDate: '',
    description: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchAcademicYears();
      if (fee) {
        setFormData({
          student: fee.student?._id || '',
          academicYear: fee.academicYear?._id || '',
          feeType: fee.feeType || 'Tuition',
          amount: fee.amount || '',
          dueDate: fee.dueDate ? new Date(fee.dueDate).toISOString().split('T')[0] : '',
          description: fee.description || '',
        });
      }
    }
  }, [isOpen, fee]);

  const fetchAcademicYears = async () => {
    try {
      const response = await api.get('/academicyears');
      setAcademicYears(response.data.data);
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (fee) {
        await api.put(`/fees/${fee._id}`, formData);
      } else {
        await api.post('/fees', formData);
      }

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error saving fee:', error);
      setError(error.response?.data?.message || 'Error saving fee record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      student: '',
      academicYear: '',
      feeType: 'Tuition',
      amount: '',
      dueDate: '',
      description: '',
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{fee ? 'Edit Fee Record' : 'Add Fee Record'}</h2>
          <button onClick={handleClose} className="close-btn">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-message">{error}</div>}

            <div className="form-row">
              <div className="form-group">
                <label>Student *</label>
                <select
                  name="student"
                  value={formData.student}
                  onChange={handleChange}
                  required
                  disabled={fee !== null}
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.firstName} {student.lastName} ({student.admissionNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Academic Year *</label>
                <select
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map((year) => (
                    <option key={year._id} value={year._id}>
                      {year.year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fee Type *</label>
                <select
                  name="feeType"
                  value={formData.feeType}
                  onChange={handleChange}
                  required
                >
                  <option value="Tuition">Tuition</option>
                  <option value="Admission">Admission</option>
                  <option value="Exam">Exam</option>
                  <option value="Library">Library</option>
                  <option value="Sports">Sports</option>
                  <option value="Transport">Transport</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Amount *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Due Date *</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Additional notes about this fee..."
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={handleClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : fee ? 'Update Fee' : 'Add Fee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeeForm;
