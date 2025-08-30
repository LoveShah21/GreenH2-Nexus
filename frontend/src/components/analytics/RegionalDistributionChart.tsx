"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge-2";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardToolbar,
} from "@/components/ui/card-enhanced";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/line-charts-5";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingDown,
  TrendingUp,
  Globe,
  MapPin,
  Users,
  Building,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// Regional hydrogen infrastructure data
const regionalData = {
  capacity: [
    {
      region: "Europe",
      value: 4200,
      projects: 89,
      growth: 18.5,
      color: "#10b981",
    },
    {
      region: "North America",
      value: 3100,
      projects: 67,
      growth: 22.3,
      color: "#3b82f6",
    },
    {
      region: "Asia Pacific",
      value: 2800,
      projects: 54,
      growth: 15.8,
      color: "#f59e0b",
    },
    {
      region: "Middle East",
      value: 1500,
      projects: 23,
      growth: 28.7,
      color: "#ef4444",
    },
    {
      region: "Latin America",
      value: 800,
      projects: 14,
      growth: 12.4,
      color: "#8b5cf6",
    },
    {
      region: "Africa",
      value: 600,
      projects: 11,
      growth: 35.2,
      color: "#06b6d4",
    },
  ],
  projects: [
    {
      region: "Europe",
      value: 89,
      capacity: 4200,
      investment: 28.5,
      color: "#10b981",
    },
    {
      region: "North America",
      value: 67,
      capacity: 3100,
      investment: 22.8,
      color: "#3b82f6",
    },
    {
      region: "Asia Pacific",
      value: 54,
      capacity: 2800,
      investment: 18.9,
      color: "#f59e0b",
    },
    {
      region: "Middle East",
      value: 23,
      capacity: 1500,
      investment: 12.3,
      color: "#ef4444",
    },
    {
      region: "Latin America",
      value: 14,
      capacity: 800,
      investment: 5.8,
      color: "#8b5cf6",
    },
    {
      region: "Africa",
      value: 11,
      capacity: 600,
      investment: 4.2,
      color: "#06b6d4",
    },
  ],
  investment: [
    {
      region: "Europe",
      value: 28.5,
      capacity: 4200,
      projects: 89,
      color: "#10b981",
    },
    {
      region: "North America",
      value: 22.8,
      capacity: 3100,
      projects: 67,
      color: "#3b82f6",
    },
    {
      region: "Asia Pacific",
      value: 18.9,
      capacity: 2800,
      projects: 54,
      color: "#f59e0b",
    },
    {
      region: "Middle East",
      value: 12.3,
      capacity: 1500,
      projects: 23,
      color: "#ef4444",
    },
    {
      region: "Latin America",
      value: 5.8,
      capacity: 800,
      projects: 14,
      color: "#8b5cf6",
    },
    {
      region: "Africa",
      value: 4.2,
      capacity: 600,
      projects: 11,
      color: "#06b6d4",
    },
  ],
};

// Chart configuration
const chartConfig = {
  value: {
    label: "Value",
    color: "#10b981",
  },
} satisfies ChartConfig;

