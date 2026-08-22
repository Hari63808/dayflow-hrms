import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { leaveService } from '../services/leaveService';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { CalendarDays, Plus, Check, X, MessageSquare, AlertCircle } from 'lucide-react';

const LeavePage = () => {
  const { isAdmin } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Apply Leave Modal state (Employee)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    leaveType: 'Paid',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Review Modal state (Admin)
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [adminComment, setAdminComment] = useState('');

  const fetchLeaves = async () => {
    try {
      if (isAdmin) {
        const res = await leaveService.getAllLeaves();
        if (res.success) setLeaves(res.leaves);
      } else {
        const res = await leaveService.getMyLeaves();
        if (res.success) setLeaves(res.leaves);
      }
    } catch (err) {
      console.error('Failed to fetch leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [isAdmin]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await leaveService.applyLeave(applyForm);
      if (res.success) {
        setToast({ message: res.message, type: 'success' });
        setIsApplyModalOpen(false);
        setApplyForm({ leaveType: 'Paid', startDate: '', endDate: '', reason: '' });
        fetchLeaves();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to submit leave request.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewAction = async (status) => {
    if (!selectedLeave) return;
    try {
      const res = await leaveService.updateLeaveStatus(selectedLeave.id, {
        status,
        adminComment
      });
      if (res.success) {
        setToast({ message: res.message, type: 'success' });
        setReviewModalOpen(false);
        setSelectedLeave(null);
        setAdminComment('');
        fetchLeaves();
      }
    } catch (err) {
      setToast({ message: 'Failed to update leave status.', type: 'error' });
    }
  };

  if (loading) return <Loader message="Loading leave management queue..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="glass-card" style={{
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--warning)'
          }}>
            <CalendarDays size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Leave Management</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {isAdmin ? 'Review, approve, or reject employee leave applications' : 'Submit leave requests and track your leave status'}
            </p>
          </div>
        </div>

        {!isAdmin && (
          <button onClick={() => setIsApplyModalOpen(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Apply For Leave</span>
          </button>
        )}
      </div>

      {/* Leave Requests Table */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        {leaves.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No leave applications found.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  {isAdmin && <th>Employee</th>}
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Admin Comment</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave.id}>
                    {isAdmin && (
                      <td>
                        <div style={{ fontWeight: 600 }}>{leave.first_name} {leave.last_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{leave.department}</div>
                      </td>
                    )}
                    <td><span style={{ fontWeight: 600 }}>{leave.leave_type}</span></td>
                    <td>{leave.start_date}</td>
                    <td>{leave.end_date}</td>
                    <td style={{ maxWidth: '250px' }}>{leave.reason}</td>
                    <td><StatusBadge status={leave.status} /></td>
                    <td>
                      {leave.admin_comment ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                          <MessageSquare size={14} color="var(--primary)" />
                          <span>{leave.admin_comment}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td>
                        {leave.status === 'Pending' ? (
                          <button
                            onClick={() => {
                              setSelectedLeave(leave);
                              setAdminComment('');
                              setReviewModalOpen(true);
                            }}
                            className="btn btn-primary btn-sm"
                          >
                            Review Request
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Decided</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal (Employee) */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply For Leave"
      >
        <form onSubmit={handleApplySubmit}>
          <div className="form-group">
            <label className="form-label">Leave Type</label>
            <select
              className="form-select"
              value={applyForm.leaveType}
              onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
              required
            >
              <option value="Paid">Paid Leave</option>
              <option value="Sick">Sick Leave</option>
              <option value="Casual">Casual Leave</option>
              <option value="Unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={applyForm.startDate}
                onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-input"
                value={applyForm.endDate}
                onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Leave</label>
            <textarea
              className="form-textarea"
              placeholder="Describe your reason for taking leave..."
              value={applyForm.reason}
              onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Leave Modal (Admin) */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Review Leave Application"
      >
        {selectedLeave && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--bg-app)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700 }}>
                {selectedLeave.first_name} {selectedLeave.last_name} ({selectedLeave.department})
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Type: <b>{selectedLeave.leave_type}</b> • Duration: <b>{selectedLeave.start_date}</b> to <b>{selectedLeave.end_date}</b>
              </div>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
                "{selectedLeave.reason}"
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">HR / Admin Comment (Optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Add comments or instructions for the employee..."
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => handleReviewAction('Rejected')}
                className="btn btn-danger"
              >
                <X size={16} />
                <span>Reject Leave</span>
              </button>
              <button
                type="button"
                onClick={() => handleReviewAction('Approved')}
                className="btn btn-success"
              >
                <Check size={16} />
                <span>Approve Leave</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LeavePage;
