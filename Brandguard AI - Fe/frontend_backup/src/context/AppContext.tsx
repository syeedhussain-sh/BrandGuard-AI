import React, { createContext, useState, useEffect, useCallback } from 'react';
import { serviceManager, INITIAL_NOVATECH_PROFILE } from '../services/serviceManager';
import type { ServiceStatus } from '../services/serviceManager';
import type { BrandSummary, BrandProfile, UpdateBrandRequest } from '../types/brand';
import type { AnalysisResponse, RecentAnalysisItem } from '../types/analysis';

export type ActivePage = 'dashboard' | 'guidelines' | 'checker' | 'results';

export interface AppContextType {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  serviceStatus: ServiceStatus;
  setMockMode: (enabled: boolean) => void;
  probeBackend: () => Promise<boolean>;
  brands: BrandSummary[];
  selectedBrandId: string;
  setSelectedBrandId: (id: string) => void;
  currentProfile: BrandProfile | null;
  setCurrentProfile: (p: BrandProfile | null) => void;
  // Alias for backward compatibility
  currentGuidelines: BrandProfile | null;
  loadBrandGuidelines: (brandId: string) => Promise<BrandProfile | null>;
  saveBrandGuidelines: (brandId: string, profile: BrandProfile | UpdateBrandRequest) => Promise<boolean>;
  refreshBrands: () => Promise<void>;

  // Analysis State
  latestAnalysis: AnalysisResponse | null;
  latestOriginalContent: string;
  latestBrandName: string;
  recentAnalyses: RecentAnalysisItem[];
  recordAnalysis: (brandId: string, brandName: string, content: string, response: AnalysisResponse) => void;
  viewAnalysisResult: (item: RecentAnalysisItem) => void;
  clearHistory: () => void;

