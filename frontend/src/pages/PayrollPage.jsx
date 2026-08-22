import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { payrollService } from '../services/payrollService';
import { employeeService } from '../services/employeeService';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { CircleDollarSign, Plus, Edit2, Trash2 } from 'lucide-react';

const PayrollPage = () => {
  const { isAdmin } = useAuth();
  const [payrollList, setPayrollList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    employeeId: '',
    month: new Date().toISOString().substring(0, 7),
    basicSalary: '',
    bonus: '0',
    deductions: '0',
    status: 'Paid',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      if (isAdmin) {
        const [resPay, resEmp] = await Promise.all([
          payrollService.getAllPayroll(),
          employeeService.getAllEmployees()
        ]);
        if (resPay?.success) setPayrollList(resPay.payroll ?? []);
        if (resEmp?.success) setEmployees(resEmp.employees ?? []);
      } else {
        const resPay = await payrollService.getMyPayroll();
        if (resPay?.success) setPayrollList(resPay.payroll ?? []);
      }
    } catch (err) {
      console.error('Failed to load payroll data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAdmin]);

  const handleOpenAddModal = () => {
    setEditId(null);
    setForm({
      employeeId: employees.length > 0 ? employees[0].id : '',
      month: new Date().toISOString().substring(0, 7),
      basicSalary: '5000',
      bonus: '500',
      deductions: '200',
      status: 'Paid',
      paymentDate: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    if (!item) return;
    setEditId(item.id);
    setForm({
      employeeId: item.employee_id ?? '',
      month: item.month ?? new Date().toISOString().substring(0, 7),
      basicSalary: item.basic_salary ?? '0',
      bonus: item.bonus ?? '0',
      deductions: item.deductions ?? '0',
      status: item.status ?? 'Paid',
      paymentDate: item.payment_date ?? new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payroll entry?')) return;
    try {
      const res = await payrollService.deletePayroll(id);
      if (res?.success) {
        setToast({ message: res.message ?? 'Deleted entry.', type: 'success' });
        fetchData();
      }
    } catch (err) {
      setToast({ message: 'Failed to delete payroll entry.', type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const res = await payrollService.updatePayroll(editId, form);
        if (res?.success) setToast({ message: res.message ?? 'Updated payroll.', type: 'success' });
      } else {
        const res = await payrollService.addPayroll(form);
        if (res?.success) setToast({ message: res.message ?? 'Saved payroll.', type: 'success' });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setToast({ message: err.response?.data?.message ?? 'Failed to save payroll.', type: 'error' });
    }
  };

  if (loading) return <Loader message="Loading payroll & salary records..." />;

  const computedNet = (parseFloat(form.basicSalary) || 0) + (parseFloat(form.bonus) || 0) - (parseFloat(form.deductions) || 0);
  const safePayroll = payrollList ?? [];
  const safeEmployees = employees ?? [];

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
            backgroundColor: 'rgba(139, 92, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--secondary)'
          }}>
            <CircleDollarSign size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Payroll & Salary Management</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {isAdmin ? 'Manage workforce compensation, monthly salary slips & payout records' : 'View your monthly payslips, bonuses, and salary breakdown'}
            </p>
          </div>
        </div>

        {isAdmin && (
          <button onClick={handleOpenAddModal} className="btn btn-primary">
            <Plus size={18} />
            <span>Generate Salary Slip</span>
          </button>
        )}
      </div>

      {/* Payroll Table */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        {safePayroll.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No payroll records found.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  {isAdmin && <th>Employee</th>}
                  <th>Month</th>
                  <th>Basic Salary</th>
                  <th>Bonus</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Payment Date</th>
                  <th>Status</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {safePayroll.map((item, idx) => (
                  <tr key={item?.id ?? idx}>
                    {isAdmin && (
                      <td>
                        <div style={{ fontWeight: 600 }}>{item?.first_name ?? 'Employee'} {item?.last_name ?? ''}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item?.department ?? 'General'}</div>
                      </td>
                    )}
                    <td style={{ fontWeight: 600 }}>{item?.month ?? '—'}</td>
                    <td>${(parseFloat(item?.basic_salary ?? 0) || 0).toLocaleString()}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 600 }}>+${(parseFloat(item?.bonus ?? 0) || 0).toLocaleString()}</td>
                    <td style={{ color: 'var(--danger)', fontWeight: 600 }}>-${(parseFloat(item?.deductions ?? 0) || 0).toLocaleString()}</td>
                    <td>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>
                        ${(parseFloat(item?.net_salary ?? 0) || 0).toLocaleString()}
                      </span>
                    </td>
                    <td>{item?.payment_date ?? 'Pending'}</td>
                    <td><StatusBadge status={item?.status ?? 'Pending'} /></td>
                    {isAdmin && (
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="btn btn-outline btn-sm"
                            title="Edit Payroll"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="btn btn-danger btn-sm"
                            title="Delete Entry"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Payroll Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editId ? 'Edit Salary Slip' : 'Generate Payroll Record'}
      >
        <form onSubmit={handleSubmit}>
          {!editId && (
            <div className="form-group">
              <label className="form-label">Select Employee</label>
              <select
                className="form-select"
                value={form.employeeId}
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                required
              >
                {safeEmployees.map((e, idx) => (
                  <option key={e?.id ?? idx} value={e?.id ?? ''}>
                    {e?.first_name ?? 'Employee'} {e?.last_name ?? ''} ({e?.email ?? ''})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Pay Period Month</label>
            <input
              type="month"
              className="form-input"
              value={form.month}
              onChange={(e) => setForm({ ...form, month: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Basic ($)</label>
              <input
                type="number"
                className="form-input"
                value={form.basicSalary}
                onChange={(e) => setForm({ ...form, basicSalary: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bonus ($)</label>
              <input
                type="number"
                className="form-input"
                value={form.bonus}
                onChange={(e) => setForm({ ...form, bonus: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Deductions ($)</label>
              <input
                type="number"
                className="form-input"
                value={form.deductions}
                onChange={(e) => setForm({ ...form, deductions: e.target.value })}
              />
            </div>
          </div>

          {/* Auto Computed Net Salary Banner */}
          <div style={{
            backgroundColor: 'var(--primary-light)',
            border: '1px solid var(--primary)',
            padding: '0.85rem 1.25rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            margin: '1rem 0'
          }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Auto-Calculated Net Salary:</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
              ${computedNet.toLocaleString()}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Payout Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Date</label>
              <input
                type="date"
                className="form-input"
                value={form.paymentDate}
                onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
              />
            </div>
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
              {editId ? 'Update Salary Record' : 'Save Payroll Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PayrollPage;
