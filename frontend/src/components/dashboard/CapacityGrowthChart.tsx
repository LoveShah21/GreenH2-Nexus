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
} from "lucide-react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";

// Hydrogen capacity data for different periods
const capacityData = {
  "7d": [
    {
      period: "Mon",
      electrolyzers: 85,
      storage: 62,
      transport: 45,
      distribution: 28,
    },
    {
      period: "Tue",
      electrolyzers: 92,
      storage: 78,
      transport: 52,
      distribution: 34,
    },
    {
      period: "Wed",
      electrolyzers: 78,
      storage: 54,
      transport: 48,
      distribution: 31,
    },
    {
      period: "Thu",
      electrolyzers: 124,
      storage: 89,
      transport: 65,
      distribution: 42,
    },
    {
      period: "Fri",
      electrolyzers: 110,
      storage: 72,
      transport: 58,
      distribution: 38,
    },
    {
      period: "Sat",
      electrolyzers: 95,
      storage: 68,
      transport: 55,
      distribution: 35,
    },
    {
      period: "Sun",
      electrolyzers: 108,
      storage: 75,
      transport: 62,
      distribution: 40,
    },
  ],
  "30d": [
    {
      period: "Week 1",
      electrolyzers: 520,
      storage: 480,
      transport: 320,
      distribution: 180,
    },
    {
      period: "Week 2",
      electrolyzers: 640,
      storage: 520,
      transport: 380,
      distribution: 220,
    },
    {
      period: "Week 3",
      electrolyzers: 580,
      storage: 460,
      transport: 350,
      distribution: 200,
    },
    {
      period: "Week 4",
      electrolyzers: 720,
      storage: 580,
      transport: 420,
      distribution: 260,
    },
  ],
  "90d": [
    {
      period: "Jan",
      electrolyzers: 2200,
      storage: 1850,
      transport: 1200,
      distribution: 680,
    },
    {
      period: "Feb",
      electrolyzers: 2480,
      storage: 2020,
      transport: 1350,
      distribution: 780,
    },
    {
      period: "Mar",
      electrolyzers: 2140,
      storage: 1780,
      transport: 1180,
      distribution: 720,
    },
    {
      period: "Apr",
      electrolyzers: 2620,
      storage: 2160,
      transport: 1480,
      distribution: 860,
    },
    {
      period: "May",
      electrolyzers: 2560,
      storage: 2080,
      transport: 1420,
      distribution: 820,
    },
    {
      period: "Jun",
      electrolyzers: 2740,
      storage: 2240,
      transport: 1580,
      distribution: 920,
    },
  ],
  "12m": [
    {
      period: "Q1 23",
      electrolyzers: 8500,
      storage: 7200,
      transport: 4800,
      distribution: 2800,
    },
    {
      period: "Q2 23",
      electrolyzers: 9200,
      storage: 7800,
      transport: 5200,
      distribution: 3100,
    },
    {
      period: "Q3 23",
      electrolyzers: 8800,
      storage: 7400,
      transport: 4900,
      distribution: 2900,
    },
    {
      period: "Q4 23",
      electrolyzers: 9800,
      storage: 8200,
      transport: 5600,
      distribution: 3400,
    },
    {
      period: "Q1 24",
      electrolyzers: 9400,
      storage: 7900,
      transport: 5300,
      distribution: 3200,
    },
    {
      period: "Q2 24",
      electrolyzers: 10200,
      storage: 8600,
      transport: 5800,
      distribution: 3600,
    },
    {
      period: "Q3 24",
      electrolyzers: 9600,
      storage: 8100,
      transport: 5500,
      distribution: 3300,
    },
    {
      period: "Q4 24",
      electrolyzers: 10800,
      storage: 9000,
      transport: 6200,
      distribution: 3800,
    },
  ],
};

