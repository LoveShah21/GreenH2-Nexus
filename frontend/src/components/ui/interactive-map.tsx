import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polygon,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as unknown)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icons
const createCustomIcon = (
  color = "blue",
  size: "small" | "medium" | "large" = "medium"
) => {
  const sizes = {
    small: [20, 32] as [number, number],
    medium: [25, 41] as [number, number],
    large: [30, 50] as [number, number],
  };

  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: sizes[size],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

// Map event handler component
interface MapEventsProps {
  onMapClick?: (latlng: L.LatLng) => void;
  onLocationFound?: (latlng: L.LatLng) => void;
}

const MapEvents: React.FC<MapEventsProps> = ({
  onMapClick,
  onLocationFound,
}) => {
  const map = useMapEvents({
    click: (e) => {
      onMapClick && onMapClick(e.latlng);
    },
    locationfound: (e) => {
      onLocationFound && onLocationFound(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return null;
};

// Component to handle map view changes
interface MapViewControllerProps {
  center: [number, number];
  zoom: number;
}

const MapViewController: React.FC<MapViewControllerProps> = ({
  center,
  zoom,
}) => {
  const map = useMap();

  useEffect(() => {
    if (center && zoom) {
      console.log(`Flying to: ${center[0]}, ${center[1]} with zoom ${zoom}`);
      map.flyTo(center, zoom, {
        duration: 1.5, // Smooth animation duration
      });
    }
  }, [map, center, zoom]);

  return null;
};

// Custom control component
interface CustomControlsProps {
  onLocate: () => void;
  onToggleLayer: (layer: string) => void;
  layers: Record<string, boolean>;
}

const CustomControls: React.FC<CustomControlsProps> = ({
  onLocate,
  onToggleLayer,
  layers,
}) => {
  const map = useMap();

  useEffect(() => {
    const control = L.control({ position: "topright" });

    control.onAdd = () => {
      const div = L.DomUtil.create("div", "custom-controls");

      // Check if dark theme is active
      const isDark = document.documentElement.classList.contains("dark");
      const bgColor = isDark ? "rgb(31, 41, 55)" : "white";
      const textColor = isDark ? "rgb(243, 244, 246)" : "rgb(17, 24, 39)";
      const borderColor = isDark ? "rgb(75, 85, 99)" : "rgb(229, 231, 235)";

      div.innerHTML = `
        <div class="map-controls-container" style="background: ${bgColor}; padding: 10px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid ${borderColor};">
          <button id="locate-btn" class="map-control-btn" style="margin: 2px; padding: 8px 12px; border: 1px solid ${borderColor}; border-radius: 6px; cursor: pointer; background: ${bgColor}; color: ${textColor}; font-size: 12px; transition: all 0.2s;">📍 Locate Me</button>
          <button id="satellite-btn" class="map-control-btn" style="margin: 2px; padding: 8px 12px; border: 1px solid ${borderColor}; border-radius: 6px; cursor: pointer; background: ${bgColor}; color: ${textColor}; font-size: 12px; transition: all 0.2s;">🛰️ Satellite</button>
          <button id="traffic-btn" class="map-control-btn" style="margin: 2px; padding: 8px 12px; border: 1px solid ${borderColor}; border-radius: 6px; cursor: pointer; background: ${bgColor}; color: ${textColor}; font-size: 12px; transition: all 0.2s;">🚦 Traffic</button>
        </div>
      `;

      L.DomEvent.disableClickPropagation(div);

      const locateBtn = div.querySelector("#locate-btn") as HTMLButtonElement;
      const satelliteBtn = div.querySelector(
        "#satellite-btn"
      ) as HTMLButtonElement;
      const trafficBtn = div.querySelector("#traffic-btn") as HTMLButtonElement;

      // Add hover effects
      const buttons = [locateBtn, satelliteBtn, trafficBtn];
      buttons.forEach((btn) => {
        if (btn) {
          btn.addEventListener("mouseenter", () => {
            btn.style.background = isDark
              ? "rgb(55, 65, 81)"
              : "rgb(243, 244, 246)";
          });
          btn.addEventListener("mouseleave", () => {
            btn.style.background = bgColor;
          });
        }
      });

      locateBtn.onclick = () => onLocate();
      satelliteBtn.onclick = () => onToggleLayer("satellite");
      trafficBtn.onclick = () => onToggleLayer("traffic");

      return div;
    };

    control.addTo(map);

    return () => {
      control.remove();
    };
  }, [map, onLocate, onToggleLayer]);

  return null;
};

// Search component
interface SearchControlProps {
  onSearch?: (result: { latLng: [number, number]; name: string }) => void;
}

interface SearchSuggestion {
  lat: string;
  lon: string;
  display_name: string;
}

const SearchControl: React.FC<SearchControlProps> = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const map = useMap();

  const handleSearch = async (searchQuery?: string) => {
    const searchTerm = searchQuery || query;
    if (!searchTerm.trim()) return;

    try {
      // Using Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchTerm
        )}&limit=1`
      );
      const results = await response.json();

      if (results.length > 0) {
        const { lat, lon, display_name } = results[0];
        const latLng: [number, number] = [parseFloat(lat), parseFloat(lon)];
        map.flyTo(latLng, 13);
        onSearch && onSearch({ latLng, name: display_name });
        setShowSuggestions(false);
        setQuery(display_name);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleInputChange = async (value: string) => {
    setQuery(value);

    if (value.length > 2) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            value
          )}&limit=5`
        );
        const results = await response.json();
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Suggestions error:", error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const control = L.control({ position: "topleft" });

    control.onAdd = () => {
      const div = L.DomUtil.create("div", "search-control");

      // Check if dark theme is active
      const isDark = document.documentElement.classList.contains("dark");
      const bgColor = isDark ? "rgb(31, 41, 55)" : "white";
      const textColor = isDark ? "rgb(243, 244, 246)" : "rgb(17, 24, 39)";
      const borderColor = isDark ? "rgb(75, 85, 99)" : "rgb(229, 231, 235)";
      const inputBg = isDark ? "rgb(55, 65, 81)" : "white";

      div.innerHTML = `
        <div class="search-container" style="position: relative;">
          <div style="background: ${bgColor}; padding: 10px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; gap: 5px; border: 1px solid ${borderColor};">
            <input id="search-input" type="text" placeholder="Search places..." style="padding: 8px 12px; border: 1px solid ${borderColor}; border-radius: 6px; width: 200px; background: ${inputBg}; color: ${textColor}; font-size: 14px;" value="${query}"/>
            <button id="search-btn" style="padding: 8px 12px; border: none; border-radius: 6px; cursor: pointer; background: #10b981; color: white; font-size: 14px; transition: all 0.2s;">🔍</button>
          </div>
          <div id="suggestions" style="position: absolute; top: 100%; left: 0; right: 0; background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 6px; margin-top: 4px; max-height: 200px; overflow-y: auto; z-index: 1000; display: none; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"></div>
        </div>
      `;

      L.DomEvent.disableClickPropagation(div);

      const input = div.querySelector("#search-input") as HTMLInputElement;
      const button = div.querySelector("#search-btn") as HTMLButtonElement;
      const suggestionsDiv = div.querySelector(
        "#suggestions"
      ) as HTMLDivElement;

      // Update suggestions display
      const updateSuggestions = () => {
        if (showSuggestions && suggestions.length > 0) {
          suggestionsDiv.innerHTML = suggestions
            .map(
              (suggestion) =>
                `<div class="suggestion-item" style="padding: 8px 12px; cursor: pointer; border-bottom: 1px solid ${borderColor}; color: ${textColor}; font-size: 13px;" data-name="${suggestion.display_name}">${suggestion.display_name}</div>`
            )
            .join("");
          suggestionsDiv.style.display = "block";

          // Add click handlers to suggestions
          suggestionsDiv
            .querySelectorAll(".suggestion-item")
            .forEach((item) => {
              item.addEventListener("click", () => {
                const name = item.getAttribute("data-name");
                if (name) {
                  handleSearch(name);
                }
              });
              item.addEventListener("mouseenter", () => {
                (item as HTMLElement).style.background = isDark
                  ? "rgb(55, 65, 81)"
                  : "rgb(243, 244, 246)";
              });
              item.addEventListener("mouseleave", () => {
                (item as HTMLElement).style.background = "transparent";
              });
            });
        } else {
          suggestionsDiv.style.display = "none";
        }
      };

      input.addEventListener("input", (e) => {
        const value = (e.target as HTMLInputElement).value;
        handleInputChange(value);
      });

      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          handleSearch();
        }
      });

      input.addEventListener("blur", () => {
        // Delay hiding suggestions to allow click
        setTimeout(() => {
          setShowSuggestions(false);
        }, 200);
      });

      button.addEventListener("click", () => handleSearch());

      button.addEventListener("mouseenter", () => {
        button.style.background = "#059669";
      });

      button.addEventListener("mouseleave", () => {
        button.style.background = "#10b981";
      });

      // Watch for suggestions changes
      const observer = new MutationObserver(updateSuggestions);
      observer.observe(document.body, { childList: true, subtree: true });

      return div;
    };

    control.addTo(map);

    return () => {
      control.remove();
    };
  }, [map, query, suggestions, showSuggestions, handleSearch]);

  return null;
};

