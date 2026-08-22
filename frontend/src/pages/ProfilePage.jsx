import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { employeeService } from '../services/employeeService';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { User, Mail, Phone, MapPin, Building, Briefcase, Camera, Save } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await employeeService.getProfile();
      if (res?.success && res?.employee) {
        setProfile(res.employee);
        setPhone(res.employee.phone ?? '');
        setAddress(res.employee.address ?? '');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await employeeService.updateProfile({ phone, address });
      if (res?.success) {
        setToast({ message: res.message ?? 'Profile updated successfully.', type: 'success' });
        setProfile(res.employee);
        updateUser({ employee: res.employee });
      }
    } catch (err) {
      setToast({ message: 'Failed to update profile details.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      const res = await employeeService.uploadAvatar(formData);
      if (res?.success) {
        setToast({ message: res.message ?? 'Avatar updated successfully.', type: 'success' });
        setProfile(res.employee);
        updateUser({ employee: res.employee });
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message ?? 'Avatar upload failed.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Loader message="Loading profile settings..." />;

  const safeProfile = profile ?? user?.employee ?? {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header Profile Hero Card */}
      <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Avatar Uploader Wrapper */}
        <div style={{ position: 'relative' }}>
          <img
            src={safeProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email ?? 'user'}`}
            alt="Profile Avatar"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '4px solid var(--primary)',
              boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)'
            }}
          />
          <label style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            backgroundColor: 'var(--primary)',
            color: 'white',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s ease'
          }} title="Upload new profile picture">
            <Camera size={18} />
            <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
          </label>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
              {safeProfile?.first_name ?? 'User'} {safeProfile?.last_name ?? ''}
            </h2>
            <span className="badge badge-info" style={{ textTransform: 'uppercase' }}>
              {user?.role ?? 'Employee'}
            </span>
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.2rem' }}>
            {safeProfile?.designation ?? 'Team Member'} • {safeProfile?.department ?? 'General'}
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Mail size={15} color="var(--primary)" /> {safeProfile?.email ?? user?.email ?? '—'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Building size={15} color="var(--secondary)" /> Member since {safeProfile?.joining_date ?? '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Edit Form Card */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          Personal Information Settings
        </h3>

        <form onSubmit={handleUpdateInfo}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">First Name (Read-only)</label>
              <input type="text" className="form-input" value={safeProfile?.first_name ?? ''} disabled readOnly style={{ opacity: 0.7 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name (Read-only)</label>
              <input type="text" className="form-input" value={safeProfile?.last_name ?? ''} disabled readOnly style={{ opacity: 0.7 }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Residential Address</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '1rem' }} />
              <textarea
                className="form-textarea"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="Enter street, city, state and zip code..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="submit" disabled={saving || uploading} className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
              <Save size={18} />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
