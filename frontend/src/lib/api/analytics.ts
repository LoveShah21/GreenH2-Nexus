import { apiClient } from './client';

export interface AnalyticsData {
  id: string;
  projectId: string;
  metrics: {
    efficiency: number;
    cost: number;
    capacity: number;
    utilization: number;
  };
  timestamp: string;
}

export interface GeospatialAnalysisRequest {
  coordinates: [number, number];
  radius: number;
  analysisType: 'suitability' | 'optimization' | 'network';
}

export interface DemandForecastRequest {
  region: string;
  timeframe: number; // months
  scenarios: string[];
}

export const analyticsApi = {
  async getAnalyticsData(filters: any = {}): Promise<AnalyticsData[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiClient.get<{ success: boolean; data: AnalyticsData[] }>(
      `/analytics/data?${params.toString()}`
    );
    return response.data;
  },

  async performGeospatialAnalysis(request: GeospatialAnalysisRequest): Promise<any> {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      '/analytics/geospatial',
      request
    );
    return response.data;
  },

  async performDemandForecasting(request: DemandForecastRequest): Promise<any> {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      '/analytics/demand-forecast',
      request
    );
    return response.data;
  },

  async getRealTimeMetrics(projectId: string): Promise<any> {
    const response = await apiClient.get<{ success: boolean; data: any }>(
      `/analytics/real-time-metrics/${projectId}`
    );
    return response.data;
  },

  async getAnalyticsSummary(): Promise<any> {
    const response = await apiClient.get<{ success: boolean; data: any }>(
      '/analytics/summary'
    );
    return response.data;
  }
};