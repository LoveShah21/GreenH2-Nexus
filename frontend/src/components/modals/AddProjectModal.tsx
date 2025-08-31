"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { projectsApi } from "@/lib/api/projects";
import AddressInputSimple from "@/components/ui/AddressInputSimple";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddProjectModal({
  isOpen,
  onClose,
  onSuccess,
}: AddProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    projectType: "production",
    status: "concept",
    location: {
      type: "Point",
      coordinates: [0, 0],
      address: "",
      city: "",
      region: "",
      country: "",
      postalCode: "",
    },
    capacityTPA: 0,
    stakeholders: [""],
    startDate: "",
    completionDate: "",
    cost: {
      estimated: 0,
      currency: "USD",
    },
    metadata: {
      tags: [""],
    },
  });

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

  const handleArrayChange = (field: string, index: number, value: string) => {
    if (field === "stakeholders") {
      setFormData((prev) => ({
        ...prev,
        stakeholders: prev.stakeholders.map((item, i) =>
          i === index ? value : item
        ),
      }));
    } else if (field === "metadata.tags") {
      setFormData((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          tags: prev.metadata.tags.map((item, i) =>
            i === index ? value : item
          ),
        },
      }));
    }
  };

  const addArrayItem = (field: string) => {
    if (field === "stakeholders") {
      setFormData((prev) => ({
        ...prev,
        stakeholders: [...prev.stakeholders, ""],
      }));
    } else if (field === "metadata.tags") {
      setFormData((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          tags: [...prev.metadata.tags, ""],
        },
      }));
    }
  };

  const removeArrayItem = (field: string, index: number) => {
    if (field === "stakeholders") {
      setFormData((prev) => ({
        ...prev,
        stakeholders: prev.stakeholders.filter((_, i) => i !== index),
      }));
    } else if (field === "metadata.tags") {
      setFormData((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          tags: prev.metadata.tags.filter((_, i) => i !== index),
        },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate coordinates before sending
      const lng = parseFloat(formData.location.coordinates[0].toString());
      const lat = parseFloat(formData.location.coordinates[1].toString());

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

      // Clean up the data before sending
      const cleanedData = {
        ...formData,
        status: formData.status as
          | "operational"
          | "planned"
          | "decommissioned"
          | "construction"
          | "concept"
          | "planning",
        projectType: formData.projectType as
          | "production"
          | "storage"
          | "distribution"
          | "hub",
        location: {
          ...formData.location,
          coordinates: [lng, lat], // Ensure proper number format
        },
        stakeholders: formData.stakeholders.filter((s) => s.trim() !== ""),
        metadata: {
          tags: formData.metadata.tags.filter((t) => t.trim() !== ""),
        },
        startDate: formData.startDate || undefined,
        completionDate: formData.completionDate || undefined,
      };

      await projectsApi.createProject(cleanedData);
      onSuccess();
      onClose();

      // Reset form
      setFormData({
        name: "",
        projectType: "production",
        status: "concept",
        location: {
          type: "Point",
          coordinates: [0, 0],
          address: "",
          city: "",
          region: "",
          country: "",
          postalCode: "",
        },
        capacityTPA: 0,
        stakeholders: [""],
        startDate: "",
        completionDate: "",
        cost: {
          estimated: 0,
          currency: "USD",
        },
        metadata: {
          tags: [""],
        },
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create project";
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
                    Add New Project
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
                      <MapPin className="w-5 h-5 mr-2" />
                      Basic Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Project Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                          placeholder="Enter project name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Project Type *
                        </label>
                        <select
                          required
                          value={formData.projectType}
                          onChange={(e) =>
                            handleInputChange("projectType", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="production">Production</option>
                          <option value="storage">Storage</option>
                          <option value="distribution">Distribution</option>
                          <option value="hub">Hub</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) =>
                            handleInputChange("status", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="concept">Concept</option>
                          <option value="planning">Planning</option>
                          <option value="construction">Construction</option>
                          <option value="operational">Operational</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Capacity (TPA) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={formData.capacityTPA}
                          onChange={(e) =>
                            handleInputChange(
                              "capacityTPA",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                          placeholder="0"
                        />
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
                      value={formData.location.address}
                      onChange={(address) =>
                        handleInputChange("location.address", address)
                      }
                      onCoordinatesChange={(coordinates) => {
                        handleInputChange("location.coordinates", [
                          coordinates.lng,
                          coordinates.lat,
                        ]);
                      }}
                      onAddressComponentsChange={(components) => {
                        handleInputChange("location.city", components.city);
                        handleInputChange("location.region", components.region);
                        handleInputChange(
                          "location.country",
                          components.country
                        );
                        handleInputChange(
                          "location.postalCode",
                          components.postalCode
                        );
                      }}
                      required
                      placeholder="Enter project address (e.g., 123 Industrial Ave, Hamburg, Germany)"
                    />

                    {/* Show coordinates if available */}
                    {(formData.location.coordinates[0] !== 0 ||
                      formData.location.coordinates[1] !== 0) && (
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
                            value={formData.location.coordinates[0].toFixed(6)}
                            onChange={(e) => {
                              const newCoords = [
                                ...formData.location.coordinates,
                              ];
                              newCoords[0] = parseFloat(e.target.value) || 0;
                              handleInputChange(
                                "location.coordinates",
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
                            value={formData.location.coordinates[1].toFixed(6)}
                            onChange={(e) => {
                              const newCoords = [
                                ...formData.location.coordinates,
                              ];
                              newCoords[1] = parseFloat(e.target.value) || 0;
                              handleInputChange(
                                "location.coordinates",
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

                  {/* Timeline */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Timeline
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) =>
                            handleInputChange("startDate", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Completion Date
                        </label>
                        <input
                          type="date"
                          value={formData.completionDate}
                          onChange={(e) =>
                            handleInputChange("completionDate", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cost */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Cost Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Estimated Cost
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.cost.estimated}
                          onChange={(e) =>
                            handleInputChange(
                              "cost.estimated",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Currency
                        </label>
                        <select
                          value={formData.cost.currency}
                          onChange={(e) =>
                            handleInputChange("cost.currency", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="JPY">JPY</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Stakeholders */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Stakeholders
                    </h3>

                    {formData.stakeholders.map((stakeholder, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={stakeholder}
                          onChange={(e) =>
                            handleArrayChange(
                              "stakeholders",
                              index,
                              e.target.value
                            )
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                          placeholder="Stakeholder name"
                        />
                        {formData.stakeholders.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              removeArrayItem("stakeholders", index)
                            }
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem("stakeholders")}
                    >
                      Add Stakeholder
                    </Button>
                  </div>

                  {/* Tags */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Tags
                    </h3>

                    {formData.metadata.tags.map((tag, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={tag}
                          onChange={(e) =>
                            handleArrayChange(
                              "metadata.tags",
                              index,
                              e.target.value
                            )
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                          placeholder="Tag name"
                        />
                        {formData.metadata.tags.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              removeArrayItem("metadata.tags", index)
                            }
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem("metadata.tags")}
                    >
                      Add Tag
                    </Button>
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
                      {loading ? "Creating..." : "Create Project"}
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
