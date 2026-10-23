import React from 'react';
import { useApp } from '../context/AppContext';
import type { ActivePage } from '../context/AppContext';
import {
  ShieldCheck,
  LayoutDashboard,
  FileCheck2,
  BarChart3,
  Server,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  X
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const {
    activePage,
    setActivePage,
    serviceStatus,
    setMockMode,
    probeBackend,
    latestAnalysis
  } = useApp();

  const navItems: { id: ActivePage; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />
    },
    {
      id: 'guidelines',
      label: 'Brand Guidelines',
      icon: <ShieldCheck size={20} />
    },
    {
      id: 'checker',
      label: 'Content Checker',
      icon: <FileCheck2 size={20} />
    },
    {
      id: 'results',
      label: 'Analysis Results',
      icon: <BarChart3 size={20} />,
      badge: latestAnalysis ? `${latestAnalysis.summary.totalIssues}` : undefined
    }
  ];

  const handleNavClick = (pageId: ActivePage) => {
    setActivePage(pageId);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
        {/* Brand Logo & Name */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon-wrapper">
              <ShieldCheck className="brand-logo-icon" size={24} />
            </div>
            <div className="brand-text">
              <span className="brand-name">BrandGuard<span className="brand-accent">.AI</span></span>
              <span className="brand-tagline">Intelligent Governance</span>
            </div>
          </div>
          <button
            className="mobile-close-btn"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav" aria-label="Main Navigation">
          <div className="nav-section-label">PLATFORM</div>
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`nav-item ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`nav-badge ${Number(item.badge) > 0 ? 'badge-alert' : 'badge-clean'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System & Backend Status Panel */}
        <div className="sidebar-footer">
          <div className="status-panel">
            <div className="status-header">
              <div className="status-title">
                <Server size={14} />
                <span>Backend Engine</span>
              </div>
              <button
                className="status-refresh-btn"
                title="Ping backend health (/api/health)"
                onClick={() => probeBackend()}
              >
                <RefreshCw size={13} />
              </button>
            </div>

            <div className="status-indicator-row">
              <span
                className={`status-dot ${
                  serviceStatus.isMockMode
                    ? 'status-dot-mock'
                    : serviceStatus.isBackendConnected
                    ? 'status-dot-connected'
                    : 'status-dot-offline'
                }`}
              />
              <span className="status-text">
                {serviceStatus.isMockMode
                  ? 'Dev Mock Mode (Offline)'
                  : serviceStatus.isBackendConnected
                  ? 'Connected (Live API)'
                  : 'Backend Disconnected'}
              </span>
            </div>

            <div className="backend-url-display" title={serviceStatus.backendUrl}>
              <code>{serviceStatus.backendUrl}</code>
            </div>

            {/* Development Mock Adapter Toggle */}
            <div className="mock-toggle-row">
              <div className="mock-info">
                <span className="mock-title">Dev Mock Mode</span>
                <span className="mock-hint">UI testing without backend</span>
              </div>
              <button
                type="button"
                className="toggle-button"
                onClick={() => setMockMode(!serviceStatus.isMockMode)}
                aria-label="Toggle Development Mock Adapter"
              >
                {serviceStatus.isMockMode ? (
                  <ToggleRight size={24} className="toggle-active" />
                ) : (
                  <ToggleLeft size={24} className="toggle-inactive" />
                )}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
