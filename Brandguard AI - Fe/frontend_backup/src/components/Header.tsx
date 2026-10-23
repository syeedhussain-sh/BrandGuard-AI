import React from 'react';
import { useApp } from '../context/AppContext';
import { Menu, Shield, Activity, PlusCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { activePage, setActivePage, serviceStatus, selectedBrandId, brands, setSelectedBrandId } = useApp();

  const getPageInfo = () => {
    switch (activePage) {
      case 'dashboard':
        return { title: 'Executive Governance Dashboard', subtitle: 'Real-time brand compliance monitoring & health metrics' };
      case 'guidelines':
        return { title: 'Brand Governance Guidelines', subtitle: 'Configure official brand lexicon, forbidden phrases, and tone guidelines' };
      case 'checker':
        return { title: 'Marketing Content Checker', subtitle: 'Analyze marketing collateral against official governance policies' };
      case 'results':
        return { title: 'Governance Analysis Audit Report', subtitle: 'Detailed issue breakdown, severity classifications, and compliant copy' };
      default:
        return { title: 'BrandGuard AI', subtitle: 'Intelligent Brand Governance Platform' };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="mobile-menu-btn"
          onClick={onToggleMobileMenu}
          aria-label="Open main navigation"
        >
          <Menu size={22} />
        </button>
        <div className="header-titles">
          <h1 className="header-title">{pageInfo.title}</h1>
          <p className="header-subtitle">{pageInfo.subtitle}</p>
        </div>
      </div>

      <div className="header-right">
        {/* Brand Selector Pill */}
        <div className="header-brand-pill">
          <Shield size={15} className="text-primary" />
          <span className="brand-pill-label">Active:</span>
          <select
            className="header-brand-select"
            value={selectedBrandId}
            onChange={(e) => setSelectedBrandId(e.target.value)}
            aria-label="Select active brand"
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
            {brands.length === 0 && <option value="demo-brand">NovaTech (Demo)</option>}
          </select>
        </div>

        {/* Backend Connectivity Status Pill */}
        <div className="header-status-pill">
          {serviceStatus.isMockMode ? (
            <span className="badge badge-medium">
              <Activity size={12} /> Dev Mock Mode
            </span>
          ) : serviceStatus.isBackendConnected ? (
            <span className="badge badge-low">
              <CheckCircle2 size={12} /> Backend Live
            </span>
          ) : (
            <span className="badge badge-high" title={serviceStatus.errorMessage || 'Cannot reach backend at localhost:5000'}>
              <AlertTriangle size={12} /> Backend Offline
            </span>
          )}
        </div>

        {/* New Check Action Button */}
        {activePage !== 'checker' && (
          <button
            className="btn btn-primary btn-sm header-action-btn"
            onClick={() => setActivePage('checker')}
          >
            <PlusCircle size={15} />
            <span>Analyze Copy</span>
          </button>
        )}
      </div>
    </header>
  );
};
