import { useState } from 'react';
import { toast } from 'react-toastify';
import '../../styles/Modal.css';

const PasswordModal = ({ isOpen, onClose, credentials }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `Email: ${credentials.email}\nPassword: ${credentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Credentials copied to clipboard');
    setTimeout(() => setCopied(false), 3000);
  };

  if (!isOpen || !credentials) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>User Credentials</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <div style={{
            background: 'var(--background-secondary)',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <p style={{
              color: '#f59e0b',
              fontWeight: 'bold',
              marginBottom: '1rem',
              fontSize: '14px'
            }}>
              ⚠️ Important: Save these credentials now. They won't be shown again!
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px' }}>Email:</strong>
              <div style={{
                background: 'var(--background-primary)',
                padding: '0.75rem',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '16px'
              }}>
                {credentials.email}
              </div>
            </div>

            <div>
              <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px' }}>Password:</strong>
              <div style={{
                background: 'var(--background-primary)',
                padding: '0.75rem',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '16px'
              }}>
                {credentials.password}
              </div>
            </div>
          </div>

          <div style={{
            background: '#e0f2fe',
            padding: '1rem',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#0369a1',
            marginBottom: '1.5rem'
          }}>
            <strong>Next Steps:</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>Share these credentials with the user securely</li>
              <li>Ask the user to change their password after first login</li>
              <li>Keep a secure record of this information</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="btn btn-primary"
              onClick={handleCopy}
              style={{ flex: 1 }}
            >
              {copied ? '✓ Copied!' : 'Copy to Clipboard'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={onClose}
              style={{ flex: 1 }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
