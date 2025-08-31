"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Search,
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
import { projectsApi } from "@/lib/api/projects";
import {
  mlPredictionsApi,
  ZonePrediction,
  AreaAnalysisResponse,
} from "@/lib/api/ml-predictions";

// Dynamic import to prevent SSR issues with Leaflet
import dynamic from "next/dynamic";
import type L from "leaflet";

const AdvancedMap = dynamic(
  () =>
    import("@/components/ui/interactive-map").then((mod) => mod.AdvancedMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading Interactive Map
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Initializing hydrogen infrastructure mapping...
          </p>
        </div>
      </div>
    ),
  }
);

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

// Create custom icons for zone predictions
const createZoneIcon = (zone: string) => {
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

  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet");
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
  }
  return undefined;
};

// Extended marker interface for our specific use case
interface ExtendedMarkerData {
  id?: string | number;
  position: [number, number];
  color?: string;
  size?: "small" | "medium" | "large";
  icon?: L.Icon;
  popup?: {
    title: string;
    content: string;
    image?: string;
  };
  facilityData?: Facility;
}

export default function MappingPage() {
  const [layers, setLayers] = useState<MapLayer[]>(initialLayers);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mapMarkers, setMapMarkers] = useState<ExtendedMarkerData[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [predictions, setPredictions] = useState<ZonePrediction[]>([]);
  const [currentPrediction, setCurrentPrediction] =
    useState<ZonePrediction | null>(null);
  const [currentAnalysis, setCurrentAnalysis] =
    useState<AreaAnalysisResponse | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    20.5937, 78.9629,
  ]); // Default to India
  const [mapZoom, setMapZoom] = useState(5);
  const [locationLoading, setLocationLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Fix hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get user location on page load
  useEffect(() => {
    const getUserLocation = () => {
      setLocationLoading(true);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setMapCenter([latitude, longitude]);
            setMapZoom(11); // Zoom in when we have user location
            setLocationLoading(false);
            console.log("User location detected:", latitude, longitude);
          },
          (error) => {
            console.warn("Geolocation failed, using India as default:", error);
            // Keep India as default
            setMapCenter([20.5937, 78.9629]);
            setMapZoom(5);
            setLocationLoading(false);
          },
          {
            timeout: 10000,
            enableHighAccuracy: true,
            maximumAge: 300000, // 5 minutes
          }
        );
      } else {
        console.warn("Geolocation not supported, using India as default");
        setMapCenter([20.5937, 78.9629]);
        setMapZoom(5);
        setLocationLoading(false);
      }
    };

    getUserLocation();
  }, []);

  // Load facilities from API
  useEffect(() => {
    const loadFacilities = async () => {
      try {
        setIsLoading(true);
        setError(""); // Clear previous errors

        console.log("Loading projects from API...");
        const response = await projectsApi.getProjects({ limit: 100 });
        console.log("Projects API response:", response);

        if (response.data && Array.isArray(response.data)) {
          // Convert projects to facilities format
          const facilitiesData = response.data.map(
            (project: unknown, index: number) => {
              console.log(`Processing project ${index}:`, project);

              return {
                id: project.id || project._id || `project-${index}`,
                name: project.name || `Project ${index + 1}`,
                type: project.type || project.projectType || "electrolyzer",
                capacity: project.capacity || project.capacityTPA || "Unknown",
                status: project.status || "operational",
                location: project.location?.coordinates
                  ? {
                      lat: project.location.coordinates[1],
                      lng: project.location.coordinates[0],
                    }
                  : project.location?.lat && project.location?.lng
                  ? { lat: project.location.lat, lng: project.location.lng }
                  : { lat: 20.5937, lng: 78.9629 }, // Use India center as default
                description: project.description || "No description available",
              };
            }
          );

          console.log("Converted facilities:", facilitiesData);
          setFacilities(facilitiesData);

          if (facilitiesData.length === 0) {
            console.warn("No projects found, using sample data");
            setFacilities(mockFacilities);
            setError("No projects found in database. Showing sample data.");
          }
        } else {
          console.warn("Invalid API response format, using sample data");
          setFacilities(mockFacilities);
          setError("Invalid API response. Showing sample data.");
        }
      } catch (error: unknown) {
        console.error("Failed to load facilities:", error);
        setError(
          `Failed to load projects: ${error.message}. Showing sample data.`
        );
        // Fallback to mock data if API fails
        setFacilities(mockFacilities);
      } finally {
        setIsLoading(false);
      }
    };

    loadFacilities();
  }, []);

  // Memoize the helper functions to prevent unnecessary re-renders
  // Note: These are kept for potential future use with actual map
  const getLayerColorMemo = useCallback(
    (facilityType: string) => {
      const layer = layers.find(
        (l) => l.id === facilityType + "s" || l.id === facilityType
      );
      return layer?.color || "gray";
    },
    [layers]
  );

  const isLayerVisibleMemo = useCallback(
    (facilityType: string) => {
      const layer = layers.find(
        (l) => l.id === facilityType + "s" || l.id === facilityType
      );
      return layer?.visible ?? true;
    },
    [layers]
  );

  // Memoize filtered facilities to prevent unnecessary re-renders
  const filteredFacilities = useMemo(
    () =>
      facilities.filter(
        (facility) =>
          facility.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          isLayerVisibleMemo(facility.type)
      ),
    [facilities, searchQuery, isLayerVisibleMemo]
  );

  // Handle place search using Nominatim API (like Google Maps)
  const handlePlaceSearch = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      // Remove country restriction to search globally like Google Maps
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=8&addressdetails=1&extratags=1`
      );
      const results = await response.json();
      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    } catch (error) {
      console.error("Search error:", error);
      setError("Failed to search places. Please try again.");
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search result selection
  const handleSearchResultSelect = (result: unknown) => {
    console.log("Search result selected:", result);

    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    // Validate coordinates
    if (isNaN(lat) || isNaN(lng)) {
      console.error("Invalid coordinates:", result);
      setError("Invalid location coordinates");
      return;
    }

    // Determine appropriate zoom level based on place type
    let zoomLevel = 13;
    if (result.type?.includes("country")) zoomLevel = 6;
    else if (
      result.type?.includes("state") ||
      result.type?.includes("province")
    )
      zoomLevel = 8;
    else if (result.type?.includes("city") || result.type?.includes("town"))
      zoomLevel = 11;
    else if (
      result.type?.includes("suburb") ||
      result.type?.includes("neighbourhood")
    )
      zoomLevel = 14;
    else if (result.type?.includes("road") || result.type?.includes("street"))
      zoomLevel = 16;

    console.log(`Navigating to: ${lat}, ${lng} with zoom ${zoomLevel}`);

    // Update map center and zoom
    setMapCenter([lat, lng]);
    setMapZoom(zoomLevel);
    setSearchQuery(result.display_name.split(",")[0]); // Use shorter name
    setShowSearchResults(false);

    // Add a temporary marker for the search result
    const searchMarker: ExtendedMarkerData = {
      id: "search-result",
      position: [lat, lng],
      color: "red",
      size: "large",
      popup: {
        title: result.display_name.split(",")[0],
        content: `
          <div class="space-y-2">
            <div class="font-medium">${result.display_name}</div>
            ${
              result.type
                ? `<div class="text-sm text-gray-600">Type: ${result.type.replace(
                    /_/g,
                    " "
                  )}</div>`
                : ""
            }
            <div class="text-xs text-gray-500">
              Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}
            </div>
          </div>
        `,
      },
    };

    setMapMarkers((prev) => {
      // Remove any existing search result markers
      const filtered = prev.filter((marker) => marker.id !== "search-result");
      return [...filtered, searchMarker];
    });
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    // Remove search result marker
    setMapMarkers((prev) =>
      prev.filter((marker) => marker.id !== "search-result")
    );
  };

  // Debounced search function - always search for places/addresses
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery && searchQuery.length >= 2) {
        handlePlaceSearch(searchQuery);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300); // Faster response like Google Maps

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle keyboard navigation for search results
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowSearchResults(false);
    } else if (e.key === "Enter" && searchResults.length > 0) {
      handleSearchResultSelect(searchResults[0]);
    }
  };

  // Handle clicking outside search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".search-container")) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Convert facilities to map markers
  useEffect(() => {
    const facilityMarkers = facilities
      .filter((facility) => isLayerVisibleMemo(facility.type))
      .map((facility) => ({
        id: facility.id,
        position: [facility.location.lat, facility.location.lng] as [
          number,
          number
        ],
        color: getLayerColorMemo(facility.type),
        size: (facility.status === "operational"
          ? "large"
          : facility.status === "construction"
          ? "medium"
          : "small") as "small" | "medium" | "large",
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

    // Add prediction markers
    const predictionMarkers = predictions.map((prediction, index) => ({
      id: `prediction-${index}`,
      position: [prediction.lat, prediction.lng] as [number, number],
      icon: createZoneIcon(prediction.zone),
      popup: {
        title: `Zone Prediction: ${prediction.zone.toUpperCase()}`,
        content: `
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="font-medium">Zone:</span>
              <span class="capitalize font-bold" style="color: ${
                prediction.zone === "green"
                  ? "#10b981"
                  : prediction.zone === "yellow"
                  ? "#f59e0b"
                  : "#ef4444"
              }">${prediction.zone}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-medium">Efficiency:</span>
              <span>${(prediction.efficiency * 100).toFixed(1)}%</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-medium">Cost:</span>
              <span>$${prediction.cost}/kg</span>
            </div>
            <div class="text-xs text-gray-500">
              ${prediction.lat.toFixed(4)}, ${prediction.lng.toFixed(4)}
            </div>
          </div>
        `,
      },
    }));

    setMapMarkers([...facilityMarkers, ...predictionMarkers]);
  }, [facilities, layers, predictions, getLayerColorMemo, isLayerVisibleMemo]);

  const toggleLayer = (layerId: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );
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

  const handleMarkerClick = (marker: ExtendedMarkerData) => {
    if (marker.facilityData) {
      setSelectedFacility(marker.facilityData);
    }
  };

  const handleMapClick = async (latlng: { lat: number; lng: number }) => {
    console.log("Map clicked at:", latlng);

    // Validate coordinates
    if (
      !latlng.lat ||
      !latlng.lng ||
      latlng.lat < -90 ||
      latlng.lat > 90 ||
      latlng.lng < -180 ||
      latlng.lng > 180
    ) {
      setError("Invalid coordinates. Please click on a valid location.");
      return;
    }

    setPredictionLoading(true);
    setError(""); // Clear any previous errors

    try {
      // Ensure coordinates are properly formatted numbers
      const lat = parseFloat(latlng.lat.toFixed(6));
      const lng = parseFloat(latlng.lng.toFixed(6));

      console.log("Requesting prediction for:", { lat, lng });

      // Call ML API to get zone prediction
      const prediction = await mlPredictionsApi.predictZone(lat, lng);

      // Add prediction to state
      setPredictions((prev) => [...prev, prediction]);
      setCurrentPrediction(prediction);

      console.log("Zone prediction received:", prediction);
    } catch (error: unknown) {
      console.error("Failed to get zone prediction:", error);
      const errorMessage =
        error.message || "Failed to get zone prediction. Please try again.";
      setError(errorMessage);
    } finally {
      setPredictionLoading(false);
    }
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
      {/* Debug ML Test Component */}
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
                Infrastructure Map
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

            {/* ML Predictions Panel */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Zone Predictions
                </h3>
                {predictions.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPredictions([]);
                      setCurrentPrediction(null);
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>

              {predictionLoading && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Getting prediction...</span>
                </div>
              )}

              {currentPrediction && (
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Latest Zone:
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
              )}

              {predictions.length === 0 && !predictionLoading && (
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                  Click anywhere on the map to get zone predictions
                </div>
              )}

              {predictions.length > 1 && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Total predictions: {predictions.length}
                </div>
              )}
            </div>

            {/* Facilities List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hydrogen Facilities ({filteredFacilities.length})
                </h3>
                {searchQuery && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Filtered
                  </div>
                )}
              </div>
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
        {/* Loading indicator */}
        {predictionLoading && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Getting zone prediction...</span>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 px-4 py-2 rounded-lg shadow-lg max-w-md">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                  Error
                </div>
                <div className="text-xs text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError("")}
                className="ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border z-[1000] max-w-xs text-xs">
          <h4 className="font-semibold mb-2">Debug Info</h4>
          <div className="space-y-1">
            <div>Projects: {facilities.length}</div>
            <div>Markers: {mapMarkers.length}</div>
            <div>Predictions: {predictions.length}</div>
            <div>
              Center: [{mapCenter[0].toFixed(2)}, {mapCenter[1].toFixed(2)}]
            </div>
            <div>Loading: {isLoading ? "Yes" : "No"}</div>
          </div>
        </div>

        {/* Map Legend */}
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
          </div>
          <div className="mt-2 pt-2 border-t text-xs text-gray-600 dark:text-gray-400">
            Click anywhere on the map to get ML zone prediction
          </div>
        </div>

        {/* Location Loading */}
        {locationLoading && (
          <div className="absolute inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-[999]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Detecting Location
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Getting your current location...
              </p>
            </div>
          </div>
        )}

        {/* Search Overlay on Map */}
        <div className="absolute top-4 left-15 z-[1000] w-80 max-w-[calc(100vw-2rem)]">
          <div className="relative search-container">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            {isClient && (
              <Input
                key="map-search"
                type="text"
                placeholder="Search for any address or place..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-9 pr-8 bg-white dark:bg-gray-800 shadow-lg border-gray-300 dark:border-gray-600"
                autoComplete="off"
              />
            )}
            {searchQuery && !searchLoading && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={clearSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            {searchLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                {searchResults.map((result, index) => {
                  const getPlaceIcon = (type: string) => {
                    if (type?.includes("city") || type?.includes("town"))
                      return "🏙️";
                    if (type?.includes("country")) return "🌍";
                    if (type?.includes("state") || type?.includes("province"))
                      return "📍";
                    if (type?.includes("road") || type?.includes("street"))
                      return "🛣️";
                    if (type?.includes("building") || type?.includes("house"))
                      return "🏢";
                    return "📍";
                  };

                  const primaryName = result.display_name.split(",")[0];
                  const secondaryInfo = result.display_name
                    .split(",")
                    .slice(1, 3)
                    .join(", ");

                  return (
                    <div
                      key={index}
                      className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors"
                      onClick={() => handleSearchResultSelect(result)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-lg mt-0.5">
                          {getPlaceIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {primaryName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {secondaryInfo}
                          </div>
                          {result.type && (
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 capitalize">
                              {result.type.replace(/_/g, " ")}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* No Results Message */}
            {showSearchResults &&
              searchResults.length === 0 &&
              searchQuery.length >= 2 &&
              !searchLoading && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 p-4">
                  <div className="text-center">
                    <div className="text-gray-400 text-2xl mb-2">🔍</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      No places found for "{searchQuery}"
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Try searching for cities, addresses, or landmarks
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Map Container */}
        <AdvancedMap
          center={mapCenter}
          zoom={mapZoom}
          markers={mapMarkers}
          polygons={hydrogenZones}
          circles={coverageAreas}
          onMarkerClick={handleMarkerClick}
          onMapClick={handleMapClick}
          enableClustering={true}
          enableSearch={false} // Disable built-in search since we have our own
          enableControls={true}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
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
