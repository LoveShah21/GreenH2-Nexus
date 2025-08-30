"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { MapPin, Zap, Warehouse, Truck, Building2, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

// Mock data for the showcase
const showcaseMarkers = [
  {
    id: 1,
    name: "Thames Green H2 Hub",
    type: "electrolyzer",
    capacity: "100 MW",
    status: "operational",
    position: { x: 45, y: 35 },
    color: "#3b82f6",
  },
  {
    id: 2,
    name: "London Storage Facility",
    type: "storage",
    capacity: "500 tons",
    status: "construction",
    position: { x: 65, y: 25 },
    color: "#10b981",
  },
  {
    id: 3,
    name: "Heathrow H2 Station",
    type: "transport",
    capacity: "50 trucks/day",
    status: "planned",
    position: { x: 25, y: 55 },
    color: "#f59e0b",
  },
  {
    id: 4,
    name: "Canary Wharf Distribution",
    type: "distribution",
    capacity: "25 MW",
    status: "operational",
    position: { x: 75, y: 45 },
    color: "#ef4444",
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "electrolyzer":
      return <Zap className="h-3 w-3" />;
    case "storage":
      return <Warehouse className="h-3 w-3" />;
    case "transport":
      return <Truck className="h-3 w-3" />;
    case "distribution":
      return <Building2 className="h-3 w-3" />;
    default:
      return <MapPin className="h-3 w-3" />;
  }
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

export function MapShowcaseSection() {
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [animatedMarkers, setAnimatedMarkers] = useState<number[]>([]);

  // Animate markers appearing one by one
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimatedMarkers((prev) => {
        if (prev.length < showcaseMarkers.length) {
          return [...prev, prev.length];
        }
        return prev;
      });
    }, 800);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Interactive{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Infrastructure Mapping
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Visualize and analyze hydrogen infrastructure projects with our
            advanced interactive mapping platform. Real-time data, geospatial
            analysis, and collaborative planning tools.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Interactive Map Preview */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10 p-8 shadow-2xl">
              {/* Mock Map Container */}
              <div className="relative h-96 bg-gradient-to-br from-blue-50/10 to-green-50/10 rounded-xl overflow-hidden border border-white/5">
                {/* Grid Background */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: "30px 30px",
                  }}
                />

                {/* Map Markers */}
                {showcaseMarkers.map((marker, index) => (
                  <motion.div
                    key={marker.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={
                      animatedMarkers.includes(index)
                        ? { scale: 1, opacity: 1 }
                        : {}
                    }
                    transition={{ duration: 0.5, delay: 0.2 }}
                    whileHover={{ scale: 1.2 }}
                    className="absolute cursor-pointer"
                    style={{
                      left: `${marker.position.x}%`,
                      top: `${marker.position.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    onClick={() => setSelectedMarker(marker)}
                  >
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center relative"
                      style={{ backgroundColor: marker.color }}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${getStatusColor(
                          marker.status
                        )}`}
                      />

                      {/* Pulse Animation */}
                      <div
                        className="absolute inset-0 rounded-full animate-ping opacity-30"
                        style={{ backgroundColor: marker.color }}
                      />
                    </div>
                  </motion.div>
                ))}

                {/* Sample Connections */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{
                      pathLength: animatedMarkers.length >= 2 ? 1 : 0,
                    }}
                    transition={{ duration: 1, delay: 1 }}
                    d="M 45% 35% Q 55% 25% 65% 25%"
                    stroke="rgba(59, 130, 246, 0.5)"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,5"
                  />
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{
                      pathLength: animatedMarkers.length >= 3 ? 1 : 0,
                    }}
                    transition={{ duration: 1, delay: 1.5 }}
                    d="M 65% 25% Q 70% 35% 75% 45%"
                    stroke="rgba(16, 185, 129, 0.5)"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,5"
                  />
                </svg>

                {/* Map Controls Overlay */}
                <div className="absolute top-4 right-4 space-y-2">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                    <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                      <span className="text-xs text-white">+</span>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                    <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                      <span className="text-xs text-white">-</span>
                    </div>
                  </div>
                </div>

                {/* Search Bar Overlay */}
                <div className="absolute top-4 left-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                    <span className="text-xs text-white/70">
                      🔍 Search locations...
                    </span>
                  </div>
                </div>
              </div>

              {/* Map Legend */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  {
                    type: "electrolyzer",
                    color: "#3b82f6",
                    label: "Electrolyzers",
                  },
                  { type: "storage", color: "#10b981", label: "Storage" },
                  { type: "transport", color: "#f59e0b", label: "Transport" },
                  {
                    type: "distribution",
                    color: "#ef4444",
                    label: "Distribution",
                  },
                ].map((item) => (
                  <div key={item.type} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-gray-300">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-6">
              {[
                {
                  icon: MapPin,
                  title: "Real-time Infrastructure Tracking",
                  description:
                    "Monitor hydrogen facilities, production capacity, and operational status in real-time across global locations.",
                },
                {
                  icon: Zap,
                  title: "Smart Site Analysis",
                  description:
                    "AI-powered analysis for optimal facility placement considering renewable energy sources, transportation, and demand.",
                },
                {
                  icon: Building2,
                  title: "Collaborative Planning",
                  description:
                    "Share maps, collaborate with stakeholders, and coordinate infrastructure development projects seamlessly.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link href="/mapping">
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Explore Interactive Map
                </Button>
              </Link>
              <Link href="/analytics">
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  View Analytics
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Selected Marker Info */}
        {selectedMarker && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl border-2 border-white flex items-center justify-center"
                  style={{ backgroundColor: selectedMarker.color }}
                >
                  {getTypeIcon(selectedMarker.type)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {selectedMarker.name}
                  </h3>
                  <p className="text-gray-300 capitalize">
                    {selectedMarker.type} Facility • {selectedMarker.capacity}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${getStatusColor(
                    selectedMarker.status
                  )}`}
                />
                <span className="text-sm text-gray-300 capitalize">
                  {selectedMarker.status}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
