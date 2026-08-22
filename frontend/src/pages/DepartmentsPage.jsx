import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { departmentService } from '../services/departmentService';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { Building, Plus, Search, Users, Code, Info } from 'lucide-react';

const DepartmentsPage = () => {
  const { isAdmin } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchDepts = async () => {
    try {
      const res = await departmentService.getDepartments();
      if (res?.success) setDepartments(res.departments ?? []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await departmentService.addDepartment(form);
      if (res?.success) {
        setToast({ message: res.message ?? 'Department created!', type: 'success' });
        setIsModalOpen(false);
        setForm({ name: '', code: '', description: '' });
        fetchDepts();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message ?? 'Failed to create department.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = (departments ?? []).filter(d => {
    const term = (searchTerm ?? '').toLowerCase();
    return (d?.name ?? '').toLowerCase().includes(term) || (d?.code ?? '').toLowerCase().includes(term);
  });

  if (loading) return <Loader message="Loading department structures..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Building size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Department Directory</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Organization units, department leads, and structural codes</p>
          </div>
        </div>

        {isAdmin && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Add Department</span>
          </button>
        )}
      </div>

      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Active Departments ({filtered.length})</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.4rem 0.85rem', width: '240px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input type="text" placeholder="Search departments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', color: 'var(--text-main)', width: '100%' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {filtered.map(dept => (
            <div key={dept?.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="badge badge-info">{dept?.code}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{dept?.id}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{dept?.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1 }}>{dept?.description || 'No description provided.'}</p>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Department">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Department Name</label>
            <input type="text" className="form-input" placeholder="e.g. Quality Assurance" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Department Code</label>
            <input type="text" className="form-input" placeholder="e.g. QA" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="Department purpose and scope..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Creating...' : 'Save Department'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentsPage;
