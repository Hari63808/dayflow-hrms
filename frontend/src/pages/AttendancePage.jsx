import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { attendanceService } from '../services/attendanceService';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { Clock, LogIn, LogOut, CheckCircle2, Calendar, Search } from 'lucide-react';

const AttendancePage = () => {
  const { user, isAdmin } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  const fetchAttendance = async () => {
    try {
      if (isAdmin) {
        const res = await attendanceService.getAllAttendance();
        if (res?.success) setAttendance(res.attendance ?? []);
      } else {
        const [resHist, resToday] = await Promise.all([
          attendanceService.getMyAttendance(),
          attendanceService.getTodayStatus()
        ]);
        if (resHist?.success) setAttendance(resHist.attendance ?? []);
        if (resToday?.success) setTodayRecord(resToday.today ?? null);
      }
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [isAdmin]);

  const handleCheckIn = async () => {
    try {
      const res = await attendanceService.checkIn();
      if (res?.success) {
        setToast({ message: res.message ?? 'Checked in successfully!', type: 'success' });
        fetchAttendance();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Check-in failed.', type: 'error' });
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await attendanceService.checkOut();
      if (res?.success) {
        setToast({ message: res.message ?? 'Checked out successfully!', type: 'success' });
        fetchAttendance();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Check-out failed.', type: 'error' });
    }
  };

  const safeAttendance = attendance ?? [];
  const filteredAttendance = safeAttendance.filter(item => {
    const term = (searchTerm ?? '').toLowerCase();
    const empName = `${item?.first_name || ''} ${item?.last_name || ''}`.toLowerCase();
    const date = (item?.date || '').toLowerCase();
    const status = (item?.status || '').toLowerCase();
    return empName.includes(term) || date.includes(term) || status.includes(term);
  });

  if (loading) return <Loader message="Loading attendance records..." />;

  const isCheckedIn = !!todayRecord?.check_in;
  const isCheckedOut = !!todayRecord?.check_out;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Employee Clock Action Card */}
      {!isAdmin && (
        <div className="glass-card" style={{
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <Clock size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Today's Shift Clock</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {!isCheckedIn ? (
              <button onClick={handleCheckIn} className="btn btn-success" style={{ padding: '0.8rem 1.5rem', fontSize: '0.95rem' }}>
                <LogIn size={18} />
                <span>Clock In Now</span>
              </button>
            ) : !isCheckedOut ? (
              <button onClick={handleCheckOut} className="btn btn-danger" style={{ padding: '0.8rem 1.5rem', fontSize: '0.95rem' }}>
                <LogOut size={18} />
                <span>Clock Out Now</span>
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: 700, backgroundColor: 'var(--success-bg)', padding: '0.65rem 1.25rem', borderRadius: '12px' }}>
                <CheckCircle2 size={20} />
                <span>Checked Out for Today</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Records Table Card */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              {isAdmin ? 'System Attendance Directory' : 'My Attendance History'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {isAdmin ? 'View daily clock-in records of all organization employees' : 'Track your daily check-in, check-out times and shift statuses'}
            </p>
          </div>

          {/* Search Input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '0.4rem 0.85rem',
            width: '240px'
          }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by date/name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', color: 'var(--text-main)', width: '100%' }}
            />
          </div>
        </div>

        {filteredAttendance.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No attendance records found.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  {isAdmin && <th>Employee</th>}
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((record, idx) => {
                  let durationStr = '--';
                  if (record?.check_in && record?.check_out) {
                    const diffMs = new Date(record.check_out) - new Date(record.check_in);
                    const hours = Math.floor(diffMs / (1000 * 60 * 60));
                    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    durationStr = `${hours}h ${mins}m`;
                  }

                  return (
                    <tr key={record?.id ?? idx}>
                      {isAdmin && (
                        <td>
                          <div style={{ fontWeight: 600 }}>{record?.first_name ?? 'Employee'} {record?.last_name ?? ''}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{record?.department ?? ''}</div>
                        </td>
                      )}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                          <Calendar size={14} color="var(--primary)" />
                          <span>{record?.date}</span>
                        </div>
                      </td>
                      <td>{record?.check_in ? new Date(record.check_in).toLocaleTimeString() : '--:--'}</td>
                      <td>{record?.check_out ? new Date(record.check_out).toLocaleTimeString() : '--:--'}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{durationStr}</td>
                      <td><StatusBadge status={record?.status ?? 'Present'} /></td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{record?.notes || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
