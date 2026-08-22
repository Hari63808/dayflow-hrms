import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { leaveService } from '../services/leaveService';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { 
  Users, 
  UserCheck, 
  CalendarDays, 
  CircleDollarSign, 
  ArrowUpRight, 
  Check, 
  X, 
  ShieldCheck 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchAdminStats = async () => {
    try {
      const res = await dashboardService.getAdminStats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const handleQuickApprove = async (leaveId) => {
    try {
      const res = await leaveService.updateLeaveStatus(leaveId, {
        status: 'Approved',
        adminComment: 'Approved via Admin Dashboard quick action.'
      });
      if (res.success) {
        setToast({ message: 'Leave request approved successfully!', type: 'success' });
        fetchAdminStats();
      }
    } catch (err) {
      setToast({ message: 'Failed to approve leave.', type: 'error' });
    }
  };

  const handleQuickReject = async (leaveId) => {
    try {
      const res = await leaveService.updateLeaveStatus(leaveId, {
        status: 'Rejected',
        adminComment: 'Rejected via Admin Dashboard quick action.'
      });
      if (res.success) {
        setToast({ message: 'Leave request rejected.', type: 'info' });
        fetchAdminStats();
      }
    } catch (err) {
      setToast({ message: 'Failed to reject leave.', type: 'error' });
    }
  };

  if (loading) return <Loader message="Loading Admin Command Center..." />;

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
        gap: '1rem'
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
              HR Admin Command Center
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Real-time organization metrics, attendance tracking & payroll management.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/employees" className="btn btn-primary" style={{ gap: '0.4rem' }}>
            <Users size={16} />
            <span>Manage Employees</span>
          </Link>
          <Link to="/leaves" className="btn btn-outline" style={{ gap: '0.4rem' }}>
            <CalendarDays size={16} />
            <span>Review Leaves</span>
          </Link>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <StatCard
          title="Total Workforce"
          value={stats?.totalEmployees || 0}
          subtext="Active employees"
          icon={Users}
          color="#6366f1"
          trend="+5%"
        />
        <StatCard
          title="Present Today"
          value={stats?.presentToday || 0}
          subtext={`${stats?.absentToday || 0} employees absent`}
          icon={UserCheck}
          color="#10b981"
        />
        <StatCard
          title="Pending Leave Review"
          value={stats?.pendingLeaves || 0}
          subtext="Requires HR action"
          icon={CalendarDays}
          color="#f59e0b"
        />
        <StatCard
          title="Monthly Payroll Outflow"
          value={`$${(stats?.totalPayrollAmount || 0).toLocaleString()}`}
          subtext={`${stats?.pendingPayrollCount || 0} slips pending payment`}
          icon={CircleDollarSign}
          color="#8b5cf6"
        />
      </div>

      {/* Recent Leave Requests Queue */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Pending Leave Applications</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quick approve or reject pending employee leave requests</p>
          </div>
          <Link to="/leaves" className="btn btn-outline btn-sm" style={{ gap: '0.35rem' }}>
            <span>View All Queue</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {(!stats?.recentLeaves || stats.recentLeaves.length === 0) ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            🎉 No pending leave requests to review!
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentLeaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{leave.first_name} {leave.last_name}</div>
                    </td>
                    <td>{leave.leave_type}</td>
                    <td>{leave.start_date} to {leave.end_date}</td>
                    <td style={{ maxWidth: '250px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {leave.reason}
                    </td>
                    <td><StatusBadge status={leave.status} /></td>
                    <td>
                      {leave.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleQuickApprove(leave.id)}
                            className="btn btn-success btn-sm"
                            title="Approve Leave"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => handleQuickReject(leave.id)}
                            className="btn btn-danger btn-sm"
                            title="Reject Leave"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
