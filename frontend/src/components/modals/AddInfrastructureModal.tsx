"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Factory, MapPin, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { infrastructureApi, Infrastructure } from "@/lib/api/infrastructure";
import { projectsApi } from "@/lib/api/projects";
import { Project } from "@/types/project";
import AddressInputSimple from "@/components/ui/AddressInputSimple";

interface AddInfrastructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddInfrastructureModal({
  isOpen,
  onClose,
  onSuccess,
}: AddInfrastructureModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState({
    infrastructureType: "production_plant",
    geometry: {
      type: "Point",
      coordinates: [0, 0],
      address: "",
    },
    capacity: {
      value: 0,
      unit: "tpa",
    },
    operationalStatus: "planned",
    projectId: "",
    specifications: {
      diameter: 0,
      pressure: 0,
      material: "",
      safetyRating: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  const loadProjects = async () => {
    try {
      const response = await projectsApi.getProjects({ limit: 100 });
      setProjects(response.data || []);
    } catch (error) {
      console.error("Failed to load projects:", error);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | number | number[]
  ) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate coordinates before sending
      const lng = parseFloat(formData.geometry.coordinates[0].toString());
      const lat = parseFloat(formData.geometry.coordinates[1].toString());

      if (isNaN(lng) || isNaN(lat)) {
        setError("Invalid coordinates. Please enter a valid address.");
        return;
      }

      if (lng === 0 && lat === 0) {
        setError("Please enter a valid address to get coordinates");
        return;
      }

      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        setError("Coordinates are out of valid range");
        return;
      }

      // Clean up the data before sending - match backend model exactly
      const coordinates = [lng, lat];

      // Debug logging
      console.log("Sending coordinates:", coordinates);
      console.log(
        "Coordinate types:",
        coordinates.map((c) => typeof c)
      );
      console.log("Coordinate validation:", {
        isArray: Array.isArray(coordinates),
        length: coordinates.length,
        lng: coordinates[0],
        lat: coordinates[1],
        lngValid: coordinates[0] >= -180 && coordinates[0] <= 180,
        latValid: coordinates[1] >= -90 && coordinates[1] <= 90,
      });

      const cleanedData: Omit<
        Infrastructure,
        "id" | "createdAt" | "updatedAt"
      > = {
        infrastructureType: formData.infrastructureType,
        geometry: {
          type: "Point", // Always use Point for infrastructure locations
          coordinates: coordinates,
        },
        capacity: {
          value: formData.capacity.value,
          unit: formData.capacity.unit,
        },
        operationalStatus: formData.operationalStatus,
        projectId: formData.projectId,
        specifications: {
          diameter: formData.specifications.diameter || undefined,
          pressure: formData.specifications.pressure || undefined,
          material: formData.specifications.material || undefined,
          safetyRating: formData.specifications.safetyRating || undefined,
        },
        // These will be set by the backend controller
        // createdBy and updatedBy are handled by the backend
      };

      await infrastructureApi.createInfrastructure(cleanedData);
      onSuccess();
      onClose();

      // Reset form
      setFormData({
        infrastructureType: "production_plant",
        geometry: {
          type: "Point",
          coordinates: [0, 0],
          address: "",
        },
        capacity: {
          value: 0,
          unit: "tpa",
        },
        operationalStatus: "planned",
        projectId: "",
        specifications: {
          diameter: 0,
          pressure: 0,
          material: "",
          safetyRating: "",
        },
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create infrastructure";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Add New Infrastructure
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    className="p-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Factory className="w-5 h-5 mr-2" />
                      Basic Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Infrastructure Type *
                        </label>
                        <select
                          required
                          value={formData.infrastructureType}
                          onChange={(e) =>
                            handleInputChange(
                              "infrastructureType",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="production_plant">
                            Production Plant
                          </option>
                          <option value="storage_facility">
                            Storage Facility
                          </option>
                          <option value="distribution_hub">
                            Distribution Hub
                          </option>
                          <option value="pipeline">Pipeline</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Operational Status
                        </label>
                        <select
                          value={formData.operationalStatus}
                          onChange={(e) =>
                            handleInputChange(
                              "operationalStatus",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="planned">Planned</option>
                          <option value="under_construction">
                            Under Construction
                          </option>
                          <option value="operational">Operational</option>
                          <option value="decommissioned">Decommissioned</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Associated Project *
                        </label>
                        <select
                          required
                          value={formData.projectId}
                          onChange={(e) =>
                            handleInputChange("projectId", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="">Select a project</option>
                          {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                              {project.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Geometry Type
                        </label>
                        <input
                          type="text"
                          value="Point"
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Infrastructure locations use Point geometry
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Location
                    </h3>

                    <AddressInputSimple
                      value={formData.geometry.address}
                      onChange={(address) =>
                        handleInputChange("geometry.address", address)
                      }
                      onCoordinatesChange={(coordinates) => {
                        handleInputChange("geometry.coordinates", [
                          coordinates.lng,
                          coordinates.lat,
                        ]);
                      }}
                      required
                      placeholder="Enter infrastructure address (e.g., 456 Storage Rd, Rotterdam, Netherlands)"
                    />

                    {/* Show coordinates if available */}
                    {(formData.geometry.coordinates[0] !== 0 ||
                      formData.geometry.coordinates[1] !== 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Longitude
                          </label>
                          <input
                            type="number"
                            min="-180"
                            max="180"
                            step="any"
                            value={formData.geometry.coordinates[0].toFixed(6)}
                            onChange={(e) => {
                              const newCoords = [
                                ...formData.geometry.coordinates,
                              ];
                              newCoords[0] = parseFloat(e.target.value) || 0;
                              handleInputChange(
                                "geometry.coordinates",
                                newCoords
                              );
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                            placeholder="0.000000"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Latitude
                          </label>
                          <input
                            type="number"
                            min="-90"
                            max="90"
                            step="any"
                            value={formData.geometry.coordinates[1].toFixed(6)}
                            onChange={(e) => {
                              const newCoords = [
                                ...formData.geometry.coordinates,
                              ];
                              newCoords[1] = parseFloat(e.target.value) || 0;
                              handleInputChange(
                                "geometry.coordinates",
                                newCoords
                              );
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                            placeholder="0.000000"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Capacity */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Zap className="w-5 h-5 mr-2" />
                      Capacity
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Capacity Value *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={formData.capacity.value}
                          onChange={(e) =>
                            handleInputChange(
                              "capacity.value",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Unit
                        </label>
                        <select
                          value={formData.capacity.unit}
                          onChange={(e) =>
                            handleInputChange("capacity.unit", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="tpa">TPA (Tons per Annum)</option>
                          <option value="mw">MW (Megawatts)</option>
                          <option value="m3">m³ (Cubic Meters)</option>
                          <option value="kg/h">
                            kg/h (Kilograms per Hour)
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Technical Specifications
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Diameter (mm)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.specifications.diameter}
                          onChange={(e) =>
                            handleInputChange(
                              "specifications.diameter",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Operating Pressure (bar)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.specifications.pressure}
                          onChange={(e) =>
                            handleInputChange(
                              "specifications.pressure",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Material
                        </label>
                        <input
                          type="text"
                          value={formData.specifications.material}
                          onChange={(e) =>
                            handleInputChange(
                              "specifications.material",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                          placeholder="e.g., Stainless Steel"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Safety Rating
                        </label>
                        <input
                          type="text"
                          value={formData.specifications.safetyRating}
                          onChange={(e) =>
                            handleInputChange(
                              "specifications.safetyRating",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                          placeholder="e.g., ASME B31.12"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      disabled={loading}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? "Creating..." : "Create Infrastructure"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
