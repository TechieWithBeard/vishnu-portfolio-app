import React, { useState, useEffect } from 'react';
import { ExperienceItem } from '../../types/admin.types';
import { AdminApi } from '../../services/api.service';
import { Modal } from '../ui/Modal';

interface ExperienceTabProps {
  onShowToast: (type: 'success' | 'error', text: string) => void;
  onRefreshStats: () => void;
}

export const ExperienceTab: React.FC<ExperienceTabProps> = ({
  onShowToast,
  onRefreshStats,
}) => {
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExperienceItem | null>(null);

  // Form State
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [period, setPeriod] = useState('');
  const [location, setLocation] = useState('');
  const [highlightsText, setHighlightsText] = useState('');
  const [techText, setTechText] = useState('');
  const [orderIndex, setOrderIndex] = useState(1);

  useEffect(() => {
    loadExperience();
  }, []);

  const loadExperience = async () => {
    try {
      setLoading(true);
      const data = await AdminApi.getExperience();
      setItems(data);
    } catch (err: any) {
      onShowToast('error', `Failed to load experience: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setRole('');
    setCompany('');
    setPeriod('');
    setLocation('Industrial SaaS (Global)');
    setHighlightsText('');
    setTechText('Angular, TypeScript, Nx');
    setOrderIndex(items.length + 1);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: ExperienceItem) => {
    setEditingItem(item);
    setRole(item.role);
    setCompany(item.company);
    setPeriod(item.period);
    setLocation(item.location || '');
    setHighlightsText(item.highlights.join('\n'));
    setTechText(item.tech.join(', '));
    setOrderIndex(item.orderIndex);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const highlights = highlightsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const tech = techText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (editingItem) {
        await AdminApi.updateExperience(editingItem.id, {
          role,
          company,
          period,
          location,
          highlights,
          tech,
          orderIndex,
        });
        onShowToast('success', 'Experience updated successfully');
      } else {
        await AdminApi.createExperience({
          role,
          company,
          period,
          location,
          highlights,
          tech,
          orderIndex,
        });
        onShowToast('success', 'New experience entry added');
      }
      setModalOpen(false);
      loadExperience();
      onRefreshStats();
    } catch (err: any) {
      onShowToast('error', `Operation failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this experience entry?')) return;
    try {
      await AdminApi.deleteExperience(id);
      onShowToast('success', 'Experience entry removed');
      loadExperience();
      onRefreshStats();
    } catch (err: any) {
      onShowToast('error', `Delete failed: ${err.message}`);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Experience Timeline</h1>
          <p className="page-subtitle">
            Manage your career history, enterprise achievements at AVEVA / Maistering, and tech stack impact.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <span>➕</span> Add Experience
        </button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading timeline...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {items.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                    <span className="tag-badge" style={{ background: 'var(--accent-subtle)', color: '#60a5fa', borderColor: 'var(--accent-border)' }}>
                      {item.period}
                    </span>
                    {item.location && (
                      <span className="tag-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                        🇪🇺 {item.location}
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{item.role}</h2>
                  <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>{item.company}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(item)}>
                    ✏️ Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>

              <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {item.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                {item.tech.map((t, i) => (
                  <span key={i} className="tag-badge">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Experience' : 'Add Experience Entry'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Job Role / Title</label>
              <input
                className="form-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Senior Frontend Engineer"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Company & Client Context</label>
              <input
                className="form-input"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Parnasoft Technologies — Client: AVEVA"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Period</label>
              <input
                className="form-input"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="March 2025 – Present"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Location / Context</label>
              <input
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Industrial SaaS (Global)"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Key Highlights & Quantified Achievements (1 per line)</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: '130px' }}
              value={highlightsText}
              onChange={(e) => setHighlightsText(e.target.value)}
              placeholder="Optimized Nx monorepo supporting 5+ apps, reducing CI build times by 30%..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Technologies Used (comma separated)</label>
            <input
              className="form-input"
              value={techText}
              onChange={(e) => setTechText(e.target.value)}
              placeholder="Angular 22, Nx, TypeScript, Playwright, Cypress"
            />
          </div>

          <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem -1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              💾 Save Experience
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
