import { useState, useEffect } from 'react';
import { studentAPI, classAPI, academicYearAPI } from '../../services/api';
import { toast } from 'react-toastify';
import '../../styles/Modal.css';

const StudentForm = ({ isOpen, onClose, onSuccess, student = null }) => {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [formData, setFormData] = useState({
    admissionNumber: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male',
    email: '',
    phone: '',
    bloodGroup: '',
    address: {
      street: '',
      city: '',
      state: '',
      pinCode: '',
      country: 'India',
    },
    guardians: [{
      name: '',
      relation: 'Father',
      phone: '',
      email: '',
      occupation: '',
    }],
    currentClass: '',
    currentAcademicYear: '',
    currentRollNumber: '',
    admissionDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (isOpen) {
      fetchClassesAndYears();
      if (student) {
        setFormData({
          ...student,
          dateOfBirth: student.dateOfBirth?.split('T')[0] || '',
          admissionDate: student.admissionDate?.split('T')[0] || '',
        });
      }
    }
  }, [isOpen, student]);

  const fetchClassesAndYears = async () => {
    try {
      const [classesRes, yearsRes] = await Promise.all([
        classAPI.getAll(),
        academicYearAPI.getAll(),
      ]);
      setClasses(classesRes.data.data);
      setAcademicYears(yearsRes.data.data);
    } catch (error) {
      toast.error('Failed to load classes and academic years');
    }
  };

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

  const handleGuardianChange = (index, field, value) => {
    const newGuardians = [...formData.guardians];
    newGuardians[index][field] = value;
    setFormData(prev => ({ ...prev, guardians: newGuardians }));
  };

  const addGuardian = () => {
    setFormData(prev => ({
      ...prev,
      guardians: [...prev.guardians, {
        name: '',
        relation: 'Mother',
        phone: '',
        email: '',
        occupation: '',
      }],
    }));
  };

  const removeGuardian = (index) => {
    if (formData.guardians.length > 1) {
      setFormData(prev => ({
        ...prev,
        guardians: prev.guardians.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (student) {
        await studentAPI.update(student._id, formData);
        toast.success('Student updated successfully');
      } else {
        await studentAPI.create(formData);
        toast.success('Student added successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save student');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{student ? 'Edit Student' : 'Add New Student'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-grid">
            <div className="form-section">
              <h3>Personal Information</h3>

              <div className="form-group">
                <label>Admission Number *</label>
                <input
                  type="text"
                  name="admissionNumber"
                  value={formData.admissionNumber}
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
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Blood Group</label>
                <input
                  type="text"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  placeholder="e.g., A+, B-, O+"
                />
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
              <h3>Academic Information</h3>

              <div className="form-group">
                <label>Academic Year *</label>
                <select
                  name="currentAcademicYear"
                  value={formData.currentAcademicYear}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map(year => (
                    <option key={year._id} value={year._id}>
                      {year.year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Class *</label>
                  <select
                    name="currentClass"
                    value={formData.currentClass}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name} - {cls.section}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Roll Number</label>
                  <input
                    type="number"
                    name="currentRollNumber"
                    value={formData.currentRollNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Admission Date *</label>
                <input
                  type="date"
                  name="admissionDate"
                  value={formData.admissionDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Guardian Information</h3>
                <button type="button" onClick={addGuardian} className="btn-small">
                  + Add Guardian
                </button>
              </div>

              {formData.guardians.map((guardian, index) => (
                <div key={index} className="guardian-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4>Guardian {index + 1}</h4>
                    {formData.guardians.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGuardian(index)}
                        className="btn-small btn-danger"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      value={guardian.name}
                      onChange={(e) => handleGuardianChange(index, 'name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Relation *</label>
                      <select
                        value={guardian.relation}
                        onChange={(e) => handleGuardianChange(index, 'relation', e.target.value)}
                        required
                      >
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Phone *</label>
                      <input
                        type="tel"
                        value={guardian.phone}
                        onChange={(e) => handleGuardianChange(index, 'phone', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={guardian.email}
                        onChange={(e) => handleGuardianChange(index, 'email', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Occupation</label>
                      <input
                        type="text"
                        value={guardian.occupation}
                        onChange={(e) => handleGuardianChange(index, 'occupation', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (student ? 'Update Student' : 'Add Student')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
