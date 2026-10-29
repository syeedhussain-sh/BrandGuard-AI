import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type {
  BrandProfile,
  TerminologyRule,
  RestrictedPhraseRule,
  RequiredTermRule,
  ClaimVerificationRule,
  ToneRule,
  IssueSeverity
} from '../types/brand';
import { INITIAL_NOVATECH_PROFILE } from '../services/mockAdapter';
import {
  ShieldCheck,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  AlertTriangle,
  BookOpen,
  Volume2,
  FileCheck,
  Server,
  Scale,
  Sparkles
} from 'lucide-react';

/**
 * Intelligent default guidelines generator for any company / industry.
 * Tailors rules for Samsung (Mobile phones and electronics), Tata Motors (Automotive),
 * or any custom enterprise entered by the user.
 */
export function createDefaultProfileForCompany(companyName: string, industry?: string): BrandProfile {
  const cleanName = (companyName || '').trim();
  const lower = cleanName.toLowerCase();
  const safeId = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'company';
  const now = new Date().toISOString();

  // 1. Samsung (Mobile phones and electronics)
  if (lower === 'samsung' || lower.includes('samsung')) {
    return {
      id: safeId,
      name: 'Samsung',
      description:
        'Global leader in mobile communications, consumer electronics, and smart hardware engineering with strict commitment to innovation, screen technology, and user trust.',
      tone: ['innovative', 'reliable', 'premium', 'customer-centric', 'authoritative'],
      guidelines: {
        terminology: [
          {
            preferred: 'Samsung Galaxy',
            discouraged: ['Galaxy Phone', 'Sammy phone', 'Samsung mobile'],
            explanation: 'Always refer to the flagship ecosystem by its official Samsung Galaxy brand name.'
          },
          {
            preferred: 'One UI',
            discouraged: ['TouchWiz', 'Samsung Android', 'Galaxy OS'],
            explanation: 'Refer to our software interface experience officially as One UI.'
          },
          {
            preferred: 'Dynamic AMOLED',
            discouraged: ['AMOLED screen', 'Samsung OLED', 'Normal OLED'],
            explanation: 'Use official display hardware branding.'
          }
        ],
        restrictedPhrases: [
          {
            phrase: 'infinite battery life',
            severity: 'high',
            explanation: 'Absolute battery endurance claims violate regulatory and advertising compliance standards.',
            suggestion: 'all-day intelligent battery life'
          },
          {
            phrase: 'unbreakable screen',
            severity: 'high',
            explanation: 'Durability claims must avoid misleading absolute terms.',
            suggestion: 'reinforced scratch-resistant display glass'
          },
          {
            phrase: '100% bug-free',
            severity: 'high',
            explanation: 'Absolute software reliability claims violate brand governance policies.',
            suggestion: 'rigorously tested software'
          },
          {
            phrase: 'cheapest in the market',
            severity: 'high',
            explanation: 'Unsubstantiated pricing superlatives violate brand standards.',
            suggestion: 'exceptional value with premium features'
          },
          {
            phrase: 'obviously',
            severity: 'medium',
            explanation: 'Condescending tone undermines accessible, customer-centric brand voice.',
            suggestion: 'as demonstrated'
          }
        ],
        requiredTerms: [
          {
            term: 'Samsung',
            context: 'Public press announcements and campaign headers',
            severity: 'medium',
            explanation: 'Official brand name must be explicitly stated at least once in public communications.'
          }
        ],
        claimVerification: [
          {
            claimPattern: 'guarantee(s|d)?',
            severity: 'high',
            explanation: 'Guarantees require explicit reference to standard warranty terms.',
            suggestion: 'backed by standard manufacturer warranty'
          }
        ],
        toneRules: [
          {
            bannedWordOrStyle: 'obviously',
            suggestion: 'as demonstrated',
            explanation: 'Avoid condescending or dismissive tone.'
          },
          {
            bannedWordOrStyle: 'cheap',
            suggestion: 'accessible and cost-effective',
            explanation: 'Maintain premium brand perception across all device tiers.'
          }
        ]
      },
      createdAt: now,
      updatedAt: now
    };
  }

  // 2. Tata Motors / Automotive
  if (
    lower.includes('tata') ||
    lower.includes('motor') ||
    lower.includes('bmw') ||
    lower.includes('toyota') ||
    (industry && industry.toLowerCase().includes('auto'))
  ) {
    return {
      id: safeId,
      name: cleanName || 'Tata Motors',
      description:
        'Pioneering automotive and mobility engineering committed to passenger safety, robust durability, and sustainable innovation.',
      tone: ['trustworthy', 'innovative', 'rugged', 'customer-first', 'authoritative'],
      guidelines: {
        terminology: [
          {
            preferred: cleanName.includes('Tata') ? 'Tata Motors Passenger Vehicles' : cleanName,
            discouraged: ['Tata Cars', 'Tata Autos'],
            explanation: 'Use official corporate vehicle division naming.'
          }
        ],
        restrictedPhrases: [
          {
            phrase: 'zero-accident guarantee',
            severity: 'high',
            explanation: 'Safety claims must reference verified crash test ratings rather than absolute guarantees.',
            suggestion: '5-star GNCAP safety rated architecture'
          },
          {
            phrase: 'cheapest car in the market',
            severity: 'high',
            explanation: 'Value propositions should emphasize total cost of ownership rather than cheapness.',
            suggestion: 'accessible, high-value personal mobility'
          },
          {
            phrase: 'obviously',
            severity: 'medium',
            explanation: 'Condescending tone undermines respectful brand voice.',
            suggestion: 'as demonstrated'
          }
        ],
        requiredTerms: [
          {
            term: cleanName || 'Tata Motors',
            context: 'Official press releases and announcements',
            severity: 'medium',
            explanation: 'Brand name must be explicitly mentioned.'
          }
        ],
        claimVerification: [
          {
            claimPattern: 'guarantee(s|d)?',
            severity: 'high',
            explanation: 'Guarantees must reference official warranty terms.',
            suggestion: 'supported by standard comprehensive warranty'
          }
        ],
        toneRules: [
          {
            bannedWordOrStyle: 'obviously',
            suggestion: 'as demonstrated',
            explanation: 'Maintain professional, respectful communication.'
          }
        ]
      },
      createdAt: now,
      updatedAt: now
    };
  }

  // 3. Universal / Generic company profile
  return {
    id: safeId,
    name: cleanName || 'Generic Brand',
    description: `Brand governance and messaging guidelines for ${cleanName || 'our brand'} (${industry || 'Universal Category'}) ensuring compliance, tone consistency, and risk reduction.`,
    tone: ['professional', 'innovative', 'authoritative', 'accessible', 'trustworthy'],
    guidelines: {
      terminology: [
        {
          preferred: cleanName,
          discouraged: [cleanName.toLowerCase()],
          explanation: `Always capitalize "${cleanName}" properly in official communications.`
        }
      ],
      restrictedPhrases: [
        {
          phrase: '100% bug-free',
          severity: 'high',
          explanation: 'Absolute reliability claims violate compliance policies.',
          suggestion: 'engineered for high reliability and resilience'
        },
        {
          phrase: 'cheapest in the market',
          severity: 'high',
          explanation: 'Unsubstantiated pricing superlatives are prohibited.',
          suggestion: 'cost-effective, high-value solutions'
        },
        {
          phrase: 'obviously',
          severity: 'medium',
          explanation: 'Condescending tone undermines accessible brand voice.',
          suggestion: 'as demonstrated'
        }
      ],
      requiredTerms: [
        {
          term: cleanName,
          context: 'Public announcements and releases',
          severity: 'medium',
          explanation: `Brand name "${cleanName}" must be mentioned explicitly at least once.`
        }
      ],
      claimVerification: [
        {
          claimPattern: 'guarantee(s|d)?',
          severity: 'high',
          explanation: 'Guarantees require explicit substantiation and standard SLA/warranty terms.',
          suggestion: 'commit to high quality and reliability'
        }
      ],
      toneRules: [
        {
          bannedWordOrStyle: 'obviously',
          suggestion: 'as demonstrated',
          explanation: 'Condescending tone undermines accessible brand voice.'
        }
      ]
    },
    createdAt: now,
    updatedAt: now
  };
}

