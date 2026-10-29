import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { IssueSeverity, IssueCategory, IssueItem } from '../types/analysis';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
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
    activeCompanyName,
    activeIndustry,
    isAuditing,
    auditError,
    auditingBrandName,
    currentReview,
    loadReviewForAnalysis,
    submitReviewDecision,
    setActivePage,
    showToast
  } = useApp();

  const [copied, setCopied] = useState<boolean>(false);
  const [severityFilter, setSeverityFilter] = useState<'all' | IssueSeverity>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | IssueCategory>('all');
  const [viewMode, setViewMode] = useState<'corrected' | 'original' | 'split'>('corrected');

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved');
  const [reviewerName, setReviewerName] = useState<string>('Brand Compliance Officer');
  const [reviewerRole, setReviewerRole] = useState<string>('Marketing Review Lead');
  const [reviewerEmail, setReviewerEmail] = useState<string>('');
  const [approvalNotes, setApprovalNotes] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  // Rehydrate review on mount or analysisId change to survive page refreshes
  useEffect(() => {
    if (latestAnalysis?.analysisId) {
      loadReviewForAnalysis(latestAnalysis.analysisId);
    }
  }, [latestAnalysis?.analysisId, loadReviewForAnalysis]);

  // 1. Loading state when an audit is currently in progress
  if (isAuditing) {
    const targetBrand = auditingBrandName || activeCompanyName;
    return (
      <div className="page-container results-page">
        <div className="empty-state glass-card p-12 text-center" role="status" aria-live="polite">
          <div className="flex justify-center mb-6">
            <div className="relative flex items-center justify-center">
              <div
                className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"
                style={{ animationDuration: '0.8s' }}
              />
              <Sparkles size={24} className="absolute text-primary animate-pulse" />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">Auditing Brand Compliance for {targetBrand}...</h2>
          <p className="text-secondary max-w-lg mx-auto mb-6 text-sm">
            Evaluating candidate content against brand identity, competitor rules, restricted marketing phrases,
            and regulatory claim policies.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            Governance Audit in Progress
          </div>
        </div>
      </div>
    );
  }

  // 2. Clear error state when audit request failed
  if (auditError && !latestAnalysis) {
    return (
      <div className="page-container results-page">
        <div className="empty-state glass-card p-12 text-center border-red-500/30">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertTriangle size={32} />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2 text-red-300">Brand Compliance Audit Failed</h2>
          <p className="text-secondary max-w-lg mx-auto mb-6 text-sm">
            {auditError}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setActivePage('checker')}
          >
            <ArrowLeft size={16} />
            <span>Return to Content Checker</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Stale result mismatch protection: verify analysis belongs to the currently active company
  const resultBrand = (latestAnalysis?.companyName || latestAnalysis?.brandName || '').trim().toLowerCase();
  const currentActive = (activeCompanyName || '').trim().toLowerCase();
  const isMismatched = Boolean(latestAnalysis && resultBrand && currentActive && resultBrand !== currentActive);

  // If no analysis exists yet or belongs to a different company, render clean empty state
  if (!latestAnalysis || isMismatched) {
    return (
      <div className="page-container results-page">
        <div className="empty-state glass-card p-12 text-center">
          <FileSearch size={52} className="text-muted mb-4 mx-auto" />
          <h2 className="text-xl font-bold mb-2">No Active Analysis Report for {activeCompanyName}</h2>
          <p className="text-secondary max-w-md mx-auto mb-6">
            Run an analysis on marketing collateral for <strong>{activeCompanyName}</strong> through the Content Checker to view detailed issue
            classifications, governance diagnostics, and auto-generated compliant copy.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setActivePage('checker')}
          >
            <ArrowLeft size={16} />
            <span>Analyze Content for {activeCompanyName}</span>
          </button>
        </div>
      </div>
    );
  }

  const {
    summary,
    issues,
    correctedContent,
    analysisId,
    analysisMode,
    companyName,
    industry,
    governanceMode,
    modeLabel,
    officialGuidelinesConfigured,
    disclaimer,
    supportedClaims,
    claimVerificationSummary
  } = latestAnalysis;

  const displayCompanyName = companyName || latestAnalysis.brandName || latestBrandName || activeCompanyName;
  const isGeneric = governanceMode === 'generic' || !officialGuidelinesConfigured;
  const claimVerificationCount = issues.filter((iss) => iss.category === 'claim_verification' || iss.verificationStatus).length;

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
      case 'brand_identity':
      case 'competitor_brand':
        return <ShieldAlert size={13} />;
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

  const openReviewModal = (action: 'approved' | 'rejected') => {
    setReviewAction(action);
    setReviewError(null);
    if (action === 'approved') {
      setApprovalNotes(currentReview?.notes || '');
    } else {
      setRejectionReason(currentReview?.rejectionReason || '');
    }
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim()) {
      setReviewError('Reviewer name is required.');
      return;
    }
    if (reviewAction === 'rejected' && !rejectionReason.trim()) {
      setReviewError('Rejection reason is mandatory when rejecting content.');
      return;
    }

    setIsSubmittingReview(true);
    setReviewError(null);
    try {
      const ok = await submitReviewDecision({
        analysisId: latestAnalysis.analysisId,
        brandId: latestAnalysis.companyName?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'brand',
        brandName: displayCompanyName,
        companyName: displayCompanyName,
        industry: industry || activeIndustry,
        contentSnippet: latestOriginalContent?.slice(0, 160) || '',
        status: reviewAction,
        reviewerName: reviewerName.trim(),
        reviewerRole: reviewerRole.trim() || undefined,
        reviewerEmail: reviewerEmail.trim() || undefined,
        notes: approvalNotes.trim() || undefined,
        rejectionReason: reviewAction === 'rejected' ? rejectionReason.trim() : undefined,
        allowUpdate: true,
      });

      if (ok) {
        setIsReviewModalOpen(false);
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="page-container results-page">
      {/* Top Navigation & Meta Header */}
      <div className="results-top-bar glass-card mb-4">
        <div className="results-meta">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setActivePage('checker')}
          >
            <ArrowLeft size={15} />
            <span>Return to Content Checker</span>
          </button>
          <div className="meta-info">
            <span className="badge badge-brand">{displayCompanyName}</span>
            {industry && (
              <span className="badge badge-info" style={{ textTransform: 'none' }}>
                Industry: {industry}
              </span>
            )}
            <span className="analysis-id-badge">
              ID: <code>{analysisId || 'analysis-current'}</code>
            </span>
            {analysisMode && (
              <span className="badge badge-info" style={{ textTransform: 'none' }}>
                Engine: {analysisMode}
              </span>
            )}
            {isGeneric ? (
              <span className="badge badge-warning">Generic Mode</span>
            ) : (
              <span className="badge badge-low">Configured Profile</span>
            )}
          </div>
        </div>

        <div className="results-actions flex items-center gap-2">
          <button
            className="btn btn-sm btn-outline text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/10 flex items-center gap-1.5"
            onClick={() => openReviewModal('approved')}
            id="btn-approve-copy"
          >
            <CheckCircle2 size={15} />
            <span>{currentReview?.status === 'approved' ? 'Update Approval' : 'Approve Copy'}</span>
          </button>
          <button
            className="btn btn-sm btn-outline text-rose-400 border-rose-500/40 hover:bg-rose-500/10 flex items-center gap-1.5"
            onClick={() => openReviewModal('rejected')}
            id="btn-reject-copy"
          >
            <XCircle size={15} />
            <span>{currentReview?.status === 'rejected' ? 'Update Rejection' : 'Reject Copy'}</span>
          </button>
          <button
            className={`btn ${copied ? 'btn-secondary' : 'btn-primary'} btn-sm`}
            onClick={handleCopy}
            disabled={!correctedContent}
          >
            {copied ? (
              <>
                <Check size={16} className="text-success" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy Corrected</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Review Decision Banner */}
      {currentReview?.status === 'approved' && (
        <div className="review-decision-card approved glass-card mb-4 p-4 border border-emerald-500/30 bg-emerald-950/20 rounded-xl flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={24} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold text-base">Content Approved for Publication</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Approved
                </span>
              </div>
              <p className="text-sm text-secondary mt-1 mb-0">
                Reviewed and approved by <strong className="text-white">{currentReview.reviewerName}</strong>
                {currentReview.reviewerRole ? ` (${currentReview.reviewerRole})` : ''} on {new Date(currentReview.updatedAt).toLocaleString()}.
              </p>
              {currentReview.notes && (
                <p className="text-xs text-secondary/80 mt-1 italic">
                  Approval Notes: "{currentReview.notes}"
                </p>
              )}
            </div>
          </div>
          <button
            className="btn btn-outline btn-sm text-xs border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-300"
            onClick={() => openReviewModal('approved')}
          >
            Update Review
          </button>
        </div>
      )}

      {currentReview?.status === 'rejected' && (
        <div className="review-decision-card rejected glass-card mb-4 p-4 border border-rose-500/30 bg-rose-950/20 rounded-xl flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <XCircle size={24} className="text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-rose-400 font-bold text-base">Content Rejected</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Rejected
                </span>
              </div>
              <p className="text-sm text-secondary mt-1 mb-0">
                Rejected by <strong className="text-white">{currentReview.reviewerName}</strong>
                {currentReview.reviewerRole ? ` (${currentReview.reviewerRole})` : ''} on {new Date(currentReview.updatedAt).toLocaleString()}.
              </p>
              {currentReview.rejectionReason && (
                <div className="mt-2 p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/20 text-xs text-rose-200">
                  <strong>Rejection Reason:</strong> {currentReview.rejectionReason}
                </div>
              )}
            </div>
          </div>
          <button
            className="btn btn-outline btn-sm text-xs border-rose-500/30 hover:bg-rose-500/10 text-rose-300"
            onClick={() => openReviewModal('rejected')}
          >
            Revise Decision
          </button>
        </div>
      )}

      {(!currentReview || currentReview.status === 'pending') && (
        <div className="review-decision-card pending glass-card mb-4 p-4 border border-amber-500/30 bg-amber-950/20 rounded-xl flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Clock size={24} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold text-base">Pending Human Compliance Review</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Pending Review
                </span>
              </div>
              <p className="text-sm text-secondary mt-1 mb-0">
                This copy has flagged compliance items or SLA policies requiring formal sign-off before publication.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              className="btn btn-sm btn-outline text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/10 flex items-center gap-1.5"
              onClick={() => openReviewModal('approved')}
            >
              <CheckCircle2 size={14} />
              <span>Approve</span>
            </button>
            <button
              className="btn btn-sm btn-outline text-rose-400 border-rose-500/40 hover:bg-rose-500/10 flex items-center gap-1.5"
              onClick={() => openReviewModal('rejected')}
            >
              <XCircle size={14} />
              <span>Reject</span>
            </button>
          </div>
        </div>
      )}

      {/* Governance Mode Alert Banner */}
      {isGeneric ? (
        <div className="analysis-mode-banner generic">
          <AlertTriangle size={22} className="text-warning shrink-0" style={{ marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fbbf24', marginBottom: '0.25rem' }}>
              {modeLabel || 'Generic Brand Analysis — Official Brand Guidelines Not Configured'}
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {disclaimer ||
                `Evaluated using universal brand governance principles (clarity, claim risks, terminology consistency, tone, and messaging integrity). Official brand guidelines and restrictions are not configured for "${displayCompanyName}". Potential issues are general risk indicators, not official company or regulatory findings.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="analysis-mode-banner configured">
          <CheckCircle2 size={22} className="text-primary shrink-0" style={{ marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#818cf8', marginBottom: '0.25rem' }}>
              Configured Brand Governance Analysis
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Evaluated strictly against official brand rules, registered terminology, tone standards, and claim requirements configured for {displayCompanyName}.
            </p>
          </div>
        </div>
      )}

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
          {((latestAnalysis as any)?.requiresHumanReview ||
            issues.some((i) => i.requiresHumanReview) ||
            (correctedContent && correctedContent.includes('Requires Human Review'))) && (
            <div
              className="alert-banner alert-warning mb-3 flex items-start gap-2.5"
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                background: 'rgba(245, 158, 11, 0.08)'
              }}
            >
              <AlertTriangle size={18} className="text-warning flex-shrink-0 mt-0.5" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#f59e0b' }}>
                  Human Editorial Review Required
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Content references competitor brand or proprietary data that cannot be safely auto-corrected without risk of misinformation. Manual review is required before publication.
                </div>
              </div>
            </div>
          )}

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
              <span>
                {isGeneric
                  ? 'Corrected copy generated using universal brand governance principles'
                  : `Corrected copy verified against ${displayCompanyName} policies`}
              </span>
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

          {/* Claims Requiring Verification & Evidence Substantiation Callout Banner */}
          {(claimVerificationCount > 0 || (supportedClaims && supportedClaims.length > 0)) && (
            <div className="claim-verification-banner mb-4">
              <div className="flex-align gap-2">
                <Scale size={18} style={{ color: '#c084fc', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                    Evidence-Based Claim Verification Diagnostics
                  </div>
                  <div style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }} className="flex-align gap-2 flex-wrap">
                    {supportedClaims && supportedClaims.length > 0 && (
                      <span className="badge badge-success text-xs" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' }}>
                        ✓ {supportedClaims.length} Supported by Approved Fact
                      </span>
                    )}
                    {claimVerificationSummary?.unsupportedClaimsCount ? (
                      <span className="badge badge-high text-xs">
                        {claimVerificationSummary.unsupportedClaimsCount} Unsupported Absolute Claims
                      </span>
                    ) : null}
                    {claimVerificationSummary?.requiresReviewCount ? (
                      <span className="badge badge-medium text-xs">
                        {claimVerificationSummary.requiresReviewCount} Requiring Empirical Benchmark Review
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <button
                className={`btn btn-sm ${categoryFilter === 'claim_verification' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                onClick={() => setCategoryFilter(categoryFilter === 'claim_verification' ? 'all' : 'claim_verification')}
              >
                {categoryFilter === 'claim_verification' ? 'Show All Categories' : 'Filter Claims'}
              </button>
            </div>
          )}

          {/* Supported & Verified Brand Claims (Substantiated without flagging errors) */}
          {supportedClaims && supportedClaims.length > 0 && (
            <div className="supported-claims-card mb-4 p-4 rounded-lg" style={{
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '10px'
            }}>
              <div className="flex-align gap-2 mb-2">
                <CheckCircle2 size={18} className="text-success" />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#22c55e' }}>
                  Substantiated Brand Claims ({supportedClaims.length}) — No Error Flagged
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {supportedClaims.map((claim, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    borderLeft: '3px solid #22c55e'
                  }}>
                    <div className="flex-align justify-between gap-2 mb-1">
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        "{claim.claimText}"
                      </span>
                      <span className="badge badge-success text-xs shrink-0">Supported</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#86efac', marginTop: '0.25rem' }}>
                      <strong>Approved Evidence:</strong> {claim.evidenceCitation || claim.supportingFact}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter Pills */}
          <div className="category-filter-row mb-4">
            <span className="text-xs text-muted">Category:</span>
            {(['all', 'brand_identity', 'terminology', 'restricted_phrase', 'tone', 'claim_verification', 'missing_term'] as const).map((cat) => {
              const count = cat === 'all' ? summary.totalIssues : issues.filter((iss) => iss.category === cat).length;
              return (
                <button
                  key={cat}
                  className={`category-filter-pill ${categoryFilter === cat ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat === 'all' ? `All (${count})` : `${cat.replace('_', ' ')} (${count})`}
                </button>
              );
            })}
          </div>

          {filteredIssues.length === 0 ? (
            <div className="clean-audit-box">
              <CheckCircle2 size={38} className="text-success mb-2" />
              <h4 className="clean-title">{summary.totalIssues === 0 ? 'Compliant Copy — All Governance Checks Passed' : 'No issues found in this filter category!'}</h4>
              <p className="clean-desc">
                {summary.totalIssues === 0
                  ? isGeneric
                    ? `All evaluated copy complies with universal brand governance principles and ${industry || activeIndustry || 'industry'} risk checks. No brand-name mismatches, prohibited superlatives, misleading claims, or tone violations were detected.`
                    : `All evaluated copy complies with official ${displayCompanyName} brand guidelines and compliance rules. No brand mismatches, terminology violations, prohibited phrases, or tone issues were detected.`
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
                      {issue.verificationStatus && (
                        <span className={`badge ${issue.verificationStatus === 'supported' ? 'badge-success' : issue.verificationStatus === 'unsupported' ? 'badge-high' : 'badge-medium'}`}>
                          {issue.verificationStatus === 'supported' ? 'Supported' : issue.verificationStatus === 'unsupported' ? 'Unsupported Claim' : 'Requires Evidence Review'}
                        </span>
                      )}
                      {issue.requiresHumanReview && (
                        <span className="badge badge-warning flex-align gap-1" style={{ fontSize: '0.72rem' }}>
                          <AlertTriangle size={12} />
                          <span>Human Review Required</span>
                        </span>
                      )}
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

                  {/* Evidence Citation Reference if applicable */}
                  {(issue.evidenceCitation || issue.supportingFact) && (
                    <div className="evidence-box mt-2 p-2 rounded" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#818cf8' }}>Evidence Reference: </span>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{issue.evidenceCitation || issue.supportingFact}</span>
                    </div>
                  )}

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

      {/* Review & Approval Modal */}
      {isReviewModalOpen && (
        <div
          className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)' }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="glass-card max-w-lg w-full p-6 rounded-2xl shadow-2xl relative"
            style={{ background: '#111827', border: '1px solid rgba(255, 255, 255, 0.15)' }}
          >
            <div className="flex items-center justify-between pb-3 mb-4" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div className="flex items-center gap-2">
                {reviewAction === 'approved' ? (
                  <>
                    <CheckCircle2 size={22} className="text-emerald-400" />
                    <h3 className="text-lg font-bold text-white m-0">Approve Marketing Copy</h3>
                  </>
                ) : (
                  <>
                    <XCircle size={22} className="text-rose-400" />
                    <h3 className="text-lg font-bold text-white m-0">Reject Marketing Copy</h3>
                  </>
                )}
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm text-sm"
                onClick={() => setIsReviewModalOpen(false)}
                style={{ padding: '2px 8px' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleReviewSubmit}>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-secondary mb-1">
                  Reviewer Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  className="input-field w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm"
                  placeholder="e.g., Sarah Jenkins"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">
                    Role / Title (Optional)
                  </label>
                  <input
                    type="text"
                    className="input-field w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm"
                    placeholder="e.g., Compliance Lead"
                    value={reviewerRole}
                    onChange={(e) => setReviewerRole(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    className="input-field w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm"
                    placeholder="e.g., sarah@company.com"
                    value={reviewerEmail}
                    onChange={(e) => setReviewerEmail(e.target.value)}
                  />
                </div>
              </div>

              {reviewAction === 'rejected' ? (
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-secondary mb-1">
                    Rejection Reason <span className="text-rose-400">* (Mandatory)</span>
                  </label>
                  <textarea
                    rows={3}
                    className="input-field w-full px-3 py-2 rounded-lg bg-black/40 border border-rose-500/40 text-white text-sm"
                    placeholder="Provide specific justification for rejection and required corrections..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-secondary mb-1">
                    Approval Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    className="input-field w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm"
                    placeholder="e.g., Approved under Enterprise SLA terms."
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                  />
                </div>
              )}

              {reviewError && (
                <div className="mb-3 p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300">
                  {reviewError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 mt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setIsReviewModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className={`btn btn-sm ${
                    reviewAction === 'approved'
                      ? 'btn-success bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'btn-danger bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                  style={{ minWidth: '130px' }}
                >
                  {isSubmittingReview
                    ? 'Submitting...'
                    : reviewAction === 'approved'
                    ? 'Confirm Approval'
                    : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
