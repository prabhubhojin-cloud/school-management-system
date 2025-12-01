import { useState, useEffect } from 'react';
import api, { feeConfigurationAPI } from '../services/api';
import { toast } from 'react-toastify';
import FeeConfigForm from '../components/fees/FeeConfigForm';
import '../styles/Table.css';

const FeeConfiguration = () => {
  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    try {
      const response = await feeConfigurationAPI.getAll();
      setConfigurations(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch fee configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddConfig = () => {
    setSelectedConfig(null);
    setShowForm(true);
  };

  const handleEditConfig = (config) => {
    setSelectedConfig(config);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedConfig(null);
  };

  const handleFormSuccess = () => {
    fetchConfigurations();
  };

  const handleDeleteConfig = async (id) => {
    if (window.confirm('Are you sure you want to delete this fee configuration?')) {
      try {
        await feeConfigurationAPI.delete(id);
        toast.success('Fee configuration deleted successfully');
        fetchConfigurations();
      } catch (error) {
        toast.error('Failed to delete fee configuration');
      }
    }
  };

  const handleGenerateFees = async (id, config) => {
    if (window.confirm(`Generate fees for all students in ${config.class?.name} - ${config.class?.section}?`)) {
      try {
        const response = await feeConfigurationAPI.generateFees(id);
        toast.success(response.data.message);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to generate fees');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Fee Configuration</h1>
        <button className="btn-primary" onClick={handleAddConfig}>
          Add Fee Configuration
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Academic Year</th>
              <th>Class</th>
              <th>Tuition Fee (Monthly)</th>
              <th>Exam Fees</th>
              <th>Other Fees</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {configurations.map((config) => (
              <tr key={config._id}>
                <td>{config.academicYear?.year}</td>
                <td>{config.class?.name} - {config.class?.section}</td>
                <td>₹{config.feeStructure.tuitionFee.toLocaleString()}</td>
                <td>{config.feeStructure.examFees.length} exams</td>
                <td>{config.feeStructure.otherFees.length} fees</td>
                <td>
                  <span className={`status-badge status-${config.isActive ? 'active' : 'inactive'}`}>
                    {config.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-small btn-success"
                    onClick={() => handleGenerateFees(config._id, config)}
                  >
                    Generate Fees
                  </button>
                  <button className="btn-small" onClick={() => handleEditConfig(config)}>
                    Edit
                  </button>
                  <button className="btn-small btn-danger" onClick={() => handleDeleteConfig(config._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {configurations.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            No fee configurations found. Click "Add Fee Configuration" to get started.
          </div>
        )}
      </div>

      <FeeConfigForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
        config={selectedConfig}
      />
    </div>
  );
};

export default FeeConfiguration;
