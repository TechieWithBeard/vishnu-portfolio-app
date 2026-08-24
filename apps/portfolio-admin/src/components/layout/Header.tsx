import React from 'react';
import { HealthResponse } from '../../types/admin.types';

interface HeaderProps {
  health: HealthResponse | null;
  onRefresh: () => void;
  onSeed: () => void;
  loading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  onRefresh,
  onSeed,
  loading,
}) => {
  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          className={`status-pill ${
            health?.storageMode === 'supabase' ? 'online' : 'local'
          }`}
        >
          <span className="dot" />
          <span>
            {health?.storageMode === 'supabase'
              ? 'Supabase Cloud Connected'
              : 'Local Store Active'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          disabled={loading}
          title="Refresh Data"
        >
          <span>🔄</span> Refresh
        </button>
        <button
          onClick={onSeed}
          className="btn btn-secondary btn-sm"
          disabled={loading}
          title="Reset to initial portfolio data"
        >
          <span>🌱</span> Re-Seed Defaults
        </button>
      </div>
    </header>
  );
};
