import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Clock, 
  CalendarDays, 
  CircleDollarSign, 
  Users, 
  UserCircle, 
  LogOut, 
  Building2 
} from 'lucide-react';

const Sidebar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      title: 'Dashboard',
      path: isAdmin ? '/admin-dashboard' : '/dashboard',
      icon: LayoutDashboard
    },
    {
      title: 'Attendance',
      path: '/attendance',
      icon: Clock
    },
    {
      title: 'Leave Requests',
      path: '/leaves',
      icon: CalendarDays
    },
    {
      title: 'Payroll & Salary',
      path: '/payroll',
      icon: CircleDollarSign
    },
    ...(isAdmin
      ? [
          {
            title: 'Employee Directory',
            path: '/employees',
            icon: Users
          }
        ]
      : []),
    {
      title: 'My Profile',
      path: '/profile',
      icon: UserCircle
    }
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-sidebar)',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      padding: '1.5rem 1rem',
      boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
      zIndex: 10
    }}>
      {/* Brand Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0 0.5rem 1.5rem 0.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
        }}>
          <Building2 size={24} color="#ffffff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #c7d2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Dayflow
          </h2>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', fontWeight: 600 }}>
            HRMS Cloud
          </span>
        </div>
      </div>

      {/* Role Indicator Banner */}
      <div style={{
        margin: '1.25rem 0.25rem',
        padding: '0.6rem 0.85rem',
        borderRadius: '10px',
        backgroundColor: isAdmin ? 'rgba(139, 92, 246, 0.15)' : 'rgba(99, 102, 241, 0.15)',
        border: `1px solid ${isAdmin ? 'rgba(139, 92, 246, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 500 }}>Active Role:</span>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: isAdmin ? '#c084fc' : '#818cf8',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {user?.role || 'Employee'}
        </span>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? '#ffffff' : '#94a3b8',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                boxShadow: isActive ? '0 4px 14px rgba(99, 102, 241, 0.4)' : 'none',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              })}
            >
              <Icon size={20} />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout Footer */}
      <div style={{
        paddingTop: '1rem',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.25rem 0.5rem' }}>
          <img
            src={user?.employee?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'user'}`}
            alt="Avatar"
            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
          />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              {user?.employee?.first_name ? `${user.employee.first_name} ${user.employee.last_name}` : user?.email}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#94a3b8', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              {user?.employee?.designation || user?.role}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            padding: '0.65rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fda4af',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
