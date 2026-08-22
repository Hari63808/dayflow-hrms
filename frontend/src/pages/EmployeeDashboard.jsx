import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { attendanceService } from '../services/attendanceService';
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
  ArrowUpRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardService.getEmployeeStats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCheckIn = async () => {
    try {
      const res = await attendanceService.checkIn();
      if (res.success) {
        setToast({ message: res.message, type: 'success' });
        fetchDashboard();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Check-in failed.', type: 'error' });
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await attendanceService.checkOut();
      if (res.success) {
        setToast({ message: res.message, type: 'success' });
        fetchDashboard();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Check-out failed.', type: 'error' });
    }
  };

  if (loading) return <Loader message="Loading your Employee Portal..." />;

  const todayRecord = stats?.todayAttendance;
  const isCheckedIn = !!todayRecord?.check_in;
  const isCheckedOut = !!todayRecord?.check_out;

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
            src={user?.employee?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
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
              Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.employee?.first_name || 'Employee'}! 👋
            </h2>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {user?.employee?.designation || 'Team Member'} • {user?.employee?.department || 'Engineering'}
            </p>
          </div>
        </div>

        {/* Live Clock & Action Button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          backgroundColor: 'var(--bg-surface)',
          padding: '1rem 1.5rem',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--card-shadow)'
        }}>
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

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <StatCard
          title="Days Present This Month"
          value={stats?.presentDays || 0}
          subtext="Verified check-in logs"
          icon={UserCheck}
          color="#10b981"
          trend="+12%"
        />
        <StatCard
          title="Pending Leave Requests"
          value={stats?.pendingLeaves || 0}
          subtext="Awaiting HR approval"
          icon={CalendarDays}
          color="#f59e0b"
        />
        <StatCard
          title="Approved Leaves"
          value={stats?.approvedLeaves || 0}
          subtext="Granted time off"
          icon={CheckCircle2}
          color="#6366f1"
        />
        <StatCard
          title="Latest Net Salary"
          value={stats?.latestSalary ? `$${parseFloat(stats.latestSalary.net_salary).toLocaleString()}` : '$0.00'}
          subtext={`Month: ${stats?.latestSalary?.month || 'Current'}`}
          icon={CircleDollarSign}
          color="#8b5cf6"
        />
      </div>

      {/* Today Status & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }} className="dash-bottom-grid">
        {/* Status Card */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Today's Shift Status</h3>
            <StatusBadge status={todayRecord ? todayRecord.status : 'Not Clocked In'} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: 'var(--bg-app)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Check In Time</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {todayRecord?.check_in ? new Date(todayRecord.check_in).toLocaleTimeString() : '--:--'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Check Out Time</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {todayRecord?.check_out ? new Date(todayRecord.check_out).toLocaleTimeString() : '--:--'}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Quick Shortcuts</h3>
          <Link to="/leaves" className="btn btn-outline" style={{ justifyContent: 'space-between' }}>
            <span>Apply For Leave</span>
            <ArrowUpRight size={16} />
          </Link>
          <Link to="/payroll" className="btn btn-outline" style={{ justifyContent: 'space-between' }}>
            <span>View Salary Slip</span>
            <ArrowUpRight size={16} />
          </Link>
          <Link to="/profile" className="btn btn-outline" style={{ justifyContent: 'space-between' }}>
            <span>Update Profile</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
