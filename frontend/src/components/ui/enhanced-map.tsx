import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  AdvancedMap,
  MarkerData,
  PolygonData,
  CircleData,
} from "./interactive-map";
import {
  mlPredictionsApi,
  ZonePrediction,
  AreaAnalysisResponse,
} from "@/lib/api/ml-predictions";
import { projectsApi } from "@/lib/api/projects";
import { infrastructureApi } from "@/lib/api/infrastructure";
import { analyticsApi } from "@/lib/api/analytics";
import { Project } from "@/types/project";
import { Button } from "./Button";
import { Badge } from "./Badge";
import L from "leaflet";

interface EnhancedMapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  style?: React.CSSProperties;
  enableAreaAnalysis?: boolean;
  enableInfrastructureLayer?: boolean;
  enableAnalyticsLayer?: boolean;
  onZonePrediction?: (prediction: ZonePrediction) => void;
  onAreaAnalysis?: (analysis: AreaAnalysisResponse) => void;
}

const getZoneColor = (zone: string): string => {
  switch (zone) {
    case "green":
      return "green";
    case "yellow":
      return "yellow";
    case "red":
      return "red";
    default:
      return "blue";
  }
};

const createZoneIcon = (zone: string) => {
  const color = getZoneColor(zone);
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

export const EnhancedMap: React.FC<EnhancedMapProps> = ({
  center = [51.505, -0.09],
  zoom = 13,
  className = "",
  style = { height: "500px", width: "100%" },
  enableAreaAnalysis = true,
  enableInfrastructureLayer = true,
  enableAnalyticsLayer = true,
  onZonePrediction,
  onAreaAnalysis,
}) => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [polygons, setPolygons] = useState<PolygonData[]>([]);
  const [circles, setCircles] = useState<CircleData[]>([]);
  const [infrastructure, setInfrastructure] = useState<any[]>([]);
  const [areaAnalysisMode, setAreaAnalysisMode] = useState(false);
  const [selectedArea, setSelectedArea] = useState<L.LatLngBounds | null>(null);
  const [areaAnalysis, setAreaAnalysis] = useState<AreaAnalysisResponse | null>(
    null
  );
  const mapRef = useRef<L.Map | null>(null);
  const [predictions, setPredictions] = useState<ZonePrediction[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  // Load projects and infrastructure on component mount
  useEffect(() => {
    loadProjects();
    if (enableInfrastructureLayer) {
      loadInfrastructure();
    }
  }, [enableInfrastructureLayer]);

  const loadProjects = async () => {
    try {
      const response = await projectsApi.getProjects({ limit: 100 });
      setProjects(response.data);

      // Convert projects to markers
      const projectMarkers: MarkerData[] = response.data.map(
        (project, index) => ({
          id: `project-${project.id || index}`,
          position: [project.location.lat, project.location.lng] as [
            number,
            number
          ],
          color: "blue",
          size: "medium" as const,
          popup: {
            title: project.name,
            content: `Type: ${project.type}\nStatus: ${project.status}\nCapacity: ${project.capacity} MW`,
          },
        })
      );

      setMarkers((prev) => [
        ...prev.filter((m) => !m.id?.toString().startsWith("project")),
        ...projectMarkers,
      ]);
    } catch (error) {
      console.error("Failed to load projects:", error);
    }
  };

  const loadInfrastructure = async () => {
    try {
      const infrastructureData = await infrastructureApi.getInfrastructure({
        limit: 100,
      });
      setInfrastructure(infrastructureData);

      // Convert infrastructure to markers and polygons
      const infraMarkers: MarkerData[] = [];
      const infraPolygons: PolygonData[] = [];

      infrastructureData.forEach((infra, index) => {
        if (infra.geometry.type === "Point") {
          infraMarkers.push({
            id: `infra-${infra.id || index}`,
            position: [
              infra.geometry.coordinates[1],
              infra.geometry.coordinates[0],
            ] as [number, number],
            color: getInfrastructureColor(infra.infrastructureType),
            size: "small" as const,
            popup: {
              title: `${infra.infrastructureType
                .replace("_", " ")
                .toUpperCase()}`,
              content: `Capacity: ${infra.capacity.value} ${infra.capacity.unit}\nStatus: ${infra.operationalStatus}`,
            },
          });
        } else if (infra.geometry.type === "Polygon") {
          infraPolygons.push({
            id: `infra-poly-${infra.id || index}`,
            positions: infra.geometry.coordinates[0].map(
              (coord) => [coord[1], coord[0]] as [number, number]
            ),
            style: {
              color: getInfrastructureColor(infra.infrastructureType),
              weight: 2,
              fillOpacity: 0.3,
            },
            popup: `${infra.infrastructureType
              .replace("_", " ")
              .toUpperCase()} - ${infra.operationalStatus}`,
          });
        }
      });

      setMarkers((prev) => [
        ...prev.filter((m) => !m.id?.toString().startsWith("infra")),
        ...infraMarkers,
      ]);
      setPolygons(infraPolygons);
    } catch (error) {
      console.error("Failed to load infrastructure:", error);
    }
  };

  const getInfrastructureColor = (type: string): string => {
    switch (type) {
      case "pipeline":
        return "orange";
      case "storage_facility":
        return "purple";
      case "production_plant":
        return "green";
      case "distribution_hub":
        return "red";
      default:
        return "gray";
    }
  };

  const handleMapClick = useCallback(async (latlng: L.LatLng) => {
    setLoading(true);

    try {
      // Get ML prediction for clicked location
      const prediction = await mlPredictionsApi.predictZone(
        latlng.lat,
        latlng.lng
      );

      // Add prediction to state
      setPredictions((prev) => [...prev, prediction]);

      // Create marker for prediction
      const predictionMarker: MarkerData = {
        id: `prediction-${Date.now()}`,
        position: [prediction.lat, prediction.lng],
        icon: createZoneIcon(prediction.zone),
        popup: {
          title: `Zone Prediction: ${prediction.zone.toUpperCase()}`,
          content: `Efficiency: ${(prediction.efficiency * 100).toFixed(
            1
          )}%\nCost: $${
            prediction.cost
          }/kg\nCoordinates: ${prediction.lat.toFixed(
            4
          )}, ${prediction.lng.toFixed(4)}`,
        },
      };

      // Add prediction marker to existing markers
      setMarkers((prev) => [...prev, predictionMarker]);
    } catch (error) {
      console.error("Failed to get prediction:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMarkerClick = useCallback((marker: MarkerData) => {
    console.log("Marker clicked:", marker);
  }, []);

  // Load projects within map bounds
  const loadProjectsInBounds = async (bounds: L.LatLngBounds) => {
    try {
      const projectsInBounds = await projectsApi.getProjectsInBounds({
        neLat: bounds.getNorthEast().lat,
        neLng: bounds.getNorthEast().lng,
        swLat: bounds.getSouthWest().lat,
        swLng: bounds.getSouthWest().lng,
      });

      // Update markers with projects in bounds
      const boundedProjectMarkers: MarkerData[] = projectsInBounds.map(
        (project, index) => ({
          id: project.id || `bounded-${index}`,
          position: [
            project.location.coordinates[1],
            project.location.coordinates[0],
          ] as [number, number],
          color: "violet",
          size: "large" as const,
          popup: {
            title: `${project.name} (In View)`,
            content: `Type: ${project.projectType}\nStatus: ${project.status}\nCapacity: ${project.capacityTPA} TPA`,
          },
        })
      );

      // Combine with existing prediction markers
      const predictionMarkers = markers.filter(
        (m) => typeof m.id === "string" && m.id.startsWith("prediction-")
      );
      setMarkers([...boundedProjectMarkers, ...predictionMarkers]);
    } catch (error) {
      console.error("Failed to load projects in bounds:", error);
    }
  };

  return (
    <div className="relative">
      {loading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Getting zone prediction...</span>
          </div>
        </div>
      )}

      <AdvancedMap
        center={center}
        zoom={zoom}
        markers={markers}
        onMapClick={handleMapClick}
        onMarkerClick={handleMarkerClick}
        enableClustering={true}
        enableSearch={true}
        enableControls={true}
        className={className}
        style={style}
      />

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border z-[1000]">
        <h4 className="font-semibold mb-2 text-sm">Zone Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Green Zone (High Efficiency, Low Cost)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Yellow Zone (Medium Efficiency)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Red Zone (Low Efficiency, High Cost)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Existing Projects</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t text-xs text-gray-600 dark:text-gray-400">
          Click anywhere on the map to get zone prediction
        </div>
      </div>
    </div>
  );
};
