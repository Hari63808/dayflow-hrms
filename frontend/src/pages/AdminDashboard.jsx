import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { 
  Users, 
  UserCheck, 
  UserX,
  CalendarDays, 
  CheckCircle2, 
  CircleDollarSign, 
  RefreshCw, 
  Activity, 
  BarChart3, 
  PieChart as PieIcon,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  Building,
  CheckSquare,
  Clock3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [toast, setToast] = useState(null);

  const fetchAdminStats = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setError(null);
    try {
      const res = await dashboardService.getAdminStats();
      if (res?.success) {
        setStats(res.stats ?? {});
        setLastUpdated(new Date());
        if (isManual) {
          setToast({ message: 'Dashboard updated with real-time data.', type: 'success' });
        }
      } else {
        setError('Failed to fetch metric data from server.');
      }
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
      setError(err.response?.data?.message ?? 'Server connection error. Failed to load metrics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();

    // 60-Second Auto-Refresh Polling Timer
    const interval = setInterval(() => {
      fetchAdminStats();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loader message="Connecting to Dayflow database & generating analytics..." />;

  const recentActivities = stats?.recentActivities ?? [];
  const attendanceAnalytics = stats?.attendanceAnalytics ?? [];
  const leaveAnalytics = stats?.leaveAnalytics ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header Banner */}
      <div className="glass-card" style={{
        padding: '2rem 2.5rem',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            backgroundColor: '#8b5cf6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(139, 92, 246, 0.4)'
          }}>
            <ShieldCheck size={30} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
              HR Executive Command Center
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Live auto-syncing metrics • Auto refreshes every 60 seconds (Last updated: {lastUpdated.toLocaleTimeString()})
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => fetchAdminStats(true)}
            disabled={refreshing}
            className="btn btn-outline"
            style={{ gap: '0.4rem' }}
            title="Manual Sync"
          >
            <RefreshCw size={16} className={refreshing ? 'spin-icon' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Refresh Data'}</span>
          </button>

          <Link to="/employees" className="btn btn-primary" style={{ gap: '0.4rem' }}>
            <Users size={16} />
            <span>Manage Workforce</span>
          </Link>
        </div>
      </div>

      {/* Error Retry Banner */}
      {error && (
        <div style={{
          backgroundColor: 'var(--danger-bg)',
          color: 'var(--danger)',
          border: '1px solid var(--danger)',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>⚠️ {error}</span>
          <button onClick={() => fetchAdminStats(true)} className="btn btn-danger btn-sm">
            Retry Connection
          </button>
        </div>
      )}

      {/* Dynamic Key Metrics Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          title="Total Employees"
          value={stats?.totalEmployees ?? 0}
          subtext="Active staff profiles"
          icon={Users}
          color="#6366f1"
        />
        <StatCard
          title="Departments"
          value={stats?.totalDepartments ?? 0}
          subtext="Active org units"
          icon={Building}
          color="#8b5cf6"
        />
        <StatCard
          title="Present Today"
          value={stats?.presentToday ?? 0}
          subtext="Verified shift clock-ins"
          icon={UserCheck}
          color="#10b981"
        />
        <StatCard
          title="Absent Today"
          value={stats?.absentToday ?? 0}
          subtext="Unaccounted or absent"
          icon={UserX}
          color="#f43f5e"
        />
        <StatCard
          title="Pending Leaves"
          value={stats?.pendingLeaves ?? 0}
          subtext="Queue awaiting review"
          icon={CalendarDays}
          color="#f59e0b"
        />
        <StatCard
          title="Approved Leaves"
          value={stats?.approvedLeaves ?? 0}
          subtext="Granted leave days"
          icon={CheckCircle2}
          color="#06b6d4"
        />
        <StatCard
          title="Total Workplace Tasks"
          value={stats?.totalTasks ?? 0}
          subtext={`${stats?.pendingTasks ?? 0} pending • ${stats?.completedTasks ?? 0} done`}
          icon={CheckSquare}
          color="#3b82f6"
        />
        <StatCard
          title="Monthly Payroll"
          value={`$${(parseFloat(stats?.monthlyPayrollTotal ?? 0) || 0).toLocaleString()}`}
          subtext="Total net compensation"
          icon={CircleDollarSign}
          color="#10b981"
        />
      </div>

      {/* Analytics Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }} className="dash-charts-grid">
        {/* Attendance 7-Day Trend Chart */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Attendance Trend Analytics (7 Days)</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Daily Present vs Absent</span>
          </div>

          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', borderRadius: '10px' }}
                />
                <Legend />
                <Area type="monotone" dataKey="present" name="Present Staff" stroke="#10b981" fillOpacity={1} fill="url(#colorPresent)" strokeWidth={2} />
                <Area type="monotone" dataKey="absent" name="Absent Staff" stroke="#f43f5e" fillOpacity={1} fill="url(#colorAbsent)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leave Type Breakdown Pie Chart */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <PieIcon size={20} color="var(--secondary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Leave Category Breakdown</h3>
          </div>

          <div style={{ width: '100%', height: '220px', flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leaveAnalytics}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {leaveAnalytics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', borderRadius: '10px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Workforce Activity Stream */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Real-Time Workforce Activity Feed</h3>
          </div>
          <Link to="/attendance" className="btn btn-outline btn-sm" style={{ gap: '0.35rem' }}>
            <span>Full Attendance Audit</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {recentActivities.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No recent activity records logged.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentActivities.map((act, index) => {
              const name = `${act?.first_name ?? 'Employee'} ${act?.last_name ?? ''}`;
              const isLeave = act?.activity_type === 'leave';

              return (
                <div
                  key={act?.id ?? index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1.25rem',
                    backgroundColor: 'var(--bg-app)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: isLeave ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isLeave ? '#f59e0b' : '#10b981'
                    }}>
                      {isLeave ? <CalendarDays size={20} /> : <Clock size={20} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {isLeave ? `Applied for ${act?.detail ?? 'Leave'}` : `Clocked shift (${act?.detail || 'In/Out'})`}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <StatusBadge status={act?.status ?? 'Pending'} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {act?.created_at ? new Date(act.created_at).toLocaleTimeString() : 'Just now'}
                    </span>
                  </div>
                </div>
              );
            })}
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

export default AdminDashboard;
