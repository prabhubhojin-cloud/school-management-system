import React, { useState } from 'react';
import './FileUpload.css';

const FileUpload = ({ label, name, value, onChange, accept = "image/*,.pdf,.doc,.docx", required = false }) => {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onChange(name, file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const clearFile = () => {
    setFileName('');
    setPreview(null);
    onChange(name, null);
  };

  return (
    <div className="file-upload-container">
      <label className="file-upload-label">
        {label} {required && <span className="required">*</span>}
      </label>

      <div className="file-upload-wrapper">
        <input
          type="file"
          id={name}
          name={name}
          accept={accept}
          onChange={handleFileChange}
          className="file-upload-input"
          required={required}
        />

        <label htmlFor={name} className="file-upload-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="17 8 12 3 7 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="3" x2="12" y2="15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {fileName ? 'Change File' : 'Choose File'}
        </label>

        {fileName && (
          <div className="file-info">
            <span className="file-name">{fileName}</span>
            <button type="button" onClick={clearFile} className="clear-file-btn">
              ✕
            </button>
          </div>
        )}
      </div>

      {preview && (
        <div className="file-preview">
          <img src={preview} alt="Preview" />
        </div>
      )}
    </div>
  );
};

export default FileUpload;
