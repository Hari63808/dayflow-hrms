import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reviewService } from '../services/reviewService';
import { employeeService } from '../services/employeeService';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { Award, Plus, Star, Target, MessageSquare } from 'lucide-react';

const PerformancePage = () => {
  const { isAdmin } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ employeeId: '', reviewPeriod: 'H1 2026', rating: '5', feedback: '', goals: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchReviewsData = async () => {
    try {
      const [resR, resE] = await Promise.all([
        reviewService.getReviews(),
        isAdmin ? employeeService.getAllEmployees() : Promise.resolve({ success: false })
      ]);
      if (resR?.success) setReviews(resR.reviews ?? []);
      if (resE?.success) setEmployees(resE.employees ?? []);
    } catch (err) {
      console.error('Failed to load performance reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsData();
  }, [isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await reviewService.addReview(form);
      if (res?.success) {
        setToast({ message: 'Performance appraisal recorded!', type: 'success' });
        setIsModalOpen(false);
        setForm({ employeeId: '', reviewPeriod: 'H1 2026', rating: '5', feedback: '', goals: '' });
        fetchReviewsData();
      }
    } catch (err) {
      setToast({ message: 'Failed to record performance review.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader message="Loading performance reviews & goals..." />;

  const safeReviews = reviews ?? [];
  const safeEmps = employees ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
            <Award size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Performance Reviews & Appraisals</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Periodic performance ratings, constructive feedback & career goal tracking</p>
          </div>
        </div>

        {isAdmin && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Record Appraisal</span>
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {safeReviews.map((r, idx) => (
          <div key={r?.id ?? idx} className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{r?.first_name ? `${r.first_name} ${r.last_name}` : 'Staff Member'}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>{r?.designation ?? ''} • {r?.department ?? ''}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'rgba(245, 158, 11, 0.15)', padding: '0.4rem 0.75rem', borderRadius: '20px', color: '#f59e0b', fontWeight: 800 }}>
                <Star size={16} fill="#f59e0b" />
                <span>{r?.rating ?? 5} / 5 Stars ({r?.review_period})</span>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-app)', padding: '1rem', borderRadius: '10px', fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Reviewer Feedback</div>
              "{r?.feedback}"
            </div>

            {r?.goals && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Target size={15} color="var(--primary)" /> <strong>Goals:</strong> {r.goals}
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Performance Appraisal">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Employee</label>
            <select className="form-select" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required>
              <option value="">Select Employee...</option>
              {safeEmps.map(e => (
                <option key={e?.id} value={e?.id}>{e?.first_name} {e?.last_name} ({e?.department})</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Review Period</label>
              <input type="text" className="form-input" placeholder="e.g. H1 2026 / Q2 2026" value={form.reviewPeriod} onChange={(e) => setForm({ ...form, reviewPeriod: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Rating (1 to 5 Stars)</label>
              <select className="form-select" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>
                <option value="5">5 - Outstanding</option>
                <option value="4">4 - Exceeds Expectations</option>
                <option value="3">3 - Meets Expectations</option>
                <option value="2">2 - Needs Improvement</option>
                <option value="1">1 - Unsatisfactory</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Detailed Feedback</label>
            <textarea className="form-textarea" placeholder="Key accomplishments & strengths..." value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Future Performance Goals</label>
            <textarea className="form-textarea" placeholder="Key goals for upcoming period..." value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Saving...' : 'Submit Appraisal'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PerformancePage;
