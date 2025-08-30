import { apiClient } from './client';
import { Project } from '@/types/project';
import { PaginatedResponse } from '@/types/api';

export interface ProjectFilters {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  region?: string;
  search?: string;
}

export interface NearbyProjectsParams {
  lat: number;
  lng: number;
  radius: number; // in km
}

export interface ProjectsInBoundsParams {
  neLat: number;
  neLng: number;
  swLat: number;
  swLng: number;
}

export const projectsApi = {
  async getProjects(filters: ProjectFilters = {}): Promise<PaginatedResponse<Project>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    return apiClient.get<PaginatedResponse<Project>>(`/projects?${params.toString()}`);
  },

  async getProject(id: string): Promise<Project> {
    return apiClient.get<Project>(`/projects/${id}`);
  },

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    return apiClient.post<Project>('/projects', project);
  },

  async updateProject(id: string, project: Partial<Project>): Promise<Project> {
    return apiClient.put<Project>(`/projects/${id}`, project);
  },

  async deleteProject(id: string): Promise<void> {
    return apiClient.delete(`/projects/${id}`);
  },

  async getNearbyProjects(params: NearbyProjectsParams): Promise<Project[]> {
    const queryParams = new URLSearchParams({
      lat: params.lat.toString(),
      lng: params.lng.toString(),
      radius: params.radius.toString(),
    });
    
    return apiClient.get<Project[]>(`/projects/nearby?${queryParams.toString()}`);
  },

  async getProjectsInBounds(params: ProjectsInBoundsParams): Promise<Project[]> {
    const queryParams = new URLSearchParams({
      neLat: params.neLat.toString(),
      neLng: params.neLng.toString(),
      swLat: params.swLat.toString(),
      swLng: params.swLng.toString(),
    });
    
    return apiClient.get<Project[]>(`/projects/within-bounds?${queryParams.toString()}`);
  }
};