import { useState, useEffect } from 'react';
import { teacherAPI } from '../../services/api';
import { toast } from 'react-toastify';
import '../../styles/Modal.css';

const TeacherForm = ({ isOpen, onClose, onSuccess, teacher = null }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pinCode: '',
      country: 'India',
    },
    qualification: '',
    specialization: [],
    joiningDate: new Date().toISOString().split('T')[0],
    salary: '',
  });

  useEffect(() => {
    if (isOpen && teacher) {
      setFormData({
        ...teacher,
        dateOfBirth: teacher.dateOfBirth?.split('T')[0] || '',
        joiningDate: teacher.joiningDate?.split('T')[0] || '',
        specialization: teacher.specialization || [],
      });
    } else if (isOpen && !teacher) {
      // Reset form
      setFormData({
        employeeId: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'Male',
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          pinCode: '',
          country: 'India',
        },
        qualification: '',
        specialization: [],
        joiningDate: new Date().toISOString().split('T')[0],
        salary: '',
      });
    }
  }, [isOpen, teacher]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (teacher) {
        await teacherAPI.update(teacher._id, formData);
        toast.success('Teacher updated successfully');
      } else {
        await teacherAPI.create(formData);
        toast.success('Teacher added successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save teacher');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{teacher ? 'Edit Teacher' : 'Add New Teacher'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-grid">
            <div className="form-section">
              <h3>Personal Information</h3>

              <div className="form-group">
                <label>Employee ID *</label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Address</h3>

              <div className="form-group">
                <label>Street</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Pin Code</label>
                  <input
                    type="text"
                    name="address.pinCode"
                    value={formData.address.pinCode}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Professional Information</h3>

              <div className="form-group">
                <label>Qualification *</label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  placeholder="e.g., M.Ed, B.Ed, Ph.D"
                  required
                />
              </div>

              <div className="form-group">
                <label>Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization.join(', ')}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    specialization: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  }))}
                  placeholder="e.g., Mathematics, Science (comma separated)"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Joining Date *</label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Salary *</label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="Monthly salary"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (teacher ? 'Update Teacher' : 'Add Teacher')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherForm;
