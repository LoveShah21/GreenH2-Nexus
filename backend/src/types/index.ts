import { Document, Types } from 'mongoose';

// Base interfaces
export interface BaseDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
}

// Geospatial types
export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface GeoJSONLineString {
  type: 'LineString';
  coordinates: [number, number][]; // Array of [longitude, latitude] pairs
}

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: [number, number][][]; // Array of linear rings
}

export interface GeoJSONMultiPolygon {
  type: 'MultiPolygon';
  coordinates: [number, number][][][]; // Array of polygons
}

export type Geometry = GeoJSONPoint | GeoJSONLineString | GeoJSONPolygon | GeoJSONMultiPolygon;

// User and Authentication
export interface IUser extends BaseDocument {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organization: string;
  isActive: boolean;
  lastLogin?: Date;
  refreshToken?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  ANALYST = 'analyst',
  VIEWER = 'viewer'
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Project Management
export interface IProject extends BaseDocument {
  name: string;
  projectType: ProjectType;
  status: ProjectStatus;
  location: GeoJSONPoint;
  capacityTPA: number;
  stakeholders: string[];
  startDate?: Date;
  completionDate?: Date;
  cost: {
    estimated: number;
    actual?: number;
    currency: string;
  };
  metadata: {
    tags: string[];
    customFields: Record<string, any>;
  };
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
}

export enum ProjectType {
  PRODUCTION = 'production',
  STORAGE = 'storage',
  DISTRIBUTION = 'distribution',
  HUB = 'hub'
}

export enum ProjectStatus {
  CONCEPT = 'concept',
  PLANNING = 'planning',
  CONSTRUCTION = 'construction',
  OPERATIONAL = 'operational'
}

// Infrastructure
export interface IInfrastructure extends BaseDocument {
  infrastructureType: InfrastructureType;
  geometry: Geometry;
  capacity: {
    value: number;
    unit: string;
  };
  operationalStatus: OperationalStatus;
  projectId: Types.ObjectId;
  connectedInfrastructure: ConnectedInfrastructure[];
  specifications: InfrastructureSpecifications;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
}

export enum InfrastructureType {
  PIPELINE = 'pipeline',
  STORAGE_FACILITY = 'storage_facility',
  PRODUCTION_PLANT = 'production_plant',
  DISTRIBUTION_HUB = 'distribution_hub'
}

export enum OperationalStatus {
  OPERATIONAL = 'operational',
  UNDER_CONSTRUCTION = 'under_construction',
  PLANNED = 'planned',
  DECOMMISSIONED = 'decommissioned'
}

export interface ConnectedInfrastructure {
  infrastructureId: Types.ObjectId;
  connectionType: ConnectionType;
  distance: number; // in kilometers
}

export enum ConnectionType {
  PIPELINE = 'pipeline',
  TRANSPORT = 'transport',
  ELECTRICAL = 'electrical'
}

export interface InfrastructureSpecifications {
  diameter?: number; // for pipelines
  pressure?: number; // operating pressure
  material?: string;
  safetyRating?: string;
}

// Renewable Energy Sources
export interface IRenewableSource extends BaseDocument {
  sourceType: RenewableSourceType;
  location: GeoJSONPoint;
  capacityMW: number;
  availabilityFactor: number; // 0-1 decimal
  distanceToGrid: number; // kilometers
  annualGeneration: number; // MWh/year
  lcoe: {
    value: number;
    currency: string;
    unit: string;
  };
  environmentalData: {
    windSpeed?: number; // m/s average
    solarIrradiance?: number; // kWh/m²/day
    waterFlow?: number; // for hydro, m³/s
  };
  region: string;
  regulatoryZone: string;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
}

export enum RenewableSourceType {
  WIND = 'wind',
  SOLAR = 'solar',
  HYDRO = 'hydro',
  BIOMASS = 'biomass'
}

// Demand Centers
export interface IDemandCenter extends BaseDocument {
  name: string;
  location: Geometry;
  demandType: DemandType;
  currentDemand: {
    value: number; // tons H2/year
    unit: string;
  };
  projectedDemand: ProjectedDemand[];
  industry?: string;
  population?: number;
  transportationFleet?: {
    buses: number;
    trucks: number;
    ships: number;
    trains: number;
  };
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
}

export enum DemandType {
  INDUSTRIAL = 'industrial',
  TRANSPORTATION = 'transportation',
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  EXPORT = 'export'
}

export interface ProjectedDemand {
  year: number;
  value: number;
  scenario: DemandScenario;
}

export enum DemandScenario {
  CONSERVATIVE = 'conservative',
  MODERATE = 'moderate',
  AGGRESSIVE = 'aggressive'
}

// Analytics and Reporting
export interface IAnalytics extends BaseDocument {
  type: AnalyticsType;
  data: Record<string, any>;
  filters: Record<string, any>;
  generatedAt: Date;
  generatedBy: Types.ObjectId;
  expiresAt?: Date;
}

export enum AnalyticsType {
  OVERVIEW = 'overview',
  CAPACITY_TRENDS = 'capacity_trends',
  REGIONAL_DISTRIBUTION = 'regional_distribution',
  INVESTMENT_FLOW = 'investment_flow',
  SITE_SUITABILITY = 'site_suitability',
  NETWORK_ANALYSIS = 'network_analysis'
}

// Site Recommendations
export interface ISiteRecommendation extends BaseDocument {
  location: GeoJSONPoint;
  score: number; // 0-100
  criteria: RecommendationCriteria;
  analysis: RecommendationAnalysis;
  status: RecommendationStatus;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
}

export interface RecommendationCriteria {
  renewableProximity: number; // km
  demandProximity: number; // km
  minCapacity: number; // TPA
  infrastructureAccess: number; // score 0-100
  regulatoryCompliance: number; // score 0-100
}

export interface RecommendationAnalysis {
  renewableSources: Types.ObjectId[];
  demandCenters: Types.ObjectId[];
  infrastructure: Types.ObjectId[];
  environmentalFactors: Record<string, any>;
  costEstimate: number;
  timeline: number; // months
}

export enum RecommendationStatus {
  DRAFT = 'draft',
  REVIEWED = 'reviewed',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Query and Filter types
export interface ProjectFilters {
  projectType?: ProjectType;
  status?: ProjectStatus;
  bounds?: {
    neLat: number;
    neLng: number;
    swLat: number;
    swLng: number;
  };
  capacityMin?: number;
  capacityMax?: number;
  tags?: string[];
}

export interface GeospatialQuery {
  lat: number;
  lng: number;
  radius: number;
  unit?: 'km' | 'miles';
}

export interface InfrastructureFilters {
  type?: InfrastructureType;
  status?: OperationalStatus;
  bounds?: {
    neLat: number;
    neLng: number;
    swLat: number;
    swLng: number;
  };
  capacityMin?: number;
  capacityMax?: number;
}

// Performance monitoring
export interface PerformanceMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
  userId?: string;
  ipAddress?: string;
}

// Error types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
}

// Cache types
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key?: string; // Custom cache key
}

// WebSocket types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
  userId?: string;
}

// Job queue types
export interface JobData {
  type: string;
  payload: any;
  priority?: number;
  delay?: number;
  attempts?: number;
}

export interface JobResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
}
