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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'native-federation' | 'module-federation' | 'iframe' | 'standalone'>('native-federation');
  const [remoteName, setRemoteName] = useState('');
  const [exposedModule, setExposedModule] = useState('');
  const [url, setUrl] = useState('');
  const [documentation, setDocumentation] = useState('');
  const [video, setVideo] = useState('');
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
    setId(`demo-${Date.now()}`);
    setTitle('');
    setDescription('');
    setType('native-federation');
    setRemoteName('demoAngularRag');
    setExposedModule('./Component');
    setUrl('/demos/rag-chat');
    setDocumentation('');
    setVideo('');
    setStatus('live');
    setTechText('Angular 22, LangChain, Streaming UI');
    setTagsText('AI, RAG, Microfrontend');
    setSandbox('allow-scripts allow-same-origin allow-forms allow-popups');
    setOrderIndex(items.length + 1);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: DemoItem) => {
    setEditingItem(item);
    setId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setType(item.type);
    setRemoteName(item.remoteName || '');
    setExposedModule(item.exposedModule || '');
    setUrl(item.url || '');
    setDocumentation(item.documentation || '');
    setVideo(item.video || '');
    setStatus(item.status);
    setTechText(item.tech.join(', '));
    setTagsText(item.tags.join(', '));
    setSandbox(item.sandbox || 'allow-scripts allow-same-origin allow-forms allow-popups');
    setOrderIndex(item.orderIndex);
    setModalOpen(true);
  };

  const handleCopyDeeplink = (demoId: string) => {
    const link = `https://www.techiewithbeard.com/demos?demo=${encodeURIComponent(demoId)}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(link);
      setCopiedId(demoId);
      onShowToast('success', `Deeplink copied: ${link}`);
      setTimeout(() => setCopiedId(null), 2500);
    }
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
          documentation: documentation || undefined,
          video: video || undefined,
          status,
          tech,
          tags,
          sandbox: sandbox || undefined,
          orderIndex,
        });
        onShowToast('success', 'Demo updated successfully');
      } else {
        await AdminApi.createDemo({
          id,
          title,
          description,
          type,
          remoteName: remoteName || undefined,
          exposedModule: exposedModule || undefined,
          url: url || undefined,
          documentation: documentation || undefined,
          video: video || undefined,
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
          <h1 className="page-title">Live Demos & Microfrontends</h1>
          <p className="page-subtitle">
            Manage embedded applications, Native Federation remotes, and deep-linked interactive AI prototypes.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          + Add New Demo
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading demos...</div>
      ) : items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>No Demos Configured</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Add your first interactive demo or remote application.
          </p>
        </div>
      ) : (
        <div className="grid two">
          {items.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span className="badge badge-accent">{item.type}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className={`badge ${item.status === 'live' ? 'badge-success' : 'badge-warning'}`}>
                    ● {item.status.toUpperCase()}
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleCopyDeeplink(item.id)}
                    title="Copy LinkedIn shareable deep link"
                  >
                    {copiedId === item.id ? '✓ Copied' : '🔗 Link'}
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem', flex: 1 }}>
                {item.description}
              </p>

              {/* Resource Badges */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
                {item.documentation && (
                  <a
                    href={item.documentation}
                    target="_blank"
                    rel="noreferrer"
                    className="badge"
                    style={{ background: 'var(--color-bg-subtle)', textDecoration: 'none', color: 'var(--accent)' }}
                  >
                    📄 Docs ↗
                  </a>
                )}
                {item.video && (
                  <a
                    href={item.video}
                    target="_blank"
                    rel="noreferrer"
                    className="badge"
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', textDecoration: 'none' }}
                  >
                    🎥 Video ↗
                  </a>
                )}
                {item.url && (
                  <span className="badge" style={{ background: 'var(--color-bg-subtle)' }}>
                    URL: {item.url}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                {item.tech.map((t) => (
                  <span key={t} className="badge">
                    {t}
                  </span>
                ))}
              </div>

              {item.tags && item.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                  {item.tags.map((t) => (
                    <span key={t} className="badge" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa' }}>
                      🏷️ {t}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: 'auto', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(item)}>
                  ✏️ Edit
                </button>
                <button className="btn btn-secondary btn-sm" style={{ color: '#ef4444' }} onClick={() => handleDelete(item.id)}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Demo Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? `Edit: ${editingItem.title}` : 'Add New Live Demo'}
        maxWidth="760px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Demo ID / Deep Link Slug</label>
              <input
                className="form-input"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="e.g. talentlens-ai or rag-chat"
                disabled={!!editingItem}
                required
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                Used for deeplinks: <code>techiewithbeard.com/demos?demo={id || 'slug'}</code>
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Demo Title</label>
              <input
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. talentLens-ai Resume Analyzer"
                required
              />
            </div>
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
                <option value="iframe">Secure Iframe (Hugging Face / Streamlit / Gradio)</option>
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
              <label className="form-label">Remote Name (For Microfrontends)</label>
              <input
                className="form-input"
                value={remoteName}
                onChange={(e) => setRemoteName(e.target.value)}
                placeholder="demoAngularRag"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Exposed Module (For Microfrontends)</label>
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
              placeholder="https://techiewithbeard-talentlens-ai.hf.space/ or /demos/rag-chat"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">📄 Documentation Link (Optional External URL)</label>
              <input
                className="form-input"
                value={documentation}
                onChange={(e) => setDocumentation(e.target.value)}
                placeholder="https://medium.com/... or https://github.com/..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">🎥 Video Demo Link (Optional YouTube URL)</label>
              <input
                className="form-input"
                value={video}
                onChange={(e) => setVideo(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: '90px' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the application architecture, key capabilities, and problem solved..."
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tech Stack (comma separated)</label>
              <input
                className="form-input"
                value={techText}
                onChange={(e) => setTechText(e.target.value)}
                placeholder="Gradio 6.25, Python 3.12, LangGraph, Qwen 3 (8B)"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input
                className="form-input"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="AI, Gradio, Hugging Face, RAG, LangGraph"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Display Order</label>
              <input
                type="number"
                className="form-input"
                value={orderIndex}
                onChange={(e) => setOrderIndex(parseInt(e.target.value, 10) || 1)}
                min={0}
              />
            </div>
            {type === 'iframe' && (
              <div className="form-group">
                <label className="form-label">Iframe Sandbox Permissions</label>
                <input
                  className="form-input"
                  value={sandbox}
                  onChange={(e) => setSandbox(e.target.value)}
                  placeholder="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            )}
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
