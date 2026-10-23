import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { serviceManager } from '../services/serviceManager';
import {
  FileCheck2,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Server,
  Zap
} from 'lucide-react';

const SAMPLE_COPY_OPTIONS = [
  {
    title: 'Official Contract Demo (Section 3.5.2)',
    description: 'Triggers terminology, superlatives, tone degradation, absolute claims, and SLA guarantee patterns',
    content:
      'Our Nova Cloud is the cheapest cloud in the market and it is obviously 100% bug-free. We guarantee total perfection.'
  },
  {
    title: 'Enterprise AI Launch Draft',
    description: 'Contains discouraged phrasing (AI assistant, client) and absolute failure claims',
    content:
      'NovaTech is proud to introduce our new AI assistant. Designed for every single client, this solution can never fail and is cheap to implement.'
  },
  {
    title: '100% Compliant Enterprise Release',
    description: 'Adheres strictly to official terminology, required brand mentions, and measured tone',
    content:
      'NovaTech Cloud Platform delivers Enterprise-grade Autonomous Intelligence for regulated organizations. Engineered for high reliability and resilience, our solutions commit to high availability under our standard SLA.'
  }
];

export const ContentCheckerPage: React.FC = () => {
  const {
    brands,
    selectedBrandId,
    setSelectedBrandId,
    recordAnalysis,
    setActivePage,
    serviceStatus,
    showToast,
    setMockMode
  } = useApp();

  const [content, setContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  const handleSelectSample = (sampleText: string) => {
    setContent(sampleText);
    setErrorMessage(null);
  };

  const handleClear = () => {
    setContent('');
    setErrorMessage(null);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation matching contract Section 3.5.3:
    // 1. brandId: non-empty string
    if (!selectedBrandId || !selectedBrandId.trim()) {
      setErrorMessage('Please select a target brand profile.');
      return;
    }

    // 2. content: non-empty string (trimmed length >= 1)
    if (!content.trim()) {
      setErrorMessage('Content is required. Please provide marketing copy or click a preset sample below.');
      return;
    }

    setIsSubmitting(true);

    try {
      const activeBrand = brands.find((b) => b.id === selectedBrandId) || {
        id: selectedBrandId,
        name: selectedBrandId === 'demo-brand' ? 'NovaTech' : selectedBrandId
      };

      const { response, source } = await serviceManager.analyzeContent({
        brandId: selectedBrandId,
        content: content.trim()
      });

      // Record to history and state
      recordAnalysis(selectedBrandId, activeBrand.name, content.trim(), response);

      showToast(
        `Analysis complete! Found ${response.summary.totalIssues} compliance issue(s) via ${
          source === 'mock' ? 'Dev Mock Adapter' : 'Live Backend API'
        }.`,
        'success'
      );

      // Navigate to results
      setActivePage('results');
    } catch (err: unknown) {
      const errorStr =
        err instanceof Error ? err.message : 'Analysis request failed against backend server.';
      setErrorMessage(errorStr);
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
              <strong>Dev Mock Mode</strong> in the sidebar to test compliance auditing offline.
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
            {/* Header / Brand Selector */}
            <div className="checker-header">
              <div className="checker-brand-control">
                <label htmlFor="target-brand" className="form-label mb-1">
                  Target Brand Governance Profile
                </label>
                <select
                  id="target-brand"
                  className="form-select"
                  value={selectedBrandId}
                  onChange={(e) => setSelectedBrandId(e.target.value)}
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.id})
                    </option>
                  ))}
                  {brands.length === 0 && <option value="demo-brand">NovaTech (demo-brand)</option>}
                </select>
              </div>

              <div className="mode-tag-display">
                <span className="text-muted text-xs">Engine Pipeline:</span>
                {serviceStatus.isMockMode ? (
                  <span className="badge badge-medium">Dev Mock Adapter</span>
                ) : (
                  <span className="badge badge-low">Live Backend (POST /api/analyze)</span>
                )}
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
                  Candidate Marketing Content / Draft Text
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
                placeholder="Paste marketing copy, press releases, social collateral, or website copy here to audit for compliance..."
                rows={9}
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
                  disabled={isSubmitting || !content.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner-border animate-spin" />
                      <span>Auditing Compliance Rules...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>Run Compliance Analysis</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Quick Demo Samples Box */}
          <div className="glass-card mt-6">
            <div className="card-header-styled mb-3">
              <div className="header-icon-pill icon-primary">
                <BookOpen size={16} />
              </div>
              <div>
                <h4 className="card-heading-sm">Quick Evaluation Presets</h4>
                <p className="card-subheading-sm">
                  Click any preset below to instantly load test copy defined in the API contract specifications
                </p>
              </div>
            </div>

            <div className="samples-grid">
              {SAMPLE_COPY_OPTIONS.map((sample, idx) => (
                <div
                  key={idx}
                  className="sample-item-card"
                  onClick={() => handleSelectSample(sample.content)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectSample(sample.content);
                    }
                  }}
                >
                  <div className="sample-card-header">
                    <span className="sample-card-title">{sample.title}</span>
                    <span className="badge badge-brand">
                      <Zap size={11} /> Load Sample
                    </span>
                  </div>
                  <p className="sample-card-desc">{sample.description}</p>
                  <p className="sample-preview-text">"{sample.content}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Checker Sidebar Guidelines Reference */}
        <aside className="checker-sidebar glass-card">
          <h4 className="sidebar-heading">
            <FileCheck2 size={18} className="text-primary" />
            <span>Active Policy Rules</span>
          </h4>
          <p className="sidebar-desc">
            Candidate copy is evaluated against 5 core governance dimensions:
          </p>

          <div className="audit-rule-item">
            <span className="rule-badge badge-high">High</span>
            <div>
              <div className="rule-name">Restricted Phrases</div>
              <div className="rule-subtext">Absolute reliability claims & prohibited superlatives</div>
            </div>
          </div>

          <div className="audit-rule-item">
            <span className="rule-badge badge-high">High</span>
            <div>
              <div className="rule-name">Claim Verification</div>
              <div className="rule-subtext">Unverified guarantees or SLA warranties</div>
            </div>
          </div>

          <div className="audit-rule-item">
            <span className="rule-badge badge-high">High</span>
            <div>
              <div className="rule-name">Terminology Glossary</div>
              <div className="rule-subtext">Official product name vs discouraged abbreviations</div>
            </div>
          </div>

          <div className="audit-rule-item">
            <span className="rule-badge badge-medium">Med</span>
            <div>
              <div className="rule-name">Tone & Voice Violations</div>
              <div className="rule-subtext">Condescending words, hype, slang, or colloquialisms</div>
            </div>
          </div>

          <div className="audit-rule-item">
            <span className="rule-badge badge-low">Low</span>
            <div>
              <div className="rule-name">Required Terms</div>
              <div className="rule-subtext">Mandatory brand name references and disclosures</div>
            </div>
          </div>

          <div className="api-contract-pill mt-6">
            <div className="contract-header">
              <Server size={14} /> Shared API Contract
            </div>
            <code>POST /api/analyze</code>
            <pre className="contract-snippet">
{`{
  "brandId": "${selectedBrandId}",
  "content": "..."
}`}
            </pre>
          </div>
        </aside>
      </div>
    </div>
  );
};
