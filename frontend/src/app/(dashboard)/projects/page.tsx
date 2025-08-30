"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Download,
  MapPin,
  Calendar,
  DollarSign,
  Zap,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/animations/FadeIn";
import { projectsApi } from "@/lib/api/projects";
import { Project } from "@/types/project";

export default function ProjectsPage() {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const filters: any = {};
        if (selectedStatus !== "all") {
          filters.status = selectedStatus;
        }
        if (searchTerm) {
          filters.search = searchTerm;
        }

        const response = await projectsApi.getProjects(filters);
        setProjects(response.data || []);
      } catch (error: any) {
        console.error("Failed to load projects:", error);
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [selectedStatus, searchTerm]);

  const statusColors = {
    Operational:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    Construction:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    Planning:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    Concept:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  };

  // Transform projects for display
  const displayProjects = projects.map((project) => ({
    id: project.id,
    name: project.name,
    location: `${project.location?.region || "Unknown"}, ${
      project.location?.country || "Unknown"
    }`,
    type: project.type.charAt(0).toUpperCase() + project.type.slice(1),
    status: project.status.charAt(0).toUpperCase() + project.status.slice(1),
    capacity: `${project.capacity} MW`,
    investment: `$${(project.investment?.total / 1000000).toFixed(0)}M`,
    completion: project.timeline?.expectedCompletion
      ? new Date(project.timeline.expectedCompletion).toLocaleDateString(
          "en-US",
          { year: "numeric", month: "short" }
        )
      : "TBD",
    progress:
      project.status === "operational"
        ? 100
        : project.status === "construction"
        ? 65
        : project.status === "planning"
        ? 25
        : 10,
    stakeholders: project.stakeholders?.partners || [],
  }));

  const filteredProjects = displayProjects;

  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Project Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage and monitor hydrogen infrastructure projects worldwide
            </p>
          </div>

          <Button className="group">
            <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
            New Project
          </Button>
        </div>
      </FadeIn>

      {/* Filters and Search */}
      <FadeIn delay={0.1}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                    disabled={loading}
                  />
                </div>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="operational">Operational</option>
                  <option value="construction">Construction</option>
                  <option value="planning">Planning</option>
                  <option value="concept">Concept</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Loading projects...
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

      {/* Projects Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <FadeIn key={project.id} delay={0.2 + index * 0.1}>
              <Card hover className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {project.name}
                      </CardTitle>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {project.location}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusColors[
                          project.status as keyof typeof statusColors
                        ]
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Project Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">
                          Type
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {project.type}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">
                          Capacity
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {project.capacity}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">
                          Investment
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {project.investment}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">
                          Completion
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {project.completion}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          Progress
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {project.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                          className="bg-emerald-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress}%` }}
                          transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        />
                      </div>
                    </div>

                    {/* Stakeholders */}
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Key Stakeholders
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {project.stakeholders.slice(0, 2).map((stakeholder) => (
                          <span
                            key={stakeholder}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded"
                          >
                            {stakeholder}
                          </span>
                        ))}
                        {project.stakeholders.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded">
                            +{project.stakeholders.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <FadeIn delay={0.3}>
          <Card className="text-center py-12">
            <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No projects found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || selectedStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by creating your first hydrogen infrastructure project."}
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create New Project
            </Button>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}