// Chart configuration with hydrogen theme colors
const chartConfig = {
  electrolyzers: {
    label: "Electrolyzers",
    color: "#10b981", // Emerald for production
  },
  storage: {
    label: "Storage",
    color: "#3b82f6", // Blue for storage
  },
  transport: {
    label: "Transport",
    color: "#f59e0b", // Amber for transport
  },
  distribution: {
    label: "Distribution",
    color: "#ef4444", // Red for distribution
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
    return (
      <div className="rounded-lg border bg-popover p-3 shadow-sm shadow-black/5 min-w-[150px]">
        <div className="text-xs font-medium text-muted-foreground tracking-wide mb-2.5">
          {label}
        </div>
        <div className="space-y-2">
          {payload.map((entry, index) => {
            const config =
              chartConfig[entry.dataKey as keyof typeof chartConfig];
            return (
              <div key={index} className="flex items-center gap-2 text-xs">
                <ChartLabel label={config?.label + ":"} color={entry.color} />
                <span className="font-semibold text-popover-foreground">
                  {entry.value.toLocaleString()} MW
                </span>
              </div>
            );
          })}
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

const getIcon = (type: string) => {
  switch (type) {
    case "electrolyzers":
      return <Zap className="size-3" />;
    case "storage":
      return <Warehouse className="size-3" />;
    case "transport":
      return <Truck className="size-3" />;
    case "distribution":
      return <Building2 className="size-3" />;
    default:
      return null;
  }
};

export default function CapacityGrowthChart() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>("30d");

  // Get data for selected period
  const currentData = capacityData[selectedPeriod];

  // Calculate totals and percentages
  const totalElectrolyzers = currentData.reduce(
    (sum, item) => sum + item.electrolyzers,
    0
  );
  const totalStorage = currentData.reduce((sum, item) => sum + item.storage, 0);
  const totalTransport = currentData.reduce(
    (sum, item) => sum + item.transport,
    0
  );
  const totalDistribution = currentData.reduce(
    (sum, item) => sum + item.distribution,
    0
  );

  // Calculate percentage changes (simulated based on period)
  const getChange = (type: string) => {
    const changes = {
      "7d": { electrolyzers: 12, storage: -3, transport: 8, distribution: 15 },
      "30d": { electrolyzers: 18, storage: 5, transport: 12, distribution: 22 },
      "90d": { electrolyzers: -5, storage: -8, transport: 3, distribution: 8 },
      "12m": {
        electrolyzers: 25,
        storage: 18,
        transport: 20,
        distribution: 28,
      },
    };
    return changes[selectedPeriod][
      type as keyof (typeof changes)[typeof selectedPeriod]
    ];
  };

  const stats = [
    {
      type: "electrolyzers",
      label: "Electrolyzers",
      total: totalElectrolyzers,
      change: getChange("electrolyzers"),
      color: chartConfig.electrolyzers.color,
    },
    {
      type: "storage",
      label: "Storage",
      total: totalStorage,
      change: getChange("storage"),
      color: chartConfig.storage.color,
    },
    {
      type: "transport",
      label: "Transport",
      total: totalTransport,
      change: getChange("transport"),
      color: chartConfig.transport.color,
    },
    {
      type: "distribution",
      label: "Distribution",
      total: totalDistribution,
      change: getChange("distribution"),
      color: chartConfig.distribution.color,
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="border-0 min-h-auto pt-6 pb-4 mb-2">
        <CardTitle className="text-lg font-semibold">
          Hydrogen Infrastructure Capacity Growth
        </CardTitle>
        <CardToolbar>
          {/* Period Selector */}
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
        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-5 mb-8">
          {stats.map((stat) => (
            <div key={stat.type} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <ChartLabel label={stat.label} color={stat.color} />
                {getIcon(stat.type)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">
                  {stat.total.toLocaleString()} MW
                </span>
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
                  {Math.abs(stat.change)}%
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <ChartContainer
          config={chartConfig}
          className="h-[300px] w-full [&_.recharts-curve.recharts-tooltip-cursor]:stroke-initial"
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
              <linearGradient
                id="electrolyzerGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={chartConfig.electrolyzers.color}
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor={chartConfig.electrolyzers.color}
                  stopOpacity={0.05}
                />
              </linearGradient>
              <linearGradient id="storageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={chartConfig.storage.color}
                  stopOpacity={0.2}
                />
                <stop
                  offset="100%"
                  stopColor={chartConfig.storage.color}
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
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k MW`}
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

            {/* Area for Electrolyzers */}
            <Area
              type="monotone"
              dataKey="electrolyzers"
              stroke={chartConfig.electrolyzers.color}
              strokeWidth={2}
              fill="url(#electrolyzerGradient)"
              fillOpacity={1}
            />

            {/* Lines for other infrastructure */}
            <Line
              type="monotone"
              dataKey="storage"
              stroke={chartConfig.storage.color}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: chartConfig.storage.color,
                strokeWidth: 0,
              }}
            />

            <Line
              type="monotone"
              dataKey="transport"
              stroke={chartConfig.transport.color}
              strokeWidth={2}
              strokeDasharray="8 4"
              dot={false}
              activeDot={{
                r: 4,
                fill: chartConfig.transport.color,
                strokeWidth: 0,
              }}
            />

            <Line
              type="monotone"
              dataKey="distribution"
              stroke={chartConfig.distribution.color}
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{
                r: 4,
                fill: chartConfig.distribution.color,
                strokeWidth: 0,
              }}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
