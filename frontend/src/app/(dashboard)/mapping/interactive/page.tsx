"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Search,
  Settings,
  X,
  Eye,
  EyeOff,
  MapPin,
  Zap,
  Warehouse,
  Truck,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { IntegratedMap } from "@/components/ui/integrated-map";
import { ZonePrediction, AreaAnalysisResponse } from "@/lib/api/ml-predictions";
import { projectsApi } from "@/lib/api/projects";

interface Facility {
  id: string;
  name: string;
  type: "electrolyzer" | "storage" | "transport" | "distribution";
  capacity: string;
  status: "operational" | "planned" | "construction";
  location: { lat: number; lng: number };
  description: string;
}

interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  color: string;
}

// Sample hydrogen facilities around London
const mockFacilities: Facility[] = [
  {
    id: "1",
    name: "Thames Hydrogen Hub",
    type: "electrolyzer",
    capacity: "100 MW",
    status: "operational",
    location: { lat: 51.505, lng: -0.09 },
    description:
      "Large-scale green hydrogen production facility powered by renewable energy",
  },
  {
    id: "2",
    name: "London H2 Storage",
    type: "storage",
    capacity: "500 tons",
    status: "construction",
    location: { lat: 51.515, lng: -0.1 },
    description: "Underground hydrogen storage facility for grid balancing",
  },
  {
    id: "3",
    name: "Heathrow H2 Transport",
    type: "transport",
    capacity: "50 trucks/day",
    status: "planned",
    location: { lat: 51.47, lng: -0.454 },
    description: "Hydrogen refueling station for heavy-duty transport",
  },
  {
    id: "4",
    name: "Canary Wharf Distribution",
    type: "distribution",
    capacity: "25 MW",
    status: "operational",
    location: { lat: 51.505, lng: -0.02 },
    description: "Hydrogen distribution center for commercial buildings",
  },
  {
    id: "5",
    name: "Greenwich Power Plant",
    type: "electrolyzer",
    capacity: "75 MW",
    status: "construction",
    location: { lat: 51.483, lng: 0.0 },
    description: "Offshore wind-powered hydrogen production",
  },
  {
    id: "6",
    name: "Stratford H2 Hub",
    type: "storage",
    capacity: "300 tons",
    status: "planned",
    location: { lat: 51.544, lng: -0.016 },
    description: "Regional hydrogen storage and distribution hub",
  },
];

const initialLayers: MapLayer[] = [
  {
    id: "electrolyzers",
    name: "Electrolyzers",
    visible: true,
    color: "blue",
  },
  {
    id: "storage",
    name: "Storage Facilities",
    visible: true,
    color: "green",
  },
  {
    id: "transport",
    name: "Transport Hubs",
    visible: true,
    color: "orange",
  },
  {
    id: "distribution",
    name: "Distribution Centers",
    visible: true,
    color: "red",
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "electrolyzer":
      return <Zap className="h-4 w-4" />;
    case "storage":
      return <Warehouse className="h-4 w-4" />;
    case "transport":
      return <Truck className="h-4 w-4" />;
    case "distribution":
      return <Building2 className="h-4 w-4" />;
    default:
      return <MapPin className="h-4 w-4" />;
  }
};

