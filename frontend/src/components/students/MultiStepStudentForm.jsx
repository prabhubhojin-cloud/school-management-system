import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import FileUpload from '../common/FileUpload';
import './MultiStepStudentForm.css';

const MultiStepStudentForm = ({ isOpen, onClose, onSuccess, student = null }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Student Details
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    bloodGroup: '',
    address: {
      street: '',
      city: '',
      state: '',
      pinCode: '',
      country: '',
    },
    currentClass: '',
    currentAcademicYear: '',
    currentRollNumber: '',
    admissionDate: new Date().toISOString().split('T')[0],

    // Father Details
    father: {
      name: '',
      phone: '',
      email: '',
      occupation: '',
      address: {
        street: '',
        city: '',
        state: '',
        pinCode: '',
      },
    },

    // Mother Details
    mother: {
      name: '',
      phone: '',
      email: '',
      occupation: '',
      address: {
        street: '',
        city: '',
        state: '',
        pinCode: '',
      },
    },

    // Guardian Details (Optional)
    guardian: {
      name: '',
      relation: '',
      phone: '',
      email: '',
      occupation: '',
      address: {
        street: '',
        city: '',
        state: '',
        pinCode: '',
      },
    },
  });

  const [documents, setDocuments] = useState({
    // Student Documents
    birthCertificate: null,
    aadharCard: null,
    transferCertificate: null,
    studentPhoto: null,
    additionalDoc1: null,
    additionalDoc2: null,

    // Father Documents
    fatherIdProof: null,
    fatherAddressProof: null,
    fatherPhoto: null,

    // Mother Documents
    motherIdProof: null,
    motherAddressProof: null,
    motherPhoto: null,

    // Guardian Documents
    guardianIdProof: null,
    guardianAddressProof: null,
    guardianPhoto: null,
  });

  const [includeGuardian, setIncludeGuardian] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAcademicYears();
      fetchClasses();

      if (student) {
        // Pre-fill form for editing
        setFormData({
          ...formData,
          ...student,
        });
      }
    }
  }, [isOpen, student]);

  const fetchAcademicYears = async () => {
    try {
      const response = await api.get('/academicyears');
      setAcademicYears(response.data.data);
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child, subChild] = name.split('.');
      if (subChild) {
        setFormData({
          ...formData,
          [parent]: {
            ...formData[parent],
            [child]: {
              ...formData[parent][child],
              [subChild]: value,
            },
          },
        });
      } else {
        setFormData({
          ...formData,
          [parent]: {
            ...formData[parent],
            [child]: value,
          },
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFileChange = (name, file) => {
    setDocuments({
      ...documents,
      [name]: file,
    });
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      setError('');
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.firstName || !formData.lastName ||
            !formData.dateOfBirth || !formData.gender || !formData.currentClass ||
            !formData.currentAcademicYear || !formData.admissionDate) {
          setError('Please fill all required fields in Student Details');
          return false;
        }
        if (!documents.birthCertificate || !documents.aadharCard || !documents.studentPhoto) {
          setError('Please upload Birth Certificate, Aadhar Card, and Student Photo');
          return false;
        }
        break;
      case 2:
        if (!formData.father.name || !formData.father.phone) {
          setError('Please fill required Father information');
          return false;
        }
        if (!documents.fatherIdProof || !documents.fatherPhoto) {
          setError('Please upload Father ID Proof and Photo');
          return false;
        }
        break;
      case 3:
        if (!formData.mother.name || !formData.mother.phone) {
          setError('Please fill required Mother information');
          return false;
        }
        if (!documents.motherIdProof || !documents.motherPhoto) {
          setError('Please upload Mother ID Proof and Photo');
          return false;
        }
        break;
      case 4:
        if (includeGuardian) {
          if (!formData.guardian.name || !formData.guardian.relation || !formData.guardian.phone) {
            setError('Please fill required Guardian information');
            return false;
          }
          if (!documents.guardianIdProof || !documents.guardianPhoto) {
            setError('Please upload Guardian ID Proof and Photo');
            return false;
          }
        }
        break;
      default:
        break;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();

      // Append student data as JSON
      formDataToSend.append('studentData', JSON.stringify(formData));

      // Append all documents
      Object.keys(documents).forEach((key) => {
        if (documents[key]) {
          formDataToSend.append(key, documents[key]);
        }
      });

      // Append guardian flag
      formDataToSend.append('includeGuardian', includeGuardian);

      let response;
      if (student) {
        response = await api.put(`/students/${student._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await api.post('/students', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      if (response.data.success) {
        onSuccess();
        handleClose();
      }
    } catch (error) {
      console.error('Error saving student:', error);
      setError(error.response?.data?.message || 'Error saving student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      email: '',
      phone: '',
      bloodGroup: '',
      address: { street: '', city: '', state: '', pinCode: '', country: '' },
      currentClass: '',
      currentAcademicYear: '',
      currentRollNumber: '',
      admissionDate: new Date().toISOString().split('T')[0],
      father: { name: '', phone: '', email: '', occupation: '', address: { street: '', city: '', state: '', pinCode: '' } },
      mother: { name: '', phone: '', email: '', occupation: '', address: { street: '', city: '', state: '', pinCode: '' } },
      guardian: { name: '', relation: '', phone: '', email: '', occupation: '', address: { street: '', city: '', state: '', pinCode: '' } },
    });
    setDocuments({
      birthCertificate: null, aadharCard: null, transferCertificate: null,
      studentPhoto: null, additionalDoc1: null, additionalDoc2: null,
      fatherIdProof: null, fatherAddressProof: null, fatherPhoto: null,
      motherIdProof: null, motherAddressProof: null, motherPhoto: null,
      guardianIdProof: null, guardianAddressProof: null, guardianPhoto: null,
    });
    setIncludeGuardian(false);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content multi-step-modal">
        <div className="modal-header">
          <h2>{student ? 'Edit Student' : 'Add New Student'}</h2>
          <button onClick={handleClose} className="close-btn">&times;</button>
        </div>

        {/* Progress Steps */}
        <div className="step-indicator">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Student Details</div>
          </div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Father Info</div>
          </div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Mother Info</div>
          </div>
          <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
            <div className="step-number">4</div>
            <div className="step-label">Guardian Info</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-message">{error}</div>}

            {/* Step 1: Student Details */}
            {currentStep === 1 && (
              <div className="form-step">
                <h3>Student Details</h3>

                <div className="info-message">
                  <strong>Note:</strong> Admission number will be generated automatically upon submission.
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Admission Date *</label>
                    <input
                      type="date"
                      name="admissionDate"
                      value={formData.admissionDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Gender</option>
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
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <h4>Address</h4>
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Street</label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <h4>Academic Information</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Academic Year *</label>
                    <select
                      name="currentAcademicYear"
                      value={formData.currentAcademicYear}
                      onChange={handleInputChange}
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
                  <div className="form-group">
                    <label>Class *</label>
                    <select
                      name="currentClass"
                      value={formData.currentClass}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls._id} value={cls._id}>
                          {cls.name} - {cls.section}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Roll Number</label>
                    <input
                      type="number"
                      name="currentRollNumber"
                      value={formData.currentRollNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <h4>Student Documents</h4>
                <div className="documents-grid">
                  <FileUpload
                    label="Birth Certificate"
                    name="birthCertificate"
                    onChange={handleFileChange}
                    required
                  />
                  <FileUpload
                    label="Aadhar Card"
                    name="aadharCard"
                    onChange={handleFileChange}
                    required
                  />
                  <FileUpload
                    label="Transfer Certificate"
                    name="transferCertificate"
                    onChange={handleFileChange}
                  />
                  <FileUpload
                    label="Student Photo"
                    name="studentPhoto"
                    onChange={handleFileChange}
                    accept="image/*"
                    required
                  />
                  <FileUpload
                    label="Additional Document 1"
                    name="additionalDoc1"
                    onChange={handleFileChange}
                  />
                  <FileUpload
                    label="Additional Document 2"
                    name="additionalDoc2"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Father Information */}
            {currentStep === 2 && (
              <div className="form-step">
                <h3>Father Information</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      name="father.name"
                      value={formData.father.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <input
                      type="tel"
                      name="father.phone"
                      value={formData.father.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="father.email"
                      value={formData.father.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Occupation</label>
                    <input
                      type="text"
                      name="father.occupation"
                      value={formData.father.occupation}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <h4>Address</h4>
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Street</label>
                    <input
                      type="text"
                      name="father.address.street"
                      value={formData.father.address.street}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="father.address.city"
                      value={formData.father.address.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="father.address.state"
                      value={formData.father.address.state}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Pin Code</label>
                    <input
                      type="text"
                      name="father.address.pinCode"
                      value={formData.father.address.pinCode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <h4>Documents</h4>
                <div className="documents-grid">
                  <FileUpload
                    label="ID Proof"
                    name="fatherIdProof"
                    onChange={handleFileChange}
                    required
                  />
                  <FileUpload
                    label="Address Proof"
                    name="fatherAddressProof"
                    onChange={handleFileChange}
                  />
                  <FileUpload
                    label="Photo"
                    name="fatherPhoto"
                    onChange={handleFileChange}
                    accept="image/*"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 3: Mother Information */}
            {currentStep === 3 && (
              <div className="form-step">
                <h3>Mother Information</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      name="mother.name"
                      value={formData.mother.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <input
                      type="tel"
                      name="mother.phone"
                      value={formData.mother.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="mother.email"
                      value={formData.mother.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Occupation</label>
                    <input
                      type="text"
                      name="mother.occupation"
                      value={formData.mother.occupation}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <h4>Address</h4>
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Street</label>
                    <input
                      type="text"
                      name="mother.address.street"
                      value={formData.mother.address.street}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="mother.address.city"
                      value={formData.mother.address.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="mother.address.state"
                      value={formData.mother.address.state}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Pin Code</label>
                    <input
                      type="text"
                      name="mother.address.pinCode"
                      value={formData.mother.address.pinCode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <h4>Documents</h4>
                <div className="documents-grid">
                  <FileUpload
                    label="ID Proof"
                    name="motherIdProof"
                    onChange={handleFileChange}
                    required
                  />
                  <FileUpload
                    label="Address Proof"
                    name="motherAddressProof"
                    onChange={handleFileChange}
                  />
                  <FileUpload
                    label="Photo"
                    name="motherPhoto"
                    onChange={handleFileChange}
                    accept="image/*"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 4: Guardian Information (Optional) */}
            {currentStep === 4 && (
              <div className="form-step">
                <h3>Guardian Information (Optional)</h3>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={includeGuardian}
                      onChange={(e) => setIncludeGuardian(e.target.checked)}
                    />
                    Include Guardian Information
                  </label>
                  <p className="help-text">
                    Check this if parents are not available or if there's an additional guardian
                  </p>
                </div>

                {includeGuardian && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Name *</label>
                        <input
                          type="text"
                          name="guardian.name"
                          value={formData.guardian.name}
                          onChange={handleInputChange}
                          required={includeGuardian}
                        />
                      </div>
                      <div className="form-group">
                        <label>Relationship with Student *</label>
                        <input
                          type="text"
                          name="guardian.relation"
                          value={formData.guardian.relation}
                          onChange={handleInputChange}
                          placeholder="e.g., Uncle, Aunt, Grandfather"
                          required={includeGuardian}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Phone *</label>
                        <input
                          type="tel"
                          name="guardian.phone"
                          value={formData.guardian.phone}
                          onChange={handleInputChange}
                          required={includeGuardian}
                        />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          name="guardian.email"
                          value={formData.guardian.email}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Occupation</label>
                        <input
                          type="text"
                          name="guardian.occupation"
                          value={formData.guardian.occupation}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <h4>Address</h4>
                    <div className="form-row">
                      <div className="form-group full-width">
                        <label>Street</label>
                        <input
                          type="text"
                          name="guardian.address.street"
                          value={formData.guardian.address.street}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>City</label>
                        <input
                          type="text"
                          name="guardian.address.city"
                          value={formData.guardian.address.city}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>State</label>
                        <input
                          type="text"
                          name="guardian.address.state"
                          value={formData.guardian.address.state}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Pin Code</label>
                        <input
                          type="text"
                          name="guardian.address.pinCode"
                          value={formData.guardian.address.pinCode}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <h4>Documents</h4>
                    <div className="documents-grid">
                      <FileUpload
                        label="ID Proof"
                        name="guardianIdProof"
                        onChange={handleFileChange}
                        required={includeGuardian}
                      />
                      <FileUpload
                        label="Address Proof"
                        name="guardianAddressProof"
                        onChange={handleFileChange}
                      />
                      <FileUpload
                        label="Photo"
                        name="guardianPhoto"
                        onChange={handleFileChange}
                        accept="image/*"
                        required={includeGuardian}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <div className="button-group">
              {currentStep > 1 && (
                <button type="button" onClick={prevStep} className="btn-secondary">
                  Previous
                </button>
              )}

              {currentStep < 4 ? (
                <button type="button" onClick={nextStep} className="btn-primary">
                  Next
                </button>
              ) : (
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : student ? 'Update Student' : 'Add Student'}
                </button>
              )}

              <button type="button" onClick={handleClose} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MultiStepStudentForm;
