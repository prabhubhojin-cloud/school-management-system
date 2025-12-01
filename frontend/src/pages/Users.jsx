import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { toast } from 'react-toastify';
import UserForm from '../components/users/UserForm';
import PasswordModal from '../components/users/PasswordModal';
import '../styles/Table.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUserCredentials, setNewUserCredentials] = useState(null);
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterRole !== 'all') params.role = filterRole;

      const response = await userAPI.getAll(params);
      setUsers(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedUser(null);
  };

  const handleFormSuccess = (data) => {
    fetchUsers();
    handleCloseForm();

    // If creating new user, show credentials
    if (data.tempPassword) {
      setNewUserCredentials({
        email: data.email,
        password: data.tempPassword
      });
    }
  };

  const handleResetPassword = async (user) => {
    if (!window.confirm(`Reset password for ${user.email}?`)) return;

    try {
      const response = await userAPI.resetPassword(user._id, {});
      setNewUserCredentials({
        email: response.data.data.email,
        password: response.data.data.tempPassword
      });
      toast.success('Password reset successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleToggleStatus = async (user) => {
    const action = user.isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} ${user.email}?`)) return;

    try {
      await userAPI.toggleStatus(user._id);
      toast.success(`User ${action}d successfully`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} user`);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.email}? This action cannot be undone.`)) return;

    try {
      await userAPI.delete(user._id);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'accountant': return 'primary';
      case 'teacher': return 'info';
      case 'student': return 'success';
      default: return 'default';
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>User Management</h1>
        <button className="btn btn-primary" onClick={handleAddUser}>
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section" style={{ marginBottom: '1.5rem' }}>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="accountant">Accountant</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.email}</td>
                <td>
                  <span className={`status-badge status-${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-${user.isActive ? 'success' : 'danger'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                <td>
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString('en-IN')
                    : 'Never'}
                </td>
                <td>
                  <button
                    className="btn-small"
                    onClick={() => handleEditUser(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-small btn-warning"
                    onClick={() => handleResetPassword(user)}
                  >
                    Reset Password
                  </button>
                  <button
                    className={`btn-small ${user.isActive ? 'btn-secondary' : 'btn-success'}`}
                    onClick={() => handleToggleStatus(user)}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    className="btn-small btn-danger"
                    onClick={() => handleDeleteUser(user)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            No users found.
          </div>
        )}
      </div>

      {showForm && (
        <UserForm
          isOpen={showForm}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
          user={selectedUser}
        />
      )}

      {newUserCredentials && (
        <PasswordModal
          isOpen={!!newUserCredentials}
          onClose={() => setNewUserCredentials(null)}
          credentials={newUserCredentials}
        />
      )}
    </div>
  );
};

export default Users;
