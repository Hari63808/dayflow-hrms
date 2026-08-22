import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationService } from '../services/notificationService';
import { 
  Sun, 
  Moon, 
  Bell, 
  Search, 
  ShieldCheck, 
  Check, 
  CheckCheck, 
  CalendarDays, 
  CheckSquare, 
  Award, 
  Megaphone, 
  CircleDollarSign, 
  User, 
  Info,
  Trash2
} from 'lucide-react';

const getNotificationDetails = (notif) => {
  const type = (notif.type || '').toLowerCase();
  if (type === 'leave') return { icon: CalendarDays, color: '#10b981', path: '/leaves' };
  if (type === 'task') return { icon: CheckSquare, color: '#8b5cf6', path: '/tasks' };
  if (type === 'appraisal') return { icon: Award, color: '#f59e0b', path: '/reviews' };
  if (type === 'announcement') return { icon: Megaphone, color: '#3b82f6', path: '/announcements' };
  if (type === 'payroll') return { icon: CircleDollarSign, color: '#06b6d4', path: '/payroll' };
  if (type === 'profile') return { icon: User, color: '#ec4899', path: '/profile' };
  return { icon: Info, color: '#6366f1', path: '/dashboard' };
};

const Navbar = ({ title = 'Dashboard' }) => {
  const { user, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPopover, setShowPopover] = useState(false);

  const fetchNotifs = async () => {
    try {
      const res = await notificationService.getMyNotifications();
      if (res?.success) {
        setNotifications(res.notifications ?? []);
        setUnreadCount(res.unreadCount ?? 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.is_read) {
        await notificationService.markAsRead(notif.id);
      }
      setShowPopover(false);
      fetchNotifs();
      const details = getNotificationDetails(notif);
      navigate(details.path);
    } catch (err) {
      console.error('Error handling notification click:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifs();
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      fetchNotifs();
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  return (
    <header style={{
      height: '70px',
      backgroundColor: 'var(--glass-bg)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 99
    }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
          {title}
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'var(--bg-app)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '0.4rem 0.85rem'
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search records..."
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '0.85rem',
              color: 'var(--text-main)',
              width: '180px'
            }}
          />
        </div>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowPopover(!showPopover)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}
            title="Notification Center"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: 'var(--danger)',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(244,63,94,0.6)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Popover Dropdown */}
          {showPopover && (
            <div className="glass-card" style={{
              position: 'absolute',
              top: '50px',
              right: 0,
              width: '360px',
              maxHeight: '440px',
              overflowY: 'auto',
              padding: '1rem',
              zIndex: 100,
              boxShadow: '0 15px 35px rgba(0,0,0,0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>Notification Center</span>
                  {unreadCount > 0 && (
                    <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--primary)', color: 'white', padding: '0.15rem 0.4rem', borderRadius: '10px', fontWeight: 700 }}>
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                  >
                    <CheckCheck size={14} />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Bell size={24} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.85rem' }}>No notifications in your feed.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {notifications.map((n) => {
                    const details = getNotificationDetails(n);
                    const IconComp = details.icon;
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '10px',
                          backgroundColor: n.is_read ? 'rgba(255, 255, 255, 0.02)' : 'rgba(99, 102, 241, 0.12)',
                          border: `1px solid ${n.is_read ? 'var(--border-color)' : 'rgba(99, 102, 241, 0.3)'}`,
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: `${details.color}20`,
                          color: details.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <IconComp size={16} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{n.title}</span>
                            {!n.is_read && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)', flexShrink: 0 }} />}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: '1.4' }}>{n.message}</div>
                        </div>

                        <button
                          onClick={(e) => handleDeleteNotification(e, n.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', opacity: 0.6, padding: '0.1rem' }}
                          title="Delete Notification"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Toggle Light / Dark Theme"
        >
          {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
        </button>

        {/* Admin Badge */}
        {isAdmin && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: 'rgba(139, 92, 246, 0.12)',
            color: '#8b5cf6',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            padding: '0.35rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            <ShieldCheck size={14} />
            <span>ADMIN MODE</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
