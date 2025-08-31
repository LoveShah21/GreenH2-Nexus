"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Factory,
  DollarSign,
  Leaf,
  TrendingUp,
  MapPin,
  Users,
  Calendar,
  BarChart3,
} from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { FadeIn } from "@/components/animations/FadeIn";
import { CountUp } from "@/components/animations/CountUp";
import CapacityGrowthChart from "@/components/dashboard/CapacityGrowthChart";
import { projectsApi } from "@/lib/api/projects";
import { analyticsApi } from "@/lib/api/analytics";
import { Project } from "@/types/project";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load projects and analytics data
        const [projectsResponse, analyticsSummary] = await Promise.all([
          projectsApi.getProjects({ limit: 10 }),
          analyticsApi.getAnalyticsSummary().catch(() => null), // Fallback if analytics fails
        ]);

        setProjects(projectsResponse.data || []);
        setAnalyticsData(analyticsSummary);
      } catch (error: any) {
        console.error("Failed to load dashboard data:", error);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Calculate KPI data from real projects
  const kpiData = [
    {
      title: "Total Projects",
      value: projects.length,
      change: { value: 12, type: "increase" as const, period: "last month" },
      icon: Factory,
      color: "green" as const,
    },
    {
      title: "Operational Capacity",
      value: `${(
        projects.reduce((sum, p) => sum + (p.capacity || 0), 0) / 1000
      ).toFixed(1)} GW`,
      change: { value: 8, type: "increase" as const, period: "last quarter" },
      icon: Zap,
      color: "blue" as const,
    },
    {
      title: "Total Investment",
      value: `$${(
        projects.reduce((sum, p) => sum + (p.investment?.total || 0), 0) /
        1000000000
      ).toFixed(1)}B`,
      change: { value: 15, type: "increase" as const, period: "this year" },
      icon: DollarSign,
      color: "amber" as const,
    },
    {
      title: "CO₂ Reduction",
      value: `${(
        projects.reduce(
          (sum, p) => sum + (p.environmental?.co2ReductionPotential || 0),
          0
        ) / 1000
      ).toFixed(0)}K tons/year`,
      change: { value: 22, type: "increase" as const, period: "projected" },
      icon: Leaf,
      color: "green" as const,
    },
  ];

  // Get recent projects from API data
  const recentProjects = projects.slice(0, 4).map((project) => ({
    name: project.name,
    location: `${project.location?.region || "Unknown"}, ${
      project.location?.country || "Unknown"
    }`,
    capacity: `${project.capacity || project.capacityTPA || 0} ${
      project.capacityTPA ? "TPA" : "MW"
    }`,
    status:
      (project.status || "unknown").charAt(0).toUpperCase() +
      (project.status || "unknown").slice(1),
    completion: project.timeline?.expectedCompletion
      ? new Date(project.timeline.expectedCompletion).toLocaleDateString(
          "en-US",
          { year: "numeric", month: "short" }
        )
      : "TBD",
  }));

  // Calculate regional distribution from projects
  const regionalData = projects
    .reduce((acc: any[], project) => {
      const region = project.location?.region || "Others";
      const existing = acc.find((r) => r.region === region);
      if (existing) {
        existing.projects += 1;
        existing.capacity += project.capacity || 0;
      } else {
        acc.push({
          region,
          projects: 1,
          capacity: project.capacity || 0,
        });
      }
      return acc;
    }, [])
    .map((item) => ({
      ...item,
      capacity: `${(item.capacity / 1000).toFixed(1)} GW`,
    }));

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Monitor global hydrogen infrastructure development and performance
              metrics
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </FadeIn>

      {/* KPI Cards */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <KPICard {...kpi} />
            </motion.div>
          ))}
        </div>
      </FadeIn>

      {/* Charts and Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Capacity Trends Chart */}
        <FadeIn delay={0.3}>
          <CapacityGrowthChart />
        </FadeIn>

        {/* Regional Distribution */}
        <FadeIn delay={0.4}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-secondary-500" />
                Regional Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regionalData.map((region, index) => (
                  <motion.div
                    key={region.region}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {region.region}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {region.projects} projects
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {region.capacity}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Recent Projects */}
      <FadeIn delay={0.5}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-accent-500" />
              Recent Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                      Project Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                      Location
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                      Capacity
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                      Completion
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentProjects.map((project, index) => (
                    <motion.tr
                      key={project.name}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                        {project.name}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {project.location}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {project.capacity}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            project.status === "Operational"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : project.status === "Construction"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {project.completion}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