// Custom Tooltip
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    payload: any;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="rounded-lg border bg-popover p-4 shadow-sm shadow-black/5 min-w-[200px]">
        <div className="text-sm font-medium text-popover-foreground mb-3">
          {data.region}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Capacity:</span>
            <span className="font-semibold text-popover-foreground">
              {data.capacity?.toLocaleString()} MW
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Projects:</span>
            <span className="font-semibold text-popover-foreground">
              {data.projects || data.value}
            </span>
          </div>
          {data.investment && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Investment:</span>
              <span className="font-semibold text-popover-foreground">
                ${data.investment}B
              </span>
            </div>
          )}
          {data.growth && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Growth:</span>
              <span className="font-semibold text-emerald-600">
                +{data.growth}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

// Metric configuration
const METRICS = {
  capacity: { key: "capacity", label: "Capacity (MW)", icon: Building },
  projects: { key: "projects", label: "Number of Projects", icon: MapPin },
  investment: { key: "investment", label: "Investment ($B)", icon: Users },
} as const;

type MetricKey = keyof typeof METRICS;

export default function RegionalDistributionChart() {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("capacity");

  // Get data for selected metric
  const currentData = regionalData[selectedMetric];
  const metric = METRICS[selectedMetric];

  // Calculate totals
  const totalValue = currentData.reduce((sum, item) => sum + item.value, 0);
  const totalProjects = currentData.reduce(
    (sum, item) => sum + (item.projects || 0),
    0
  );
  const avgGrowth =
    currentData.reduce((sum, item) => sum + (item.growth || 0), 0) /
    currentData.length;

  // Get top performing region
  const topRegion = currentData.reduce((prev, current) =>
    current.value > prev.value ? current : prev
  );

  const stats = [
    {
      label: "Total Value",
      value:
        selectedMetric === "investment"
          ? `$${totalValue.toFixed(1)}B`
          : selectedMetric === "capacity"
          ? `${totalValue.toLocaleString()} MW`
          : totalValue.toString(),
      change: avgGrowth,
      icon: <metric.icon className="size-4" />,
      color: "#10b981",
    },
    {
      label: "Top Region",
      value: topRegion.region,
      change: topRegion.growth || 0,
      icon: <Globe className="size-4" />,
      color: topRegion.color,
    },
    {
      label: "Total Projects",
      value: totalProjects.toString(),
      change: 15.2,
      icon: <MapPin className="size-4" />,
      color: "#3b82f6",
    },
    {
      label: "Avg Growth",
      value: `${avgGrowth.toFixed(1)}%`,
      change: avgGrowth >= 20 ? 5 : -2,
      icon: <TrendingUp className="size-4" />,
      color: "#f59e0b",
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="border-0 min-h-auto pt-6 pb-4">
        <CardTitle className="text-lg font-semibold">
          Regional Distribution Analysis
        </CardTitle>
        <CardToolbar>
          <Select
            value={selectedMetric}
            onValueChange={(value) => setSelectedMetric(value as MetricKey)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {Object.values(METRICS).map((metric) => (
                <SelectItem key={metric.key} value={metric.key}>
                  {metric.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardToolbar>
      </CardHeader>

      <CardContent className="px-2 pb-6">
        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-5 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div style={{ color: stat.color }}>{stat.icon}</div>
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">{stat.value}</span>
                <Badge
                  variant={stat.change >= 0 ? "success" : "destructive"}
                  appearance="light"
                  size="sm"
                >
                  {stat.change >= 0 ? (
                    <TrendingUp className="size-3" />
                  ) : (
                    <TrendingDown className="size-3" />
                  )}
                  {Math.abs(stat.change).toFixed(1)}%
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-5">
          {/* Pie Chart */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Distribution by Region
            </h3>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={currentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ region, percent }) =>
                      `${region} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {currentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Bar Chart */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Regional Comparison
            </h3>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={currentData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="region"
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) =>
                      selectedMetric === "investment"
                        ? `$${value}B`
                        : selectedMetric === "capacity"
                        ? `${value}`
                        : value.toString()
                    }
                  />
                  <ChartTooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="value"
                    fill={(entry) => entry.color}
                    radius={[4, 4, 0, 0]}
                  >
                    {currentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>

        {/* Regional Insights */}
        <div className="mt-6 px-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Regional Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-lg">
              <div className="font-medium text-emerald-800 dark:text-emerald-200 mb-2">
                Leading Region
              </div>
              <div className="text-emerald-600 dark:text-emerald-400">
                {topRegion.region} leads with{" "}
                {selectedMetric === "investment"
                  ? `$${topRegion.value}B`
                  : selectedMetric === "capacity"
                  ? `${topRegion.value} MW`
                  : topRegion.value}
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <div className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Growth Trend
              </div>
              <div className="text-blue-600 dark:text-blue-400">
                Average {avgGrowth.toFixed(1)}% growth across all regions
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
              <div className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                Market Share
              </div>
              <div className="text-purple-600 dark:text-purple-400">
                Top 3 regions account for{" "}
                {(
                  (currentData
                    .slice(0, 3)
                    .reduce((sum, item) => sum + item.value, 0) /
                    totalValue) *
                  100
                ).toFixed(0)}
                % of total
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
