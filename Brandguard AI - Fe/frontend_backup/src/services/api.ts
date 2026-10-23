import type { BrandProfile, BrandSummary, UpdateBrandRequest } from '../types/brand';
import type { AnalyzeRequest, AnalysisResponse } from '../types/analysis';
import type { HealthStatus, ApiSuccessResponse } from '../types/api';

/**
 * Shared Backend API Client for BrandGuard AI
 * Default base URL: http://localhost:5000 (configurable via VITE_API_URL or VITE_API_BASE_URL)
 */
function resolveBaseUrl(): string {
  const envUrl = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:5000'
  ).replace(/\/+$/, '');
  return envUrl;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(newUrl: string) {
    this.baseUrl = newUrl.replace(/\/+$/, '');
  }

  /**
   * Helper to normalize endpoint and avoid duplicate /api segments.
   * If baseUrl already ends with /api, strip leading /api from endpoint.
   */
  private buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    if (this.baseUrl.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
      return `${this.baseUrl}${cleanEndpoint.slice(4)}`;
    }
    return `${this.baseUrl}${cleanEndpoint}`;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = this.buildUrl(endpoint);

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorJson = await response.json();
          if (errorJson) {
            if (errorJson.error?.message) {
              errorMessage = errorJson.error.message;
            } else if (typeof errorJson.error === 'string') {
              errorMessage = errorJson.error;
            } else if (errorJson.message) {
              errorMessage = errorJson.message;
            }
          }
        } catch {
          // Response body was not JSON, retain default status message
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data as T;
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new Error(`Connection to backend at ${this.baseUrl} timed out after 10s.`);
      }
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new Error(`Cannot connect to backend server at ${this.baseUrl}. Please verify the backend service is running.`);
      }
      throw err;
    }
  }

  /**
   * Health check endpoint: GET /api/health
   */
  async checkHealth(): Promise<HealthStatus> {
    return this.request<HealthStatus>('/api/health');
  }

  /**
   * List all brands: GET /api/brands
   * Response: { success: true, data: BrandSummary[] }
   */
  async getBrands(): Promise<BrandSummary[]> {
    const res = await this.request<ApiSuccessResponse<BrandSummary[]> | BrandSummary[]>('/api/brands');
    if (res && typeof res === 'object' && 'data' in res && Array.isArray(res.data)) {
      return res.data;
    }
    if (Array.isArray(res)) {
      return res;
    }
    return [];
  }

  /**
   * Get brand guidelines: GET /api/brands/:brandId
   * Response: { success: true, data: BrandProfile }
   */
  async getBrand(brandId: string): Promise<BrandProfile> {
    const res = await this.request<ApiSuccessResponse<BrandProfile> | BrandProfile>(
      `/api/brands/${encodeURIComponent(brandId)}`
    );
    if (res && typeof res === 'object' && 'data' in res && (res as ApiSuccessResponse<BrandProfile>).data) {
      return (res as ApiSuccessResponse<BrandProfile>).data;
    }
    return res as BrandProfile;
  }

  /**
   * Update brand guidelines: PUT /api/brands/:brandId
   * Request Body: { name, description?, tone?, guidelines }
   * Response: { success: true, data: { id, name, updatedAt }, message?: string }
   */
  async updateBrand(
    brandId: string,
    payload: UpdateBrandRequest | BrandProfile
  ): Promise<BrandProfile> {
    // Structure payload according to PUT contract: { name, description, tone, guidelines }
    const body: UpdateBrandRequest = {
      name: payload.name,
      description: payload.description,
      tone: payload.tone,
      guidelines: payload.guidelines,
    };

    const res = await this.request<ApiSuccessResponse<{ id: string; name: string; updatedAt: string }> | BrandProfile>(
      `/api/brands/${encodeURIComponent(brandId)}`,
      {
        method: 'PUT',
        body: JSON.stringify(body),
      }
    );

    // If backend returns minimal updated receipt, re-fetch or synthesize complete profile
    if (res && typeof res === 'object' && 'data' in res) {
      const receipt = (res as ApiSuccessResponse<{ id: string; name: string; updatedAt: string }>).data;
      return {
        id: receipt.id || brandId,
        name: receipt.name || payload.name,
        description: payload.description,
        tone: payload.tone,
        guidelines: payload.guidelines,
        updatedAt: receipt.updatedAt || new Date().toISOString(),
      };
    }

    return res as BrandProfile;
  }

  /**
   * Analyze marketing content: POST /api/analyze
   * Request Body: { brandId, content }
   * Response: AnalysisResponse
   */
  async analyzeContent(request: AnalyzeRequest): Promise<AnalysisResponse> {
    return this.request<AnalysisResponse>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

export const apiService = new ApiClient(resolveBaseUrl());
