import React, { useState, useEffect } from 'react';
import { WritingItem } from '../../types/admin.types';
import { AdminApi } from '../../services/api.service';
import { Modal } from '../ui/Modal';

interface WritingTabProps {
  onShowToast: (type: 'success' | 'error', text: string) => void;
  onRefreshStats: () => void;
}

export const WritingTab: React.FC<WritingTabProps> = ({
  onShowToast,
  onRefreshStats,
}) => {
  const [items, setItems] = useState<WritingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WritingItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState<'medium' | 'dev.to' | 'linkedin' | 'youtube' | 'hashnode' | 'other'>('medium');
  const [url, setUrl] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [summary, setSummary] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [readTime, setReadTime] = useState('5 min read');
  const [featured, setFeatured] = useState(true);
  const [orderIndex, setOrderIndex] = useState(1);

  useEffect(() => {
    loadWriting();
  }, []);

  const loadWriting = async () => {
    try {
      setLoading(true);
      const data = await AdminApi.getWriting();
      setItems(data);
    } catch (err: any) {
      onShowToast('error', `Failed to load writing: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setTitle('');
    setPlatform('medium');
    setUrl('https://medium.com/@techiewithbeard/');
    setPublishedAt(new Date().toISOString().split('T')[0]);
    setSummary('');
    setTagsText('Angular, Architecture, Microfrontends');
    setReadTime('6 min read');
    setFeatured(true);
    setOrderIndex(items.length + 1);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: WritingItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setPlatform(item.platform);
    setUrl(item.url);
    setPublishedAt(item.publishedAt);
    setSummary(item.summary);
    setTagsText(item.tags.join(', '));
    setReadTime(item.readTime || '5 min read');
    setFeatured(item.featured ?? true);
    setOrderIndex(item.orderIndex);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsText.split(',').map((s) => s.trim()).filter(Boolean);

    try {
      if (editingItem) {
        await AdminApi.updateWriting(editingItem.id, {
          title,
          platform,
          url,
          publishedAt,
          summary,
          tags,
          readTime,
          featured,
          orderIndex,
        });
        onShowToast('success', 'Article updated');
      } else {
        await AdminApi.createWriting({
          title,
          platform,
          url,
          publishedAt,
          summary,
          tags,
          readTime,
          featured,
          orderIndex,
        });
        onShowToast('success', 'New article added');
      }
      setModalOpen(false);
      loadWriting();
      onRefreshStats();
    } catch (err: any) {
      onShowToast('error', `Operation failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await AdminApi.deleteWriting(id);
      onShowToast('success', 'Article removed');
      loadWriting();
      onRefreshStats();
    } catch (err: any) {
      onShowToast('error', `Delete failed: ${err.message}`);
    }
  };

  const getPlatformClass = (p: string) => {
    switch (p.toLowerCase()) {
      case 'medium': return 'platform-medium';
      case 'dev.to': return 'platform-devto';
      case 'linkedin': return 'platform-linkedin';
      case 'youtube': return 'platform-youtube';
      default: return '';
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Articles & Technical Writing</h1>
          <p className="page-subtitle">
            Publish and manage technical articles from Medium, Dev.to, LinkedIn, YouTube, and Hashnode.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <span>➕</span> Add Article / Video
        </button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading articles...</div>
      ) : items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem', maxWidth: '580px', margin: '2rem auto' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✍️</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            No Articles Published Yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Drafts are brewing! Add your technical articles, architecture deep-dives, or video talks to showcase your thought leadership across Medium, Dev.to, and LinkedIn.
          </p>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <span>➕</span> Add First Article
          </button>
        </div>
      ) : (
        <div className="items-grid">
          {items.map((item) => (
            <div key={item.id} className="item-card">
              <div>
                <div className="item-card-header">
                  <span className={`tag-badge ${getPlatformClass(item.platform)}`}>
                    {item.platform.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {item.publishedAt} • {item.readTime}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0.6rem 0 0.35rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                  {item.summary}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {item.tags.map((t, i) => (
                    <span key={i} className="tag-badge">{t}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost btn-sm"
                  style={{ paddingLeft: 0, color: 'var(--accent-primary)' }}
                >
                  🔗 Open Link ↗
                </a>
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

      {/* Writing Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Article / Video' : 'Add New Article'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Article / Video Title</label>
            <input
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Architecting Large-Scale Angular Monorepos..."
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Publishing Platform</label>
              <select
                className="form-select"
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
              >
                <option value="medium">Medium</option>
                <option value="dev.to">Dev.to</option>
                <option value="linkedin">LinkedIn</option>
                <option value="youtube">YouTube</option>
                <option value="hashnode">Hashnode</option>
                <option value="other">Other / Blog</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Publication Date</label>
              <input
                className="form-input"
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Article / Video URL</label>
              <input
                className="form-input"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Estimated Read / Watch Time</label>
              <input
                className="form-input"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="6 min read"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Summary & Key Takeaways</label>
            <textarea
              className="form-textarea"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input
              className="form-input"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="Angular, Signals, AI, Architecture"
            />
          </div>

          <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem -1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              💾 Save Article
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