  // UI Toast notifications
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_HISTORY_KEY = 'brandguard_analysis_history_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>(serviceManager.getStatus());
  const [brands, setBrands] = useState<BrandSummary[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('demo-brand');
  const [currentProfile, setCurrentProfile] = useState<BrandProfile | null>(INITIAL_NOVATECH_PROFILE);

  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisResponse | null>(null);
  const [latestOriginalContent, setLatestOriginalContent] = useState<string>('');
  const [latestBrandName, setLatestBrandName] = useState<string>('NovaTech');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load analysis history from localStorage
  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysisItem[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore parse errors
    }
    // Default initial demonstration record based on contract Section 3.5.2 & 3.5.4
    return [
      {
        id: 'anlz_demo_baseline',
        brandId: 'demo-brand',
        brandName: 'NovaTech',
        timestamp: new Date().toISOString(),
        totalIssues: 4,
        highSeverity: 3,
        contentSnippet: 'Our Nova Cloud is the cheapest cloud in the market and it is obviously 100% bug-free. We guarantee total perfection.',
        characterCount: 114,
        wordCount: 19,
        originalContent: 'Our Nova Cloud is the cheapest cloud in the market and it is obviously 100% bug-free. We guarantee total perfection.',
        analysisResult: {
          success: true,
          analysisId: 'anlz_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
          summary: {
            totalIssues: 4,
            high: 3,
            medium: 1,
            low: 0,
          },
          issues: [
            {
              id: 'iss_1',
              category: 'terminology',
              severity: 'high',
              matchedText: 'Nova Cloud',
              explanation: 'Always refer to our core offering by its complete official brand name.',
              suggestion: 'NovaTech Cloud Platform'
            },
            {
              id: 'iss_2',
              category: 'restricted_phrase',
              severity: 'high',
              matchedText: 'cheapest cloud in the market',
              explanation: 'Unsubstantiated pricing superlatives are prohibited.',
              suggestion: 'cost-effective, high-performance cloud infrastructure'
            },
            {
              id: 'iss_3',
              category: 'tone',
              severity: 'medium',
              matchedText: 'obviously',
              explanation: 'Condescending tone undermines accessible brand voice.',
              suggestion: 'as demonstrated'
            },
            {
              id: 'iss_4',
              category: 'restricted_phrase',
              severity: 'high',
              matchedText: '100% bug-free',
              explanation: 'Absolute reliability claims violate compliance policies.',
              suggestion: 'engineered for high reliability and resilience'
            }
          ],
          correctedContent: 'Our NovaTech Cloud Platform is the cost-effective, high-performance cloud infrastructure and it is as demonstrated engineered for high reliability and resilience. We commit to high availability under our standard SLA total perfection.',
          analysisMode: 'rules'
        }
      }
    ];
  });

  // Save history on changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(recentAnalyses));
    } catch {
      // ignore storage errors
    }
  }, [recentAnalyses]);

  // Subscribe to service manager status changes
  useEffect(() => {
    const unsubscribe = serviceManager.subscribe((status) => {
      setServiceStatus(status);
    });
    // Initial health probe
    serviceManager.probeBackend();
    return unsubscribe;
  }, []);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const refreshBrands = useCallback(async () => {
    try {
      const res = await serviceManager.getBrands();
      setBrands(res.brands);
      if (res.brands.length > 0 && !res.brands.some((b) => b.id === selectedBrandId)) {
        setSelectedBrandId(res.brands[0].id);
      }
    } catch (err: unknown) {
      console.warn('Backend unavailable, continuing with available profiles:', err);
    }
  }, [selectedBrandId]);

  const loadBrandGuidelines = useCallback(async (brandId: string): Promise<BrandProfile | null> => {
    try {
      const res = await serviceManager.getBrand(brandId);
      setCurrentProfile(res.profile);
      return res.profile;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error loading brand guidelines';
      showToast(msg, 'error');
      return null;
    }
  }, []);

  const saveBrandGuidelines = async (
    brandId: string,
    profilePayload: BrandProfile | UpdateBrandRequest
  ): Promise<boolean> => {
    try {
      const res = await serviceManager.updateBrand(brandId, profilePayload);
      setCurrentProfile(res.profile);
      showToast(
        `Guidelines for ${res.profile.name} updated successfully (${res.source === 'mock' ? 'Dev Mock' : 'Live Backend'})!`,
        'success'
      );
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update brand on backend';
      showToast(msg, 'error');
      return false;
    }
  };

  const recordAnalysis = (brandId: string, brandName: string, content: string, response: AnalysisResponse) => {
    setLatestAnalysis(response);
    setLatestOriginalContent(content);
    setLatestBrandName(brandName);

    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const newItem: RecentAnalysisItem = {
      id: response.analysisId || `anlz_${Date.now()}`,
      brandId,
      brandName,
      timestamp: new Date().toISOString(),
      totalIssues: response.summary.totalIssues,
      highSeverity: response.summary.high,
      contentSnippet: content.slice(0, 110) + (content.length > 110 ? '...' : ''),
      characterCount: content.length,
      wordCount: words,
      originalContent: content,
      analysisResult: response,
    };

    setRecentAnalyses((prev) => [newItem, ...prev.slice(0, 29)]);
  };

  const viewAnalysisResult = (item: RecentAnalysisItem) => {
    setLatestAnalysis(item.analysisResult);
    setLatestOriginalContent(item.originalContent);
    setLatestBrandName(item.brandName);
    setActivePage('results');
  };

  const clearHistory = () => {
    setRecentAnalyses([]);
    localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
    showToast('Analysis audit history cleared', 'info');
  };

  const setMockMode = (enabled: boolean) => {
    serviceManager.setMockMode(enabled);
    showToast(
      enabled
        ? 'Development Mock Adapter Enabled (Offline UI Mode)'
        : 'Live Backend Mode Activated (http://localhost:5000/api)',
      'info'
    );
    refreshBrands();
  };

  const probeBackend = async () => {
    const ok = await serviceManager.probeBackend();
    if (ok) {
      showToast('Successfully connected to backend API at ' + serviceStatus.backendUrl, 'success');
    } else {
      showToast('Backend offline or unreachable. You can use Dev Mock Mode.', 'error');
    }
    refreshBrands();
    return ok;
  };

  // Initial load
  useEffect(() => {
    refreshBrands();
    loadBrandGuidelines(selectedBrandId);
  }, [serviceStatus.isMockMode, refreshBrands, loadBrandGuidelines, selectedBrandId]);

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        serviceStatus,
        setMockMode,
        probeBackend,
        brands,
        selectedBrandId,
        setSelectedBrandId,
        currentProfile,
        setCurrentProfile,
        currentGuidelines: currentProfile,
        loadBrandGuidelines,
        saveBrandGuidelines,
        refreshBrands,
        latestAnalysis,
        latestOriginalContent,
        latestBrandName,
        recentAnalyses,
        recordAnalysis,
        viewAnalysisResult,
        clearHistory,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { useApp } from './useApp';
