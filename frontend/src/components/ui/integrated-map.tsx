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

interface IntegratedMapProps {
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

export const IntegratedMap: React.FC<IntegratedMapProps> = ({
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
  const [predictions, setPredictions] = useState<ZonePrediction[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [infrastructure, setInfrastructure] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [areaAnalysisMode, setAreaAnalysisMode] = useState(false);
  const [selectedArea, setSelectedArea] = useState<L.LatLngBounds | null>(null);
  const [areaAnalysis, setAreaAnalysis] = useState<AreaAnalysisResponse | null>(
    null
  );

  // Load data on component mount
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
        (project, index) => {
          // Handle different location formats from backend
          let lat, lng;
          if (project.location?.coordinates) {
            // GeoJSON format: [longitude, latitude]
            lng = project.location.coordinates[0];
            lat = project.location.coordinates[1];
          } else if (project.location?.lat && project.location?.lng) {
            // Object format: {lat, lng}
            lat = project.location.lat;
            lng = project.location.lng;
          } else {
            // Default fallback
            lat = 51.505;
            lng = -0.09;
          }

          return {
            id: `project-${project.id || project._id || index}`,
            position: [lat, lng] as [number, number],
            color: "blue",
            size: "medium" as const,
            popup: {
              title: project.name || "Unnamed Project",
              content: `Type: ${
                project.type || project.projectType || "Unknown"
              }\nStatus: ${project.status || "Unknown"}\nCapacity: ${
                project.capacity || project.capacityTPA || "Unknown"
              } ${project.capacityTPA ? "TPA" : "MW"}`,
            },
          };
        }
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
      setPolygons((prev) => [
        ...prev.filter((p) => !p.id?.toString().startsWith("infra")),
        ...infraPolygons,
      ]);
    } catch (error) {
      console.error("Failed to load infrastructure:", error);
    }
  };

  const handleMapClick = useCallback(
    async (latlng: L.LatLng) => {
      if (areaAnalysisMode) {
        // Handle area selection for analysis
        if (!selectedArea) {
          // Start area selection
          setSelectedArea(new L.LatLngBounds(latlng, latlng));
        } else {
          // Complete area selection and analyze
          const bounds = selectedArea.extend(latlng);
          await performAreaAnalysis(bounds);
          setSelectedArea(null);
          setAreaAnalysisMode(false);
        }
        return;
      }

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

        // Call callback if provided
        onZonePrediction?.(prediction);
      } catch (error) {
        console.error("Failed to get prediction:", error);
      } finally {
        setLoading(false);
      }
    },
    [areaAnalysisMode, selectedArea, onZonePrediction]
  );

  const performAreaAnalysis = async (bounds: L.LatLngBounds) => {
    setLoading(true);
    try {
      const analysis = await mlPredictionsApi.analyzeArea({
        bounds: {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        },
        gridSize: 15,
      });

      setAreaAnalysis(analysis);

      // Add analysis markers to map
      const analysisMarkers: MarkerData[] = analysis.predictions.map(
        (pred, index) => ({
          id: `analysis-${index}`,
          position: [pred.lat, pred.lng],
          icon: createZoneIcon(pred.zone),
          size: "small" as const,
          popup: {
            title: `Analysis Point: ${pred.zone.toUpperCase()}`,
            content: `Efficiency: ${(pred.efficiency * 100).toFixed(
              1
            )}%\nCost: $${pred.cost}/kg`,
          },
        })
      );

      setMarkers((prev) => [
        ...prev.filter((m) => !m.id?.toString().startsWith("analysis")),
        ...analysisMarkers,
      ]);

      // Add analysis area polygon
      const analysisPolygon: PolygonData = {
        id: "analysis-area",
        positions: [
          [bounds.getNorth(), bounds.getWest()],
          [bounds.getNorth(), bounds.getEast()],
          [bounds.getSouth(), bounds.getEast()],
          [bounds.getSouth(), bounds.getWest()],
        ],
        style: { color: "blue", weight: 2, fillOpacity: 0.1 },
        popup: `Analysis Area - ${analysis.totalPoints} points analyzed`,
      };

      setPolygons((prev) => [
        ...prev.filter((p) => p.id !== "analysis-area"),
        analysisPolygon,
      ]);

      // Call callback if provided
      onAreaAnalysis?.(analysis);
    } catch (error) {
      console.error("Failed to perform area analysis:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = useCallback((marker: MarkerData) => {
    console.log("Marker clicked:", marker);
  }, []);

  const clearPredictions = () => {
    setMarkers((prev) =>
      prev.filter(
        (m) =>
          !m.id?.toString().startsWith("prediction") &&
          !m.id?.toString().startsWith("analysis")
      )
    );
    setPolygons((prev) => prev.filter((p) => p.id !== "analysis-area"));
    setPredictions([]);
    setAreaAnalysis(null);
  };

  return (
    <div className="relative">
      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">
              {areaAnalysisMode
                ? "Analyzing area..."
                : "Getting zone prediction..."}
            </span>
          </div>
        </div>
      )}

      {/* Control panel */}
      {enableAreaAnalysis && (
        <div className="absolute top-4 right-4 z-[1000] bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border space-y-2">
          <div className="flex flex-col space-y-2">
            <Button
              size="sm"
              variant={areaAnalysisMode ? "default" : "outline"}
              onClick={() => setAreaAnalysisMode(!areaAnalysisMode)}
            >
              {areaAnalysisMode ? "Cancel Area Analysis" : "Area Analysis Mode"}
            </Button>
            <Button size="sm" variant="outline" onClick={clearPredictions}>
              Clear Predictions
            </Button>
          </div>
          {areaAnalysisMode && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Click two points to define analysis area
            </div>
          )}
        </div>
      )}

      {/* Map component */}
      <AdvancedMap
        center={center}
        zoom={zoom}
        markers={markers}
        polygons={polygons}
        circles={circles}
        onMapClick={handleMapClick}
        onMarkerClick={handleMarkerClick}
        enableClustering={true}
        enableSearch={true}
        enableControls={true}
        className={className}
        style={style}
      />

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border z-[1000] max-w-xs">
        <h4 className="font-semibold mb-2 text-sm">Map Legend</h4>
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
          {enableInfrastructureLayer && (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Pipelines</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Storage Facilities</span>
              </div>
            </>
          )}
        </div>
        <div className="mt-2 pt-2 border-t text-xs text-gray-600 dark:text-gray-400">
          Click anywhere on the map to get zone prediction
        </div>
      </div>

      {/* Area analysis results */}
      {areaAnalysis && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border z-[1000] max-w-sm">
          <h4 className="font-semibold mb-2 text-sm">Area Analysis Results</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Total Points:</span>
              <Badge variant="outline">{areaAnalysis.totalPoints}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Green Zones:</span>
              <Badge className="bg-green-500">
                {areaAnalysis.zoneDistribution.green}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Yellow Zones:</span>
              <Badge className="bg-yellow-500">
                {areaAnalysis.zoneDistribution.yellow}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Red Zones:</span>
              <Badge className="bg-red-500">
                {areaAnalysis.zoneDistribution.red}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Avg Efficiency:</span>
              <span>{(areaAnalysis.averageEfficiency * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Cost:</span>
              <span>${areaAnalysis.averageCost.toFixed(2)}/kg</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
