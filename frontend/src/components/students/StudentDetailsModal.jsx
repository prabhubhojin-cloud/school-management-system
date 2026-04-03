import React from 'react';
import './StudentDetailsModal.css';

const StudentDetailsModal = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content details-modal">
        <div className="modal-header">
          <h2>Student Details</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="modal-body">
          {/* Basic Information */}
          <div className="details-section">
            <h3>Basic Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Admission Number:</label>
                <span>{student.admissionNumber}</span>
              </div>
              <div className="detail-item">
                <label>Full Name:</label>
                <span>{student.firstName} {student.lastName}</span>
              </div>
              <div className="detail-item">
                <label>Date of Birth:</label>
                <span>{formatDate(student.dateOfBirth)}</span>
              </div>
              <div className="detail-item">
                <label>Gender:</label>
                <span>{student.gender}</span>
              </div>
              <div className="detail-item">
                <label>Blood Group:</label>
                <span>{student.bloodGroup || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Admission Date:</label>
                <span>{formatDate(student.admissionDate)}</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="details-section">
            <h3>Contact Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Email:</label>
                <span>{student.email || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Phone:</label>
                <span>{student.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Address */}
          {student.address && (
            <div className="details-section">
              <h3>Address</h3>
              <div className="details-grid">
                <div className="detail-item full-width">
                  <label>Street:</label>
                  <span>{student.address.street || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>City:</label>
                  <span>{student.address.city || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>State:</label>
                  <span>{student.address.state || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Pin Code:</label>
                  <span>{student.address.pinCode || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Country:</label>
                  <span>{student.address.country || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Academic Information */}
          <div className="details-section">
            <h3>Academic Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Current Class:</label>
                <span>{student.currentClass?.name} - {student.currentClass?.section || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Academic Year:</label>
                <span>{student.currentAcademicYear?.year || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Roll Number:</label>
                <span>{student.currentRollNumber || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Status:</label>
                <span className={`status-badge status-${student.status}`}>
                  {student.status}
                </span>
              </div>
            </div>
          </div>

          {/* Father Information */}
          {student.father && student.father.name && (
            <div className="details-section">
              <h3>Father's Information</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Name:</label>
                  <span>{student.father.name}</span>
                </div>
                <div className="detail-item">
                  <label>Phone:</label>
                  <span>{student.father.phone || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{student.father.email || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Occupation:</label>
                  <span>{student.father.occupation || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Mother Information */}
          {student.mother && student.mother.name && (
            <div className="details-section">
              <h3>Mother's Information</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Name:</label>
                  <span>{student.mother.name}</span>
                </div>
                <div className="detail-item">
                  <label>Phone:</label>
                  <span>{student.mother.phone || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{student.mother.email || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Occupation:</label>
                  <span>{student.mother.occupation || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Guardian Information */}
          {student.guardian && student.guardian.name && (
            <div className="details-section">
              <h3>Guardian's Information</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Name:</label>
                  <span>{student.guardian.name}</span>
                </div>
                <div className="detail-item">
                  <label>Relation:</label>
                  <span>{student.guardian.relation || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Phone:</label>
                  <span>{student.guardian.phone || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{student.guardian.email || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Occupation:</label>
                  <span>{student.guardian.occupation || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Sibling Info */}
          {student.isSibling && (
            <div className="details-section">
              <h3>Sibling Information</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Is Sibling:</label>
                  <span className="status-badge" style={{ background: 'var(--primary-light, #e0e7ff)', color: 'var(--primary)' }}>Yes</span>
                </div>
                {student.siblingOf && (
                  <div className="detail-item">
                    <label>Sibling's Admission No:</label>
                    <span>{student.siblingOf}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Documents */}
          {student.studentDocuments && Object.values(student.studentDocuments).some(Boolean) && (
            <div className="details-section">
              <h3>Student Documents</h3>
              <div className="documents-list">
                {[
                  { key: 'birthCertificate', label: 'Birth Certificate' },
                  { key: 'aadharCard', label: 'Aadhar Card' },
                  { key: 'transferCertificate', label: 'Transfer Certificate' },
                  { key: 'studentPhoto', label: 'Student Photo' },
                  { key: 'additionalDoc1', label: 'Additional Doc 1' },
                  { key: 'additionalDoc2', label: 'Additional Doc 2' },
                ].filter(d => student.studentDocuments[d.key]).map(d => (
                  <a key={d.key} href={student.studentDocuments[d.key]} target="_blank" rel="noreferrer" className="doc-link">
                    <span className="doc-icon">📄</span> {d.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Father Documents */}
          {student.father && (student.father.idProof || student.father.photo || student.father.addressProof) && (
            <div className="details-section">
              <h3>Father's Documents</h3>
              <div className="documents-list">
                {student.father.idProof && (
                  <a href={student.father.idProof} target="_blank" rel="noreferrer" className="doc-link">
                    <span className="doc-icon">📄</span> ID Proof
                  </a>
                )}
                {student.father.addressProof && (
                  <a href={student.father.addressProof} target="_blank" rel="noreferrer" className="doc-link">
                    <span className="doc-icon">📄</span> Address Proof
                  </a>
                )}
                {student.father.photo && (
                  <a href={student.father.photo} target="_blank" rel="noreferrer" className="doc-link">
                    <span className="doc-icon">🖼️</span> Photo
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Mother Documents */}
          {student.mother && (student.mother.idProof || student.mother.photo || student.mother.addressProof) && (
            <div className="details-section">
              <h3>Mother's Documents</h3>
              <div className="documents-list">
                {student.mother.idProof && (
                  <a href={student.mother.idProof} target="_blank" rel="noreferrer" className="doc-link">
                    <span className="doc-icon">📄</span> ID Proof
                  </a>
                )}
                {student.mother.addressProof && (
                  <a href={student.mother.addressProof} target="_blank" rel="noreferrer" className="doc-link">
                    <span className="doc-icon">📄</span> Address Proof
                  </a>
                )}
                {student.mother.photo && (
                  <a href={student.mother.photo} target="_blank" rel="noreferrer" className="doc-link">
                    <span className="doc-icon">🖼️</span> Photo
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Guardian Documents */}
          {student.guardian && (student.guardian.idProof || student.guardian.photo || student.guardian.addressProof) && (
            <div className="details-section">
              <h3>Guardian's Documents</h3>
              <div className="documents-list">
                {student.guardian.idProof && (
                  <a href={student.guardian.idProof} target="_blank" rel="noreferrer" className="doc-link">
                    <span className="doc-icon">📄</span> ID Proof
                  </a>
                )}
                {student.guardian.addressProof && (
                  <a href={student.guardian.addressProof} target="_blank" rel="noreferrer" className="doc-link">
                    <span className="doc-icon">📄</span> Address Proof
                  </a>
                )}
                {student.guardian.photo && (
                  <a href={student.guardian.photo} target="_blank" rel="noreferrer" className="doc-link">
                    <span className="doc-icon">🖼️</span> Photo
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">Close</button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;
