import React, { useState, useEffect } from 'react';
import { employeeService } from '../services/employeeService';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { Users, UserPlus, Edit2, Trash2, Search, Mail, Phone, MapPin, Briefcase, Calendar } from 'lucide-react';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'employee',
    phone: '',
    address: '',
    department: 'Engineering',
    designation: 'Software Developer',
    joiningDate: new Date().toISOString().split('T')[0]
  });

  const fetchEmployees = async () => {
    try {
      const res = await employeeService.getAllEmployees();
      if (res.success) {
        setEmployees(res.employees);
      }
    } catch (err) {
      console.error('Failed to load employee directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenAddModal = () => {
    setEditId(null);
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      password: 'user123',
      role: 'employee',
      phone: '',
      address: '',
      department: 'Engineering',
      designation: 'Software Developer',
      joiningDate: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setEditId(emp.id);
    setForm({
      firstName: emp.first_name,
      lastName: emp.last_name,
      email: emp.email,
      password: '', // Leave blank unless changing
      role: emp.role || 'employee',
      phone: emp.phone || '',
      address: emp.address || '',
      department: emp.department || '',
      designation: emp.designation || '',
      joiningDate: emp.joining_date || new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee? This will remove their user account!')) return;
    try {
      const res = await employeeService.deleteEmployee(id);
      if (res.success) {
        setToast({ message: res.message, type: 'success' });
        fetchEmployees();
      }
    } catch (err) {
      setToast({ message: 'Failed to delete employee.', type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const res = await employeeService.updateEmployee(editId, form);
        if (res.success) setToast({ message: res.message, type: 'success' });
      } else {
        const res = await employeeService.addEmployee(form);
        if (res.success) setToast({ message: res.message, type: 'success' });
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to save employee.', type: 'error' });
    }
  };

  const filteredEmployees = employees.filter(e => {
    const term = searchTerm.toLowerCase();
    const fullName = `${e.first_name} ${e.last_name}`.toLowerCase();
    const email = (e.email || '').toLowerCase();
    const dept = (e.department || '').toLowerCase();
    const desig = (e.designation || '').toLowerCase();
    return fullName.includes(term) || email.includes(term) || dept.includes(term) || desig.includes(term);
  });

  if (loading) return <Loader message="Loading employee directory..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header Banner */}
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
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <Users size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Employee Directory</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Manage workforce profiles, departments, designations & account access
            </p>
          </div>
        </div>

        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <UserPlus size={18} />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* Employee Directory Card */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            Total Registered Staff ({filteredEmployees.length})
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '0.4rem 0.85rem',
            width: '260px'
          }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by name, email, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', color: 'var(--text-main)', width: '100%' }}
            />
          </div>
        </div>

        {filteredEmployees.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No matching employees found.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Contact Info</th>
                  <th>Department & Role</th>
                  <th>Joining Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={emp.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.email}`}
                          alt="Avatar"
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                            {emp.first_name} {emp.last_name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{emp.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Mail size={13} color="var(--text-muted)" /> {emp.email}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}><Phone size={13} /> {emp.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{emp.designation}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{emp.department}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{emp.joining_date}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleOpenEditModal(emp)}
                          className="btn btn-outline btn-sm"
                          title="Edit Employee"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="btn btn-danger btn-sm"
                          title="Delete Employee"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editId ? 'Edit Employee Profile' : 'Add New Employee'}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-input"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-input"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          {!editId && (
            <>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Temporary Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                className="form-input"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Designation</label>
              <input
                type="text"
                className="form-input"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Joining Date</label>
              <input
                type="date"
                className="form-input"
                value={form.joiningDate}
                onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              className="form-textarea"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editId ? 'Update Record' : 'Create Employee'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeesPage;
