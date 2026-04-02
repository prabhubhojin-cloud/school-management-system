import { useState, useEffect, useCallback } from 'react';
import { checkInAPI } from '../services/api';
import {
  FiMapPin, FiLogIn, FiLogOut, FiCheckCircle,
  FiXCircle, FiUser, FiCalendar, FiClock
} from 'react-icons/fi';

const formatTime = (dt) =>
  dt ? new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';

const formatDate = (d) =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const todayStr = () => new Date().toISOString().split('T')[0];

const firstOfMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

const ROLES = [
  { value: '', label: 'All Roles' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'office_incharge', label: 'Office Incharge' },
  { value: 'accountant', label: 'Accountant' },
];

const MODE_DAILY = 'daily';
const MODE_MEMBER = 'member';

const CheckInReport = () => {
  const [mode, setMode] = useState(MODE_DAILY);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);

  // Daily mode filters
  const [date, setDate] = useState(todayStr());
  const [role, setRole] = useState('');
  const [checkInAfter, setCheckInAfter] = useState('');

  // Member history filters
  const [selectedUser, setSelectedUser] = useState('');
  const [fromDate, setFromDate] = useState(firstOfMonth());
  const [toDate, setToDate] = useState(todayStr());

  useEffect(() => {
    checkInAPI.getStaffList()
      .then(res => setStaffList(res.data.data))
      .catch(() => {});
  }, []);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (mode === MODE_DAILY) {
        params.date = date;
        if (role) params.role = role;
        if (checkInAfter) params.checkInAfter = checkInAfter;
      } else {
        if (!selectedUser) { setRecords([]); setLoading(false); return; }
        params.userId = selectedUser;
        params.fromDate = fromDate;
        params.toDate = toDate;
      }
      const res = await checkInAPI.getAll(params);
      setRecords(res.data.data);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [mode, date, role, checkInAfter, selectedUser, fromDate, toDate]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const presentCount = records.filter(r => r.isWithinRange).length;
  const remoteCount = records.filter(r => !r.isWithinRange).length;

  const selectedStaff = staffList.find(s => s._id === selectedUser);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Check-In Report</h1>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {[
          { id: MODE_DAILY,  label: 'Daily View',      icon: FiCalendar },
          { id: MODE_MEMBER, label: 'Member History',  icon: FiUser },
        ].map(m => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={mode === m.id ? 'btn-primary' : 'btn-secondary'}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Icon size={14} /> {m.label}
            </button>
          );
        })}
      </div>

      {/* ── Daily mode filters ── */}
      {mode === MODE_DAILY && (
        <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                <FiCalendar size={12} style={{ marginRight: 4 }} />Date
              </label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: 'auto' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                <FiClock size={12} style={{ marginRight: 4 }} />Checked in after
              </label>
              <input
                type="time"
                value={checkInAfter}
                onChange={e => setCheckInAfter(e.target.value)}
                style={{ width: 'auto' }}
                placeholder="Any time"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Role</label>
              <select value={role} onChange={e => setRole(e.target.value)} style={{ width: 'auto' }}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            {checkInAfter && (
              <button className="btn-ghost" onClick={() => setCheckInAfter('')} style={{ marginBottom: 1 }}>
                Clear time filter
              </button>
            )}
          </div>
          {checkInAfter && (
            <div style={{ marginTop: '0.6rem', fontSize: '0.78rem', color: 'var(--warning)', background: 'var(--warning-light)', padding: '0.4rem 0.75rem', borderRadius: 6, display: 'inline-block' }}>
              Showing staff who checked in at or after {checkInAfter}
            </div>
          )}
        </div>
      )}

      {/* ── Member history filters ── */}
      {mode === MODE_MEMBER && (
        <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                <FiUser size={12} style={{ marginRight: 4 }} />Select Member
              </label>
              <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                <option value="">— Choose a staff member —</option>
                {staffList.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.email} ({s.role.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>From</label>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ width: 'auto' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>To</label>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ width: 'auto' }} />
            </div>
          </div>
          {!selectedUser && (
            <p style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Select a staff member to view their check-in history.
            </p>
          )}
          {selectedUser && (
            <div style={{ marginTop: '0.6rem', fontSize: '0.78rem', color: 'var(--primary)', background: 'var(--primary-light)', padding: '0.4rem 0.75rem', borderRadius: 6, display: 'inline-block' }}>
              Showing {selectedStaff?.email} — {formatDate(fromDate)} to {formatDate(toDate)}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      {records.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {[
            { label: 'Total',       value: records.length,                                   color: 'var(--primary)',        bg: 'var(--primary-light)' },
            { label: 'At School',   value: presentCount,                                     color: 'var(--success)',        bg: '#d1fae5' },
            { label: 'Remote',      value: remoteCount,                                      color: 'var(--warning)',        bg: '#fef3c7' },
            { label: 'Checked Out', value: records.filter(r => r.checkOutTime).length,       color: 'var(--text-secondary)', bg: '#f1f5f9' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center', padding: '0.85rem' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
          ) : mode === MODE_MEMBER && !selectedUser ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Select a staff member above to view their history.
            </div>
          ) : records.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No check-ins found for the selected filters.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  {mode === MODE_DAILY && <th>Staff Member</th>}
                  {mode === MODE_DAILY && <th>Role</th>}
                  {mode === MODE_MEMBER && <th>Date</th>}
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
                    {mode === MODE_DAILY && <td style={{ fontWeight: 500 }}>{r.user?.email || '—'}</td>}
                    {mode === MODE_DAILY && (
                      <td>
                        <span className="status-badge status-pending" style={{ textTransform: 'capitalize' }}>
                          {r.role?.replace('_', ' ')}
                        </span>
                      </td>
                    )}
                    {mode === MODE_MEMBER && (
                      <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{formatDate(r.date)}</td>
                    )}
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--success)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        <FiLogIn size={13} />{formatTime(r.checkInTime)}
                      </span>
                    </td>
                    <td>
                      {r.checkOutTime
                        ? <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}><FiLogOut size={13} />{formatTime(r.checkOutTime)}</span>
                        : <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span>}
                    </td>
                    <td>
                      <a
                        href={`https://www.google.com/maps?q=${r.location?.latitude},${r.location?.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                      >
                        <FiMapPin size={12} />View map
                      </a>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{r.distanceMeters}m</td>
                    <td>
                      {r.isWithinRange
                        ? <span className="status-badge status-active" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><FiCheckCircle size={11} />At School</span>
                        : <span className="status-badge status-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><FiXCircle size={11} />Remote</span>}
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
