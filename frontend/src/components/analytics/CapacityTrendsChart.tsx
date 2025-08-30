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
  Zap,
  Warehouse,
  Truck,
  Building2,
  Target,
  BarChart3,
} from "lucide-react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";

// Advanced hydrogen capacity analytics data
const analyticsData = {
  "7d": [
    {
      period: "Mon",
      actual: 850,
      projected: 820,
      target: 900,
      efficiency: 85,
      utilization: 78,
      growth: 2.1,
    },
    {
      period: "Tue",
      actual: 920,
      projected: 880,
      target: 950,
      efficiency: 88,
      utilization: 82,
      growth: 3.2,
    },
    {
      period: "Wed",
      actual: 780,
      projected: 840,
      target: 900,
      efficiency: 82,
      utilization: 75,
      growth: 1.8,
    },
    {
      period: "Thu",
      actual: 1240,
      projected: 900,
      target: 1000,
      efficiency: 92,
      utilization: 89,
      growth: 4.5,
    },
    {
      period: "Fri",
      actual: 1100,
      projected: 950,
      target: 1050,
      efficiency: 90,
      utilization: 85,
      growth: 3.8,
    },
    {
      period: "Sat",
      actual: 950,
      projected: 920,
      target: 980,
      efficiency: 87,
      utilization: 80,
      growth: 2.9,
    },
    {
      period: "Sun",
      actual: 1080,
      projected: 980,
      target: 1100,
      efficiency: 89,
      utilization: 83,
      growth: 3.5,
    },
  ],
  "30d": [
    {
      period: "Week 1",
      actual: 5200,
      projected: 4800,
      target: 5500,
      efficiency: 86,
      utilization: 79,
      growth: 12.5,
    },
    {
      period: "Week 2",
      actual: 6400,
      projected: 5200,
      target: 6000,
      efficiency: 89,
      utilization: 84,
      growth: 18.2,
    },
    {
      period: "Week 3",
      actual: 5800,
      projected: 5600,
      target: 6200,
      efficiency: 85,
      utilization: 81,
      growth: 15.8,
    },
    {
      period: "Week 4",
      actual: 7200,
      projected: 6000,
      target: 6800,
      efficiency: 91,
      utilization: 87,
      growth: 22.1,
    },
  ],
  "90d": [
    {
      period: "Jan",
      actual: 22000,
      projected: 20500,
      target: 23000,
      efficiency: 87,
      utilization: 82,
      growth: 8.5,
    },
    {
      period: "Feb",
      actual: 24800,
      projected: 22000,
      target: 25000,
      efficiency: 89,
      utilization: 85,
      growth: 12.2,
    },
    {
      period: "Mar",
      actual: 21400,
      projected: 23500,
      target: 24000,
      efficiency: 84,
      utilization: 78,
      growth: 6.8,
    },
    {
      period: "Apr",
      actual: 26200,
      projected: 24000,
      target: 26500,
      efficiency: 91,
      utilization: 88,
      growth: 15.5,
    },
    {
      period: "May",
      actual: 25600,
      projected: 25000,
      target: 27000,
      efficiency: 88,
      utilization: 84,
      growth: 13.8,
    },
    {
      period: "Jun",
      actual: 27400,
      projected: 26000,
      target: 28000,
      efficiency: 92,
      utilization: 89,
      growth: 18.2,
    },
  ],
  "12m": [
    {
      period: "Q1 23",
      actual: 85000,
      projected: 80000,
      target: 90000,
      efficiency: 86,
      utilization: 81,
      growth: 25.5,
    },
    {
      period: "Q2 23",
      actual: 92000,
      projected: 85000,
      target: 95000,
      efficiency: 88,
      utilization: 84,
      growth: 28.2,
    },
    {
      period: "Q3 23",
      actual: 88000,
      projected: 90000,
      target: 92000,
      efficiency: 85,
      utilization: 80,
      growth: 22.8,
    },
    {
      period: "Q4 23",
      actual: 98000,
      projected: 92000,
      target: 100000,
      efficiency: 90,
      utilization: 87,
      growth: 32.1,
    },
    {
      period: "Q1 24",
      actual: 94000,
      projected: 95000,
      target: 98000,
      efficiency: 87,
      utilization: 83,
      growth: 28.5,
    },
    {
      period: "Q2 24",
      actual: 102000,
      projected: 98000,
      target: 105000,
      efficiency: 91,
      utilization: 88,
      growth: 35.2,
    },
    {
      period: "Q3 24",
      actual: 96000,
      projected: 100000,
      target: 102000,
      efficiency: 88,
      utilization: 85,
      growth: 30.8,
    },
    {
      period: "Q4 24",
      actual: 108000,
      projected: 105000,
      target: 110000,
      efficiency: 93,
      utilization: 90,
      growth: 38.5,
    },
  ],
};

