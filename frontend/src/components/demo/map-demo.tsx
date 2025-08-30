import React, { useState } from "react";
import { AdvancedMap } from "@/components/ui/interactive-map";

export default function MapDemo() {
  const [markers, setMarkers] = useState([
    {
      id: 1,
      position: [51.505, -0.09] as [number, number],
      color: "blue",
      size: "medium" as const,
      popup: {
        title: "London",
        content: "Capital of England",
        image:
          "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=300&h=200&fit=crop",
      },
    },
    {
      id: 2,
      position: [51.51, -0.1] as [number, number],
      color: "red",
      size: "large" as const,
      popup: {
        title: "Westminster",
        content: "Political center of London",
      },
    },
    {
      id: 3,
      position: [51.515, -0.072] as [number, number],
      color: "green",
      size: "small" as const,
      popup: {
        title: "Tower Bridge",
        content: "Famous London landmark",
        image:
          "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=300&h=200&fit=crop",
      },
    },
  ]);

  const polygons = [
    {
      id: 1,
      positions: [
        [51.515, -0.09],
        [51.52, -0.1],
        [51.52, -0.12],
      ] as [number, number][],
      style: { color: "green", weight: 2, fillOpacity: 0.4 },
      popup: "Hyde Park Area",
    },
  ];

  const circles = [
    {
      id: 1,
      center: [51.508, -0.11] as [number, number],
      radius: 500,
      style: { color: "purple", fillOpacity: 0.3 },
      popup: "500m radius from center",
    },
  ];

  const polylines = [
    {
      id: 1,
      positions: [
        [51.505, -0.09],
        [51.51, -0.1],
        [51.515, -0.072],
      ] as [number, number][],
      style: { color: "red", weight: 3 },
      popup: "Route through London",
    },
  ];

  const handleMarkerClick = (marker: any) => {
    console.log("Marker clicked:", marker);
    alert(`Clicked on ${marker.popup?.title || "Unknown location"}`);
  };

  const handleMapClick = (latlng: any) => {
    console.log("Map clicked at:", latlng);
    // Add a new marker at clicked location
    const newMarker = {
      id: Date.now(),
      position: [latlng.lat, latlng.lng] as [number, number],
      color: "yellow",
      size: "small" as const,
      popup: {
        title: "New Location",
        content: `Lat: ${latlng.lat.toFixed(4)}, Lng: ${latlng.lng.toFixed(4)}`,
      },
    };
    setMarkers((prev) => [...prev, newMarker]);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Interactive Map Demo
        </h1>
        <p className="text-gray-600">
          This demo shows the interactive map component with various features:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-500 mt-2 space-y-1">
          <li>Click on markers to see popups</li>
          <li>Click anywhere on the map to add new markers</li>
          <li>Use the search box to find locations</li>
          <li>Use the controls to locate yourself or toggle layers</li>
          <li>Markers are clustered when zoomed out</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <AdvancedMap
          center={[51.505, -0.09]}
          zoom={13}
          markers={markers}
          polygons={polygons}
          circles={circles}
          polylines={polylines}
          onMarkerClick={handleMarkerClick}
          onMapClick={handleMapClick}
          enableClustering={true}
          enableSearch={true}
          enableControls={true}
          style={{ height: "600px", width: "100%" }}
          className="border-0"
        />
      </div>

      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">
          Current Markers ({markers.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {markers.map((marker) => (
            <div key={marker.id} className="bg-white p-3 rounded border">
              <div className="font-medium">{marker.popup?.title}</div>
              <div className="text-sm text-gray-500">
                {marker.position[0].toFixed(4)}, {marker.position[1].toFixed(4)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Color: {marker.color} | Size: {marker.size}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
