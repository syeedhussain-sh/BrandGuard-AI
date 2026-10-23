import React from 'react';
import { useApp } from '../context/AppContext';
import { Menu, Shield, Activity, PlusCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

const PRESET_HEADER_COMPANIES = [
  { name: 'Tata Motors', industry: 'Automotive' },
  { name: 'MRF Tyres', industry: 'Automotive & Rubber' },
  { name: 'Samsung', industry: 'Mobile phones and electronics' },
  { name: "McDonald's", industry: 'Food and beverages' },
  { name: 'Nike', industry: 'Clothing and fashion' },
  { name: 'Infosys', industry: 'Technology and software' }
];

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const {
    activePage,
    setActivePage,
    serviceStatus,
    activeCompanyName,
    activeIndustry,
    activeGovernanceMode,
    setActiveCompany,
    brands
  } = useApp();

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

  // Determine if current active company is custom (not in configured or preset lists)
  const isKnownConfiguredOrPreset =
    activeCompanyName.toLowerCase() === 'novatech' ||
    brands.some((b) => b.name.toLowerCase() === activeCompanyName.toLowerCase()) ||
    PRESET_HEADER_COMPANIES.some((c) => c.name.toLowerCase() === activeCompanyName.toLowerCase());

  const isCustomActive = Boolean(activeCompanyName && !isKnownConfiguredOrPreset);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    const foundPreset = PRESET_HEADER_COMPANIES.find((c) => c.name.toLowerCase() === selectedName.toLowerCase());
    setActiveCompany(selectedName, foundPreset ? foundPreset.industry : undefined);
  };

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
        {/* Dynamic Active Company Selector Pill */}
        <div className="header-brand-pill">
          <Shield
            size={15}
            className={activeGovernanceMode === 'configured' ? 'text-primary' : 'text-warning'}
          />
          <span className="brand-pill-label">Active:</span>
          <select
            className="header-brand-select"
            value={activeCompanyName}
            onChange={handleCompanyChange}
            aria-label="Select active company"
          >
            {/* Configured Official Profiles */}
            <optgroup label="Configured Official Profiles">
              {brands.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name} (Configured)
                </option>
              ))}
              {brands.length === 0 && <option value="NovaTech">NovaTech (Configured)</option>}
            </optgroup>

            {/* Universal Multi-Industry Companies */}
            <optgroup label="Universal Multi-Industry Companies">
              {PRESET_HEADER_COMPANIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.industry})
                </option>
              ))}
            </optgroup>

            {/* Custom entered company if currently active */}
            {isCustomActive && (
              <optgroup label="Custom Active Brand">
                <option value={activeCompanyName}>
                  {activeCompanyName} ({activeIndustry || 'Custom'})
                </option>
              </optgroup>
            )}
          </select>

          {activeGovernanceMode === 'configured' ? (
            <span
              className="badge badge-brand"
              style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}
              title="Official brand guidelines and rules are active"
            >
              Configured
            </span>
          ) : (
            <span
              className="badge badge-warning"
              style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}
              title="Generic analysis — official guidelines not configured"
            >
              Generic
            </span>
          )}
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
