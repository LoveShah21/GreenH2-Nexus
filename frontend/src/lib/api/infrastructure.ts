import { apiClient } from './client';

export interface Infrastructure {
  id: string;
  infrastructureType: 'pipeline' | 'storage_facility' | 'production_plant' | 'distribution_hub';
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon' | 'MultiPolygon';
    coordinates: number[] | number[][] | number[][][];
  };
  capacity: {
    value: number;
    unit: string;
  };
  operationalStatus: 'operational' | 'under_construction' | 'planned' | 'decommissioned';
  projectId: string;
  specifications?: {
    diameter?: number;
    pressure?: number;
    material?: string;
    safetyRating?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface InfrastructureFilters {
  page?: number;
  limit?: number;
  infrastructureType?: string;
  operationalStatus?: string;
  projectId?: string;
}

export const infrastructureApi = {
  async getInfrastructure(filters: InfrastructureFilters = {}): Promise<Infrastructure[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiClient.get<{ success: boolean; data: Infrastructure[] }>(
      `/infrastructure?${params.toString()}`
    );
    return response.data || [];
  },

  async createInfrastructure(infrastructure: Omit<Infrastructure, 'id' | 'createdAt' | 'updatedAt'>): Promise<Infrastructure> {
    const response = await apiClient.post<{ success: boolean; data: Infrastructure }>(
      '/infrastructure',
      infrastructure
    );
    return response.data;
  },

  async getRouteOptimization(params: any): Promise<any> {
    const queryParams = new URLSearchParams(params);
    const response = await apiClient.get<{ success: boolean; data: any }>(
      `/infrastructure/route-optimization?${queryParams.toString()}`
    );
    return response.data;
  },

  async performSiteSuitabilityAnalysis(request: any): Promise<any> {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      '/infrastructure/site-suitability',
      request
    );
    return response.data;
  },

  async getConnectivityAnalysis(params: any): Promise<any> {
    const queryParams = new URLSearchParams(params);
    const response = await apiClient.get<{ success: boolean; data: any }>(
      `/infrastructure/connectivity-analysis?${queryParams.toString()}`
    );
    return response.data;
  }
};