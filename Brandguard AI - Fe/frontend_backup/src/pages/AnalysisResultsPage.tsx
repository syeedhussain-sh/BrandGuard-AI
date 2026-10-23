import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { IssueSeverity, IssueCategory, IssueItem } from '../types/analysis';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ArrowLeft,
  FileSearch,
  ShieldAlert,
  Sparkles,
  Info,
  Layers,
  Scale,
  BookOpen,
  Volume2
} from 'lucide-react';

export const AnalysisResultsPage: React.FC = () => {
  const {
    latestAnalysis,
    latestOriginalContent,
    latestBrandName,
    setActivePage,
    showToast
  } = useApp();

  const [copied, setCopied] = useState<boolean>(false);
  const [severityFilter, setSeverityFilter] = useState<'all' | IssueSeverity>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | IssueCategory>('all');
  const [viewMode, setViewMode] = useState<'corrected' | 'original' | 'split'>('corrected');

  // If no analysis exists yet, render clean empty state
  if (!latestAnalysis) {
    return (
      <div className="page-container results-page">
        <div className="empty-state glass-card p-12 text-center">
          <FileSearch size={52} className="text-muted mb-4 mx-auto" />
          <h2 className="text-xl font-bold mb-2">No Active Analysis Report</h2>
          <p className="text-secondary max-w-md mx-auto mb-6">
            Run an analysis on your marketing collateral through the Content Checker to view detailed issue
            classifications, governance diagnostics, and auto-generated compliant copy.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setActivePage('checker')}
          >
            <ArrowLeft size={16} />
            <span>Go to Content Checker</span>
          </button>
        </div>
      </div>
    );
  }

  const { summary, issues, correctedContent, analysisId, analysisMode } = latestAnalysis;

  // Filter issues by severity and category
  const filteredIssues = issues.filter((iss) => {
    const matchesSeverity = severityFilter === 'all' || iss.severity === severityFilter;
    const matchesCategory = categoryFilter === 'all' || iss.category === categoryFilter;
    return matchesSeverity && matchesCategory;
  });

  // Copy corrected content
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(correctedContent);
      setCopied(true);
      showToast('Corrected compliant content copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = correctedContent;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      showToast('Corrected compliant content copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const getSeverityBadgeClass = (severity: IssueSeverity) => {
    switch (severity) {
      case 'high':
        return 'badge-high';
      case 'medium':
        return 'badge-medium';
      case 'low':
        return 'badge-low';
      default:
        return 'badge-info';
    }
  };

  const getCategoryIcon = (category: IssueCategory) => {
    switch (category) {
      case 'restricted_phrase':
        return <AlertTriangle size={13} />;
      case 'claim_verification':
        return <Scale size={13} />;
      case 'terminology':
        return <BookOpen size={13} />;
      case 'tone':
        return <Volume2 size={13} />;
      case 'missing_term':
        return <Layers size={13} />;
      default:
        return <Info size={13} />;
    }
  };

  return (
    <div className="page-container results-page">
      {/* Top Navigation & Meta Header */}
      <div className="results-top-bar glass-card mb-6">
        <div className="results-meta">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setActivePage('checker')}
          >
            <ArrowLeft size={15} />
            <span>Return to Content Checker</span>
          </button>
          <div className="meta-info">
            <span className="badge badge-brand">{latestBrandName}</span>
            <span className="analysis-id-badge">
              ID: <code>{analysisId || 'analysis-current'}</code>
            </span>
            {analysisMode && (
              <span className="badge badge-info">Mode: {analysisMode}</span>
            )}
          </div>
        </div>

        <div className="results-actions">
          <button
            className={`btn ${copied ? 'btn-secondary' : 'btn-primary'} btn-sm`}
            onClick={handleCopy}
            disabled={!correctedContent}
          >
            {copied ? (
              <>
                <Check size={16} className="text-success" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy Corrected Content</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards: Total, High, Medium, Low */}
      <section className="results-summary-grid mb-6" aria-label="Governance Audit Summary">
        {/* Total Issues */}
        <div
          className={`stat-card glass-card ${severityFilter === 'all' && categoryFilter === 'all' ? 'active-filter-card' : ''}`}
          onClick={() => {
            setSeverityFilter('all');
            setCategoryFilter('all');
          }}
          role="button"
          tabIndex={0}
        >
          <div className="stat-card-header">
            <span className="stat-label">Total Issues Detected</span>
            <div className="stat-icon-wrapper icon-primary">
              <ShieldAlert size={20} />
            </div>
          </div>
          <div className="stat-value">{summary.totalIssues}</div>
          <div className="stat-footer">
            <span className="stat-subtext">across evaluated copy</span>
          </div>
        </div>

        {/* High Severity */}
        <div
          className={`stat-card glass-card ${severityFilter === 'high' ? 'active-filter-card' : ''}`}
          onClick={() => setSeverityFilter(severityFilter === 'high' ? 'all' : 'high')}
          role="button"
          tabIndex={0}
        >
          <div className="stat-card-header">
            <span className="stat-label">High Severity</span>
            <div className="stat-icon-wrapper icon-danger">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="stat-value text-danger">{summary.high}</div>
          <div className="stat-footer">
            <span className="badge badge-high">Restricted & Violations</span>
          </div>
        </div>

        {/* Medium Severity */}
        <div
          className={`stat-card glass-card ${severityFilter === 'medium' ? 'active-filter-card' : ''}`}
          onClick={() => setSeverityFilter(severityFilter === 'medium' ? 'all' : 'medium')}
          role="button"
          tabIndex={0}
        >
          <div className="stat-card-header">
            <span className="stat-label">Medium Severity</span>
            <div className="stat-icon-wrapper icon-warning">
              <Layers size={20} />
            </div>
          </div>
          <div className="stat-value text-warning">{summary.medium}</div>
          <div className="stat-footer">
            <span className="badge badge-medium">Tone & Terminology</span>
          </div>
        </div>

        {/* Low Severity */}
        <div
          className={`stat-card glass-card ${severityFilter === 'low' ? 'active-filter-card' : ''}`}
          onClick={() => setSeverityFilter(severityFilter === 'low' ? 'all' : 'low')}
          role="button"
          tabIndex={0}
        >
          <div className="stat-card-header">
            <span className="stat-label">Low Severity</span>
            <div className="stat-icon-wrapper icon-success">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="stat-value text-success">{summary.low}</div>
          <div className="stat-footer">
            <span className="badge badge-low">Minor Polish</span>
          </div>
        </div>
      </section>

      {/* Main 2-Column Split View: Corrected Content & Detailed Issues */}
      <div className="results-content-grid">
        {/* Left Column: Corrected Content Card */}
        <section className="corrected-content-card glass-card">
          <div className="section-header">
            <div>
              <h3 className="section-title flex-align">
                <Sparkles size={18} className="text-primary" />
                <span>Auto-Corrected Brand Content</span>
              </h3>
              <p className="section-subtitle">
                Synthesized copy conforming strictly with official terminology, tone, and legal governance
              </p>
            </div>

            <button
              className={`btn ${copied ? 'btn-secondary' : 'btn-primary'} btn-sm`}
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check size={14} className="text-success" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Corrected</span>
                </>
              )}
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="view-mode-tabs mb-3">
            <button
              className={`mode-tab ${viewMode === 'corrected' ? 'active' : ''}`}
              onClick={() => setViewMode('corrected')}
            >
              Corrected Copy
            </button>
            <button
              className={`mode-tab ${viewMode === 'original' ? 'active' : ''}`}
              onClick={() => setViewMode('original')}
            >
              Original Copy
            </button>
            <button
              className={`mode-tab ${viewMode === 'split' ? 'active' : ''}`}
              onClick={() => setViewMode('split')}
            >
              Side-by-Side Comparison
            </button>
          </div>

          {/* Text Display Boxes */}
          {viewMode === 'corrected' && (
            <div className="content-preview-box corrected-box">
              <pre className="content-text">{correctedContent}</pre>
            </div>
          )}

          {viewMode === 'original' && (
            <div className="content-preview-box original-box">
              <pre className="content-text">{latestOriginalContent}</pre>
            </div>
          )}

          {viewMode === 'split' && (
            <div className="split-preview-grid">
              <div className="split-col">
                <div className="split-label text-danger">Original Submitted Copy</div>
                <div className="content-preview-box original-box">
                  <pre className="content-text text-sm">{latestOriginalContent}</pre>
                </div>
              </div>
              <div className="split-col">
                <div className="split-label text-success">Compliant Corrected Copy</div>
                <div className="content-preview-box corrected-box">
                  <pre className="content-text text-sm">{correctedContent}</pre>
                </div>
              </div>
            </div>
          )}

          <div className="corrected-footer">
            <div className="footer-notice">
              <Info size={14} className="text-primary" />
              <span>Corrected copy verified against {latestBrandName} policies</span>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setActivePage('checker')}
            >
              Analyze Another Document
            </button>
          </div>
        </section>

        {/* Right Column: Detailed Issues List */}
        <section className="issues-list-section glass-card">
          <div className="section-header">
            <div>
              <h3 className="section-title">
                Detailed Issue Diagnostics ({filteredIssues.length})
              </h3>
              <p className="section-subtitle">
                Category classifications, matched text triggers, and suggested replacements
              </p>
            </div>

            {/* Severity Filter Pills */}
            <div className="filter-pill-group">
              <button
                className={`filter-btn ${severityFilter === 'all' ? 'active' : ''}`}
                onClick={() => setSeverityFilter('all')}
              >
                All ({summary.totalIssues})
              </button>
              <button
                className={`filter-btn filter-high ${severityFilter === 'high' ? 'active' : ''}`}
                onClick={() => setSeverityFilter('high')}
              >
                High ({summary.high})
              </button>
              <button
                className={`filter-btn filter-med ${severityFilter === 'medium' ? 'active' : ''}`}
                onClick={() => setSeverityFilter('medium')}
              >
                Med ({summary.medium})
              </button>
              <button
                className={`filter-btn filter-low ${severityFilter === 'low' ? 'active' : ''}`}
                onClick={() => setSeverityFilter('low')}
              >
                Low ({summary.low})
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="category-filter-row mb-4">
            <span className="text-xs text-muted">Category:</span>
            {(['all', 'terminology', 'restricted_phrase', 'tone', 'claim_verification', 'missing_term'] as const).map((cat) => (
              <button
                key={cat}
                className={`category-filter-pill ${categoryFilter === cat ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat === 'all' ? 'All Categories' : cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          {filteredIssues.length === 0 ? (
            <div className="clean-audit-box">
              <CheckCircle2 size={38} className="text-success mb-2" />
              <h4 className="clean-title">No issues found in this filter category!</h4>
              <p className="clean-desc">
                {summary.totalIssues === 0
                  ? 'All evaluated copy conforms 100% with the brand guidelines.'
                  : 'Try selecting "All" to view issues in other severity tiers or categories.'}
              </p>
            </div>
          ) : (
            <div className="issues-stack">
              {filteredIssues.map((issue: IssueItem, index: number) => (
                <div key={issue.id || index} className="issue-card">
                  {/* Issue Header */}
                  <div className="issue-header">
                    <div className="issue-badges">
                      <span className={`badge ${getSeverityBadgeClass(issue.severity)}`}>
                        {issue.severity} severity
                      </span>
                      <span className="badge badge-brand flex-align gap-1">
                        {getCategoryIcon(issue.category)}
                        <span>{issue.category.replace('_', ' ')}</span>
                      </span>
                    </div>
                    <span className="issue-id">#{issue.id || `iss_${index + 1}`}</span>
                  </div>

                  {/* Matched Text Quote */}
                  <div className="matched-text-wrapper">
                    <span className="matched-text-label">Triggered By:</span>
                    <code className="matched-quote">"{issue.matchedText}"</code>
                  </div>

                  {/* Explanation */}
                  <div className="issue-explanation">
                    <div className="explanation-title">Policy Explanation:</div>
                    <p className="explanation-text">{issue.explanation}</p>
                  </div>

                  {/* Suggested Correction */}
                  <div className="suggestion-box">
                    <span className="suggestion-label">Suggested Replacement:</span>
                    <span className="suggestion-text">{issue.suggestion}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