// Chart configuration with advanced analytics theme
const chartConfig = {
  actual: {
    label: "Actual Capacity",
    color: "#10b981", // Emerald for actual
  },
  projected: {
    label: "Projected Capacity",
    color: "#3b82f6", // Blue for projected
  },
  target: {
    label: "Target Capacity",
    color: "#f59e0b", // Amber for target
  },
  efficiency: {
    label: "Efficiency %",
    color: "#8b5cf6", // Purple for efficiency
  },
} satisfies ChartConfig;

// Custom Tooltip
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const ChartLabel = ({ label, color }: { label: string; color: string }) => {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-1 h-3 rounded-full"
        style={{ backgroundColor: color }}
      ></div>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;

    return (
      <div className="rounded-lg border bg-popover p-4 shadow-sm shadow-black/5 min-w-[200px]">
        <div className="text-xs font-medium text-muted-foreground tracking-wide mb-3">
          {label}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <ChartLabel label="Actual:" color={chartConfig.actual.color} />
            <span className="font-semibold text-popover-foreground">
              {data?.actual?.toLocaleString()} MW
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <ChartLabel
              label="Projected:"
              color={chartConfig.projected.color}
            />
            <span className="font-semibold text-popover-foreground">
              {data?.projected?.toLocaleString()} MW
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <ChartLabel label="Target:" color={chartConfig.target.color} />
            <span className="font-semibold text-popover-foreground">
              {data?.target?.toLocaleString()} MW
            </span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Efficiency:</span>
              <span className="font-semibold text-popover-foreground">
                {data?.efficiency}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Utilization:</span>
              <span className="font-semibold text-popover-foreground">
                {data?.utilization}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Growth:</span>
              <span className="font-semibold text-emerald-600">
                +{data?.growth}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Period configuration
const PERIODS = {
  "7d": { key: "7d", label: "Last 7 days" },
  "30d": { key: "30d", label: "Last 30 days" },
  "90d": { key: "90d", label: "Last 90 days" },
  "12m": { key: "12m", label: "Last 12 months" },
} as const;

type PeriodKey = keyof typeof PERIODS;

export default function CapacityTrendsChart() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>("90d");

  // Get data for selected period
  const currentData = analyticsData[selectedPeriod];

  // Calculate analytics
  const totalActual = currentData.reduce((sum, item) => sum + item.actual, 0);
  const totalProjected = currentData.reduce(
    (sum, item) => sum + item.projected,
    0
  );
  const totalTarget = currentData.reduce((sum, item) => sum + item.target, 0);
  const avgEfficiency = Math.round(
    currentData.reduce((sum, item) => sum + item.efficiency, 0) /
      currentData.length
  );
  const avgUtilization = Math.round(
    currentData.reduce((sum, item) => sum + item.utilization, 0) /
      currentData.length
  );
  const totalGrowth =
    currentData.reduce((sum, item) => sum + item.growth, 0) /
    currentData.length;

  // Performance vs target
  const performanceVsTarget = ((totalActual / totalTarget) * 100).toFixed(1);
  const projectionAccuracy = (
    (1 - Math.abs(totalActual - totalProjected) / totalActual) *
    100
  ).toFixed(1);

  const stats = [
    {
      label: "Total Capacity",
      value: `${totalActual.toLocaleString()} MW`,
      change: totalGrowth,
      icon: <Zap className="size-4" />,
      color: chartConfig.actual.color,
    },
    {
      label: "vs Target",
      value: `${performanceVsTarget}%`,
      change: parseFloat(performanceVsTarget) >= 95 ? 5 : -2,
      icon: <Target className="size-4" />,
      color: chartConfig.target.color,
    },
    {
      label: "Avg Efficiency",
      value: `${avgEfficiency}%`,
      change: avgEfficiency >= 85 ? 3 : -1,
      icon: <BarChart3 className="size-4" />,
      color: chartConfig.efficiency.color,
    },
    {
      label: "Projection Accuracy",
      value: `${projectionAccuracy}%`,
      change: parseFloat(projectionAccuracy) >= 90 ? 4 : -1,
      icon: <Building2 className="size-4" />,
      color: chartConfig.projected.color,
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="border-0 min-h-auto pt-6 pb-4 mb-2">
        <CardTitle className="text-lg font-semibold">
          Advanced Capacity Trends & Analytics
        </CardTitle>
        <CardToolbar>
          <Select
            value={selectedPeriod}
            onValueChange={(value) => setSelectedPeriod(value as PeriodKey)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {Object.values(PERIODS).map((period) => (
                <SelectItem key={period.key} value={period.key}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardToolbar>
      </CardHeader>

      <CardContent className="px-2 pb-6">
        {/* Advanced Stats Section */}
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

        {/* Advanced Chart */}
        <ChartContainer
          config={chartConfig}
          className="h-[400px] w-full [&_.recharts-curve.recharts-tooltip-cursor]:stroke-initial"
        >
          <ComposedChart
            data={currentData}
            margin={{
              top: 30,
              right: 5,
              left: 5,
              bottom: 10,
            }}
          >
            {/* Background gradients */}
            <defs>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={chartConfig.actual.color}
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor={chartConfig.actual.color}
                  stopOpacity={0.05}
                />
              </linearGradient>
              <linearGradient
                id="projectedGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={chartConfig.projected.color}
                  stopOpacity={0.2}
                />
                <stop
                  offset="100%"
                  stopColor={chartConfig.projected.color}
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="4 12"
              stroke="var(--border)"
              strokeOpacity={0.5}
              horizontal={true}
              vertical={false}
            />

            {/* X Axis */}
            <XAxis
              dataKey="period"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              tickMargin={10}
            />

            {/* Y Axis */}
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              tickFormatter={(value) =>
                selectedPeriod === "7d"
                  ? `${value}`
                  : `${(value / 1000).toFixed(0)}k`
              }
              tickMargin={10}
            />

            <ChartTooltip
              content={<CustomTooltip />}
              cursor={{
                strokeDasharray: "3 3",
                stroke: "var(--muted-foreground)",
                strokeOpacity: 0.5,
              }}
            />

            {/* Target Reference Line */}
            <ReferenceLine
              y={currentData[0]?.target}
              stroke={chartConfig.target.color}
              strokeDasharray="8 8"
              strokeOpacity={0.6}
            />

            {/* Area for Actual Capacity */}
            <Area
              type="monotone"
              dataKey="actual"
              stroke={chartConfig.actual.color}
              strokeWidth={3}
              fill="url(#actualGradient)"
              fillOpacity={1}
            />

            {/* Line for Projected Capacity */}
            <Line
              type="monotone"
              dataKey="projected"
              stroke={chartConfig.projected.color}
              strokeWidth={2}
              strokeDasharray="6 6"
              dot={false}
              activeDot={{
                r: 5,
                fill: chartConfig.projected.color,
                strokeWidth: 0,
              }}
            />

            {/* Line for Target */}
            <Line
              type="monotone"
              dataKey="target"
              stroke={chartConfig.target.color}
              strokeWidth={2}
              strokeDasharray="12 4"
              dot={false}
              activeDot={{
                r: 4,
                fill: chartConfig.target.color,
                strokeWidth: 0,
              }}
            />
          </ComposedChart>
        </ChartContainer>

        {/* Performance Insights */}
        <div className="mt-6 px-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg">
              <div className="font-medium text-emerald-800 dark:text-emerald-200">
                Performance
              </div>
              <div className="text-emerald-600 dark:text-emerald-400">
                {parseFloat(performanceVsTarget) >= 95
                  ? "Exceeding targets"
                  : "Below target"}
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
              <div className="font-medium text-blue-800 dark:text-blue-200">
                Efficiency
              </div>
              <div className="text-blue-600 dark:text-blue-400">
                {avgEfficiency >= 85 ? "High efficiency" : "Needs improvement"}
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg">
              <div className="font-medium text-purple-800 dark:text-purple-200">
                Forecast
              </div>
              <div className="text-purple-600 dark:text-purple-400">
                {parseFloat(projectionAccuracy) >= 90
                  ? "Accurate projections"
                  : "Review forecasting"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
