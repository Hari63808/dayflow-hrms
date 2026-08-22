import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { attendanceService } from '../services/attendanceService';
import { notificationService } from '../services/notificationService';
import { announcementService } from '../services/announcementService';
import { getAvatarUrl } from '../utils/avatarUtils';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { 
  Clock, 
  CalendarDays, 
  CircleDollarSign, 
  UserCheck, 
  LogIn, 
  LogOut, 
  CheckCircle2, 
  ArrowUpRight, 
  RefreshCw, 
  Percent, 
  Award,
  Calendar,
  CheckSquare,
  Bell,
  Megaphone,
  User,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';

const getNotifColor = (type) => {
  const t = (type || '').toLowerCase();
  if (t === 'leave') return '#10b981';
  if (t === 'task') return '#8b5cf6';
  if (t === 'appraisal') return '#f59e0b';
  if (t === 'announcement') return '#3b82f6';
  if (t === 'payroll') return '#06b6d4';
  return '#6366f1';
};

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchEmployeeDashboard = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setError(null);
    try {
      const [resS, resN, resA] = await Promise.all([
        dashboardService.getEmployeeStats(),
        notificationService.getMyNotifications(),
        announcementService.getAnnouncements()
      ]);
      if (resS?.success) setStats(resS.stats ?? {});
      if (resN?.success) setNotifications(resN.notifications?.slice(0, 5) ?? []);
      if (resA?.success) setAnnouncements(resA.announcements?.slice(0, 3) ?? []);
      if (isManual) setToast({ message: 'Dashboard updated with latest company data.', type: 'success' });
    } catch (err) {
      console.error('Failed to load employee dashboard metrics:', err);
      setError(err.response?.data?.message ?? 'Server error loading metrics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEmployeeDashboard();
    const interval = setInterval(() => fetchEmployeeDashboard(), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckIn = async () => {
    try {
      const res = await attendanceService.checkIn();
      if (res?.success) {
        setToast({ message: res.message ?? 'Checked in successfully!', type: 'success' });
        fetchEmployeeDashboard();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message ?? 'Check-in failed.', type: 'error' });
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await attendanceService.checkOut();
      if (res?.success) {
        setToast({ message: res.message ?? 'Checked out successfully!', type: 'success' });
        fetchEmployeeDashboard();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message ?? 'Check-out failed.', type: 'error' });
    }
  };

  if (loading) return <Loader message="Loading your Employee Portal..." />;

  const todayRecord = stats?.todayAttendance ?? null;
  const isCheckedIn = !!todayRecord?.check_in;
  const isCheckedOut = !!todayRecord?.check_out;
  const salary = stats?.salarySummary ?? null;
  const recentAttendance = stats?.recentAttendance ?? [];
  const avatarSrc = getAvatarUrl(user?.employee?.avatar_url, user?.employee?.first_name || user?.email);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Hero Clock & Check-In Widget */}
      <div className="glass-card" style={{
        padding: '2.5rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
        border: '1px solid var(--primary-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <img
            src={avatarSrc}
            alt="Profile Avatar"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              objectFit: 'cover',
              border: '3px solid var(--primary)',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
            }}
          />
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.employee?.first_name ?? 'Employee'}! 👋
            </h2>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {user?.employee?.designation ?? 'Team Member'} • {user?.employee?.department ?? 'Engineering'}
            </p>
          </div>
        </div>

        {/* Live Clock & Action Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          backgroundColor: 'var(--bg-surface)',
          padding: '1rem 1.5rem',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--card-shadow)'
        }}>
          <button
            onClick={() => fetchEmployeeDashboard(true)}
            disabled={refreshing}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            title="Refresh Data"
          >
            <RefreshCw size={18} className={refreshing ? 'spin-icon' : ''} />
          </button>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--primary)' }}>
              {currentTime.toLocaleTimeString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          <div>
            {!isCheckedIn ? (
              <button onClick={handleCheckIn} className="btn btn-success" style={{ gap: '0.5rem' }}>
                <LogIn size={18} />
                <span>Check In Now</span>
              </button>
            ) : !isCheckedOut ? (
              <button onClick={handleCheckOut} className="btn btn-danger" style={{ gap: '0.5rem' }}>
                <LogOut size={18} />
                <span>Check Out Now</span>
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontWeight: 700, fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} />
                <span>Shift Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Company Announcements & Broadcasts Banner */}
      {announcements.length > 0 && (
        <div className="glass-card" style={{
          padding: '1.5rem 1.75rem',
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                <Megaphone size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Latest Company Announcements</h3>
                <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Official notices from HR & Leadership</span>
              </div>
            </div>
            <Link to="/announcements" className="btn btn-outline btn-sm" style={{ gap: '0.35rem' }}>
              <span>View All ({announcements.length})</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {announcements.map((a) => (
              <div key={a.id} style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className={`badge ${a?.priority === 'High' || a?.priority === 'Urgent' ? 'badge-danger' : 'badge-info'}`} style={{ fontSize: '0.65rem' }}>
                    {a.priority || 'Normal'}
                  </span>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                    {new Date(a.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>{a.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {a.content?.length > 90 ? a.content.substring(0, 90) + '...' : a.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Key Performance Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          title="Present Days"
          value={stats?.presentDays ?? 0}
          subtext="Verified shift check-ins"
          icon={UserCheck}
          color="#10b981"
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats?.attendancePercentage ?? 100}%`}
          subtext="Workdays elapsed"
          icon={Percent}
          color="#6366f1"
        />
        <StatCard
          title="Leave Balance"
          value={`${stats?.leaveBalance ?? 0} Days`}
          subtext={`Out of ${stats?.annualAllowance ?? 24} annual quota`}
          icon={Award}
          color="#8b5cf6"
        />
        <StatCard
          title="Assigned Tasks"
          value={stats?.assignedTasks ?? 0}
          subtext={`${stats?.pendingTasks ?? 0} pending • ${stats?.completedTasks ?? 0} done`}
          icon={CheckSquare}
          color="#3b82f6"
        />
        <StatCard
          title="Pending Requests"
          value={stats?.pendingLeaves ?? 0}
          subtext="Under HR review"
          icon={CalendarDays}
          color="#f59e0b"
        />
        <StatCard
          title="Latest Net Salary"
          value={salary ? `$${(parseFloat(salary?.net_salary ?? 0) || 0).toLocaleString()}` : '$0.00'}
          subtext={`Month: ${salary?.month ?? 'Current'}`}
          icon={CircleDollarSign}
          color="#06b6d4"
        />
      </div>

      {/* Middle Section: Shift Status & Real-time Notifications Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="dash-mid-grid">
        {/* Today Shift Detail */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Today's Shift Status</h3>
            <StatusBadge status={todayRecord?.status ?? 'Not Clocked In'} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: 'var(--bg-app)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Check In Timestamp</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {todayRecord?.check_in ? new Date(todayRecord.check_in).toLocaleTimeString() : '--:--'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Check Out Timestamp</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {todayRecord?.check_out ? new Date(todayRecord.check_out).toLocaleTimeString() : '--:--'}
              </div>
            </div>
          </div>
        </div>

        {/* Latest 5 Notifications Feed Widget */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recent Notifications</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Latest updates</span>
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No recent notifications in your feed.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {notifications.map(n => (
                <div key={n.id} style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-app)',
                  border: `1px solid ${getNotifColor(n.type)}30`,
                  borderLeft: `4px solid ${getNotifColor(n.type)}`
                }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>{n.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{n.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Attendance History Table */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recent Shift Attendance History</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your verified daily clock logs</p>
          </div>
          <Link to="/attendance" className="btn btn-outline btn-sm" style={{ gap: '0.35rem' }}>
            <span>Full History</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {recentAttendance.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No recent attendance logs recorded.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.map((rec, idx) => (
                  <tr key={rec?.id ?? idx}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                        <Calendar size={14} color="var(--primary)" />
                        <span>{rec?.date ?? 'Today'}</span>
                      </div>
                    </td>
                    <td>{rec?.check_in ? new Date(rec.check_in).toLocaleTimeString() : '--:--'}</td>
                    <td>{rec?.check_out ? new Date(rec.check_out).toLocaleTimeString() : '--:--'}</td>
                    <td><StatusBadge status={rec?.status ?? 'Present'} /></td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{rec?.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .spin-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EmployeeDashboard;
