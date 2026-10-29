import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { serviceManager } from '../services/serviceManager';
import {
  Sparkles,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Building2,
  Tag,
  ShieldCheck,
  ShieldAlert,
  Car,
  Smartphone,
  Utensils,
  Shirt,
  Cpu,
  Cloud
} from 'lucide-react';

interface PresetOption {
  company: string;
  industry: string;
  isConfigured: boolean;
  label: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  content: string;
}

const MULTI_INDUSTRY_PRESETS: PresetOption[] = [
  {
    company: 'KFC',
    industry: 'Food',
    isConfigured: false,
    label: 'KFC (Product Preservation)',
    badge: 'Mode B: Identity Test',
    description: 'Verifies product identity preservation: "Nova Cloud" is preserved and never replaced with "KFC"',
    icon: <Utensils size={16} />,
    content:
      'Our Nova Cloud is the cheapest cloud in the market and it is obviously 100% bug-free. We guarantee total perfection.'
  },
  {
    company: 'KFC',
    industry: 'Food',
    isConfigured: false,
    label: 'KFC (Contextual Mismatch)',
    badge: 'Mode B: Product Mismatch',
    description: 'Flags vehicle offering under a food brand and corrects it to quality food and service',
    icon: <Utensils size={16} />,
    content:
      'KFC provides good bike and good services.'
  },
  {
    company: 'KFC',
    industry: 'Food',
    isConfigured: false,
    label: 'KFC (Legitimate Delivery)',
    badge: 'Mode B: Legitimate Context',
    description: 'Recognizes bicycle delivery as legitimate food logistics and produces zero false positives',
    icon: <Utensils size={16} />,
    content:
      'We deliver meals using bicycles in selected locations.'
  },
  {
    company: 'NovaTech',
    industry: 'Enterprise Cloud and AI',
    isConfigured: true,
    label: 'NovaTech (Configured)',
    badge: 'Mode A: Configured Brand',
    description: 'Cloud infrastructure provider with official custom rules for terminology, tone, and SLA claims',
    icon: <Cloud size={16} />,
    content:
      'Our Nova Cloud is the cheapest cloud in the market and it is obviously 100% bug-free. We guarantee total perfection.'
  },
  {
    company: 'Tata Motors',
    industry: 'Automotive',
    isConfigured: false,
    label: 'Tata Motors',
    badge: 'Mode B: Automotive',
    description: 'Tests automotive safety risk indicators: 100% crash-proof claims, zero maintenance, and customer satisfaction',
    icon: <Car size={16} />,
    content:
      'Our new tata motors electric SUV is 100% crash-proof and never needs maintenance. We guarantee 100% customer satisfaction.'
  },
  {
    company: 'MRF Tyres',
    industry: 'Automotive & Rubber',
    isConfigured: false,
    label: 'MRF Tyres',
    badge: 'Mode B: Automotive',
    description: 'Tests automotive and tire durability claims: zero wear and tear, 100% puncture-proof, and road safety guarantees',
    icon: <Car size={16} />,
    content:
      'MRF Tyres introduces our revolutionary steel radial tire with 100% puncture-proof warranty and zero wear and tear on all highway roads!'
  },
  {
    company: 'Samsung',
    industry: 'Mobile phones and electronics',
    isConfigured: false,
    label: 'Samsung',
    badge: 'Mode B: Electronics',
    description: 'Tests hardware and consumer electronics risk indicators: infinite battery life, unbreakable screen, and zero latency',
    icon: <Smartphone size={16} />,
    content:
      'The new samsung Galaxy features infinite battery life and an unbreakable screen with zero latency guaranteed.'
  },
  {
    company: "McDonald's",
    industry: 'Food and beverages',
    isConfigured: false,
    label: "McDonald's",
    badge: 'Mode B: Food & Dining',
    description: 'Tests food and restaurant compliance: health claims, miracle detox phrasing, weight loss guarantees, and price superlatives',
    icon: <Utensils size={16} />,
    content:
      "Try mcdonald's miracle detox burger that cures all diseases and guarantees weight loss! Obviously it is the cheapest in the world."
  },
  {
    company: 'Nike',
    industry: 'Clothing and fashion',
    isConfigured: false,
    label: 'Nike',
    badge: 'Mode B: Apparel & Retail',
    description: 'Tests retail compliance: absolute eco-friendly claims, unverified lowest price guarantees, and aggressive shouting typography',
    icon: <Shirt size={16} />,
    content:
      'Our new nike running shoes are 100% eco-friendly on earth with cheapest prices guaranteed anywhere! BUY NOW TODAY DO NOT MISS OUT!!!'
  },
  {
    company: 'Infosys',
    industry: 'Technology and software',
    isConfigured: false,
    label: 'Infosys',
    badge: 'Mode B: IT Services',
    description: 'Tests software and enterprise services: 100% unhackable security claims and eternal zero downtime promises',
    icon: <Cpu size={16} />,
    content:
      'infosys provides 100% unhackable digital transformation architectures with zero downtime guaranteed forever.'
  }
];

