export interface Infrastructure {
  id: string;
  name: string;
  type: 'production_plant' | 'storage_facility' | 'pipeline' | 'distribution_hub' | 'renewable_source';
  status: 'operational' | 'under_construction' | 'planned' | 'decommissioned';
  location: {
    lat: number;
    lng: number;
    address: string;
    region: string;
  };
  capacity: number;
  specifications: {
    technology?: string;
    efficiency?: number;
    maxPressure?: number;
    storageType?: string;
    pipelineDiameter?: number;
    length?: number;
  };
  connections: string[]; // IDs of connected infrastructure
  operationalData: {
    currentCapacity: number;
    utilizationRate: number;
    lastMaintenance: string;
    nextMaintenance: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NetworkAnalysis {
  connectivity: {
    nodeId: string;
    connections: number;
    centrality: number;
  }[];
  criticalPaths: {
    from: string;
    to: string;
    path: string[];
    reliability: number;
  }[];
  bottlenecks: {
    nodeId: string;
    capacity: number;
    demand: number;
    utilizationRate: number;
  }[];
}