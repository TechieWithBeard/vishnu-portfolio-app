import React, { useState, useEffect } from 'react';
import { ProjectItem } from '../../types/admin.types';
import { AdminApi } from '../../services/api.service';
import { Modal } from '../ui/Modal';

interface ProjectsTabProps {
  onShowToast: (type: 'success' | 'error', text: string) => void;
  onRefreshStats: () => void;
}

export const ProjectsTab: React.FC<ProjectsTabProps> = ({
  onShowToast,
  onRefreshStats,
}) => {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [role, setRole] = useState('Senior Frontend Engineer');
  const [category, setCategory] = useState('Architecture');
  const [techText, setTechText] = useState('');
  const [highlightsText, setHighlightsText] = useState('');
  const [github, setGithub] = useState('');
  const [liveDemo, setLiveDemo] = useState('');
  const [demoType, setDemoType] = useState<'native-federation' | 'module-federation' | 'iframe'>('native-federation');
  const [featured, setFeatured] = useState(true);
  const [orderIndex, setOrderIndex] = useState(1);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await AdminApi.getProjects();
      setItems(data);
    } catch (err: any) {
      onShowToast('error', `Failed to load projects: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setRole('Senior Frontend Engineer');
    setCategory('AI Interfaces');
    setTechText('Angular 22, LangChain, Streaming UI');
    setHighlightsText('');
    setGithub('https://github.com/techiewithbeard/');
    setLiveDemo('/demos');
    setDemoType('native-federation');
    setFeatured(true);
    setOrderIndex(items.length + 1);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: ProjectItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setRole(item.role || '');
    setCategory(item.category || 'Architecture');
    setTechText(item.tech.join(', '));
    setHighlightsText(item.highlights.join('\n'));
    setGithub(item.github || '');
    setLiveDemo(item.liveDemo || '');
    setDemoType(item.demoType || 'native-federation');
    setFeatured(item.featured);
    setOrderIndex(item.orderIndex);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tech = techText.split(',').map((s) => s.trim()).filter(Boolean);
    const highlights = highlightsText.split('\n').map((s) => s.trim()).filter(Boolean);

    try {
      if (editingItem) {
        await AdminApi.updateProject(editingItem.id, {
          title,
          description,
          role,
          category,
          tech,
          highlights,
          github: github || null,
          liveDemo: liveDemo || null,
          demoType,
          featured,
          orderIndex,
        });
        onShowToast('success', 'Project updated successfully');
      } else {
        await AdminApi.createProject({
          title,
          description,
          role,
          category,
          tech,
          highlights,
          github: github || null,
          liveDemo: liveDemo || null,
          demoType,
          featured,
          orderIndex,
        });
        onShowToast('success', 'New project added');
      }
      setModalOpen(false);
      loadProjects();
      onRefreshStats();
    } catch (err: any) {
      onShowToast('error', `Operation failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await AdminApi.deleteProject(id);
      onShowToast('success', 'Project deleted');
      loadProjects();
      onRefreshStats();
    } catch (err: any) {
      onShowToast('error', `Delete failed: ${err.message}`);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Featured Projects & Demos</h1>
          <p className="page-subtitle">
            Manage your architecture case studies, LangChain AI interfaces, and microfrontend demos.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <span>➕</span> Add Project
        </button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading projects...</div>
      ) : (
        <div className="items-grid">
          {items.map((item) => (
            <div key={item.id} className="item-card">
              <div>
                <div className="item-card-header">
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span className="tag-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                      {item.category}
                    </span>
                    {item.featured && (
                      <span className="tag-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0.5rem 0 0.25rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                  {item.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                  {item.tech.map((t, i) => (
                    <span key={i} className="tag-badge">{t}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {item.demoType && <span>Mode: {item.demoType}</span>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(item)}>
                    ✏️ Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Project' : 'Add Project Case Study'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Title</label>
            <input
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Production RAG Document Intelligence Interface"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Architecture">Architecture</option>
                <option value="AI Interfaces">AI Interfaces</option>
                <option value="Modernization">Modernization</option>
                <option value="Design Systems">Design Systems</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Your Role</label>
              <input
                className="form-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Senior Frontend Engineer / Creator"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Architecture Highlights (1 per line)</label>
            <textarea
              className="form-textarea"
              value={highlightsText}
              onChange={(e) => setHighlightsText(e.target.value)}
              placeholder="Real-time token streaming with resilient backoff..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Technologies (comma separated)</label>
            <input
              className="form-input"
              value={techText}
              onChange={(e) => setTechText(e.target.value)}
              placeholder="Angular 22, LangChain, LangGraph, Nx, Signals"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">GitHub Repository URL</label>
              <input
                className="form-input"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/techiewithbeard/..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Live Demo Path / URL</label>
              <input
                className="form-input"
                value={liveDemo}
                onChange={(e) => setLiveDemo(e.target.value)}
                placeholder="/demos or https://..."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Demo Federation Type</label>
              <select
                className="form-select"
                value={demoType}
                onChange={(e) => setDemoType(e.target.value as any)}
              >
                <option value="native-federation">Angular Native Federation</option>
                <option value="module-federation">React Module Federation</option>
                <option value="iframe">Embedded Sandbox (Iframe)</option>
              </select>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.8rem' }}>
              <input
                type="checkbox"
                id="featuredCheck"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
              />
              <label htmlFor="featuredCheck" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
                Featured on Homepage
              </label>
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem -1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              💾 Save Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