export const ContentCheckerPage: React.FC = () => {
  const {
    brands,
    selectedBrandId,
    setSelectedBrandId,
    startAudit,
    failAudit,
    recordAnalysis,
    setActivePage,
    serviceStatus,
    showToast,
    setMockMode,
    activeCompanyName,
    activeIndustry,
    setActiveCompany
  } = useApp();

  // Universal Company & Industry inputs synchronized with shared AppContext state
  const [companyName, setCompanyName] = useState<string>(activeCompanyName);
  const [industry, setIndustry] = useState<string>(activeIndustry);
  const [content, setContent] = useState<string>(
    'Our Nova Cloud is the cheapest cloud in the market and it is obviously 100% bug-free. We guarantee total perfection.'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Synchronize local input state whenever active company changes in shared context
  useEffect(() => {
    setCompanyName(activeCompanyName);
    setIndustry(activeIndustry);
  }, [activeCompanyName, activeIndustry]);

  // Check whether the entered company matches a configured brand in the database
  const normalizedCompany = companyName.trim().toLowerCase();
  const matchedBrand = brands.find(
    (b) => b.name.toLowerCase() === normalizedCompany || b.id.toLowerCase() === normalizedCompany
  );
  const isConfiguredMode = Boolean(
    matchedBrand ||
    normalizedCompany === 'novatech' ||
    (selectedBrandId === 'demo-brand' && normalizedCompany === '')
  );

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  const handleApplyPreset = (preset: PresetOption) => {
    setCompanyName(preset.company);
    setIndustry(preset.industry);
    setContent(preset.content);
    setActiveCompany(preset.company, preset.industry);
    if (preset.isConfigured) {
      setSelectedBrandId('demo-brand');
    }
    setErrorMessage(null);
  };

  const handleClear = () => {
    setContent('');
    setErrorMessage(null);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedCompany = companyName.trim();
    const trimmedContent = content.trim();

    // Validation 1: Company / Brand Name is required
    if (!trimmedCompany) {
      setErrorMessage('Please enter a company or brand name (e.g. Tata Motors, Samsung, Nike, NovaTech, or your brand).');
      return;
    }

    // Validation 2: Content is required
    if (!trimmedContent) {
      setErrorMessage('Content is required. Please provide marketing copy or click a preset sample below.');
      return;
    }

    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setIsSubmitting(true);

    // Initialize audit in global state and navigate to results immediately to show loading progress
    startAudit(auditId, trimmedCompany, industry.trim());
    setActivePage('results');

    try {
      const targetBrandId = matchedBrand ? matchedBrand.id : (isConfiguredMode ? 'demo-brand' : undefined);

      const { response, source } = await serviceManager.analyzeContent({
        brandId: targetBrandId,
        companyName: trimmedCompany,
        industry: industry.trim() || undefined,
        content: trimmedContent
      });

      // Record to history and application state (validated by auditId)
      recordAnalysis(
        targetBrandId || trimmedCompany.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        response.companyName || trimmedCompany,
        trimmedContent,
        response,
        industry.trim() || undefined,
        auditId
      );

      const modeText = response.officialGuidelinesConfigured
        ? 'Mode A (Configured Brand Profile)'
        : 'Mode B (Universal Generic Governance)';

      showToast(
        `Audit complete! Found ${response.summary.totalIssues} issue(s) for ${response.companyName || trimmedCompany} under ${modeText} via ${
          source === 'mock' ? 'Dev Mock Adapter' : 'Live Backend API'
        }.`,
        'success'
      );
    } catch (err: unknown) {
      const errorStr =
        err instanceof Error ? err.message : 'Analysis request failed against backend server.';
      setErrorMessage(errorStr);
      failAudit(auditId, errorStr);
      showToast(errorStr, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container content-checker-page">
      {/* Offline Alert if backend is disconnected and not in mock mode */}
      {!serviceStatus.isBackendConnected && !serviceStatus.isMockMode && (
        <div className="alert-banner alert-warning mb-6">
          <AlertTriangle size={20} className="alert-icon" />
          <div className="flex-1">
            <h4 className="alert-title">Live Backend Server Offline ({serviceStatus.backendUrl})</h4>
            <p className="alert-desc">
              Cannot reach the backend server at <code>{serviceStatus.backendUrl}</code>. You can switch on{' '}
              <strong>Dev Mock Mode</strong> to test multi-industry compliance offline.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => setMockMode(true)}
          >
            Enable Dev Mock Mode
          </button>
        </div>
      )}

      <div className="checker-layout">
        {/* Main Checker Form */}
        <div className="checker-main">
          <form onSubmit={handleAnalyze} className="glass-card checker-card">
            {/* Header: Universal Brand & Industry Inputs */}
            <div className="checker-header flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {/* Company or Brand Name */}
                <div className="form-group mb-0">
                  <label htmlFor="company-name" className="form-label mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Building2 size={15} className="text-primary" />
                      Company or Brand Name <span className="text-danger">*</span>
                    </span>
                    {isConfiguredMode ? (
                      <span className="badge badge-brand text-xs">Configured Profile</span>
                    ) : (
                      <span className="badge badge-info text-xs">Universal Generic Mode</span>
                    )}
                  </label>
                  <input
                    id="company-name"
                    type="text"
                    className="form-input"
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    onBlur={() => {
                      if (companyName.trim()) {
                        setActiveCompany(companyName.trim(), industry.trim());
                      }
                    }}
                    placeholder="e.g. Tata Motors, MRF Tyres, Samsung, Nike, McDonald's, Infosys, NovaTech..."
                    autoComplete="organization"
                  />
                </div>

                {/* Industry / Category (Optional) */}
                <div className="form-group mb-0">
                  <label htmlFor="industry-name" className="form-label mb-1 flex items-center gap-1.5">
                    <Tag size={15} className="text-secondary" />
                    Industry / Business Category <span className="text-muted text-xs font-normal">(Optional)</span>
                  </label>
                  <input
                    id="industry-name"
                    type="text"
                    className="form-input"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    onBlur={() => {
                      if (companyName.trim()) {
                        setActiveCompany(companyName.trim(), industry.trim());
                      }
                    }}
                    placeholder="e.g. Automotive, Electronics, Food, Fashion, Software, Healthcare..."
                  />
                </div>
              </div>

              {/* Dynamic Analysis Mode Indicator Banner */}
              <div className={`mode-indicator-bar p-3 rounded-lg border flex items-center justify-between w-full ${
                isConfiguredMode
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}>
                <div className="flex items-center gap-2.5">
                  {isConfiguredMode ? (
                    <ShieldCheck size={18} className="text-blue-400 shrink-0" />
                  ) : (
                    <ShieldAlert size={18} className="text-emerald-400 shrink-0" />
                  )}
                  <div>
                    <span className="font-semibold text-sm">
                      {isConfiguredMode
                        ? 'Mode A: Configured Brand Analysis Active'
                        : 'Mode B: Universal Generic Brand Analysis Active'}
                    </span>
                    <span className="text-xs text-muted block">
                      {isConfiguredMode
                        ? `Applying officially saved guidelines, terminology, and restricted rules for ${matchedBrand?.name || 'NovaTech'}.`
                        : `Official guidelines not configured for "${companyName || 'this brand'}". Applying universal brand governance principles and ${industry ? `${industry} risk indicators` : 'general risk indicators'}.`}
                    </span>
                  </div>
                </div>

                <div className="text-xs shrink-0 pl-3">
                  <span className="badge badge-low">
                    {serviceStatus.isMockMode ? 'Dev Mock Pipeline' : 'Live Express Engine'}
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="alert-banner alert-danger my-4" role="alert">
                <AlertTriangle size={18} />
                <span className="text-sm font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Content Input Area */}
            <div className="form-group content-input-group mt-4">
              <div className="content-label-row">
                <label htmlFor="marketing-content" className="form-label">
                  Candidate Marketing Copy / Promotional Content
                </label>
                <div className="content-stats">
                  <span>{wordCount} words</span>
                  <span className="stat-separator">•</span>
                  <span>{charCount} characters</span>
                </div>
              </div>

              <textarea
                id="marketing-content"
                className="form-textarea checker-textarea"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Paste marketing copy, press releases, product announcements, or social copy to audit for brand compliance..."
                rows={8}
                disabled={isSubmitting}
                aria-required="true"
              />
            </div>

            {/* Toolbar Buttons */}
            <div className="checker-toolbar">
              <div className="toolbar-left">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleClear}
                  disabled={isSubmitting || !content}
                >
                  <RotateCcw size={14} /> Clear Text
                </button>
              </div>

              <div className="toolbar-right">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || !content.trim() || !companyName.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner-border animate-spin" />
                      <span>Auditing Compliance Rules...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>Audit Brand Compliance</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Multi-Industry Quick Evaluation Presets */}
          <div className="glass-card mt-6">
            <div className="card-header-styled mb-3">
              <div className="header-icon-pill icon-primary">
                <BookOpen size={16} />
              </div>
              <div>
                <h4 className="card-heading-sm">Universal Multi-Industry Evaluation Presets</h4>
                <p className="card-subheading-sm">
                  Click any industry below to instantly populate brand name, industry category, and representative test copy
                </p>
              </div>
            </div>

            <div className="samples-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {MULTI_INDUSTRY_PRESETS.map((preset, idx) => (
                <div
                  key={idx}
                  className="sample-item-card p-3 rounded-lg border border-white/10 hover:border-primary/50 transition cursor-pointer bg-white/5"
                  onClick={() => handleApplyPreset(preset)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleApplyPreset(preset);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-medium text-sm text-foreground">
                      {preset.icon}
                      <span>{preset.label}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      preset.isConfigured ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {preset.industry.split(' ')[0]}
                    </span>
                  </div>
                  <p className="text-xs text-muted line-clamp-2 mb-2">{preset.description}</p>
                  <div className="text-[11px] font-mono text-secondary/80 bg-black/20 p-1.5 rounded truncate">
                    "{preset.content}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
