import React, { useState, useEffect } from 'react';
import { SkillCategoryItem } from '../../types/admin.types';
import { AdminApi } from '../../services/api.service';

interface SkillsTabProps {
  onShowToast: (type: 'success' | 'error', text: string) => void;
  onRefreshStats: () => void;
}

export const SkillsTab: React.FC<SkillsTabProps> = ({
  onShowToast,
  onRefreshStats,
}) => {
  const [categories, setCategories] = useState<SkillCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setLoading(true);
      const data = await AdminApi.getSkills();
      setCategories(data);
    } catch (err: any) {
      onShowToast('error', `Failed to load skills: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItems = (id: string, text: string) => {
    const items = text.split(',').map((s) => s.trim()).filter(Boolean);
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, items } : cat))
    );
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      await AdminApi.updateSkills(categories);
      onShowToast('success', 'Skills matrix updated and synced to API!');
      onRefreshStats();
    } catch (err: any) {
      onShowToast('error', `Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Skills & Technical Competencies</h1>
          <p className="page-subtitle">
            Configure categorized skill matrices aligned with Senior / Staff Frontend & AI Engineer expectations.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSaveAll}
          disabled={saving}
        >
          {saving ? 'Saving...' : '💾 Save All Skills'}
        </button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading skills...</div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {categories.map((cat) => (
            <div key={cat.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{cat.categoryLabel}</h2>
                <span className="tag-badge" style={{ background: 'var(--accent-subtle)', color: '#60a5fa' }}>
                  {cat.items.length} skills
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Skill Items (comma separated)</label>
                <input
                  className="form-input"
                  value={cat.items.join(', ')}
                  onChange={(e) => handleUpdateItems(cat.id, e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                {cat.items.map((skill, i) => (
                  <span
                    key={i}
                    className="tag-badge"
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
