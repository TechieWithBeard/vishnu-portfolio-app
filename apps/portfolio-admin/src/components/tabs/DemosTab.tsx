import React, { useState, useEffect } from 'react';
import { DemoItem } from '../../types/admin.types';
import { AdminApi } from '../../services/api.service';
import { Modal } from '../ui/Modal';

interface DemosTabProps {
  onShowToast: (type: 'success' | 'error', text: string) => void;
  onRefreshStats: () => void;
}

export const DemosTab: React.FC<DemosTabProps> = ({
  onShowToast,
  onRefreshStats,
}) => {
  const [items, setItems] = useState<DemoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DemoItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'native-federation' | 'module-federation' | 'iframe' | 'standalone'>('native-federation');
  const [remoteName, setRemoteName] = useState('');
  const [exposedModule, setExposedModule] = useState('');
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'live' | 'planned' | 'wip'>('live');
  const [techText, setTechText] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [sandbox, setSandbox] = useState('');
  const [orderIndex, setOrderIndex] = useState(1);

  useEffect(() => {
    loadDemos();
  }, []);

  const loadDemos = async () => {
    try {
      setLoading(true);
      const data = await AdminApi.getDemos();
      setItems(data);
    } catch (err: any) {
      onShowToast('error', `Failed to load demos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setType('native-federation');
    setRemoteName('demoAngularRag');
    setExposedModule('./Component');
    setUrl('/demos/rag-chat');
    setStatus('live');
    setTechText('Angular 22, LangChain, Streaming UI');
    setTagsText('AI, RAG, Microfrontend');
    setSandbox('');
    setOrderIndex(items.length + 1);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: DemoItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setType(item.type);
    setRemoteName(item.remoteName || '');
    setExposedModule(item.exposedModule || '');
    setUrl(item.url || '');
    setStatus(item.status);
    setTechText(item.tech.join(', '));
    setTagsText(item.tags.join(', '));
    setSandbox(item.sandbox || '');
    setOrderIndex(item.orderIndex);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tech = techText.split(',').map((s) => s.trim()).filter(Boolean);
    const tags = tagsText.split(',').map((s) => s.trim()).filter(Boolean);

    try {
      if (editingItem) {
        await AdminApi.updateDemo(editingItem.id, {
          title,
          description,
          type,
          remoteName: remoteName || undefined,
          exposedModule: exposedModule || undefined,
          url: url || undefined,
          status,
          tech,
          tags,
          sandbox: sandbox || undefined,
          orderIndex,
        });
        onShowToast('success', 'Demo updated');
      } else {
        await AdminApi.createDemo({
          title,
          description,
          type,
          remoteName: remoteName || undefined,
          exposedModule: exposedModule || undefined,
          url: url || undefined,
          status,
          tech,
          tags,
          sandbox: sandbox || undefined,
          orderIndex,
        });
        onShowToast('success', 'New demo entry created');
      }
      setModalOpen(false);
      loadDemos();
      onRefreshStats();
    } catch (err: any) {
      onShowToast('error', `Operation failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this demo?')) return;
    try {
      await AdminApi.deleteDemo(id);
      onShowToast('success', 'Demo deleted');
      loadDemos();
      onRefreshStats();
    } catch (err: any) {
      onShowToast('error', `Delete failed: ${err.message}`);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Live Demo Hub</h1>
          <p className="page-subtitle">
            Configure Angular Native Federation remotes, React Module Federation, and embedded Streamlit AI applications.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <span>➕</span> Add Demo
        </button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading live demos...</div>
      ) : (
        <div className="items-grid">
          {items.map((item) => (
            <div key={item.id} className="item-card">
              <div>
                <div className="item-card-header">
                  <span className="tag-badge" style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#c084fc' }}>
                    {item.type}
                  </span>
                  <span
                    className="status-pill"
                    style={{
                      background: item.status === 'live' ? 'var(--success-subtle)' : 'var(--bg-surface-hover)',
                      color: item.status === 'live' ? '#34d399' : 'var(--text-muted)',
                    }}
                  >
                    <span className="dot" />
                    {item.status.toUpperCase()}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0.6rem 0 0.25rem' }}>{item.title}</h3>
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
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {item.remoteName || item.url}
                </span>
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

      {/* Demo Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Live Demo' : 'Add Live Demo'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Demo Title</label>
            <input
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. RAG Document Q&A Assistant"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Demo Technology Type</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="native-federation">Angular Native Federation (Microfrontend)</option>
                <option value="module-federation">React Module Federation (Microfrontend)</option>
                <option value="iframe">Secure Iframe (Streamlit / Next.js)</option>
                <option value="standalone">Standalone Web App</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="live">Live (Ready)</option>
                <option value="wip">In Progress (WIP)</option>
                <option value="planned">Planned (Upcoming)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Remote Name (MF)</label>
              <input
                className="form-input"
                value={remoteName}
                onChange={(e) => setRemoteName(e.target.value)}
                placeholder="demoAngularRag"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Exposed Module (MF)</label>
              <input
                className="form-input"
                value={exposedModule}
                onChange={(e) => setExposedModule(e.target.value)}
                placeholder="./Component"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Hosted URL / Router Path</label>
            <input
              className="form-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/demos/rag-chat or https://..."
            />
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
            <label className="form-label">Tech Stack (comma separated)</label>
            <input
              className="form-input"
              value={techText}
              onChange={(e) => setTechText(e.target.value)}
              placeholder="Angular 22, LangChain, Streaming UI"
            />
          </div>

          <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem -1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              💾 Save Demo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
