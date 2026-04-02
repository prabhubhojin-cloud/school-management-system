import { useState, useEffect } from 'react';
import { checkInAPI } from '../services/api';
import { FiMapPin, FiClock, FiLogIn, FiLogOut, FiCheckCircle, FiXCircle, FiFilter } from 'react-icons/fi';

const formatTime = (dt) =>
  dt ? new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';

const todayStr = () => new Date().toISOString().split('T')[0];

const ROLES = [
  { value: '', label: 'All Roles' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'office_incharge', label: 'Office Incharge' },
  { value: 'accountant', label: 'Accountant' },
];

const CheckInReport = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(todayStr());
  const [role, setRole] = useState('');

  useEffect(() => {
    fetchRecords();
  }, [date, role]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = { date };
      if (role) params.role = role;
      const res = await checkInAPI.getAll(params);
      setRecords(res.data.data);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const presentCount = records.filter(r => r.isWithinRange).length;
  const absentCount = records.filter(r => !r.isWithinRange).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Staff Check-In Report</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', value: records.length, color: 'var(--primary)', bg: 'var(--primary-light)' },
          { label: 'At School', value: presentCount, color: 'var(--success)', bg: '#d1fae5' },
          { label: 'Remote', value: absentCount, color: 'var(--warning)', bg: '#fef3c7' },
          { label: 'Checked Out', value: records.filter(r => r.checkOutTime).length, color: 'var(--text-secondary)', bg: '#f1f5f9' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <FiFilter size={15} color="var(--text-muted)" />
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ width: 'auto' }}
          />
          <select value={role} onChange={e => setRole(e.target.value)} style={{ width: 'auto' }}>
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
          ) : records.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No check-ins found for {date}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Role</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Location</th>
                  <th>Distance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 500 }}>{r.user?.email || '—'}</td>
                    <td>
                      <span className="status-badge status-pending" style={{ textTransform: 'capitalize' }}>
                        {r.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--success)', fontWeight: 600 }}>
                        <FiLogIn size={13} />
                        {formatTime(r.checkInTime)}
                      </span>
                    </td>
                    <td>
                      {r.checkOutTime ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)', fontWeight: 600 }}>
                          <FiLogOut size={13} />
                          {formatTime(r.checkOutTime)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Not checked out</span>
                      )}
                    </td>
                    <td>
                      <a
                        href={`https://www.google.com/maps?q=${r.location?.latitude},${r.location?.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontSize: '0.8rem' }}
                      >
                        <FiMapPin size={12} />
                        View on map
                      </a>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {r.distanceMeters}m
                    </td>
                    <td>
                      {r.isWithinRange ? (
                        <span className="status-badge status-active" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <FiCheckCircle size={11} /> At School
                        </span>
                      ) : (
                        <span className="status-badge status-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <FiXCircle size={11} /> Remote
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckInReport;