// Types for the main component
interface MarkerData {
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
}

interface PolygonData {
  id?: string | number;
  positions: [number, number][];
  style?: L.PathOptions;
  popup?: string;
}

interface CircleData {
  id?: string | number;
  center: [number, number];
  radius: number;
  style?: L.PathOptions;
  popup?: string;
}

interface PolylineData {
  id?: string | number;
  positions: [number, number][];
  style?: L.PathOptions;
  popup?: string;
}

interface MapLayers {
  openstreetmap?: boolean;
  satellite?: boolean;
  traffic?: boolean;
}

interface AdvancedMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MarkerData[];
  polygons?: PolygonData[];
  circles?: CircleData[];
  polylines?: PolylineData[];
  onMarkerClick?: (marker: MarkerData) => void;
  onMapClick?: (latlng: L.LatLng) => void;
  enableClustering?: boolean;
  enableSearch?: boolean;
  enableControls?: boolean;
  enableDrawing?: boolean;
  mapLayers?: MapLayers;
  className?: string;
  style?: React.CSSProperties;
}

// Main AdvancedMap component
export const AdvancedMap: React.FC<AdvancedMapProps> = ({
  center = [51.505, -0.09],
  zoom = 13,
  markers = [],
  polygons = [],
  circles = [],
  polylines = [],
  onMarkerClick,
  onMapClick,
  enableClustering = true,
  enableSearch = true,
  enableControls = true,
  enableDrawing = false,
  mapLayers = {
    openstreetmap: true,
    satellite: false,
    traffic: false,
  },
  className = "",
  style = { height: "500px", width: "100%" },
}) => {
  const [currentLayers, setCurrentLayers] = useState(mapLayers);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [searchResult, setSearchResult] = useState<{
    latLng: [number, number];
    name: string;
  } | null>(null);
  const [clickedLocation, setClickedLocation] = useState<L.LatLng | null>(null);

  // Handle layer toggling
  const handleToggleLayer = useCallback((layerType: string) => {
    setCurrentLayers((prev) => ({
      ...prev,
      [layerType]: !prev[layerType],
    }));
  }, []);

  // Handle geolocation
  const handleLocate = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);

  // Handle map click
  const handleMapClick = useCallback(
    (latlng: L.LatLng) => {
      setClickedLocation(latlng);
      onMapClick && onMapClick(latlng);
    },
    [onMapClick]
  );

  // Handle search results
  const handleSearch = useCallback(
    (result: { latLng: [number, number]; name: string }) => {
      setSearchResult(result);
    },
    []
  );

  return (
    <div className={`advanced-map ${className}`} style={style}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        {/* Base tile layers */}
        {currentLayers.openstreetmap && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}

        {currentLayers.satellite && (
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        {/* Map view controller for programmatic navigation */}
        <MapViewController center={center} zoom={zoom} />

        {/* Map events */}
        <MapEvents
          onMapClick={handleMapClick}
          onLocationFound={setUserLocation}
        />

        {/* Search control */}
        {enableSearch && <SearchControl onSearch={handleSearch} />}

        {/* Custom controls */}
        {enableControls && (
          <CustomControls
            onLocate={handleLocate}
            onToggleLayer={handleToggleLayer}
            layers={currentLayers}
          />
        )}

        {/* Markers with clustering */}
        {enableClustering ? (
          <MarkerClusterGroup>
            {markers.map((marker, index) => (
              <Marker
                key={marker.id || index}
                position={marker.position}
                icon={
                  marker.icon || createCustomIcon(marker.color, marker.size)
                }
                eventHandlers={{
                  click: () => onMarkerClick && onMarkerClick(marker),
                }}
              >
                {marker.popup && (
                  <Popup>
                    <div>
                      <h3>{marker.popup.title}</h3>
                      <p>{marker.popup.content}</p>
                      {marker.popup.image && (
                        <img
                          src={marker.popup.image}
                          alt={marker.popup.title}
                          style={{ maxWidth: "200px", height: "auto" }}
                        />
                      )}
                    </div>
                  </Popup>
                )}
              </Marker>
            ))}
          </MarkerClusterGroup>
        ) : (
          markers.map((marker, index) => (
            <Marker
              key={marker.id || index}
              position={marker.position}
              icon={marker.icon || createCustomIcon(marker.color, marker.size)}
              eventHandlers={{
                click: () => onMarkerClick && onMarkerClick(marker),
              }}
            >
              {marker.popup && (
                <Popup>
                  <div>
                    <h3>{marker.popup.title}</h3>
                    <p>{marker.popup.content}</p>
                  </div>
                </Popup>
              )}
            </Marker>
          ))
        )}

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={createCustomIcon("red", "medium")}
          >
            <Popup>Your current location</Popup>
          </Marker>
        )}

        {/* Search result marker */}
        {searchResult && (
          <Marker
            position={searchResult.latLng}
            icon={createCustomIcon("green", "large")}
          >
            <Popup>{searchResult.name}</Popup>
          </Marker>
        )}

        {/* Clicked location marker */}
        {clickedLocation && (
          <Marker
            position={[clickedLocation.lat, clickedLocation.lng]}
            icon={createCustomIcon("orange", "small")}
          >
            <Popup>
              Lat: {clickedLocation.lat.toFixed(6)}
              <br />
              Lng: {clickedLocation.lng.toFixed(6)}
            </Popup>
          </Marker>
        )}

        {/* Polygons */}
        {polygons.map((polygon, index) => (
          <Polygon
            key={polygon.id || index}
            positions={polygon.positions}
            pathOptions={
              polygon.style || { color: "purple", weight: 2, fillOpacity: 0.3 }
            }
          >
            {polygon.popup && <Popup>{polygon.popup}</Popup>}
          </Polygon>
        ))}

        {/* Circles */}
        {circles.map((circle, index) => (
          <Circle
            key={circle.id || index}
            center={circle.center}
            radius={circle.radius}
            pathOptions={
              circle.style || { color: "blue", weight: 2, fillOpacity: 0.2 }
            }
          >
            {circle.popup && <Popup>{circle.popup}</Popup>}
          </Circle>
        ))}

        {/* Polylines */}
        {polylines.map((polyline, index) => (
          <Polyline
            key={polyline.id || index}
            positions={polyline.positions}
            pathOptions={polyline.style || { color: "red", weight: 3 }}
          >
            {polyline.popup && <Popup>{polyline.popup}</Popup>}
          </Polyline>
        ))}
      </MapContainer>
    </div>
  );
};
