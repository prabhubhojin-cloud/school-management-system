import { useState, useEffect } from 'react';
import { checkInAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  FiMapPin, FiClock, FiCheckCircle, FiAlertCircle,
  FiLogIn, FiLogOut, FiRefreshCw, FiNavigation
} from 'react-icons/fi';

const formatTime = (dt) =>
  dt ? new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';

const formatDate = (dt) =>
  dt ? new Date(dt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';

const StaffCheckIn = () => {
  const { user } = useAuth();
  const [todayRecord, setTodayRecord] = useState(null);
  const [schoolLocation, setSchoolLocation] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    fetchStatus();
    fetchSchoolLocation();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await checkInAPI.getMyStatus();
      setTodayRecord(res.data.data);
    } catch {
      // no record today is fine
    } finally {
      setLoadingStatus(false);
    }
  };

  const fetchSchoolLocation = async () => {
    try {
      const res = await checkInAPI.getSchoolLocation();
      setSchoolLocation(res.data.data);
    } catch {}
  };

  const getLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => reject(new Error(err.message || 'Unable to retrieve location')),
        { enableHighAccuracy: true, timeout: 15000 }
      );
    });

  const handleLocate = async () => {
    setLocating(true);
    setLocationError('');
    try {
      const pos = await getLocation();
      setCurrentPosition(pos);
    } catch (err) {
      setLocationError(err.message);
    } finally {
      setLocating(false);
    }
  };

  const handleCheckIn = async () => {
    setSubmitting(true);
    setLocationError('');
    try {
      const pos = currentPosition || await getLocation();
      setCurrentPosition(pos);
      const res = await checkInAPI.checkIn({ latitude: pos.latitude, longitude: pos.longitude });
      toast.success(res.data.message);
      if (res.data.warning) {
        toast.warn(`⚠ ${res.data.warning}`, { autoClose: 8000 });
      }
      setTodayRecord(res.data.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setLocationError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isCheckedIn = !!todayRecord?.checkInTime;
  const isCheckedOut = !!todayRecord?.checkOutTime;
  const canCheckOut = isCheckedIn && !isCheckedOut;

  return (
    <div className="page-container" style={{ maxWidth: 500, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header">
        <h1>My Check-In</h1>
        <span className="status-badge status-active">{formatDate(new Date())}</span>
      </div>

      {/* School location warning */}
      {schoolLocation && !schoolLocation.configured && (
        <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10, padding: '0.9rem 1.1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#92400e', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <FiAlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          School GPS location is not configured. Contact your admin to set SCHOOL_LATITUDE and SCHOOL_LONGITUDE on the server.
        </div>
      )}

      {/* Today's status card */}
      <div className="card" style={{ marginBottom: '1.25rem', textAlign: 'center', padding: '2rem 1.5rem' }}>
        {loadingStatus ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading status…</p>
        ) : isCheckedIn ? (
          <>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: isCheckedOut ? '#f1f5f9' : '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              {isCheckedOut
                ? <FiLogOut size={28} color="var(--text-secondary)" />
                : <FiCheckCircle size={28} color="var(--success)" />}
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              {isCheckedOut ? 'Checked Out' : 'Checked In'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              {isCheckedOut ? 'You have completed today\'s attendance' : 'You are marked present for today'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Check-In</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiLogIn size={16} color="var(--success)" />
                  {formatTime(todayRecord.checkInTime)}
                </div>
              </div>
              {isCheckedOut && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Check-Out</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiLogOut size={16} color="var(--text-secondary)" />
                    {formatTime(todayRecord.checkOutTime)}
                  </div>
                </div>
              )}
            </div>
            {/* Location badge */}
            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <span className={`status-badge ${todayRecord.isWithinRange ? 'status-active' : 'status-warning'}`}>
                <FiMapPin size={11} />
                {todayRecord.isWithinRange ? `At school (${todayRecord.distanceMeters}m)` : `${todayRecord.distanceMeters}m from school`}
              </span>
            </div>
          </>
        ) : (
          <>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <FiClock size={28} color="var(--primary)" />
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Not Checked In Yet</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tap below to mark your presence for today</p>
          </>
        )}
      </div>

      {/* Location preview */}
      {currentPosition && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#166534', display: 'flex', gap: 8, alignItems: 'center' }}>
          <FiNavigation size={14} />
          Location acquired: {currentPosition.latitude.toFixed(5)}, {currentPosition.longitude.toFixed(5)}
        </div>
      )}

      {locationError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#991b1b', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <FiAlertCircle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
          {locationError}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Get location first */}
        {!currentPosition && !isCheckedIn && (
          <button
            className="btn-secondary"
            onClick={handleLocate}
            disabled={locating}
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
          >
            <FiNavigation size={16} />
            {locating ? 'Getting location…' : 'Get My Location'}
          </button>
        )}

        {/* Check-in button */}
        {!isCheckedIn && (
          <button
            className="btn-primary"
            onClick={handleCheckIn}
            disabled={submitting || !schoolLocation?.configured}
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem', fontWeight: 600 }}
          >
            <FiLogIn size={18} />
            {submitting ? 'Checking in…' : 'Check In Now'}
          </button>
        )}

        {/* Check-out button */}
        {canCheckOut && (
          <button
            className="btn-secondary"
            onClick={handleCheckIn}
            disabled={submitting}
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem', fontWeight: 600 }}
          >
            <FiLogOut size={18} />
            {submitting ? 'Checking out…' : 'Check Out'}
          </button>
        )}

        {/* Refresh */}
        <button
          className="btn-ghost"
          onClick={fetchStatus}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <FiRefreshCw size={14} />
          Refresh status
        </button>
      </div>

      {/* Info */}
      <div style={{ marginTop: '1.5rem', background: '#f8fafc', borderRadius: 10, padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
        <strong style={{ color: 'var(--text-secondary)' }}>How it works</strong><br />
        • Your GPS location is captured when you check in<br />
        • The system verifies if you are within {schoolLocation?.radiusMeters || 200}m of the school<br />
        • Check-in and check-out times are recorded and visible to admin<br />
        • Only one check-in per day is allowed
      </div>
    </div>
  );
};

export default StaffCheckIn;
