import React from 'react';
import { Outlet } from 'react-router-dom';
import { Building2, Sparkles, CheckCircle2 } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      backgroundColor: 'var(--bg-app)'
    }}>
      {/* Left Branding Panel */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #31104b 100%)',
        color: '#ffffff',
        padding: '4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }} className="auth-brand-panel">
        {/* Glow Spheres */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(40px)'
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', zIndex: 2 }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.5)'
          }}>
            <Building2 size={28} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Dayflow HRMS</h2>
            <span style={{ fontSize: '0.75rem', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Enterprise Workforce OS
            </span>
          </div>
        </div>

        {/* Value Proposition */}
        <div style={{ zIndex: 2, maxWidth: '500px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.85rem',
            borderRadius: '20px',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            color: '#c7d2fe',
            fontSize: '0.825rem',
            fontWeight: 600,
            marginBottom: '1.5rem'
          }}>
            <Sparkles size={16} /> Next-Generation HR Experience
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
            Empower your team with seamless HR workflows.
          </h1>
          <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '2rem' }}>
            Automate daily attendance check-ins, leave application workflows, payroll distribution, and workforce analytics with zero friction.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {['1-Click Attendance Clocking', 'Instant Leave Review & Approvals', 'Automated Payslip & Payroll Engine', 'Role-Based Security & Permissions'].map((feat, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.925rem', color: '#e2e8f0' }}>
                <CheckCircle2 size={18} color="#10b981" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ zIndex: 2, fontSize: '0.8rem', color: '#64748b' }}>
          © 2026 Dayflow HRMS. Built for Hackathon Excellence.
        </div>
      </div>

      {/* Right Form Panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{ width: '100%', maxWidth: '460px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
