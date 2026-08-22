import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskService } from '../services/taskService';
import { employeeService } from '../services/employeeService';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import StatusBadge from '../components/StatusBadge';
import { CheckSquare, Plus, Calendar, User, Clock, AlertTriangle } from 'lucide-react';

const TasksPage = () => {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'Medium'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchTasksData = async () => {
    try {
      const [resT, resE] = await Promise.all([
        taskService.getTasks(),
        isAdmin ? employeeService.getAllEmployees() : Promise.resolve({ success: false })
      ]);
      if (resT?.success) setTasks(resT.tasks ?? []);
      if (resE?.success) {
        const emps = resE.employees ?? [];
        setEmployees(emps);
        if (emps.length > 0 && !form.assignedTo) {
          setForm(prev => ({ ...prev, assignedTo: emps[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksData();
  }, [isAdmin]);

  const handleOpenModal = () => {
    setForm({
      title: '',
      description: '',
      assignedTo: employees.length > 0 ? employees[0].id : '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'Medium'
    });
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await taskService.updateTaskStatus(id, status);
      if (res?.success) {
        setToast({ message: res.message ?? 'Task status updated!', type: 'success' });
        fetchTasksData();
      }
    } catch (err) {
      setToast({ message: 'Failed to update task status.', type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.assignedTo) {
      setToast({ message: 'Please select an employee to assign the task.', type: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await taskService.addTask(form);
      if (res?.success) {
        setToast({ message: 'Task assigned successfully!', type: 'success' });
        setIsModalOpen(false);
        setForm({
          title: '',
          description: '',
          assignedTo: employees.length > 0 ? employees[0].id : '',
          dueDate: new Date().toISOString().split('T')[0],
          priority: 'Medium'
        });
        fetchTasksData();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message ?? 'Failed to assign task.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader message="Loading workplace deliverables & tasks..." />;

  const safeTasks = tasks ?? [];
  const safeEmps = employees ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
            <CheckSquare size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Task & Self-Service Portal</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Workplace assignments, priority deliverables, and progress tracking</p>
          </div>
        </div>

        {isAdmin && (
          <button onClick={handleOpenModal} className="btn btn-primary">
            <Plus size={18} />
            <span>Assign New Task</span>
          </button>
        )}
      </div>

      <div className="glass-card" style={{ padding: '1.75rem' }}>
        {safeTasks.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No tasks assigned.</div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  {isAdmin && <th>Assigned To</th>}
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Action / Status Update</th>
                </tr>
              </thead>
              <tbody>
                {safeTasks.map((t, idx) => (
                  <tr key={t?.id ?? idx}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{t?.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t?.description || 'No description'}</div>
                    </td>
                    {isAdmin && (
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                          <User size={14} color="var(--primary)" />
                          <span>{t?.first_name ? `${t.first_name} ${t.last_name || ''}` : `Employee #${t?.assigned_to}`}</span>
                        </div>
                      </td>
                    )}
                    <td>
                      <span className={`badge ${t?.priority === 'High' ? 'badge-danger' : t?.priority === 'Low' ? 'badge-info' : 'badge-warning'}`}>
                        {t?.priority ?? 'Medium'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                        <Calendar size={14} color="var(--text-muted)" />
                        <span>{t?.due_date}</span>
                      </div>
                    </td>
                    <td><StatusBadge status={t?.status ?? 'Pending'} /></td>
                    <td>
                      <select
                        className="form-select"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', width: '140px' }}
                        value={t?.status ?? 'Pending'}
                        onChange={(e) => handleUpdateStatus(t.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Assigning New Task */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign New Workplace Task">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input type="text" className="form-input" placeholder="e.g. Prepare Q3 Audit Summary" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Assign To Employee</label>
            <select className="form-select" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} required>
              {safeEmps.map(e => (
                <option key={e?.id} value={e?.id}>{e?.first_name} {e?.last_name} ({e?.department})</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" className="form-input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="Detailed instructions..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Assigning...' : 'Assign Task'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TasksPage;
