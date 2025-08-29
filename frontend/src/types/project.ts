export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'concept' | 'planning' | 'construction' | 'operational' | 'decommissioned';
  type: 'production' | 'storage' | 'distribution' | 'transport';
  capacity: number; // in MW or kg/day
  location: {
    lat: number;
    lng: number;
    address: string;
    region: string;
    country: string;
  };
  investment: {
    total: number;
    currency: string;
    investors: string[];
  };
  timeline: {
    startDate: string;
    expectedCompletion: string;
    actualCompletion?: string;
  };
  environmental: {
    co2ReductionPotential: number; // tons per year
    renewableEnergySource?: string;
    certifications: string[];
  };
  stakeholders: {
    developer: string;
    operator?: string;
    partners: string[];
  };
  technicalSpecs: {
    technology: string;
    efficiency?: number;
    storageCapacity?: number;
    pipelineLength?: number;
  };
  createdAt: string;
  updatedAt: string;
}