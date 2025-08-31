export interface Project {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  type?: 'electrolyzer' | 'storage' | 'transport' | 'distribution';
  projectType?: 'production' | 'storage' | 'distribution' | 'hub';
  capacity?: string | number;
  capacityTPA?: number;
  status: 'operational' | 'planned' | 'construction' | 'decommissioned' | 'concept' | 'planning';
  location: {
    lat?: number;
    lng?: number;
    address?: string;
    type?: string;
    coordinates?: [number, number]; // GeoJSON format [lng, lat]
    region?: string;
    country?: string;
  };
  owner?: string;
  startDate?: string;
  endDate?: string;
  completionDate?: string;
  investment?: {
    total?: number;
  };
  cost?: {
    estimated?: number;
    actual?: number;
    currency?: string;
  };
  efficiency?: number;
  stakeholders?: {
    partners?: string[];
  };
  timeline?: {
    expectedCompletion?: string;
  };
  environmental?: {
    co2ReductionPotential?: number;
  };
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ProjectFilters {
  type?: string;
  status?: string;
  owner?: string;
  location?: string;
  capacity?: {
    min?: number;
    max?: number;
  };
}

export interface ProjectStats {
  total: number;
  operational: number;
  planned: number;
  construction: number;
  totalCapacity: number;
  averageEfficiency: number;
}