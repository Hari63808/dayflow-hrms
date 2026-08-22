import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { correctionService } from '../services/correctionService';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { FileCheck, Plus, Check, X, Clock } from 'lucide-react';

const CorrectionsPage = () => {
  const { isAdmin } = useAuth();
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], requestedCheckIn: '', requestedCheckOut: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCorrections = async () => {
    try {
      const res = await correctionService.getCorrections();
      if (res?.success) setCorrections(res.corrections ?? []);
    } catch (err) {
      console.error('Failed to load corrections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCorrections();
  }, []);

  const handleReview = async (id, status) => {
    const adminComment = window.prompt(`Enter review notes for setting status to ${status}:`) || '';
    try {
      const res = await correctionService.reviewCorrection(id, { status, adminComment });
      if (res?.success) {
        setToast({ message: `Request ${status.toLowerCase()}!`, type: 'success' });
        fetchCorrections();
      }
    } catch (err) {
      setToast({ message: 'Failed to review request.', type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const checkInFull = `${form.date} ${form.requestedCheckIn}:00`;
      const checkOutFull = `${form.date} ${form.requestedCheckOut}:00`;
      const res = await correctionService.requestCorrection({
        date: form.date,
        requestedCheckIn: checkInFull,
        requestedCheckOut: checkOutFull,
        reason: form.reason
      });
      if (res?.success) {
        setToast({ message: 'Correction request submitted!', type: 'success' });
        setIsModalOpen(false);
        setForm({ date: new Date().toISOString().split('T')[0], requestedCheckIn: '', requestedCheckOut: '', reason: '' });
        fetchCorrections();
      }
    } catch (err) {
      setToast({ message: 'Failed to submit correction request.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader message="Loading attendance correction requests..." />;

  const safeCorrections = corrections ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <FileCheck size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Attendance Correction Requests</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Request shift clock corrections for missed check-ins or system glitches</p>
          </div>
        </div>

        {!isAdmin && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Request Shift Fix</span>
          </button>
        )}
      </div>

      <div className="glass-card" style={{ padding: '1.75rem' }}>
        {safeCorrections.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No correction requests logged.</div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  {isAdmin && <th>Employee</th>}
                  <th>Shift Date</th>
                  <th>Requested In/Out</th>
                  <th>Reason</th>
                  <th>Status</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {safeCorrections.map((c, idx) => (
                  <tr key={c?.id ?? idx}>
                    {isAdmin && (
                      <td>
                        <div style={{ fontWeight: 700 }}>{c?.first_name ? `${c.first_name} ${c.last_name}` : 'Employee'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{c?.department ?? ''}</div>
                      </td>
                    )}
                    <td style={{ fontWeight: 600 }}>{c?.date}</td>
                    <td style={{ fontSize: '0.85rem' }}>
                      <div>In: {c?.requested_check_in ?? '—'}</div>
                      <div>Out: {c?.requested_check_out ?? '—'}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c?.reason}</td>
                    <td><StatusBadge status={c?.status ?? 'Pending'} /></td>
                    {isAdmin && (
                      <td>
                        {c?.status === 'Pending' ? (
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button onClick={() => handleReview(c.id, 'Approved')} className="btn btn-success btn-sm"><Check size={14} /> Approve</button>
                            <button onClick={() => handleReview(c.id, 'Rejected')} className="btn btn-danger btn-sm"><X size={14} /> Reject</button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reviewed</span>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit Attendance Correction">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Shift Date</label>
            <input type="date" className="form-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Requested Clock In Time</label>
              <input type="time" className="form-input" value={form.requestedCheckIn} onChange={(e) => setForm({ ...form, requestedCheckIn: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Requested Clock Out Time</label>
              <input type="time" className="form-input" value={form.requestedCheckOut} onChange={(e) => setForm({ ...form, requestedCheckOut: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Reason for Correction</label>
            <textarea className="form-textarea" placeholder="Explain why clock-in/out was missed..." value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Submitting...' : 'Submit Request'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CorrectionsPage;
