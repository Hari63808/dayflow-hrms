import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { announcementService } from '../services/announcementService';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { Megaphone, Plus, BellRing, User, Clock } from 'lucide-react';

const AnnouncementsPage = () => {
  const { isAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', priority: 'Normal', targetDepartment: 'All' });
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await announcementService.getAnnouncements();
      if (res?.success) setAnnouncements(res.announcements ?? []);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await announcementService.createAnnouncement(form);
      if (res?.success) {
        setToast({ message: 'Announcement broadcast published!', type: 'success' });
        setIsModalOpen(false);
        setForm({ title: '', content: '', priority: 'Normal', targetDepartment: 'All' });
        fetchAnnouncements();
      }
    } catch (err) {
      setToast({ message: 'Failed to publish announcement.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader message="Loading company announcements..." />;

  const safeAnnouncements = announcements ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
            <Megaphone size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Company Broadcasts & News</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Official organization notices, policy updates, and executive news</p>
          </div>
        </div>

        {isAdmin && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Post Announcement</span>
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {safeAnnouncements.map((a, idx) => (
          <div key={a?.id ?? idx} className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`badge ${a?.priority === 'High' || a?.priority === 'Urgent' ? 'badge-danger' : 'badge-info'}`}>
                  {a?.priority ?? 'Normal'} Priority
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Target: {a?.target_department ?? 'All'}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={13} /> {new Date(a?.created_at ?? Date.now()).toLocaleDateString()}
              </div>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{a?.title}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{a?.content}</p>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
              <User size={13} /> Posted by <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{a?.author_name ?? 'HR Admin'}</span>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Broadcast Announcement">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Announcement Title</label>
            <input type="text" className="form-input" placeholder="e.g. Q3 Townhall Schedule" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Target Audience</label>
              <input type="text" className="form-input" placeholder="All / Engineering / Sales" value={form.targetDepartment} onChange={(e) => setForm({ ...form, targetDepartment: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Message Content</label>
            <textarea className="form-textarea" style={{ minHeight: '120px' }} placeholder="Full broadcast message..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Publishing...' : 'Publish Announcement'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AnnouncementsPage;
