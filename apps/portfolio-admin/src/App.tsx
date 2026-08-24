import React, { useState, useEffect } from 'react';
import { HealthResponse } from './types/admin.types';
import { AdminApi } from './services/api.service';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Toast, ToastMessage } from './components/ui/Toast';

import { OverviewTab } from './components/tabs/OverviewTab';
import { ProfileTab } from './components/tabs/ProfileTab';
import { ExperienceTab } from './components/tabs/ExperienceTab';
import { ProjectsTab } from './components/tabs/ProjectsTab';
import { WritingTab } from './components/tabs/WritingTab';
import { DemosTab } from './components/tabs/DemosTab';
import { SkillsTab } from './components/tabs/SkillsTab';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    loadHealth();
  }, []);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, text }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadHealth = async () => {
    try {
      setLoading(true);
      const data = await AdminApi.getHealth();
      setHealth(data);
    } catch (err: any) {
      addToast('error', `Could not connect to API: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    if (!window.confirm('Reset/seed database with Vishnu Thankappan default portfolio data?')) return;
    try {
      setLoading(true);
      const res = await AdminApi.seedAll();
      addToast('success', res.message || 'Database seeded successfully!');
      loadHealth();
    } catch (err: any) {
      addToast('error', `Seeding failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            health={health}
            onNavigate={setActiveTab}
            onSeed={handleSeed}
          />
        );
      case 'profile':
        return <ProfileTab onShowToast={addToast} />;
      case 'experience':
        return (
          <ExperienceTab
            onShowToast={addToast}
            onRefreshStats={loadHealth}
          />
        );
      case 'projects':
        return (
          <ProjectsTab
            onShowToast={addToast}
            onRefreshStats={loadHealth}
          />
        );
      case 'writing':
        return (
          <WritingTab
            onShowToast={addToast}
            onRefreshStats={loadHealth}
          />
        );
      case 'demos':
        return (
          <DemosTab
            onShowToast={addToast}
            onRefreshStats={loadHealth}
          />
        );
      case 'skills':
        return (
          <SkillsTab
            onShowToast={addToast}
            onRefreshStats={loadHealth}
          />
        );
      default:
        return (
          <OverviewTab
            health={health}
            onNavigate={setActiveTab}
            onSeed={handleSeed}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
      />
      <div className="main-content">
        <Header
          health={health}
          onRefresh={loadHealth}
          onSeed={handleSeed}
          loading={loading}
        />
        <main className="page-body">{renderActiveTab()}</main>
      </div>
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
