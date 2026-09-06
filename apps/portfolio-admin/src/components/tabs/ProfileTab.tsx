import React, { useState, useEffect } from 'react';
import { ProfileData } from '../../types/admin.types';
import { AdminApi } from '../../services/api.service';

interface ProfileTabProps {
  onShowToast: (type: 'success' | 'error', text: string) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ onShowToast }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await AdminApi.getProfile();
      setProfile(data);
    } catch (err: any) {
      onShowToast('error', `Failed to load profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      setSaving(true);
      const updated = await AdminApi.updateProfile(profile);
      setProfile(updated);
      onShowToast('success', 'Profile updated successfully and synced to API!');
    } catch (err: any) {
      onShowToast('error', `Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading profile data...</div>;
  }

  if (!profile) {
    return <div>No profile data found.</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile & Basic Details</h1>
          <p className="page-subtitle">
            Configure your professional title, positioning, bio, and contact links.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '2rem', alignItems: 'start' }}>
        <form onSubmit={handleSave} className="card">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Handle / Alias</label>
              <input
                className="form-input"
                value={profile.alias}
                onChange={(e) => setProfile({ ...profile, alias: e.target.value })}
                placeholder="@techiewithbeard"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Professional Title</label>
              <input
                className="form-input"
                value={profile.title}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tagline</label>
              <input
                className="form-input"
                value={profile.tagline}
                onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location (Professional Headline)</label>
            <input
              className="form-input"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              placeholder="e.g. Bangalore, India"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Executive Bio / Summary</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: '120px' }}
              value={profile.summary}
              onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Primary Email</label>
              <input
                className="form-input"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                className="form-input"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">LinkedIn URL</label>
              <input
                className="form-input"
                value={profile.linkedin}
                onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">GitHub URL</label>
              <input
                className="form-input"
                value={profile.github}
                onChange={(e) => setProfile({ ...profile, github: e.target.value })}
              />
            </div>
          </div>

          <div className="card-header" style={{ marginTop: '1rem', marginBottom: '0.75rem' }}>
            <h3 className="card-title" style={{ fontSize: '0.95rem' }}>Career & Availability Status</h3>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status Label</label>
              <input
                className="form-input"
                value={profile.availability?.status || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    availability: {
                      ...(profile.availability || { target: '', note: '' }),
                      status: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Target Roles</label>
              <input
                className="form-input"
                value={profile.availability?.target || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    availability: {
                      ...(profile.availability || { status: '', note: '' }),
                      target: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}
          >
            {saving ? 'Saving...' : '💾 Save Profile Details'}
          </button>
        </form>

        {/* Live Preview Card */}
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
            Live Shell Preview
          </h2>
          <div className="card" style={{ background: '#090d16', borderColor: '#2563eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                }}
              >
                VT
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{profile.name}</h3>
                <span style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600 }}>{profile.alias}</span>
              </div>
            </div>

            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {profile.tagline}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.6 }}>
              {profile.summary}
            </p>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>📍 {profile.location}</p>
              <p style={{ color: 'var(--text-muted)' }}>✉️ {profile.email}</p>
              <p style={{ color: 'var(--text-muted)' }}>💼 {profile.linkedin}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
