import { useState, useEffect } from 'react';
import { feeInstallmentAPI, studentAPI, academicYearAPI, classAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/fees/PaymentModal';
import '../styles/Table.css';

const Fees = () => {
  const { isAdmin } = useAuth();
  const [installments, setInstallments] = useState([]);
  const [students, setStudents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(null);

  // Get current month name
  const getCurrentMonth = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[new Date().getMonth()];
  };

  // Filters
  const [filterStudent, setFilterStudent] = useState('');
  const [filterAcademicYear, setFilterAcademicYear] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFeeType, setFilterFeeType] = useState('tuition');
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth());
  const [search, setSearch] = useState('');

  // Summary stats
  const [summary, setSummary] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchInstallments();
  }, [filterStudent, filterAcademicYear, filterClass, filterStatus, filterFeeType, filterMonth]);

  const fetchInitialData = async () => {
    try {
      const [studentsRes, yearsRes, classesRes] = await Promise.all([
        studentAPI.getAll(),
        academicYearAPI.getAll(),
        classAPI.getAll(),
      ]);

      setStudents(studentsRes.data.data || []);
      setAcademicYears(yearsRes.data.data || []);
      setClasses(classesRes.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch initial data');
    }
  };

  const fetchInstallments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStudent) params.student = filterStudent;
      if (filterAcademicYear) params.academicYear = filterAcademicYear;
      if (filterClass) params.class = filterClass;
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterFeeType !== 'all') params.feeType = filterFeeType;
      if (filterMonth !== 'all') params.month = filterMonth;

      const response = await feeInstallmentAPI.getAll(params);
      const data = response.data.data || [];
      setInstallments(data);

      // Calculate summary
      const total = data.reduce((sum, inst) => sum + (inst.amount || 0), 0);
      const paid = data.reduce((sum, inst) => sum + (inst.paidAmount || 0), 0);
      const pending = data.filter(inst => inst.status === 'pending').reduce((sum, inst) => sum + (inst.balance || 0), 0);
      const overdue = data.filter(inst => inst.status === 'overdue').reduce((sum, inst) => sum + (inst.balance || 0), 0);

      setSummary({ total, paid, pending, overdue });
    } catch (error) {
      toast.error('Failed to fetch fee installments');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (installment) => {
    setSelectedInstallment(installment);
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedInstallment(null);
  };

  const handlePaymentSuccess = () => {
    fetchInstallments();
  };

  const handleSkip = async (installmentId) => {
    const reason = prompt('Enter reason for skipping this fee:');
    if (!reason) return;

    try {
      await feeInstallmentAPI.skip(installmentId, { reason });
      toast.success('Fee installment skipped successfully');
      fetchInstallments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to skip installment');
    }
  };

  const handleUnskip = async (installmentId) => {
    if (!window.confirm('Are you sure you want to unskip this fee installment?')) return;

    try {
      await feeInstallmentAPI.unskip(installmentId);
      toast.success('Fee installment unskipped successfully');
      fetchInstallments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to unskip installment');
    }
  };

  const handleApplyDiscount = async (installmentId) => {
    const amount = prompt('Enter discount amount:');
    if (!amount) return;

    const reason = prompt('Enter reason for discount:');
    if (!reason) return;

    try {
      await feeInstallmentAPI.applyDiscount(installmentId, {
        amount: parseFloat(amount),
        reason,
      });
      toast.success('Discount applied successfully');
      fetchInstallments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply discount');
    }
  };

  const handleFixExistingData = async () => {
    if (!window.confirm('This will recalculate balance and status for all existing fee installments. Continue?')) return;

    try {
      const response = await feeInstallmentAPI.fixExisting();
      toast.success(response.data.message || 'Fee data fixed successfully');
      fetchInstallments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fix fee data');
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'danger';
      case 'skipped': return 'secondary';
      case 'partial': return 'info';
      default: return 'default';
    }
  };

  const filteredInstallments = installments.filter(inst => {
    const studentName = `${inst.student?.firstName} ${inst.student?.lastName}`.toLowerCase();
    const admissionNumber = inst.student?.admissionNumber?.toLowerCase() || '';
    const searchLower = search.toLowerCase();

    return studentName.includes(searchLower) || admissionNumber.includes(searchLower) || inst.feeName?.toLowerCase().includes(searchLower);
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Fee Management - Installments</h1>
        {isAdmin && (
          <button className="btn btn-warning" onClick={handleFixExistingData}>
            Fix Existing Data
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="summary-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="summary-card" style={{ padding: '1rem', background: 'var(--background-secondary)', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Amount</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-color)' }}>{formatCurrency(summary.total)}</p>
        </div>
        <div className="summary-card" style={{ padding: '1rem', background: 'var(--background-secondary)', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Paid</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(summary.paid)}</p>
        </div>
        <div className="summary-card" style={{ padding: '1rem', background: 'var(--background-secondary)', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Pending</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{formatCurrency(summary.pending)}</p>
        </div>
        <div className="summary-card" style={{ padding: '1rem', background: 'var(--background-secondary)', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Overdue</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{formatCurrency(summary.overdue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search student or fee name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />

          <select value={filterStudent} onChange={(e) => setFilterStudent(e.target.value)}>
            <option value="">All Students</option>
            {students.map(student => (
              <option key={student._id} value={student._id}>
                {student.firstName} {student.lastName} ({student.admissionNumber})
              </option>
            ))}
          </select>

          <select value={filterAcademicYear} onChange={(e) => setFilterAcademicYear(e.target.value)}>
            <option value="">All Academic Years</option>
            {academicYears.map(year => (
              <option key={year._id} value={year._id}>{year.year}</option>
            ))}
          </select>

          <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
            <option value="">All Classes</option>
            {classes.map(cls => (
              <option key={cls._id} value={cls._id}>{cls.name} - {cls.section}</option>
            ))}
          </select>

          <select value={filterFeeType} onChange={(e) => setFilterFeeType(e.target.value)}>
            <option value="all">All Fee Types</option>
            <option value="tuition">Tuition</option>
            <option value="exam">Exam</option>
            <option value="other">Other</option>
          </select>

          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
            <option value="all">All Months</option>
            <option value="April">April</option>
            <option value="May">May</option>
            <option value="June">June</option>
            <option value="July">July</option>
            <option value="August">August</option>
            <option value="September">September</option>
            <option value="October">October</option>
            <option value="November">November</option>
            <option value="December">December</option>
            <option value="January">January</option>
            <option value="February">February</option>
            <option value="March">March</option>
          </select>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="partial">Partial</option>
            <option value="skipped">Skipped</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Admission No</th>
              <th>Fee Name</th>
              <th>Type</th>
              <th>Month</th>
              <th>Amount</th>
              <th>Paid</th>
              <th>Discount</th>
              <th>Balance</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInstallments.map((inst) => (
              <tr key={inst._id}>
                <td>{inst.student?.firstName} {inst.student?.lastName}</td>
                <td>{inst.student?.admissionNumber}</td>
                <td>{inst.feeName}</td>
                <td style={{ textTransform: 'capitalize' }}>{inst.feeType}</td>
                <td>{inst.month || '-'}</td>
                <td>{formatCurrency(inst.amount)}</td>
                <td>{formatCurrency(inst.paidAmount)}</td>
                <td>{inst.discount > 0 ? formatCurrency(inst.discount) : '-'}</td>
                <td>{formatCurrency(inst.balance)}</td>
                <td>{formatDate(inst.dueDate)}</td>
                <td>
                  <span className={`status-badge status-${getStatusColor(inst.status)}`}>
                    {inst.status}
                  </span>
                </td>
                <td>
                  {inst.status === 'skipped' ? (
                    isAdmin ? (
                      <button
                        className="btn-small btn-warning"
                        onClick={() => handleUnskip(inst._id)}
                        title={inst.skippedReason}
                      >
                        Unskip
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Skipped</span>
                    )
                  ) : inst.status !== 'paid' ? (
                    <>
                      <button
                        className="btn-small btn-success"
                        onClick={() => handlePayment(inst)}
                      >
                        Pay
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            className="btn-small"
                            onClick={() => handleApplyDiscount(inst._id)}
                          >
                            Discount
                          </button>
                          <button
                            className="btn-small btn-secondary"
                            onClick={() => handleSkip(inst._id)}
                          >
                            Skip
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Paid</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredInstallments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            No fee installments found. Add students with fee configurations to see installments here.
          </div>
        )}
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handleClosePaymentModal}
        onSuccess={handlePaymentSuccess}
        installment={selectedInstallment}
      />
    </div>
  );
};

export default Fees;
