import React from 'react';
import { HealthResponse } from '../../types/admin.types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  health: HealthResponse | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  health,
}) => {
  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: '📊' },
    { id: 'profile', label: 'Profile & Details', icon: '👤' },
    {
      id: 'experience',
      label: 'Experience Timeline',
      icon: '💼',
      count: health?.counts.experience,
    },
    {
      id: 'projects',
      label: 'Featured Projects',
      icon: '🚀',
      count: health?.counts.projects,
    },
    {
      id: 'writing',
      label: 'Articles & Writing',
      icon: '✍️',
      count: health?.counts.writing,
    },
    {
      id: 'demos',
      label: 'Live Demo Hub',
      icon: '⚡',
      count: health?.counts.demos,
    },
    {
      id: 'skills',
      label: 'Skills Matrix',
      icon: '🛠️',
      count: health?.counts.skillCategories,
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="logo-badge">VT</div>
        <div>
          <h1>Portfolio Studio</h1>
          <small>Admin Control Center</small>
        </div>
      </div>

      <div className="nav-section-title">Content Modules</div>
      <ul className="nav-menu">
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span className="badge-count">{item.count}</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};
