"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Factory, Fuel, Truck, Zap, Plus, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useState, useEffect } from "react";
import { infrastructureApi } from "@/lib/api/infrastructure";
import { Infrastructure } from "@/lib/api/infrastructure";
import AddInfrastructureModal from "@/components/modals/AddInfrastructureModal";
import { exportToCSV, exportToJSON } from "@/utils/exportUtils";

export default function InfrastructurePage() {
  const [infrastructure, setInfrastructure] = useState<Infrastructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const loadInfrastructure = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Loading infrastructure data...");
        const data = await infrastructureApi.getInfrastructure();
        console.log("Infrastructure data received:", data);
        console.log("Data type:", typeof data);
        console.log("Is array:", Array.isArray(data));

        // Ensure data is an array
        const infrastructureArray = Array.isArray(data) ? data : [];
        setInfrastructure(infrastructureArray);
      } catch (error: any) {
        console.error("Failed to load infrastructure:", error);
        setError(
          `Failed to load infrastructure data: ${error.message || error}`
        );
      } finally {
        setLoading(false);
      }
    };

    loadInfrastructure();
  }, []);

  const handleExportCSV = () => {
    try {
      exportToCSV(
        infrastructureItems,
        `infrastructure-${new Date().toISOString().split("T")[0]}.csv`
      );
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleExportJSON = () => {
    try {
      exportToJSON(
        infrastructureItems,
        `infrastructure-${new Date().toISOString().split("T")[0]}.json`
      );
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const refreshInfrastructure = () => {
    const loadInfrastructure = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Refreshing infrastructure data...");
        const data = await infrastructureApi.getInfrastructure();
        console.log("Infrastructure data refreshed:", data);

        // Ensure data is an array
        const infrastructureArray = Array.isArray(data) ? data : [];
        setInfrastructure(infrastructureArray);
      } catch (error: any) {
        console.error("Failed to load infrastructure:", error);
        setError(
          `Failed to load infrastructure data: ${error.message || error}`
        );
      } finally {
        setLoading(false);
      }
    };

    loadInfrastructure();
  };

  // Calculate infrastructure type counts from real data
  const infrastructureTypes = [
    {
      id: "production_plant",
      name: "Production Plants",
      icon: Factory,
      count: infrastructure.filter(
        (i) => i?.infrastructureType === "production_plant"
      ).length,
      color: "bg-primary-500",
      bgColor: "bg-primary-50 dark:bg-primary-900/20",
    },
    {
      id: "storage_facility",
      name: "Storage Facilities",
      icon: Fuel,
      count: infrastructure.filter(
        (i) => i?.infrastructureType === "storage_facility"
      ).length,
      color: "bg-secondary-500",
      bgColor: "bg-secondary-50 dark:bg-secondary-900/20",
    },
    {
      id: "distribution_hub",
      name: "Distribution Hubs",
      icon: Truck,
      count: infrastructure.filter(
        (i) => i?.infrastructureType === "distribution_hub"
      ).length,
      color: "bg-accent-500",
      bgColor: "bg-accent-50 dark:bg-accent-900/20",
    },
    {
      id: "pipeline",
      name: "Pipelines",
      icon: Zap,
      count: infrastructure.filter((i) => i?.infrastructureType === "pipeline")
        .length,
      color: "bg-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    },
  ];

  // Transform infrastructure for display
  const infrastructureItems = (
    Array.isArray(infrastructure) ? infrastructure : []
  )
    .filter(
      (item) =>
        !searchTerm ||
        (item?.infrastructureType &&
          typeof item.infrastructureType === "string" &&
          item.infrastructureType
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
    )
    .map((item) => {
      // Safe string replacement function
      const safeReplace = (str: string | undefined | null) => {
        if (!str || typeof str !== "string") return "Unknown";
        try {
          return str
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
        } catch (error) {
          console.error("Error in safeReplace:", error, "Input:", str);
          return "Unknown";
        }
      };

      return {
        id: item?.id || "unknown",
        name: safeReplace(item?.infrastructureType) || "Unknown Infrastructure",
        type: safeReplace(item?.infrastructureType) || "Unknown",
        capacity: item?.capacity
          ? `${item.capacity.value || 0} ${(
              item.capacity.unit || "TPA"
            ).toUpperCase()}`
          : "Unknown",
        status: safeReplace(item?.operationalStatus) || "Unknown",
        location:
          item?.geometry?.coordinates &&
          Array.isArray(item.geometry.coordinates) &&
          item.geometry.coordinates.length >= 2
            ? `${Number(item.geometry.coordinates[1]).toFixed(4)}, ${Number(
                item.geometry.coordinates[0]
              ).toFixed(4)}`
            : "Unknown Location",
        commissioned: item?.createdAt
          ? new Date(item.createdAt).toLocaleDateString()
          : "Unknown",
      };
    });
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Infrastructure Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Monitor and manage hydrogen infrastructure assets
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Infrastructure
        </Button>
      </motion.div>
      {/* Infrastructure Type Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {infrastructureTypes.map((type, index) => (
          <motion.div
            key={type.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 ${type.bgColor} rounded-lg flex items-center justify-center`}
                  >
                    <type.icon
                      className={`w-6 h-6 text-${type.color.split("-")[1]}-500`}
                    />
                  </div>
                  <Badge variant="secondary">{type.count}</Badge>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mt-4">
                  {type.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {type.count} facilities
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search infrastructure..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
        <div className="relative group">
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Export
          </Button>
          <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            <button
              onClick={handleExportCSV}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
            >
              Export as CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
            >
              Export as JSON
            </button>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Loading infrastructure...
          </span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      )}

      {/* Infrastructure List */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                Infrastructure Assets ({infrastructureItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {infrastructureItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No infrastructure assets found.
                  </p>
                  <Button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Infrastructure
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {infrastructureItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                          <Factory className="w-5 h-5 text-primary-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {item.location} • {item.capacity}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge
                          variant={
                            item.status === "Operational"
                              ? "default"
                              : item.status === "Under Construction"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {item.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Add Infrastructure Modal */}
      <AddInfrastructureModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={refreshInfrastructure}
      />
    </div>
  );
}