export default function InteractiveMappingPage() {
  const [layers, setLayers] = useState<MapLayer[]>(initialLayers);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);
  const [currentPrediction, setCurrentPrediction] =
    useState<ZonePrediction | null>(null);
  const [currentAnalysis, setCurrentAnalysis] =
    useState<AreaAnalysisResponse | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Load facilities from API
  useEffect(() => {
    const loadFacilities = async () => {
      try {
        setIsLoading(true);
        const response = await projectsApi.getProjects({ limit: 100 });
        // Convert projects to facilities format
        const facilitiesData = response.data.map((project: any) => ({
          id: project.id || project._id,
          name: project.name,
          type: project.type || "electrolyzer",
          capacity: project.capacity || "Unknown",
          status: project.status || "operational",
          location: project.location || { lat: 51.505, lng: -0.09 },
          description: project.description || "",
        }));
        setFacilities(facilitiesData);
      } catch (error: any) {
        console.error("Failed to load facilities:", error);
        setError("Failed to load facilities. Using sample data.");
        // Fallback to mock data if API fails
        setFacilities(mockFacilities);
      } finally {
        setIsLoading(false);
      }
    };

    loadFacilities();
  }, []);

  // Convert facilities to map markers
  useEffect(() => {
    const markers = facilities
      .filter((facility) => isLayerVisible(facility.type))
      .map((facility) => ({
        id: facility.id,
        position: [facility.location.lat, facility.location.lng] as [
          number,
          number
        ],
        color: getLayerColor(facility.type),
        size:
          facility.status === "operational"
            ? "large"
            : facility.status === "construction"
            ? "medium"
            : "small",
        popup: {
          title: facility.name,
          content: `
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="font-medium">Type:</span>
                <span class="capitalize">${facility.type}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-medium">Capacity:</span>
                <span>${facility.capacity}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-medium">Status:</span>
                <span class="capitalize">${facility.status}</span>
              </div>
              <p class="text-sm text-gray-600 mt-2">${facility.description}</p>
            </div>
          `,
          image: getImageForType(facility.type),
        },
        facilityData: facility,
      }));

    setMapMarkers(markers);
  }, [facilities, layers]);

  const toggleLayer = (layerId: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  const getLayerColor = (facilityType: string) => {
    const layer = layers.find(
      (l) => l.id === facilityType + "s" || l.id === facilityType
    );
    return layer?.color || "gray";
  };

  const isLayerVisible = (facilityType: string) => {
    const layer = layers.find(
      (l) => l.id === facilityType + "s" || l.id === facilityType
    );
    return layer?.visible ?? true;
  };

  const getImageForType = (type: string) => {
    const images = {
      electrolyzer:
        "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=300&h=200&fit=crop",
      storage:
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=200&fit=crop",
      transport:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
      distribution:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&h=200&fit=crop",
    };
    return images[type as keyof typeof images];
  };

  const filteredFacilities = facilities.filter(
    (facility) =>
      facility.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      isLayerVisible(facility.type)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-500";
      case "construction":
        return "bg-yellow-500";
      case "planned":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleMarkerClick = (marker: any) => {
    if (marker.facilityData) {
      setSelectedFacility(marker.facilityData);
    }
  };

  const handleZonePrediction = (prediction: ZonePrediction) => {
    setCurrentPrediction(prediction);
    console.log("Zone prediction received:", prediction);
  };

  const handleAreaAnalysis = (analysis: AreaAnalysisResponse) => {
    setCurrentAnalysis(analysis);
    console.log("Area analysis received:", analysis);
  };

  // Sample polygons for hydrogen infrastructure zones
  const hydrogenZones = [
    {
      id: "industrial-zone",
      positions: [
        [51.52, -0.12],
        [51.53, -0.08],
        [51.51, -0.06],
        [51.49, -0.1],
      ] as [number, number][],
      style: { color: "purple", weight: 2, fillOpacity: 0.1 },
      popup: "Industrial Hydrogen Zone - Priority development area",
    },
  ];

  // Sample circles for coverage areas
  const coverageAreas = [
    {
      id: "central-coverage",
      center: [51.505, -0.09] as [number, number],
      radius: 5000,
      style: { color: "blue", fillOpacity: 0.05, weight: 1 },
      popup: "Central London H2 Coverage Area",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: sidebarCollapsed ? 60 : 320 }}
        className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-10"
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Interactive H2 Map
              </h2>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <Layers className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!sidebarCollapsed && (
          <>
            {/* Search */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search facilities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Layers Panel */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Infrastructure Layers
              </h3>
              <div className="space-y-2">
                {layers.map((layer) => (
                  <div
                    key={layer.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            layer.color === "blue"
                              ? "#3b82f6"
                              : layer.color === "green"
                              ? "#10b981"
                              : layer.color === "orange"
                              ? "#f59e0b"
                              : layer.color === "red"
                              ? "#ef4444"
                              : "#6b7280",
                        }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {layer.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLayer(layer.id)}
                    >
                      {layer.visible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Prediction Display */}
            {currentPrediction && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Latest Prediction
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Zone:
                    </span>
                    <Badge
                      className={
                        currentPrediction.zone === "green"
                          ? "bg-green-500"
                          : currentPrediction.zone === "yellow"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }
                    >
                      {currentPrediction.zone.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Efficiency:
                    </span>
                    <span className="text-xs font-medium">
                      {(currentPrediction.efficiency * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Cost:
                    </span>
                    <span className="text-xs font-medium">
                      ${currentPrediction.cost}/kg
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {currentPrediction.lat.toFixed(4)},{" "}
                    {currentPrediction.lng.toFixed(4)}
                  </div>
                </div>
              </div>
            )}

            {/* Area Analysis Display */}
            {currentAnalysis && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Area Analysis Results
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {currentAnalysis.zoneDistribution.green}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Green
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-600">
                        {currentAnalysis.zoneDistribution.yellow}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Yellow
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-red-600">
                        {currentAnalysis.zoneDistribution.red}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Red
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Avg Efficiency:
                    </span>
                    <span className="text-xs font-medium">
                      {(currentAnalysis.averageEfficiency * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Avg Cost:
                    </span>
                    <span className="text-xs font-medium">
                      ${currentAnalysis.averageCost.toFixed(2)}/kg
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Facilities List */}
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Facilities ({filteredFacilities.length})
              </h3>
              <div className="space-y-2">
                {filteredFacilities.map((facility) => (
                  <motion.div
                    key={facility.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => setSelectedFacility(facility)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getTypeIcon(facility.type)}
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {facility.name}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {facility.capacity}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="text-xs">
                          {facility.type}
                        </Badge>
                        <div
                          className={`w-2 h-2 rounded-full ${getStatusColor(
                            facility.status
                          )}`}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Main Map Area */}
      <div className="flex-1 relative">
        {/* Integrated Map with Full Backend Integration */}
        <IntegratedMap
          center={[51.505, -0.09]}
          zoom={11}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
          enableAreaAnalysis={true}
          enableInfrastructureLayer={true}
          enableAnalyticsLayer={true}
          onZonePrediction={handleZonePrediction}
          onAreaAnalysis={handleAreaAnalysis}
        />
      </div>

      {/* Facility Details Modal */}
      <AnimatePresence>
        {selectedFacility && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setSelectedFacility(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getTypeIcon(selectedFacility.type)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedFacility.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedFacility.type.charAt(0).toUpperCase() +
                        selectedFacility.type.slice(1)}{" "}
                      Facility
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFacility(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Capacity
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedFacility.capacity}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${getStatusColor(
                          selectedFacility.status
                        )}`}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedFacility.status.charAt(0).toUpperCase() +
                          selectedFacility.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedFacility.description}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedFacility.location.lat.toFixed(4)},{" "}
                    {selectedFacility.location.lng.toFixed(4)}
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">View Details</Button>
                  <Button variant="outline" className="flex-1">
                    Edit Facility
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
