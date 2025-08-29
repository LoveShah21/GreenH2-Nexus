export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon';
    coordinates: number[] | number[][] | number[][][];
  };
  properties: {
    [key: string]: any;
  };
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface MapBounds {
  neLat: number;
  neLng: number;
  swLat: number;
  swLng: number;
}

export interface SiteSuitability {
  location: {
    lat: number;
    lng: number;
  };
  score: number; // 0-100
  factors: {
    renewableEnergy: number;
    gridAccess: number;
    transportation: number;
    landAvailability: number;
    regulatory: number;
    environmental: number;
  };
  constraints: string[];
  recommendations: string[];
}

export interface RouteOptimization {
  route: {
    lat: number;
    lng: number;
  }[];
  distance: number; // in km
  estimatedCost: number;
  elevationProfile: {
    distance: number;
    elevation: number;
  }[];
  obstacles: {
    type: string;
    location: {
      lat: number;
      lng: number;
    };
    severity: 'low' | 'medium' | 'high';
  }[];
}