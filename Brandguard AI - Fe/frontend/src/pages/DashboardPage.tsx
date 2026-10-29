import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  XCircle,
  FileSearch,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Clock,
  Sparkles,
  ExternalLink,
  Layers,
  Trash2,
  Tag
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    setActivePage,
    recentAnalyses,
    viewAnalysisResult,
    clearHistory,
    serviceStatus,
    currentProfile,
    selectedBrandId,
    activeCompanyName,
    activeIndustry,
    activeGovernanceMode,
    reviewMetrics,
    loadReviewMetrics
  } = useApp();

  useEffect(() => {
    loadReviewMetrics();
  }, [loadReviewMetrics]);

  const isConfigured = activeGovernanceMode === 'configured';
  const displayCompanyName = activeCompanyName || currentProfile?.name || 'NovaTech';

  // Metrics calculated from history
  const totalAnalyses = recentAnalyses.length;
  const totalIssuesDetected = recentAnalyses.reduce((acc, curr) => acc + curr.totalIssues, 0);
  const totalWordsChecked = recentAnalyses.reduce((acc, curr) => acc + curr.wordCount, 0);
  const totalCharsChecked = recentAnalyses.reduce((acc, curr) => acc + curr.characterCount, 0);
  const totalHighIssues = recentAnalyses.reduce((acc, curr) => acc + curr.highSeverity, 0);

  // Compliance score calculation: ratio of checks without high severity issues
  const complianceScore =
    totalAnalyses > 0
      ? Math.max(0, Math.min(100, Math.round(((totalAnalyses - totalHighIssues) / totalAnalyses) * 100)))
      : 100;

  const g = currentProfile?.guidelines || {};
  const terminologyCount = g.terminology?.length ?? 0;
  const restrictedCount = g.restrictedPhrases?.length ?? 0;
  const claimCount = g.claimVerification?.length ?? 0;
  const requiredCount = g.requiredTerms?.length ?? 0;

  return (
    <div className="page-container dashboard-page">
      {/* Offline Alert Banner if backend is disconnected and not in mock mode */}
      {!serviceStatus.isBackendConnected && !serviceStatus.isMockMode && (
        <div className="alert-banner alert-warning mb-6">
          <div className="alert-content">
            <AlertTriangle className="alert-icon" size={20} />
            <div>
              <h4 className="alert-title">Backend Server Offline ({serviceStatus.backendUrl})</h4>
              <p className="alert-desc">
                The BrandGuard AI backend service is not running on <code>http://localhost:5000</code>.
                You can switch on <strong>Dev Mock Mode</strong> in the sidebar to test full UI analysis and guideline updates.
              </p>
            </div>
          </div>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setActivePage('checker')}
          >
            Go to Content Checker
          </button>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <section className="dashboard-hero glass-card mb-6">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} /> Brand Governance OS
          </div>
          <h2 className="hero-title">Protect and elevate your brand integrity with BrandGuard AI</h2>
          <p className="hero-description">
            Automated brand lexicon auditing, restricted phrase detection, regulatory claim alignment, and tone consistency for enterprise marketing.
          </p>
          <div className="hero-actions">
            <button
              className="btn btn-primary"
              onClick={() => setActivePage('checker')}
            >
              <FileSearch size={18} />
              <span>Analyze New Content</span>
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setActivePage('guidelines')}
            >
              <ShieldCheck size={18} />
              <span>View Brand Guidelines</span>
            </button>
          </div>
        </div>
      </section>

      {/* Overview Stat Cards */}
      <section className="stats-grid mb-8" aria-label="Governance Overview Metrics">
        {/* Card 1: Total Analyses */}
        <div className="stat-card glass-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Analyses</span>
            <div className="stat-icon-wrapper icon-primary">
              <FileText size={20} />
            </div>
          </div>
          <div className="stat-value">{totalAnalyses}</div>
          <div className="stat-footer">
            <span className="stat-trend positive">
              <TrendingUp size={14} /> Active
            </span>
            <span className="stat-subtext">documents processed</span>
          </div>
        </div>

        {/* Card 2: Issues Detected */}
        <div className="stat-card glass-card">
          <div className="stat-card-header">
            <span className="stat-label">Issues Detected</span>
            <div className="stat-icon-wrapper icon-danger">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="stat-value text-danger">{totalIssuesDetected}</div>
          <div className="stat-footer">
            <span className="badge badge-high">{totalHighIssues} High Severity</span>
            <span className="stat-subtext">flagged violations</span>
          </div>
        </div>

        {/* Card 3: Content Checked */}
        <div className="stat-card glass-card">
          <div className="stat-card-header">
            <span className="stat-label">Content Checked</span>
            <div className="stat-icon-wrapper icon-info">
              <Layers size={20} />
            </div>
          </div>
          <div className="stat-value">{totalWordsChecked.toLocaleString()} <span className="stat-unit">words</span></div>
          <div className="stat-footer">
            <span className="stat-subtext">{totalCharsChecked.toLocaleString()} characters audited</span>
          </div>
        </div>

        {/* Card 4: Governance Health Index */}
        <div className="stat-card glass-card">
          <div className="stat-card-header">
            <span className="stat-label">Compliance Index</span>
            <div className="stat-icon-wrapper icon-success">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="stat-value text-success">{complianceScore}%</div>
          <div className="stat-footer">
            <span className="stat-subtext">Brand alignment score</span>
          </div>
        </div>
      </section>

      {/* Human Review & Approval Workflow Metrics */}
      <div className="section-title-wrapper mb-3">
        <h4 className="text-sm font-bold uppercase tracking-wider text-secondary flex-align gap-2">
          <CheckCircle2 size={16} className="text-primary" />
          <span>Human Review & Approval Workflow Governance</span>
        </h4>
      </div>

      <section className="stats-grid mb-8" aria-label="Review Workflow Metrics">
        {/* Approved Copy */}
        <div className="stat-card glass-card">
          <div className="stat-card-header">
            <span className="stat-label">Approved Copy</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="stat-value text-success">{reviewMetrics?.approvedCount ?? 0}</div>
          <div className="stat-footer">
            <span className="stat-subtext">Certified compliant copy</span>
          </div>
        </div>

        {/* Rejected Copy */}
        <div className="stat-card glass-card">
          <div className="stat-card-header">
            <span className="stat-label">Rejected Copy</span>
            <div className="stat-icon-wrapper icon-danger">
              <XCircle size={20} />
            </div>
          </div>
          <div className="stat-value text-danger">{reviewMetrics?.rejectedCount ?? 0}</div>
          <div className="stat-footer">
            <span className="stat-subtext">Returned for revisions</span>
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="stat-card glass-card">
          <div className="stat-card-header">
            <span className="stat-label">Pending Reviews</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#fbbf24' }}>{reviewMetrics?.pendingCount ?? 0}</div>
          <div className="stat-footer">
            <span className="stat-subtext">Awaiting reviewer sign-off</span>
          </div>
        </div>

        {/* Approval Rate */}
        <div className="stat-card glass-card">
          <div className="stat-card-header">
            <span className="stat-label">Approval Rate</span>
            <div className="stat-icon-wrapper icon-primary">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-value text-primary">{reviewMetrics?.approvalRate ?? 100}%</div>
          <div className="stat-footer">
            <span className="stat-subtext">Of finalized decisions</span>
          </div>
        </div>
      </section>

      {/* Main Grid: Recent Analyses & Brand Policy Summary */}
      <div className="dashboard-grid">
        {/* Recent Analyses Section */}
        <section className="recent-analyses-section glass-card" aria-label="Recent Analyses">
          <div className="section-header">
            <div>
              <h3 className="section-title">Recent Analyses</h3>
              <p className="section-subtitle">History of evaluated marketing collateral and governance findings</p>
            </div>
            {recentAnalyses.length > 0 && (
              <button
                className="btn btn-outline btn-sm text-muted"
                onClick={clearHistory}
                title="Clear local audit history"
              >
                <Trash2 size={14} /> Clear
              </button>
            )}
          </div>

          {recentAnalyses.length === 0 ? (
            <div className="empty-state">
              <FileSearch size={44} className="text-muted mb-2" />
              <p className="empty-title">No content analyzed yet</p>
              <p className="empty-desc">
                Submit marketing copy through the Content Checker to generate an instant governance audit.
              </p>
              <button
                className="btn btn-primary btn-sm mt-4"
                onClick={() => setActivePage('checker')}
              >
                Launch Content Checker
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Brand</th>
                    <th>Content Snippet</th>
                    <th>Issues</th>
                    <th>Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAnalyses.map((item) => (
                    <tr key={item.id} className="table-row-hover">
                      <td>
                        <span className="badge badge-brand">{item.brandName}</span>
                      </td>
                      <td className="snippet-cell" title={item.originalContent}>
                        <div className="content-snippet">{item.contentSnippet}</div>
                        <span className="char-badge">{item.wordCount} words</span>
                      </td>
                      <td>
                        {item.totalIssues === 0 ? (
                          <span className="badge badge-low">Clean (0)</span>
                        ) : (
                          <div className="issue-badges-cell">
                            <span className="badge badge-medium">{item.totalIssues} issues</span>
                            {item.highSeverity > 0 && (
                              <span className="badge badge-high">{item.highSeverity} High</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="timestamp-cell">
                        <span className="time-text">
                          <Clock size={12} />
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => viewAnalysisResult(item)}
                          title="Open full audit results report"
                        >
                          <span>View Report</span>
                          <ArrowRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Quick Brand Guidelines Summary Card */}
        <section className="brand-summary-section glass-card" aria-label="Brand Governance Snapshot">
          <div className="section-header">
            <div>
              <h3 className="section-title">
                {isConfigured ? 'Active Brand Policy' : 'Active Governance Mode'}
              </h3>
              <p className="section-subtitle">
                {isConfigured
                  ? 'Officially configured rule sets for governance'
                  : 'Universal multi-industry governance active'}
              </p>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setActivePage('guidelines')}
            >
              <span>{isConfigured ? 'Manage' : 'Configure Rules'}</span>
              <ExternalLink size={13} />
            </button>
          </div>

          <div className="brand-policy-card">
            <div className="brand-policy-header">
              <div
                className="policy-brand-avatar"
                style={{
                  background: isConfigured ? 'var(--primary-light)' : 'rgba(245, 158, 11, 0.15)',
                  color: isConfigured ? '#a5b4fc' : '#fbbf24',
                  borderColor: isConfigured ? 'var(--primary-glow)' : 'rgba(245, 158, 11, 0.4)'
                }}
              >
                {displayCompanyName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="policy-brand-name flex-align gap-2">
                  <span>{displayCompanyName}</span>
                  {isConfigured ? (
                    <span className="badge badge-brand text-xs">Configured</span>
                  ) : (
                    <span className="badge badge-warning text-xs">Generic Mode</span>
                  )}
                </h4>
                <span className="policy-brand-id">
                  {isConfigured ? `ID: ${selectedBrandId}` : `Category: ${activeIndustry || 'Universal'}`}
                </span>
              </div>
            </div>

            <p className="policy-desc">
              {isConfigured
                ? currentProfile?.description || 'Enterprise cloud and AI infrastructure provider.'
                : `Official guidelines not configured for ${displayCompanyName}. Content is analyzed using universal brand governance principles, messaging clarity, and ${activeIndustry ? `${activeIndustry} risk indicators` : 'general risk indicators'}.`}
            </p>

            {/* If Configured, show Voice Attributes & Configured Rules stats */}
            {isConfigured ? (
              <>
                {currentProfile?.tone && currentProfile.tone.length > 0 && (
                  <div className="policy-tone-badges mb-3">
                    <span className="text-xs text-muted flex-align gap-1 mb-1">
                      <Tag size={12} /> Voice Attributes:
                    </span>
                    <div className="tags-flex">
                      {currentProfile.tone.map((t, idx) => (
                        <span key={idx} className="badge badge-low text-xs">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="policy-stat-row">
                  <div className="policy-metric">
                    <span className="metric-num">{restrictedCount}</span>
                    <span className="metric-label">Restricted Phrases</span>
                  </div>
                  <div className="policy-metric">
                    <span className="metric-num">{terminologyCount}</span>
                    <span className="metric-label">Terminology Glossary</span>
                  </div>
                  <div className="policy-metric">
                    <span className="metric-num">{claimCount}</span>
                    <span className="metric-label">Claim Verifications</span>
                  </div>
                  <div className="policy-metric">
                    <span className="metric-num">{requiredCount}</span>
                    <span className="metric-label">Required Terms</span>
                  </div>
                </div>

                <div className="policy-sample-terms">
                  <div className="sample-label">Restricted Phrases Spotlight:</div>
                  <div className="tags-flex">
                    {(g.restrictedPhrases?.slice(0, 3) || [
                      { phrase: '100% bug-free' },
                      { phrase: 'cheapest cloud in the market' }
                    ]).map((r, i) => (
                      <span key={i} className="badge badge-high">
                        {r.phrase}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* If Generic, show Universal Governance Framework */
              <>
                <div className="policy-tone-badges mb-3">
                  <span className="text-xs text-muted flex-align gap-1 mb-1">
                    <Tag size={12} /> Universal Governance Principles:
                  </span>
                  <div className="tags-flex">
                    <span className="badge badge-info text-xs">Professional Tone</span>
                    <span className="badge badge-info text-xs">Superlatives & Absolutes</span>
                    <span className="badge badge-info text-xs">Unverified Claims</span>
                    <span className="badge badge-info text-xs">Brand Casing</span>
                  </div>
                </div>

                <div className="policy-stat-row">
                  <div className="policy-metric">
                    <span className="metric-num">Universal</span>
                    <span className="metric-label">Lexicon Audit</span>
                  </div>
                  <div className="policy-metric">
                    <span className="metric-num">Dynamic</span>
                    <span className="metric-label">Industry Risks</span>
                  </div>
                  <div className="policy-metric">
                    <span className="metric-num">Verified</span>
                    <span className="metric-label">Claims Audit</span>
                  </div>
                </div>

                <div className="policy-sample-terms">
                  <div className="sample-label">General Risk Indicators Checked:</div>
                  <div className="tags-flex">
                    <span className="badge badge-high">100% risk-free</span>
                    <span className="badge badge-high">zero risk guaranteed</span>
                    <span className="badge badge-high">cheapest in the world</span>
                  </div>
                </div>
              </>
            )}

            <div className="quick-nav-block mt-4">
              <button
                className="btn btn-primary w-full"
                onClick={() => setActivePage('checker')}
              >
                <span>Check Content for {displayCompanyName}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Persistent Review Decisions Audit Trail */}
      <section className="glass-card mt-8 p-6" aria-label="Review Audit Trail">
        <div className="section-header mb-4">
          <div>
            <h3 className="section-title">Review & Approval Audit Trail</h3>
            <p className="section-subtitle">
              Persistent log of review decisions, reviewer timestamps, and mandatory rejection justifications
            </p>
          </div>
          <span className="badge badge-brand text-xs">
            Persistent reviews.json Storage
          </span>
        </div>

        {(!reviewMetrics?.recentDecisions || reviewMetrics.recentDecisions.length === 0) ? (
          <div className="empty-state p-6 text-center text-muted text-sm">
            No formal review decisions recorded yet. Run an audit in the Content Checker and submit an approval or rejection.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Analysis ID</th>
                  <th>Brand / Company</th>
                  <th>Decision</th>
                  <th>Reviewer</th>
                  <th>Decision Date</th>
                  <th>Rejection Reason / Notes</th>
                </tr>
              </thead>
              <tbody>
                {reviewMetrics.recentDecisions.map((rev) => (
                  <tr key={rev.id || rev.analysisId} className="table-row-hover">
                    <td>
                      <code>{rev.analysisId}</code>
                    </td>
                    <td>
                      <span className="font-semibold text-white">
                        {rev.companyName || rev.brandName || 'Brand'}
                      </span>
                    </td>
                    <td>
                      {rev.status === 'approved' && (
                        <span className="badge badge-success flex-align gap-1">
                          <CheckCircle2 size={12} /> Approved
                        </span>
                      )}
                      {rev.status === 'rejected' && (
                        <span className="badge badge-high flex-align gap-1">
                          <XCircle size={12} /> Rejected
                        </span>
                      )}
                      {rev.status === 'pending' && (
                        <span className="badge badge-warning flex-align gap-1">
                          <Clock size={12} /> Pending Review
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="text-sm font-medium text-white">
                        {rev.reviewerName || 'Automated Registration'}
                      </div>
                      {rev.reviewerRole && (
                        <div className="text-xs text-muted">{rev.reviewerRole}</div>
                      )}
                    </td>
                    <td className="text-xs text-secondary">
                      {new Date(rev.updatedAt).toLocaleString()}
                    </td>
                    <td className="text-xs text-secondary" style={{ maxWidth: '280px' }}>
                      {rev.rejectionReason ? (
                        <span className="text-rose-300 font-medium">{rev.rejectionReason}</span>
                      ) : rev.notes ? (
                        <span>{rev.notes}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
