import { apiClient } from './client';

export interface GeocodeResult {
  coordinates: {
    lat: number;
    lng: number;
  };
  formattedAddress: string;
  addressComponents: {
    address: string;
    city: string;
    region: string;
    country: string;
    postalCode: string;
  };
  boundingBox?: {
    south: number;
    north: number;
    west: number;
    east: number;
  };
}

export interface ReverseGeocodeResult {
  address: string;
  addressComponents: {
    address: string;
    city: string;
    region: string;
    country: string;
    postalCode: string;
  };
  type: string;
  importance: number;
}

export const geocodingApi = {
  async geocodeAddress(address: string): Promise<GeocodeResult> {
    const response = await apiClient.post<{ success: boolean; data: GeocodeResult }>(
      '/geocoding/geocode',
      { address }
    );
    return response.data;
  },

  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
    const response = await apiClient.get<{ success: boolean; data: ReverseGeocodeResult }>(
      `/geocoding/reverse?lat=${lat}&lng=${lng}`
    );
    return response.data;
  },

  async batchGeocode(addresses: string[]): Promise<Array<{
    success: boolean;
    data?: GeocodeResult;
    error?: string;
    originalAddress: string;
  }>> {
    const response = await apiClient.post<{ 
      success: boolean; 
      data: Array<{
        success: boolean;
        data?: GeocodeResult;
        error?: string;
        originalAddress: string;
      }>;
    }>('/geocoding/batch', { addresses });
    return response.data;
  }
};