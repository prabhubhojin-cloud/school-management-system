import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { toast } from 'react-toastify';
import '../../styles/Modal.css';
import '../../styles/Form.css';

const UserForm = ({ isOpen, onClose, onSuccess, user }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'accountant',
    isActive: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        password: '', // Don't pre-fill password for edit
        role: user.role || 'accountant',
        isActive: user.isActive !== undefined ? user.isActive : true,
      });
    } else {
      setFormData({
        email: '',
        password: '',
        role: 'accountant',
        isActive: true,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.email) {
        toast.error('Email is required');
        setLoading(false);
        return;
      }

      if (!user && !formData.password) {
        // Auto-generate password if not provided for new user
        const generatedPassword = `${formData.email.split('@')[0]}@123`;
        formData.password = generatedPassword;
      }

      if (user) {
        // Update existing user (without password)
        const { password, ...updateData } = formData;
        const response = await userAPI.update(user._id, updateData);
        toast.success('User updated successfully');
        onSuccess(response.data.data);
      } else {
        // Create new user
        const response = await userAPI.create(formData);
        toast.success('User created successfully');
        onSuccess(response.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{user ? 'Edit User' : 'Add New User'}</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
            />
          </div>

          {!user && (
            <div className="form-group">
              <label>Password</label>
              <input
                type="text"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave empty to auto-generate"
              />
              <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>
                If left empty, password will be auto-generated as: email@123
              </small>
            </div>
          )}

          <div className="form-group">
            <label>Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="accountant">Accountant</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              Active
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
