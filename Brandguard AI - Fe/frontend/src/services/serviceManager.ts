import { apiService } from './api';
import { devMockAdapter, INITIAL_NOVATECH_PROFILE } from './mockAdapter';
import type { BrandProfile, BrandSummary, UpdateBrandRequest } from '../types/brand';
import type { AnalyzeRequest, AnalysisResponse } from '../types/analysis';

export interface ServiceStatus {
  isBackendConnected: boolean;
  isMockMode: boolean;
  backendUrl: string;
  lastChecked: string | null;
  errorMessage: string | null;
}

class ServiceManager {
  private useMock: boolean = false;
  private backendConnected: boolean = false;
  private lastChecked: string | null = null;
  private errorMessage: string | null = null;
  private listeners: ((status: ServiceStatus) => void)[] = [];

  constructor() {
    const savedMockPref = localStorage.getItem('brandguard_use_mock');
    if (savedMockPref === 'true') {
      this.useMock = true;
    }
  }

  public subscribe(listener: (status: ServiceStatus) => void): () => void {
    this.listeners.push(listener);
    listener(this.getStatus());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    const status = this.getStatus();
    this.listeners.forEach((listener) => listener(status));
  }

  public getStatus(): ServiceStatus {
    return {
      isBackendConnected: this.backendConnected,
      isMockMode: this.useMock,
      backendUrl: apiService.getBaseUrl(),
      lastChecked: this.lastChecked,
      errorMessage: this.errorMessage,
    };
  }

  public setMockMode(enabled: boolean) {
    this.useMock = enabled;
    localStorage.setItem('brandguard_use_mock', String(enabled));
    this.notify();
  }

  /**
   * Probe the backend health endpoint (GET /api/health).
   */
  public async probeBackend(): Promise<boolean> {
    try {
      this.lastChecked = new Date().toLocaleTimeString();
      const health = await apiService.checkHealth();
      this.backendConnected = health.status === 'ok';
      this.errorMessage = null;
    } catch (err: unknown) {
      this.backendConnected = false;
      this.errorMessage = err instanceof Error ? err.message : 'Unable to reach backend API at ' + apiService.getBaseUrl();
    }
    this.notify();
    return this.backendConnected;
  }

  /**
   * Fetch brand list (GET /api/brands)
   */
  public async getBrands(): Promise<{ brands: BrandSummary[]; source: 'backend' | 'mock' }> {
    if (this.useMock) {
      const brands = await devMockAdapter.getBrands();
      return { brands, source: 'mock' };
    }

    try {
      const brands = await apiService.getBrands();
      this.backendConnected = true;
      this.errorMessage = null;
      this.notify();
      return { brands, source: 'backend' };
    } catch (err: unknown) {
      this.backendConnected = false;
      this.errorMessage = err instanceof Error ? err.message : 'Failed to fetch brands from backend';
      this.notify();
      throw err;
    }
  }

  /**
   * Fetch specific brand guidelines (GET /api/brands/:brandId)
   */
  public async getBrand(brandId: string): Promise<{ profile: BrandProfile; source: 'backend' | 'mock' }> {
    if (this.useMock) {
      const profile = await devMockAdapter.getBrand(brandId);
      return { profile, source: 'mock' };
    }

    try {
      const profile = await apiService.getBrand(brandId);
      this.backendConnected = true;
      this.errorMessage = null;
      this.notify();
      return { profile, source: 'backend' };
    } catch (err: unknown) {
      this.backendConnected = false;
      this.errorMessage = err instanceof Error ? err.message : `Failed to load brand "${brandId}" from backend`;
      this.notify();
      throw err;
    }
  }

  /**
   * Save updated brand profile and guidelines (PUT /api/brands/:brandId)
   */
  public async updateBrand(
    brandId: string,
    payload: UpdateBrandRequest | BrandProfile
  ): Promise<{ profile: BrandProfile; source: 'backend' | 'mock' }> {
    if (this.useMock) {
      const updated = await devMockAdapter.updateBrand(brandId, payload);
      return { profile: updated, source: 'mock' };
    }

    try {
      const updated = await apiService.updateBrand(brandId, payload);
      this.backendConnected = true;
      this.errorMessage = null;
      this.notify();
      return { profile: updated, source: 'backend' };
    } catch (err: unknown) {
      this.backendConnected = false;
      this.errorMessage = err instanceof Error ? err.message : `Failed to update brand "${brandId}" on backend`;
      this.notify();
      throw err;
    }
  }

  /**
   * Analyze marketing copy against brand guidelines (POST /api/analyze)
   */
  public async analyzeContent(
    request: AnalyzeRequest
  ): Promise<{ response: AnalysisResponse; source: 'backend' | 'mock' }> {
    if (this.useMock) {
      const response = await devMockAdapter.analyzeContent(request);
      return { response, source: 'mock' };
    }

    try {
      const response = await apiService.analyzeContent(request);
      this.backendConnected = true;
      this.errorMessage = null;
      this.notify();
      return { response, source: 'backend' };
    } catch (err: unknown) {
      this.backendConnected = false;
      this.errorMessage = err instanceof Error ? err.message : 'Analysis request failed against backend server';
      this.notify();
      throw err;
    }
  }
}

export const serviceManager = new ServiceManager();
export const INITIAL_NOVATECH_GUIDELINES = INITIAL_NOVATECH_PROFILE;
export { INITIAL_NOVATECH_PROFILE };
