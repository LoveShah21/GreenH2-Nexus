import { apiClient } from './client';

export interface ZonePrediction {
  lat: number;
  lng: number;
  efficiency: number;
  cost: number;
  zone: 'green' | 'yellow' | 'red';
  timestamp: string;
}

export interface BatchPredictionRequest {
  locations: Array<{ lat: number; lng: number }>;
}

export interface BatchPredictionResponse {
  predictions: ZonePrediction[];
}

export interface AreaAnalysisRequest {
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  gridSize?: number;
}

export interface AreaAnalysisResponse {
  totalPoints: number;
  zoneDistribution: {
    green: number;
    yellow: number;
    red: number;
  };
  averageEfficiency: number;
  averageCost: number;
  predictions: ZonePrediction[];
}

export const mlPredictionsApi = {
  async predictZone(lat: number, lng: number): Promise<ZonePrediction> {
    const response = await apiClient.get<{ success: boolean; data: ZonePrediction }>(
      `/ml-predictions/predict-zone?lat=${lat}&lng=${lng}`
    );
    return response.data;
  },

  async predictZonesBatch(locations: Array<{ lat: number; lng: number }>): Promise<ZonePrediction[]> {
    const response = await apiClient.post<{ success: boolean; data: BatchPredictionResponse }>(
      '/ml-predictions/predict-zones/batch',
      { locations }
    );
    return response.data.predictions;
  },

  async analyzeArea(request: AreaAnalysisRequest): Promise<AreaAnalysisResponse> {
    const response = await apiClient.post<{ success: boolean; data: AreaAnalysisResponse }>(
      '/ml-predictions/analyze-area',
      request
    );
    return response.data;
  },

  async checkHealth(): Promise<any> {
    const response = await apiClient.get<{ success: boolean; data: any }>('/ml-predictions/health');
    return response.data;
  }
};