import React from 'react';
import { HealthResponse } from '../../types/admin.types';

interface OverviewTabProps {
  health: HealthResponse | null;
  onNavigate: (tab: string) => void;
  onSeed: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  health,
  onNavigate,
  onSeed,
}) => {
  const stats = [
    {
      title: 'Experience Entries',
      count: health?.counts.experience ?? 0,
      icon: '💼',
      tab: 'experience',
      desc: 'Roles at AVEVA, ACI Logistix, Maistering B.V',
    },
    {
      title: 'Featured Projects',
      count: health?.counts.projects ?? 0,
      icon: '🚀',
      tab: 'projects',
      desc: 'Architecture, RAG Chat, Multi-Agent apps',
    },
    {
      title: 'Articles & Writing',
      count: health?.counts.writing ?? 0,
      icon: '✍️',
      tab: 'writing',
      desc: 'Medium, Dev.to, LinkedIn, YouTube',
    },
    {
      title: 'Live Demos',
      count: health?.counts.demos ?? 0,
      icon: '⚡',
      tab: 'demos',
      desc: 'Native Federation & AI iframes',
    },
    {
      title: 'Skill Categories',
      count: health?.counts.skillCategories ?? 0,
      icon: '🛠️',
      tab: 'skills',
      desc: 'Frontend Architecture, AI, Testing',
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">
            Manage Vishnu Thankappan's professional portfolio data, Supabase sync, and API endpoints.
          </p>
        </div>
      </div>

      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          marginBottom: '2rem',
          borderColor: '#3b82f6',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>⚡</span>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                API & Storage Engine:{' '}
                {health?.storageMode === 'supabase' ? 'Supabase Cloud (Active)' : 'Local In-Memory Repository (Active)'}
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '640px' }}>
              {health?.storageMode === 'supabase'
                ? 'Connected directly to Supabase Postgres. All updates sync to cloud tables with Row-Level Security enabled.'
                : 'Running in zero-friction Local Store mode. To connect to Supabase Cloud, add SUPABASE_URL and SUPABASE_ANON_KEY to your environment.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-primary btn-sm" onClick={onSeed}>
              Seed Default Data
            </button>
            <a
              href="/api/health"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
            >
              View /api/health
            </a>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem' }}>Content Modules</h2>
      <div className="items-grid" style={{ marginBottom: '2rem' }}>
        {stats.map((s) => (
          <div
            key={s.title}
            className="item-card"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate(s.tab)}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {s.count}
                </span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{s.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{s.desc}</p>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', paddingLeft: 0 }}>
              Manage {s.title} →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
