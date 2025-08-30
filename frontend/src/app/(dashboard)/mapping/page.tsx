"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Layers,
  Search,
  Filter,
  Maximize2,
  Download,
  Settings,
  MapPin,
  Zap,
  Factory,
  Truck,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/animations/FadeIn";

export default function MappingPage() {
  const [selectedLayers, setSelectedLayers] = useState({
    production: true,
    storage: true,
    pipelines: true,
    distribution: false,
    renewable: true,
  });

  const [mapStyle, setMapStyle] = useState("satellite");

  const layerControls = [
    {
      id: "production",
      name: "Production Plants",
      icon: Factory,
      color: "text-green-500",
      count: 89,
    },
    {
      id: "storage",
      name: "Storage Facilities",
      icon: Zap,
      color: "text-blue-500",
      count: 34,
    },
    {
      id: "pipelines",
      name: "Pipeline Network",
      icon: Truck,
      color: "text-purple-500",
      count: 156,
    },
    {
      id: "distribution",
      name: "Distribution Hubs",
      icon: MapPin,
      color: "text-amber-500",
      count: 67,
    },
    {
      id: "renewable",
      name: "Renewable Sources",
      icon: Zap,
      color: "text-teal-500",
      count: 203,
    },
  ];

  const mapStyles = [
    { id: "satellite", name: "Satellite" },
    { id: "streets", name: "Streets" },
    { id: "terrain", name: "Terrain" },
    { id: "dark", name: "Dark" },
  ];

  const toggleLayer = (layerId: string) => {
    setSelectedLayers((prev) => ({
      ...prev,
      [layerId]: !prev[layerId as keyof typeof prev],
    }));
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-surface-light dark:bg-surface-dark">
          <div>
            <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Interactive Infrastructure Map
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark">
              Explore global hydrogen infrastructure with advanced geospatial
              tools
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
              <input
                type="text"
                placeholder="Search locations, projects..."
                className="pl-10 pr-4 py-2 w-64 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>

            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </FadeIn>

      <div className="flex-1 flex">
        {/* Sidebar Controls */}
        <FadeIn delay={0.1}>
          <div className="w-80 bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Layer Controls */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4 flex items-center">
                <Layers className="w-5 h-5 mr-2" />
                Map Layers
              </h3>

              <div className="space-y-3">
                {layerControls.map((layer) => (
                  <motion.div
                    key={layer.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => toggleLayer(layer.id)}
                    whileHover={{ x: 2 }}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedLayers[
                            layer.id as keyof typeof selectedLayers
                          ]
                        }
                        onChange={() => toggleLayer(layer.id)}
                        className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500 mr-3"
                      />
                      <layer.icon className={`w-4 h-4 mr-2 ${layer.color}`} />
                      <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                        {layer.name}
                      </span>
                    </div>
                    <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {layer.count}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Map Style Selector */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
                Map Style
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {mapStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setMapStyle(style.id)}
                    className={`p-3 text-sm rounded-lg border-2 transition-all ${
                      mapStyle === style.id
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
                Legend
              </h3>

              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    Operational
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    Under Construction
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    Planned
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    Decommissioned
                  </span>
                </div>
              </div>
            </div>

            {/* Map Tools */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 mt-auto">
              <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
                Tools
              </h3>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Measure Distance
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Draw Polygon
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Full Screen
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Map Container */}
        <FadeIn delay={0.2} className="flex-1">
          <div className="h-full relative bg-gray-100 dark:bg-gray-900">
            {/* Map Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Card className="p-8 text-center max-w-md">
                <MapPin className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                  Interactive Map Loading
                </h3>
                <p className="text-text-secondary-light dark:text-text-secondary-dark mb-4">
                  The interactive Mapbox GL JS map will be rendered here with
                  real-time hydrogen infrastructure data.
                </p>
                <div className="space-y-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  <div>• Production plants with capacity indicators</div>
                  <div>• Pipeline networks with flow visualization</div>
                  <div>• Storage facilities with volume data</div>
                  <div>• Renewable energy source integration</div>
                  <div>• Real-time operational status updates</div>
                </div>
              </Card>
            </div>

            {/* Map Controls Overlay */}
            <div className="absolute top-4 right-4 space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white dark:bg-gray-800 shadow-lg"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white dark:bg-gray-800 shadow-lg"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col space-y-1">
              <Button
                variant="outline"
                size="sm"
                className="bg-white dark:bg-gray-800 shadow-lg w-10 h-10 p-0"
              >
                +
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white dark:bg-gray-800 shadow-lg w-10 h-10 p-0"
              >
                -
              </Button>
            </div>

            {/* Scale Indicator */}
            <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 px-3 py-2 rounded shadow-lg">
              <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                Scale: 1:50,000
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
