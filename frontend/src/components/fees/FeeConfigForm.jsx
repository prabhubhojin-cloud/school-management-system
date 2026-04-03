import { useState, useEffect } from 'react';
import { feeConfigurationAPI, academicYearAPI, classAPI } from '../../services/api';
import { toast } from 'react-toastify';
import '../../styles/Modal.css';
import '../../styles/Form.css';

const FeeConfigForm = ({ isOpen, onClose, onSuccess, config }) => {
  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]);

  const [formData, setFormData] = useState({
    academicYear: '',
    class: '',
    tuitionFee: 0,
    examFees: [
      { name: 'First Term', amount: 0 },
      { name: 'Mid Term', amount: 0 },
      { name: 'Pre-Final', amount: 0 },
      { name: 'Final Term', amount: 0 },
    ],
    otherFees: [],
    generalDiscounts: [],
    siblingDiscount: { enabled: false, type: 'percentage', value: 0, appliesTo: 'tuition' },
    isActive: true,
  });

  useEffect(() => {
    if (isOpen) {
      fetchAcademicYears();
      fetchClasses();

      if (config) {
        setFormData({
          academicYear: config.academicYear?._id || '',
          class: config.class?._id || '',
          tuitionFee: config.feeStructure?.tuitionFee || 0,
          examFees: config.feeStructure?.examFees?.length
            ? config.feeStructure.examFees
            : [
                { name: 'First Term', amount: 0 },
                { name: 'Mid Term', amount: 0 },
                { name: 'Pre-Final', amount: 0 },
                { name: 'Final Term', amount: 0 },
              ],
          otherFees: config.feeStructure?.otherFees || [],
          generalDiscounts: config.discounts?.general || [],
          siblingDiscount: config.discounts?.sibling || { enabled: false, type: 'percentage', value: 0, appliesTo: 'tuition' },
          isActive: config.isActive !== undefined ? config.isActive : true,
        });
      } else {
        // Reset form for new config
        setFormData({
          academicYear: '',
          class: '',
          tuitionFee: 0,
          examFees: [
            { name: 'First Term', amount: 0 },
            { name: 'Mid Term', amount: 0 },
            { name: 'Pre-Final', amount: 0 },
            { name: 'Final Term', amount: 0 },
          ],
          otherFees: [],
          generalDiscounts: [],
          siblingDiscount: { enabled: false, type: 'percentage', value: 0, appliesTo: 'tuition' },
          isActive: true,
        });
      }
    }
  }, [isOpen, config]);

  const fetchAcademicYears = async () => {
    try {
      const response = await academicYearAPI.getAll();
      setAcademicYears(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch academic years');
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getAll();
      setClasses(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch classes');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleExamFeeChange = (index, field, value) => {
    const updatedExamFees = [...formData.examFees];
    updatedExamFees[index][field] = field === 'amount' ? Number(value) : value;
    setFormData({ ...formData, examFees: updatedExamFees });
  };

  const handleOtherFeeChange = (index, field, value) => {
    const updatedOtherFees = [...formData.otherFees];
    updatedOtherFees[index][field] = field === 'amount' ? Number(value) : value;
    setFormData({ ...formData, otherFees: updatedOtherFees });
  };

  const addOtherFee = () => {
    setFormData({
      ...formData,
      otherFees: [
        ...formData.otherFees,
        { name: '', amount: 0, frequency: 'one-time' },
      ],
    });
  };

  const removeOtherFee = (index) => {
    const updatedOtherFees = formData.otherFees.filter((_, i) => i !== index);
    setFormData({ ...formData, otherFees: updatedOtherFees });
  };

  const addGeneralDiscount = () => {
    setFormData({
      ...formData,
      generalDiscounts: [...formData.generalDiscounts, { name: '', type: 'percentage', value: 0, appliesTo: 'all' }],
    });
  };

  const handleGeneralDiscountChange = (index, field, value) => {
    const updated = [...formData.generalDiscounts];
    updated[index][field] = field === 'value' ? Number(value) : value;
    setFormData({ ...formData, generalDiscounts: updated });
  };

  const removeGeneralDiscount = (index) => {
    setFormData({ ...formData, generalDiscounts: formData.generalDiscounts.filter((_, i) => i !== index) });
  };

  const handleSiblingDiscountChange = (field, value) => {
    setFormData({
      ...formData,
      siblingDiscount: {
        ...formData.siblingDiscount,
        [field]: field === 'value' ? Number(value) : field === 'enabled' ? value : value,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        academicYear: formData.academicYear,
        class: formData.class,
        feeStructure: {
          tuitionFee: Number(formData.tuitionFee),
          examFees: formData.examFees,
          otherFees: formData.otherFees,
        },
        discounts: {
          general: formData.generalDiscounts,
          sibling: formData.siblingDiscount,
        },
        isActive: formData.isActive,
      };

      if (config) {
        await feeConfigurationAPI.update(config._id, payload);
        toast.success('Fee configuration updated successfully');
      } else {
        await feeConfigurationAPI.create(payload);
        toast.success('Fee configuration created successfully');
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save fee configuration');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{config ? 'Edit Fee Configuration' : 'Add Fee Configuration'}</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-section">
            <h3>Basic Information</h3>

            <div className="form-row">
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

              <div className="form-group">
                <label>Class *</label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
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
                <label>Monthly Tuition Fee *</label>
                <input
                  type="number"
                  name="tuitionFee"
                  value={formData.tuitionFee}
                  onChange={handleChange}
                  placeholder="Enter monthly tuition fee"
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    style={{ marginRight: '8px' }}
                  />
                  <span>Active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Exam Fees</h3>
            {formData.examFees.map((exam, index) => (
              <div key={index} className="form-row">
                <div className="form-group">
                  <label>Exam Name *</label>
                  <input
                    type="text"
                    value={exam.name}
                    onChange={(e) => handleExamFeeChange(index, 'name', e.target.value)}
                    placeholder="e.g., First Term"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Amount *</label>
                  <input
                    type="number"
                    value={exam.amount}
                    onChange={(e) => handleExamFeeChange(index, 'amount', e.target.value)}
                    placeholder="Enter amount"
                    required
                    min="0"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="form-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Other Fees</h3>
              <button
                type="button"
                className="btn-small btn-success"
                onClick={addOtherFee}
              >
                + Add Fee
              </button>
            </div>

            {formData.otherFees.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                No other fees added. Click "Add Fee" to include additional fee heads.
              </p>
            )}

            {formData.otherFees.map((fee, index) => (
              <div key={index} className="fee-item">
                <div className="form-row">
                  <div className="form-group">
                    <label>Fee Name *</label>
                    <input
                      type="text"
                      value={fee.name}
                      onChange={(e) => handleOtherFeeChange(index, 'name', e.target.value)}
                      placeholder="e.g., Library Fee, Transport Fee"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Amount *</label>
                    <input
                      type="number"
                      value={fee.amount}
                      onChange={(e) => handleOtherFeeChange(index, 'amount', e.target.value)}
                      placeholder="Enter amount"
                      required
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Frequency *</label>
                    <select
                      value={fee.frequency}
                      onChange={(e) => handleOtherFeeChange(index, 'frequency', e.target.value)}
                      required
                    >
                      <option value="one-time">One-time</option>
                      <option value="annual">Annual</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn-small btn-danger"
                      onClick={() => removeOtherFee(index)}
                      style={{ marginBottom: '0' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Sibling Discount ── */}
          <div className="form-section">
            <h3>Sibling Discount</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Auto-applied when a student is marked as a sibling during fee generation.
            </p>

            <div className="form-row">
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                <input
                  type="checkbox"
                  id="siblingEnabled"
                  checked={formData.siblingDiscount.enabled}
                  onChange={e => handleSiblingDiscountChange('enabled', e.target.checked)}
                  style={{ width: 'auto' }}
                />
                <label htmlFor="siblingEnabled" style={{ marginBottom: 0 }}>Enable sibling discount</label>
              </div>
            </div>

            {formData.siblingDiscount.enabled && (
              <div className="form-row" style={{ marginTop: '0.75rem' }}>
                <div className="form-group">
                  <label>Discount Type</label>
                  <select value={formData.siblingDiscount.type} onChange={e => handleSiblingDiscountChange('type', e.target.value)}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Value {formData.siblingDiscount.type === 'percentage' ? '(%)' : '(₹)'}</label>
                  <input
                    type="number"
                    min="0"
                    max={formData.siblingDiscount.type === 'percentage' ? 100 : undefined}
                    value={formData.siblingDiscount.value}
                    onChange={e => handleSiblingDiscountChange('value', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Applies To</label>
                  <select value={formData.siblingDiscount.appliesTo} onChange={e => handleSiblingDiscountChange('appliesTo', e.target.value)}>
                    <option value="tuition">Tuition Fee Only</option>
                    <option value="exam">Exam Fee Only</option>
                    <option value="all">All Fees</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* ── General Discount Presets ── */}
          <div className="form-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ marginBottom: 0 }}>Discount Presets</h3>
              </div>
              <button type="button" className="btn-small btn-success" onClick={addGeneralDiscount}>+ Add Preset</button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
              Named discount categories (e.g. Staff Ward, Merit) that can be manually applied to individual students.
            </p>

            {formData.generalDiscounts.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No discount presets added.</p>
            )}

            {formData.generalDiscounts.map((d, index) => (
              <div key={index} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.9rem', marginBottom: '0.75rem' }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Discount Name *</label>
                    <input
                      type="text"
                      value={d.name}
                      onChange={e => handleGeneralDiscountChange(index, 'name', e.target.value)}
                      placeholder="e.g. Staff Ward, Merit, EWS"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select value={d.type} onChange={e => handleGeneralDiscountChange(index, 'type', e.target.value)}>
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Value {d.type === 'percentage' ? '(%)' : '(₹)'}</label>
                    <input
                      type="number"
                      min="0"
                      value={d.value}
                      onChange={e => handleGeneralDiscountChange(index, 'value', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Applies To</label>
                    <select value={d.appliesTo} onChange={e => handleGeneralDiscountChange(index, 'appliesTo', e.target.value)}>
                      <option value="all">All Fees</option>
                      <option value="tuition">Tuition Only</option>
                      <option value="exam">Exam Only</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button type="button" className="btn-small btn-danger" onClick={() => removeGeneralDiscount(index)}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : config ? 'Update Configuration' : 'Create Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeeConfigForm;
