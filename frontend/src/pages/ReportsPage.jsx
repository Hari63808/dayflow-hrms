import React, { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { FileSpreadsheet, ShieldAlert, Download, Activity, DollarSign, CalendarCheck } from 'lucide-react';

const ReportsPage = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchReportsData = async () => {
    try {
      const res = await reportService.getHRReports();
      if (res?.success) setReports(res.reports);
    } catch (err) {
      console.error('Failed to load HR reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const handleExportCSV = (tableData, filename) => {
    if (!tableData || tableData.length === 0) return;
    const headers = Object.keys(tableData[0]).join(',');
    const rows = tableData.map(row => Object.values(row).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <Loader message="Generating HR analytics reports & audit logs..." />;

  const auditLogs = reports?.auditLogs ?? [];
  const payrollExp = reports?.payrollExpenditure ?? [];
  const attSummary = reports?.attendanceSummary ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <FileSpreadsheet size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>HR Analytics & System Audit Logs</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Corporate compliance reports, payroll expenditure trends & security access trail</p>
          </div>
        </div>

        <button onClick={() => handleExportCSV(auditLogs, 'HR_System_Audit_Logs')} className="btn btn-outline">
          <Download size={18} />
          <span>Export Audit Trail CSV</span>
        </button>
      </div>

      {/* Payroll Expenditure Summary Table */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={20} color="var(--success)" /> Monthly Payroll Expenditure Summary
          </h3>
          <button onClick={() => handleExportCSV(payrollExp, 'Payroll_Expenditure_Report')} className="btn btn-outline btn-sm">
            <Download size={14} /> Export CSV
          </button>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Pay Period Month</th>
                <th>Total Basic Salary</th>
                <th>Total Bonus Outflow</th>
                <th>Total Deductions</th>
                <th>Net Payroll Outflow</th>
              </tr>
            </thead>
            <tbody>
              {payrollExp.map((p, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700 }}>{p?.month ?? 'Current'}</td>
                  <td>${(parseFloat(p?.total_basic ?? 0)).toLocaleString()}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 600 }}>+${(parseFloat(p?.total_bonus ?? 0)).toLocaleString()}</td>
                  <td style={{ color: 'var(--danger)', fontWeight: 600 }}>-${(parseFloat(p?.total_deductions ?? 0)).toLocaleString()}</td>
                  <td><span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>${(parseFloat(p?.total_net ?? 0)).toLocaleString()}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Audit Logs */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={20} color="var(--primary)" /> Enterprise Security Audit Logs
        </h3>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User Account</th>
                <th>Action</th>
                <th>Details</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, idx) => (
                <tr key={log?.id ?? idx}>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(log?.created_at ?? Date.now()).toLocaleString()}</td>
                  <td style={{ fontWeight: 600 }}>{log?.user_email}</td>
                  <td><span className="badge badge-info">{log?.action}</span></td>
                  <td style={{ fontSize: '0.85rem' }}>{log?.details}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log?.ip_address ?? '127.0.0.1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
