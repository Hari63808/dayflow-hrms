import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { holidayService } from '../services/holidayService';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { Palmtree, Plus, Calendar, Tag } from 'lucide-react';

const HolidaysPage = () => {
  const { isAdmin } = useAuth();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', type: 'Public', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchHolidays = async () => {
    try {
      const res = await holidayService.getHolidays();
      if (res?.success) setHolidays(res.holidays ?? []);
    } catch (err) {
      console.error('Failed to fetch holidays:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await holidayService.addHoliday(form);
      if (res?.success) {
        setToast({ message: res.message ?? 'Holiday added!', type: 'success' });
        setIsModalOpen(false);
        setForm({ title: '', date: '', type: 'Public', description: '' });
        fetchHolidays();
      }
    } catch (err) {
      setToast({ message: 'Failed to add holiday.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader message="Loading official holiday calendar..." />;

  const safeHolidays = holidays ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
            <Palmtree size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Holiday Calendar 2026</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Official company holidays, public observances, and regional leaves</p>
          </div>
        </div>

        {isAdmin && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Add Holiday</span>
          </button>
        )}
      </div>

      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Holiday Title</th>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {safeHolidays.map((h, idx) => (
                <tr key={h?.id ?? idx}>
                  <td style={{ fontWeight: 700 }}>{h?.title}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                      <Calendar size={14} color="var(--primary)" />
                      <span>{h?.date}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${h?.type === 'Company' ? 'badge-warning' : 'badge-success'}`}>
                      {h?.type ?? 'Public'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{h?.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Holiday Event">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Holiday Title</label>
            <input type="text" className="form-input" placeholder="e.g. Independence Day" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="Public">Public Holiday</option>
                <option value="Company">Company Holiday</option>
                <option value="Regional">Regional Holiday</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="Optional details..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Saving...' : 'Add Holiday'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HolidaysPage;
