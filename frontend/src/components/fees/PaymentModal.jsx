import { useState, useEffect } from 'react';
import { feeInstallmentAPI } from '../../services/api';
import { toast } from 'react-toastify';
import '../../styles/Modal.css';
import '../../styles/Form.css';

const PaymentModal = ({ isOpen, onClose, onSuccess, installment }) => {
  const [loading, setLoading] = useState(false);
  const [receiptImage, setReceiptImage] = useState(null);
  const [formData, setFormData] = useState({
    amount: 0,
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    transactionId: '',
    remarks: '',
  });

  useEffect(() => {
    if (isOpen && installment) {
      // Set default amount to remaining balance
      setFormData({
        amount: installment.balance || 0,
        paymentMethod: 'cash',
        paymentDate: new Date().toISOString().split('T')[0],
        transactionId: '',
        remarks: '',
      });
      setReceiptImage(null);
    }
  }, [isOpen, installment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPG, PNG, and PDF files are allowed');
        e.target.value = '';
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        e.target.value = '';
        return;
      }
      setReceiptImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const amount = parseFloat(formData.amount);

      // Validation
      if (amount <= 0) {
        toast.error('Payment amount must be greater than 0');
        setLoading(false);
        return;
      }

      if (amount > installment.balance) {
        toast.error(`Payment amount cannot exceed balance of ₹${installment.balance}`);
        setLoading(false);
        return;
      }

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('amount', amount);
      formDataToSend.append('paymentMethod', formData.paymentMethod);
      formDataToSend.append('paymentDate', formData.paymentDate);
      if (formData.transactionId) formDataToSend.append('transactionId', formData.transactionId);
      if (formData.remarks) formDataToSend.append('remarks', formData.remarks);
      if (receiptImage) formDataToSend.append('receiptImage', receiptImage);

      await feeInstallmentAPI.processPayment(installment._id, formDataToSend);
      toast.success('Payment processed successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !installment) return null;

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Process Payment</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Installment Details */}
        <div style={{ padding: '1rem', background: 'var(--background-secondary)', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '0.75rem' }}>Fee Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '14px' }}>
            <div>
              <strong>Student:</strong> {installment.student?.firstName} {installment.student?.lastName}
            </div>
            <div>
              <strong>Admission No:</strong> {installment.student?.admissionNumber}
            </div>
            <div>
              <strong>Fee Name:</strong> {installment.feeName}
            </div>
            <div>
              <strong>Fee Type:</strong> <span style={{ textTransform: 'capitalize' }}>{installment.feeType}</span>
            </div>
            {installment.month && (
              <div>
                <strong>Month:</strong> {installment.month}
              </div>
            )}
            <div>
              <strong>Due Date:</strong> {new Date(installment.dueDate).toLocaleDateString('en-IN')}
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '14px' }}>
            <div>
              <strong>Total Amount:</strong>
              <div style={{ fontSize: '18px', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                {formatCurrency(installment.amount)}
              </div>
            </div>
            <div>
              <strong>Paid Amount:</strong>
              <div style={{ fontSize: '18px', color: '#10b981', fontWeight: 'bold' }}>
                {formatCurrency(installment.paidAmount)}
              </div>
            </div>
            <div>
              <strong>Balance:</strong>
              <div style={{ fontSize: '18px', color: '#ef4444', fontWeight: 'bold' }}>
                {formatCurrency(installment.balance)}
              </div>
            </div>
          </div>
          {installment.discount > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <strong>Discount Applied:</strong> {formatCurrency(installment.discount)}
              {installment.discountReason && ` (${installment.discountReason})`}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Payment Amount *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter payment amount"
              required
              min="0.01"
              max={installment.balance}
              step="0.01"
            />
            <small style={{ color: 'var(--text-secondary)' }}>
              Maximum: {formatCurrency(installment.balance)}
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Payment Method *</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="online">Online Payment</option>
              </select>
            </div>

            <div className="form-group">
              <label>Payment Date *</label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Transaction ID / Reference Number</label>
            <input
              type="text"
              name="transactionId"
              value={formData.transactionId}
              onChange={handleChange}
              placeholder="Enter transaction ID (optional)"
            />
          </div>

          <div className="form-group">
            <label>Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Add any additional notes (optional)"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Receipt / Proof of Payment</label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={handleFileChange}
            />
            <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>
              Upload receipt image or PDF (optional, max 5MB)
            </small>
            {receiptImage && (
              <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'var(--background-secondary)', borderRadius: '4px', fontSize: '14px' }}>
                Selected: {receiptImage.name}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary btn-success" disabled={loading}>
              {loading ? 'Processing...' : 'Process Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
