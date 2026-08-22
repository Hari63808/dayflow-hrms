import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { documentService } from '../services/documentService';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { FolderLock, Plus, FileText, Download, ExternalLink } from 'lucide-react';

const DocumentsPage = () => {
  const { isAdmin } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Contract', fileUrl: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchDocs = async () => {
    try {
      const res = await documentService.getDocuments();
      if (res?.success) setDocuments(res.documents ?? []);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await documentService.uploadDocumentRecord(form);
      if (res?.success) {
        setToast({ message: 'Document added to vault!', type: 'success' });
        setIsModalOpen(false);
        setForm({ title: '', category: 'Contract', fileUrl: '' });
        fetchDocs();
      }
    } catch (err) {
      setToast({ message: 'Failed to upload document record.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader message="Loading document repository vault..." />;

  const safeDocs = documents ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <FolderLock size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Document Vault & Records</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Secure storage for offer letters, tax compliance forms & employment contracts</p>
          </div>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>Upload Document</span>
        </button>
      </div>

      <div className="glass-card" style={{ padding: '1.75rem' }}>
        {safeDocs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No document records found in vault.</div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Document Title</th>
                  <th>Category</th>
                  {isAdmin && <th>Employee</th>}
                  <th>Uploaded Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {safeDocs.map((d, idx) => (
                  <tr key={d?.id ?? idx}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={18} color="var(--primary)" />
                        <span style={{ fontWeight: 700 }}>{d?.title}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-info">{d?.category ?? 'Other'}</span></td>
                    {isAdmin && (
                      <td>{d?.first_name ? `${d.first_name} ${d.last_name}` : 'Staff Member'}</td>
                    )}
                    <td style={{ fontSize: '0.85rem' }}>{new Date(d?.uploaded_at ?? Date.now()).toLocaleDateString()}</td>
                    <td>
                      <a href={d?.file_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ gap: '0.35rem', textDecoration: 'none' }}>
                        <ExternalLink size={14} /> Open Document
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Document Record">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Document Title</label>
            <input type="text" className="form-input" placeholder="e.g. Tax Declaration Form 2026" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="Contract">Employment Contract</option>
              <option value="Tax">Tax Document</option>
              <option value="Identity">Identity Verification</option>
              <option value="Certificate">Certificate / Qualification</option>
              <option value="Other">Other Document</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Document URL / File Path</label>
            <input type="url" className="form-input" placeholder="https://example.com/document.pdf" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} required />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Storing...' : 'Save Document'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DocumentsPage;