export const BrandGuidelinesPage: React.FC = () => {
  const {
    setSelectedBrandId,
    brands,
    loadBrandGuidelines,
    saveBrandGuidelines,
    serviceStatus,
    showToast,
    activeCompanyName,
    activeIndustry,
    setActiveCompany,
    setActivePage,
    setCurrentProfile
  } = useApp();

  const [profile, setProfile] = useState<BrandProfile>(() =>
    createDefaultProfileForCompany(activeCompanyName, activeIndustry)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Check if current active company has configured brand profile
  const cleanActive = (activeCompanyName || '').trim().toLowerCase();
  const matchedBrand = brands.find(
    (b) =>
      b.name.toLowerCase() === cleanActive ||
      b.id.toLowerCase() === cleanActive ||
      (cleanActive === 'novatech' && b.id === 'demo-brand')
  );
  const isConfigured = Boolean(
    matchedBrand ||
    cleanActive === 'novatech' ||
    cleanActive === 'demo-brand'
  );
  const targetBrandId = matchedBrand ? matchedBrand.id : 'demo-brand';

  // Input states for adding new rules
  const [newToneTag, setNewToneTag] = useState<string>('');

  const [newTerm, setNewTerm] = useState<{ preferred: string; discouraged: string; explanation: string }>({
    preferred: '',
    discouraged: '',
    explanation: ''
  });

  const [newRestricted, setNewRestricted] = useState<{
    phrase: string;
    severity: IssueSeverity;
    explanation: string;
    suggestion: string;
  }>({
    phrase: '',
    severity: 'high',
    explanation: '',
    suggestion: ''
  });

  const [newRequired, setNewRequired] = useState<{
    term: string;
    context: string;
    severity: IssueSeverity;
    explanation: string;
  }>({
    term: '',
    context: '',
    severity: 'medium',
    explanation: ''
  });

  const [newClaim, setNewClaim] = useState<{
    claimPattern: string;
    severity: IssueSeverity;
    explanation: string;
    suggestion: string;
  }>({
    claimPattern: '',
    severity: 'high',
    explanation: '',
    suggestion: ''
  });

  const [newToneRule, setNewToneRule] = useState<{
    bannedWordOrStyle: string;
    suggestion: string;
    explanation: string;
  }>({
    bannedWordOrStyle: '',
    suggestion: '',
    explanation: ''
  });

  const [newFactText, setNewFactText] = useState<string>('');

  // Load selected brand
  useEffect(() => {
    let isMounted = true;

    // If company is in generic / active dynamic mode
    if (!isConfigured) {
      // Check if user previously customized guidelines for this company in localStorage
      const storageKey = `brandguard_guidelines_${activeCompanyName.toLowerCase().trim()}`;
      let initialProf: BrandProfile | null = null;
      try {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          initialProf = JSON.parse(cached);
        }
      } catch {
        // ignore cache parse errors
      }

      if (!initialProf) {
        initialProf = createDefaultProfileForCompany(activeCompanyName, activeIndustry);
      }

      if (isMounted) {
        setProfile(initialProf);
        setCurrentProfile(initialProf);
        setIsLoading(false);
        setLoadError(null);
      }
      return () => {
        isMounted = false;
      };
    }

    const fetchBrand = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await loadBrandGuidelines(targetBrandId);
        if (isMounted) {
          if (res) {
            setProfile(res);
            setCurrentProfile(res);
          } else {
            const fallback = { ...INITIAL_NOVATECH_PROFILE, id: targetBrandId };
            setProfile(fallback);
            setCurrentProfile(fallback);
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to retrieve brand guidelines.';
          setLoadError(msg);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBrand();

    return () => {
      isMounted = false;
    };
  }, [isConfigured, targetBrandId, loadBrandGuidelines, activeCompanyName, activeIndustry, setCurrentProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isConfigured) {
        await saveBrandGuidelines(targetBrandId, profile);
      } else {
        // Save to localStorage and update active profile in AppContext
        try {
          const storageKey = `brandguard_guidelines_${profile.name.toLowerCase().trim()}`;
          localStorage.setItem(storageKey, JSON.stringify(profile));
        } catch {
          // ignore local storage error
        }
        setCurrentProfile(profile);
        showToast(`Brand guidelines for ${profile.name} saved successfully!`, 'success');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save brand guidelines.';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (isConfigured) {
      setProfile(JSON.parse(JSON.stringify(INITIAL_NOVATECH_PROFILE)));
      showToast('Reset guidelines to NovaTech default specifications (unsaved)', 'info');
    } else {
      const def = createDefaultProfileForCompany(activeCompanyName, activeIndustry);
      setProfile(def);
      setCurrentProfile(def);
      try {
        const storageKey = `brandguard_guidelines_${activeCompanyName.toLowerCase().trim()}`;
        localStorage.removeItem(storageKey);
      } catch {
        // ignore
      }
      showToast(`Reset guidelines for ${activeCompanyName} to default specifications`, 'info');
    }
  };

  // Tone Tags
  const addToneTag = () => {
    if (!newToneTag.trim()) return;
    const tag = newToneTag.trim().toLowerCase();
    const currentTone = profile.tone || [];
    if (!currentTone.includes(tag)) {
      setProfile({ ...profile, tone: [...currentTone, tag] });
    }
    setNewToneTag('');
  };

  const removeToneTag = (tag: string) => {
    setProfile({
      ...profile,
      tone: (profile.tone || []).filter((t) => t !== tag)
    });
  };

  // Terminology
  const addTerminologyRule = () => {
    if (!newTerm.preferred.trim() || !newTerm.discouraged.trim()) {
      showToast('Both official preferred term and discouraged variations are required.', 'error');
      return;
    }
    const discouragedArray = newTerm.discouraged
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const rule: TerminologyRule = {
      preferred: newTerm.preferred.trim(),
      discouraged: discouragedArray,
      explanation: newTerm.explanation.trim() || `Always use "${newTerm.preferred.trim()}".`
    };

    setProfile((prev) => ({
      ...prev,
      guidelines: {
        ...prev.guidelines,
        terminology: [...(prev.guidelines.terminology || []), rule]
      }
    }));

    setNewTerm({ preferred: '', discouraged: '', explanation: '' });
  };

  const removeTerminologyRule = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      guidelines: {
        ...prev.guidelines,
        terminology: (prev.guidelines.terminology || []).filter((_, i) => i !== index)
      }
    }));
  };

  // Restricted Phrases
  const addRestrictedPhrase = () => {
    if (!newRestricted.phrase.trim()) {
      showToast('Restricted phrase cannot be empty.', 'error');
      return;
    }
    const rule: RestrictedPhraseRule = {
      phrase: newRestricted.phrase.trim(),
      severity: newRestricted.severity,
      explanation: newRestricted.explanation.trim() || 'Restricted by brand compliance governance.',
      suggestion: newRestricted.suggestion.trim() || 'Remove or rephrase this term.'
    };

    setProfile((prev) => ({
      ...prev,
      guidelines: {
        ...prev.guidelines,
        restrictedPhrases: [...(prev.guidelines.restrictedPhrases || []), rule]
      }
    }));

    setNewRestricted({ phrase: '', severity: 'high', explanation: '', suggestion: '' });
  };

  const removeRestrictedPhrase = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      guidelines: {
        ...prev.guidelines,
        restrictedPhrases: (prev.guidelines.restrictedPhrases || []).filter((_, i) => i !== index)
      }
    }));
  };

  // Required Terms
  const addRequiredTerm = () => {
    if (!newRequired.term.trim()) {
      showToast('Required term cannot be empty.', 'error');
      return;
    }
    const rule: RequiredTermRule = {
      term: newRequired.term.trim(),
      context: newRequired.context.trim() || 'Any public press release or marketing copy',
      severity: newRequired.severity,
      explanation: newRequired.explanation.trim() || `Mandatory mention of ${newRequired.term.trim()}.`
    };

    setProfile((prev) => ({
      ...prev,
      guidelines: {
        ...prev.guidelines,
        requiredTerms: [...(prev.guidelines.requiredTerms || []), rule]
      }
    }));

    setNewRequired({ term: '', context: '', severity: 'medium', explanation: '' });
  };

  const removeRequiredTerm = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      guidelines: {
        ...prev.guidelines,
        requiredTerms: (prev.guidelines.requiredTerms || []).filter((_, i) => i !== index)
      }
    }));
  };

  // Claim Verification
  const addClaimRule = () => {
    if (!newClaim.claimPattern.trim()) {
      showToast('Claim pattern cannot be empty.', 'error');
      return;
    }
    const rule: ClaimVerificationRule = {
      claimPattern: newClaim.claimPattern.trim(),
      severity: newClaim.severity,
      explanation: newClaim.explanation.trim() || 'Absolute claims require verified SLAs and legal approval.',
      suggestion: newClaim.suggestion.trim() || 'Cite audited benchmark or verified standard SLA.'
    };

    setProfile((prev) => ({
      ...prev,
      guidelines: {
        ...prev.guidelines,
        claimVerification: [...(prev.guidelines.claimVerification || []), rule]
      }
    }));

    setNewClaim({ claimPattern: '', severity: 'high', explanation: '', suggestion: '' });
  };

  const removeClaimRule = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      guidelines: {
        ...prev.guidelines,
        claimVerification: (prev.guidelines.claimVerification || []).filter((_, i) => i !== index)
      }
    }));
  };

  // Tone Rules
  const addToneRule = () => {
    if (!newToneRule.bannedWordOrStyle.trim()) {
      showToast('Banned word or style cannot be empty.', 'error');
      return;
    }
    const rule: ToneRule = {
      bannedWordOrStyle: newToneRule.bannedWordOrStyle.trim(),
      suggestion: newToneRule.suggestion.trim() || 'Use objective, professional phrasing.',
      explanation: newToneRule.explanation.trim() || 'Avoid off-brand tone and superlatives.'
    };

    setProfile((prev) => ({
      ...prev,
      guidelines: {
        ...prev.guidelines,
        toneRules: [...(prev.guidelines.toneRules || []), rule]
      }
    }));

    setNewToneRule({ bannedWordOrStyle: '', suggestion: '', explanation: '' });
  };

  const removeToneRule = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      guidelines: {
        ...prev.guidelines,
        toneRules: (prev.guidelines.toneRules || []).filter((_, i) => i !== index)
      }
    }));
  };

  // Approved Brand Facts & Evidence
  const addApprovedFact = () => {
    if (!newFactText.trim()) {
      showToast('Approved fact cannot be empty.', 'error');
      return;
    }
    setProfile((prev) => ({
      ...prev,
      approvedFacts: [...(prev.approvedFacts || []), newFactText.trim()]
    }));
    setNewFactText('');
    showToast('Approved fact added. Click "Save Brand Guidelines" below to persist changes.', 'info');
  };

  const removeApprovedFact = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      approvedFacts: (prev.approvedFacts || []).filter((_, i) => i !== index)
    }));
  };

  const g = profile.guidelines || {};

  return (
    <div className="page-container guidelines-page">
      {/* Top Header Controls Bar */}
      <div className="guidelines-top-bar glass-card mb-6">
        <div className="bar-info">
          <div className="brand-select-group">
            <label htmlFor="brand-picker" className="brand-picker-label">
              Active Brand Profile:
            </label>
            <select
              id="brand-picker"
              className="form-select brand-select"
              value={isConfigured ? targetBrandId : activeCompanyName}
              onChange={(e) => {
                const newId = e.target.value;
                if (!newId) return;
                const matched = brands.find((b) => b.id === newId);
                if (matched) {
                  setSelectedBrandId(matched.id);
                  setActiveCompany(matched.name);
                } else if (newId === 'demo-brand' || newId.toLowerCase() === 'novatech') {
                  setSelectedBrandId('demo-brand');
                  setActiveCompany('NovaTech');
                } else {
                  setActiveCompany(newId);
                }
              }}
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.id})
                </option>
              ))}
              {brands.length === 0 && <option value="demo-brand">NovaTech (demo-brand)</option>}
              {!isConfigured && (
                <option value={activeCompanyName}>
                  {activeCompanyName} ({activeIndustry || 'Active Company'})
                </option>
              )}
            </select>
          </div>

          <div className="backend-indicator">
            <Server size={15} />
            <span>Governance Target: </span>
            {isConfigured ? (
              serviceStatus.isMockMode ? (
                <span className="badge badge-medium">Dev Mock Adapter</span>
              ) : serviceStatus.isBackendConnected ? (
                <span className="badge badge-low">Live Backend Profile</span>
              ) : (
                <span className="badge badge-high">Backend Offline</span>
              )
            ) : (
              <span className="badge badge-medium">{activeIndustry || 'Universal'} Governance</span>
            )}
          </div>
        </div>

        <div className="bar-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleReset}
            disabled={isSaving}
          >
            <RotateCcw size={14} />
            <span>{isConfigured ? 'Reset Demo' : 'Reset Recommended'}</span>
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save size={14} />
            <span>{isSaving ? 'Saving...' : isConfigured ? 'Save to Backend' : 'Save Session Rules'}</span>
          </button>
        </div>
      </div>

      {!serviceStatus.isBackendConnected && !serviceStatus.isMockMode && (
        <div className="alert-banner alert-warning mb-6">
          <AlertTriangle size={18} />
          <div>
            <strong>Notice:</strong> Backend is offline at <code>{serviceStatus.backendUrl}</code>. Changes will
            be preserved locally or you can toggle <strong>Dev Mock Mode</strong> in the sidebar.
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="loading-state glass-card">
          <div className="spinner-border animate-spin" />
          <p>Loading brand governance guidelines...</p>
        </div>
      ) : loadError ? (
        <div className="alert-banner alert-danger mb-6">
          <AlertTriangle size={18} />
          <div>
            <strong>Error:</strong> {loadError}
          </div>
        </div>
      ) : (
        <>
          {/* Active Brand Governance Status Banner */}
          {isConfigured ? (
            <div className="glass-card mb-6 p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-xl flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <BookOpen size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white text-base">
                      Official Brand Guidelines: {profile.name || activeCompanyName}
                    </h4>
                    <span className="badge badge-low">
                      Mode A: Configured Official Profile
                    </span>
                  </div>
                  <p className="text-secondary text-sm mt-0.5">
                    Official brand guidelines configured for {profile.name}. Rules are saved on the backend server and directly enforced during content analysis.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setActivePage('checker')}
                >
                  <Sparkles size={14} />
                  <span>Analyze Content for {profile.name || activeCompanyName}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card mb-6 p-4 border border-amber-500/20 bg-amber-500/5 rounded-xl flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white text-base">
                      Official Brand Guidelines Not Configured for {profile.name || activeCompanyName}
                    </h4>
                    <span className="badge badge-medium">
                      Mode B: {activeIndustry || 'Universal'} Governance
                    </span>
                  </div>
                  <p className="text-secondary text-sm mt-0.5">
                    Official brand guidelines are not configured for {profile.name || activeCompanyName} ({activeIndustry || 'General Category'}). Content is analyzed using universal brand governance principles, messaging clarity, and {activeIndustry || 'industry-specific'} risk indicators.
                  </p>
                  <p className="text-secondary text-xs mt-1 text-slate-400">
                    The guidelines below represent recommended universal governance standards and custom session rules, not official corporate policies of {profile.name || activeCompanyName}. You can customize these rules for your active session.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setActivePage('checker')}
                >
                  <Sparkles size={14} />
                  <span>Analyze Content for {profile.name || activeCompanyName}</span>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSave} className="guidelines-form">
          {/* Section 1: Brand Profile & Tone Voice */}
          <div className="glass-card mb-6">
            <div className="card-header-styled">
              <div className="header-icon-pill">
                <BookOpen size={18} />
              </div>
              <div>
                <h3 className="card-heading">1. Brand Identity & Tone Attributes</h3>
                <p className="card-subheading">Core profile details and strategic voice pillars</p>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="brand-name">
                  Brand Name
                </label>
                <input
                  id="brand-name"
                  type="text"
                  className="form-input"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="e.g., NovaTech"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="brand-id-display">
                  Brand ID (Path Identifier)
                </label>
                <input
                  id="brand-id-display"
                  type="text"
                  className="form-input font-mono"
                  value={profile.id}
                  disabled
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="brand-desc">
                Description / Positioning
              </label>
              <textarea
                id="brand-desc"
                className="form-textarea form-textarea-sm"
                value={profile.description || ''}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                placeholder="Enterprise cloud and AI infrastructure provider."
                rows={2}
              />
            </div>

            {/* Tone Attributes Array */}
            <div className="form-group mt-3">
              <label className="form-label">Tone Attributes (Voice Pillars)</label>
              <div className="tags-container mb-2">
                {(profile.tone || []).map((t) => (
                  <span key={t} className="tag-chip tag-primary">
                    <span>{t}</span>
                    <button
                      type="button"
                      className="tag-remove-btn"
                      onClick={() => removeToneTag(t)}
                      aria-label={`Remove tone ${t}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="input-group-action max-w-sm">
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. professional, innovative, authoritative..."
                  value={newToneTag}
                  onChange={(e) => setNewToneTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToneTag();
                    }
                  }}
                />
                <button type="button" className="btn btn-secondary btn-sm" onClick={addToneTag}>
                  <Plus size={14} /> Add Tone
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Terminology Rules */}
          <div className="glass-card mb-6">
            <div className="card-header-styled">
              <div className="header-icon-pill icon-primary">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="card-heading">2. Terminology Glossary</h3>
                <p className="card-subheading">
                  Official preferred names vs. discouraged abbreviations, colloquial terms, or outdated phrasing
                </p>
              </div>
            </div>

            <div className="table-responsive mb-4">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Official Preferred Term</th>
                    <th>Discouraged Variations</th>
                    <th>Policy Explanation</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(g.terminology || []).map((rule, idx) => (
                    <tr key={idx}>
                      <td>
                        <span className="badge badge-brand">{rule.preferred}</span>
                      </td>
                      <td>
                        <div className="tags-flex">
                          {rule.discouraged.map((d, i) => (
                            <span key={i} className="badge badge-high text-xs">
                              {d}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="text-sm text-secondary">{rule.explanation}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-icon-danger"
                          onClick={() => removeTerminologyRule(idx)}
                          title="Remove rule"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!g.terminology || g.terminology.length === 0) && (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-4">
                        No terminology mappings configured yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Add Terminology Row */}
            <div className="add-term-box">
              <h4 className="add-heading">Add New Terminology Rule</h4>
              <div className="form-grid-3 mb-2">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Preferred Term (e.g., NovaTech Cloud Platform)"
                  value={newTerm.preferred}
                  onChange={(e) => setNewTerm({ ...newTerm, preferred: e.target.value })}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Discouraged (comma-separated: Nova Cloud, NT Cloud)"
                  value={newTerm.discouraged}
                  onChange={(e) => setNewTerm({ ...newTerm, discouraged: e.target.value })}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Explanation (e.g., Always use full official brand name)"
                  value={newTerm.explanation}
                  onChange={(e) => setNewTerm({ ...newTerm, explanation: e.target.value })}
                />
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={addTerminologyRule}
              >
                <Plus size={14} /> Add Terminology Rule
              </button>
            </div>
          </div>

          {/* Section 3: Restricted Phrases */}
          <div className="glass-card mb-6">
            <div className="card-header-styled">
              <div className="header-icon-pill icon-danger">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="card-heading">3. Restricted Phrases & Superlatives</h3>
                <p className="card-subheading">
                  Prohibited claims, unsubstantiated absolutes, or compliance-violating expressions
                </p>
              </div>
            </div>

            <div className="table-responsive mb-4">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Restricted Phrase</th>
                    <th>Severity</th>
                    <th>Suggested Replacement</th>
                    <th>Explanation</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(g.restrictedPhrases || []).map((rule, idx) => (
                    <tr key={idx}>
                      <td className="font-mono text-danger font-medium">"{rule.phrase}"</td>
                      <td>
                        <span className={`badge badge-${rule.severity}`}>
                          {rule.severity}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-low text-xs">{rule.suggestion}</span>
                      </td>
                      <td className="text-sm text-secondary">{rule.explanation}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-icon-danger"
                          onClick={() => removeRestrictedPhrase(idx)}
                          title="Remove phrase"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!g.restrictedPhrases || g.restrictedPhrases.length === 0) && (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-4">
                        No restricted phrases configured.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Add Restricted Phrase Box */}
            <div className="add-term-box">
              <h4 className="add-heading">Add Restricted Phrase</h4>
              <div className="form-grid-4 mb-2">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Phrase (e.g., 100% bug-free)"
                  value={newRestricted.phrase}
                  onChange={(e) => setNewRestricted({ ...newRestricted, phrase: e.target.value })}
                />
                <select
                  className="form-select"
                  value={newRestricted.severity}
                  onChange={(e) =>
                    setNewRestricted({ ...newRestricted, severity: e.target.value as IssueSeverity })
                  }
                >
                  <option value="high">High Severity</option>
                  <option value="medium">Medium Severity</option>
                  <option value="low">Low Severity</option>
                </select>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Suggestion (e.g., engineered for high reliability)"
                  value={newRestricted.suggestion}
                  onChange={(e) => setNewRestricted({ ...newRestricted, suggestion: e.target.value })}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Explanation (e.g., Absolute claims violate policy)"
                  value={newRestricted.explanation}
                  onChange={(e) => setNewRestricted({ ...newRestricted, explanation: e.target.value })}
                />
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={addRestrictedPhrase}
              >
                <Plus size={14} /> Add Restricted Phrase
              </button>
            </div>
          </div>

          {/* Section 4: Claim Verification & Required Terms (2-column layout) */}
          <div className="grid-2-col mb-6">
            {/* Claim Verification Rules */}
            <div className="glass-card">
              <div className="card-header-styled">
                <div className="header-icon-pill icon-info">
                  <Scale size={18} />
                </div>
                <div>
                  <h3 className="card-heading">4. Claim Verification (Regex)</h3>
                  <p className="card-subheading">Unsubstantiated warranties or SLA guarantees</p>
                </div>
              </div>

              <div className="claim-rules-stack mb-4">
                {(g.claimVerification || []).map((rule, idx) => (
                  <div key={idx} className="rule-card-mini">
                    <div className="flex-between">
                      <code className="text-primary font-bold">/{rule.claimPattern}/</code>
                      <div className="flex-align gap-2">
                        <span className={`badge badge-${rule.severity}`}>{rule.severity}</span>
                        <button
                          type="button"
                          className="btn-icon-danger"
                          onClick={() => removeClaimRule(idx)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-secondary mt-1">{rule.explanation}</p>
                    <div className="text-xs text-success mt-1">
                      <strong>Suggestion:</strong> {rule.suggestion}
                    </div>
                  </div>
                ))}
              </div>

              <div className="add-term-box">
                <h4 className="add-heading">Add Claim Pattern</h4>
                <div className="form-grid-2 mb-2">
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="Regex Pattern (e.g., guarantee(s|d)?)"
                    value={newClaim.claimPattern}
                    onChange={(e) => setNewClaim({ ...newClaim, claimPattern: e.target.value })}
                  />
                  <select
                    className="form-select"
                    value={newClaim.severity}
                    onChange={(e) =>
                      setNewClaim({ ...newClaim, severity: e.target.value as IssueSeverity })
                    }
                  >
                    <option value="high">High Severity</option>
                    <option value="medium">Medium Severity</option>
                    <option value="low">Low Severity</option>
                  </select>
                </div>
                <div className="form-grid-2 mb-2">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Suggestion (e.g., commit to standard SLA)"
                    value={newClaim.suggestion}
                    onChange={(e) => setNewClaim({ ...newClaim, suggestion: e.target.value })}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Explanation (e.g., Legal approval required)"
                    value={newClaim.explanation}
                    onChange={(e) => setNewClaim({ ...newClaim, explanation: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={addClaimRule}
                >
                  <Plus size={14} /> Add Claim Pattern
                </button>
              </div>
            </div>

            {/* Required Terms */}
            <div className="glass-card">
              <div className="card-header-styled">
                <div className="header-icon-pill icon-success">
                  <FileCheck size={18} />
                </div>
                <div>
                  <h3 className="card-heading">5. Required Terms & Mentions</h3>
                  <p className="card-subheading">Mandatory brand name references and disclosures</p>
                </div>
              </div>

              <div className="required-terms-stack mb-4">
                {(g.requiredTerms || []).map((rule, idx) => (
                  <div key={idx} className="rule-card-mini">
                    <div className="flex-between">
                      <span className="font-bold text-success">{rule.term}</span>
                      <div className="flex-align gap-2">
                        <span className={`badge badge-${rule.severity}`}>{rule.severity}</span>
                        <button
                          type="button"
                          className="btn-icon-danger"
                          onClick={() => removeRequiredTerm(idx)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-muted mt-1">Context: {rule.context || 'General'}</div>
                    <p className="text-xs text-secondary mt-1">{rule.explanation}</p>
                  </div>
                ))}
              </div>

              <div className="add-term-box">
                <h4 className="add-heading">Add Required Term</h4>
                <div className="form-grid-2 mb-2">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Term (e.g., NovaTech)"
                    value={newRequired.term}
                    onChange={(e) => setNewRequired({ ...newRequired, term: e.target.value })}
                  />
                  <select
                    className="form-select"
                    value={newRequired.severity}
                    onChange={(e) =>
                      setNewRequired({ ...newRequired, severity: e.target.value as IssueSeverity })
                    }
                  >
                    <option value="medium">Medium Severity</option>
                    <option value="high">High Severity</option>
                    <option value="low">Low Severity</option>
                  </select>
                </div>
                <div className="form-grid-2 mb-2">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Context (e.g., Press releases)"
                    value={newRequired.context}
                    onChange={(e) => setNewRequired({ ...newRequired, context: e.target.value })}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Explanation (e.g., Must cite brand name once)"
                    value={newRequired.explanation}
                    onChange={(e) => setNewRequired({ ...newRequired, explanation: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={addRequiredTerm}
                >
                  <Plus size={14} /> Add Required Term
                </button>
              </div>
            </div>
          </div>

          {/* Section 6: Approved Brand Facts & Evidence */}
          <div className="glass-card mb-6">
            <div className="card-header-styled">
              <div className="header-icon-pill icon-success">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h3 className="card-heading">6. Approved Brand Facts & Evidence</h3>
                <p className="card-subheading">
                  Verified claims, SLA guarantees, and empirical benchmarks used by the analysis engine to substantiate content claims
                </p>
              </div>
            </div>

            <div className="approved-facts-stack mb-4">
              {(profile.approvedFacts || []).map((fact, idx) => (
                <div key={idx} className="rule-card-mini flex-between p-3 rounded-lg bg-black/30 border border-white/10 mb-2">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold text-sm shrink-0 mt-0.5">&#10003;</span>
                    <span className="text-sm text-white font-medium">{fact}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-icon-danger ml-3 shrink-0"
                    onClick={() => removeApprovedFact(idx)}
                    title="Remove approved fact"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {(!profile.approvedFacts || profile.approvedFacts.length === 0) && (
                <div className="text-center text-muted py-4 text-sm">
                  No approved brand facts configured. Add certified brand facts below to automatically substantiate quantitative claims and SLA guarantees.
                </div>
              )}
            </div>

            <div className="add-term-box">
              <h4 className="add-heading">Add Approved Brand Fact</h4>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="form-input flex-1"
                  placeholder='e.g., NovaTech provides 99.99% availability under our Enterprise SLA.'
                  value={newFactText}
                  onChange={(e) => setNewFactText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addApprovedFact();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={addApprovedFact}
                >
                  <Plus size={14} /> Add Fact
                </button>
              </div>
              <p className="text-xs text-muted mb-0">
                Facts added here are verified against marketing content by the analysis engine and will automatically cite this evidence in audit reports.
              </p>
            </div>
          </div>

          {/* Section 7: Tone Rules */}
          <div className="glass-card mb-6">
            <div className="card-header-styled">
              <div className="header-icon-pill icon-warning">
                <Volume2 size={18} />
              </div>
              <div>
                <h3 className="card-heading">7. Tone & Voice Violations</h3>
                <p className="card-subheading">
                  Off-brand expressions (condescending words, hype, slang, or colloquialisms)
                </p>
              </div>
            </div>

            <div className="table-responsive mb-4">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Banned Word or Style</th>
                    <th>Suggested Remedy</th>
                    <th>Policy Explanation</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(g.toneRules || []).map((rule, idx) => (
                    <tr key={idx}>
                      <td className="font-mono text-warning font-medium">"{rule.bannedWordOrStyle}"</td>
                      <td>
                        <span className="badge badge-low text-xs">{rule.suggestion}</span>
                      </td>
                      <td className="text-sm text-secondary">{rule.explanation}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-icon-danger"
                          onClick={() => removeToneRule(idx)}
                          title="Remove rule"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!g.toneRules || g.toneRules.length === 0) && (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-4">
                        No specific tone violation rules defined.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="add-term-box">
              <h4 className="add-heading">Add Tone Rule</h4>
              <div className="form-grid-3 mb-2">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Banned Word / Style (e.g., obviously)"
                  value={newToneRule.bannedWordOrStyle}
                  onChange={(e) => setNewToneRule({ ...newToneRule, bannedWordOrStyle: e.target.value })}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Suggestion (e.g., as demonstrated)"
                  value={newToneRule.suggestion}
                  onChange={(e) => setNewToneRule({ ...newToneRule, suggestion: e.target.value })}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Explanation (e.g., Condescending tone)"
                  value={newToneRule.explanation}
                  onChange={(e) => setNewToneRule({ ...newToneRule, explanation: e.target.value })}
                />
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={addToneRule}
              >
                <Plus size={14} /> Add Tone Rule
              </button>
            </div>
          </div>

          {/* Save Action Footer Bar */}
          <div className="guidelines-footer-actions glass-card">
            <div className="footer-status-text text-muted text-sm">
              {isConfigured ? (
                <>
                  Saves updates directly to backend via <code>PUT /api/brands/{targetBrandId}</code>
                </>
              ) : (
                <>
                  Saves active brand guidelines for <strong>{profile.name}</strong> ({activeIndustry || 'Universal Category'})
                </>
              )}
            </div>
            <div className="footer-buttons">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReset}
                disabled={isSaving}
              >
                <RotateCcw size={16} /> Reset
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving}
              >
                <Save size={16} />
                <span>{isSaving ? 'Saving...' : isConfigured ? 'Save Brand Guidelines' : 'Save Guidelines'}</span>
              </button>
            </div>
          </div>
        </form>
      </>
    )}
    </div>
  );
};
