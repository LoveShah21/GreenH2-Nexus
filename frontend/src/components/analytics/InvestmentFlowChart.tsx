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
  DollarSign,
  PiggyBank,
  TrendingUp as Growth,
  Target,
} from "lucide-react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Sankey,
} from "recharts";

// Investment flow data for different periods
const investmentData = {
  "7d": [
    {
      period: "Mon",
      public: 12.5,
      private: 18.3,
      grants: 4.2,
      total: 35.0,
      deals: 8,
    },
    {
      period: "Tue",
      public: 15.2,
      private: 22.1,
      grants: 5.8,
      total: 43.1,
      deals: 12,
    },
    {
      period: "Wed",
      public: 11.8,
      private: 16.9,
      grants: 3.9,
      total: 32.6,
      deals: 6,
    },
    {
      period: "Thu",
      public: 18.7,
      private: 28.4,
      grants: 7.1,
      total: 54.2,
      deals: 15,
    },
    {
      period: "Fri",
      public: 16.3,
      private: 24.8,
      grants: 6.2,
      total: 47.3,
      deals: 11,
    },
    {
      period: "Sat",
      public: 13.9,
      private: 19.7,
      grants: 4.8,
      total: 38.4,
      deals: 9,
    },
    {
      period: "Sun",
      public: 14.6,
      private: 21.5,
      grants: 5.4,
      total: 41.5,
      deals: 10,
    },
  ],
  "30d": [
    {
      period: "Week 1",
      public: 52.0,
      private: 78.5,
      grants: 18.2,
      total: 148.7,
      deals: 35,
    },
    {
      period: "Week 2",
      public: 64.0,
      private: 96.2,
      grants: 22.8,
      total: 183.0,
      deals: 42,
    },
    {
      period: "Week 3",
      public: 58.0,
      private: 87.3,
      grants: 20.1,
      total: 165.4,
      deals: 38,
    },
    {
      period: "Week 4",
      public: 72.0,
      private: 108.6,
      grants: 25.4,
      total: 206.0,
      deals: 48,
    },
  ],
  "90d": [
    {
      period: "Jan",
      public: 220.0,
      private: 330.5,
      grants: 78.2,
      total: 628.7,
      deals: 145,
    },
    {
      period: "Feb",
      public: 248.0,
      private: 372.8,
      grants: 88.1,
      total: 708.9,
      deals: 162,
    },
    {
      period: "Mar",
      public: 214.0,
      private: 321.3,
      grants: 76.8,
      total: 612.1,
      deals: 138,
    },
    {
      period: "Apr",
      public: 262.0,
      private: 393.6,
      grants: 92.4,
      total: 748.0,
      deals: 175,
    },
    {
      period: "May",
      public: 256.0,
      private: 384.2,
      grants: 89.6,
      total: 729.8,
      deals: 168,
    },
    {
      period: "Jun",
      public: 274.0,
      private: 411.8,
      grants: 96.2,
      total: 782.0,
      deals: 182,
    },
  ],
  "12m": [
    {
      period: "Q1 23",
      public: 850.0,
      private: 1275.5,
      grants: 298.2,
      total: 2423.7,
      deals: 580,
    },
    {
      period: "Q2 23",
      public: 920.0,
      private: 1380.8,
      grants: 322.1,
      total: 2622.9,
      deals: 625,
    },
    {
      period: "Q3 23",
      public: 880.0,
      private: 1320.3,
      grants: 308.8,
      total: 2509.1,
      deals: 595,
    },
    {
      period: "Q4 23",
      public: 980.0,
      private: 1470.6,
      grants: 343.4,
      total: 2794.0,
      deals: 665,
    },
    {
      period: "Q1 24",
      public: 940.0,
      private: 1410.2,
      grants: 329.6,
      total: 2679.8,
      deals: 638,
    },
    {
      period: "Q2 24",
      public: 1020.0,
      private: 1530.8,
      grants: 357.2,
      total: 2908.0,
      deals: 692,
    },
    {
      period: "Q3 24",
      public: 960.0,
      private: 1440.3,
      grants: 336.8,
      total: 2737.1,
      deals: 651,
    },
    {
      period: "Q4 24",
      public: 1080.0,
      private: 1620.6,
      grants: 378.4,
      total: 3079.0,
      deals: 732,
    },
  ],
};

// Investment sources breakdown
const investmentSources = [
  {
    source: "Private Equity",
    amount: 45.2,
    percentage: 38.5,
    color: "#10b981",
  },
  {
    source: "Government Funding",
    amount: 32.8,
    percentage: 28.0,
    color: "#3b82f6",
  },
  {
    source: "Corporate Investment",
    amount: 24.6,
    percentage: 21.0,
    color: "#f59e0b",
  },
  { source: "Green Bonds", amount: 8.9, percentage: 7.6, color: "#ef4444" },
  {
    source: "Grants & Subsidies",
    amount: 5.8,
    percentage: 4.9,
    color: "#8b5cf6",
  },
];

// Chart configuration
const chartConfig = {
  public: {
    label: "Public Investment",
    color: "#3b82f6",
  },
  private: {
    label: "Private Investment",
    color: "#10b981",
  },
  grants: {
    label: "Grants & Subsidies",
    color: "#f59e0b",
  },
  total: {
    label: "Total Investment",
    color: "#8b5cf6",
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
            <span className="text-muted-foreground">Public:</span>
            <span className="font-semibold text-popover-foreground">
              ${data?.public?.toFixed(1)}M
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Private:</span>
            <span className="font-semibold text-popover-foreground">
              ${data?.private?.toFixed(1)}M
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Grants:</span>
            <span className="font-semibold text-popover-foreground">
              ${data?.grants?.toFixed(1)}M
            </span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold text-emerald-600">
                ${data?.total?.toFixed(1)}M
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Deals:</span>
              <span className="font-semibold text-popover-foreground">
                {data?.deals}
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

export default function InvestmentFlowChart() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>("90d");

  // Get data for selected period
  const currentData = investmentData[selectedPeriod];

  // Calculate analytics
  const totalPublic = currentData.reduce((sum, item) => sum + item.public, 0);
  const totalPrivate = currentData.reduce((sum, item) => sum + item.private, 0);
  const totalGrants = currentData.reduce((sum, item) => sum + item.grants, 0);
  const totalInvestment = currentData.reduce(
    (sum, item) => sum + item.total,
    0
  );
  const totalDeals = currentData.reduce((sum, item) => sum + item.deals, 0);

  // Calculate growth rates (simulated)
  const getGrowthRate = (type: string) => {
    const rates = {
      "7d": { public: 8.5, private: 12.3, grants: 5.2, total: 10.8 },
      "30d": { public: 15.2, private: 18.7, grants: 8.9, total: 16.5 },
      "90d": { public: 22.1, private: 25.8, grants: 12.4, total: 23.2 },
      "12m": { public: 28.5, private: 32.1, grants: 18.7, total: 29.8 },
    };
    return rates[selectedPeriod][
      type as keyof (typeof rates)[typeof selectedPeriod]
    ];
  };

  const stats = [
    {
      label: "Total Investment",
      value: `$${totalInvestment.toFixed(1)}M`,
      change: getGrowthRate("total"),
      icon: <DollarSign className="size-4" />,
      color: chartConfig.total.color,
    },
    {
      label: "Private Investment",
      value: `$${totalPrivate.toFixed(1)}M`,
      change: getGrowthRate("private"),
      icon: <PiggyBank className="size-4" />,
      color: chartConfig.private.color,
    },
    {
      label: "Public Investment",
      value: `$${totalPublic.toFixed(1)}M`,
      change: getGrowthRate("public"),
      icon: <Target className="size-4" />,
      color: chartConfig.public.color,
    },
    {
      label: "Total Deals",
      value: totalDeals.toString(),
      change: 18.5,
      icon: <Growth className="size-4" />,
      color: chartConfig.grants.color,
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="border-0 min-h-auto pt-6 pb-4 mb-2">
        <CardTitle className="text-lg font-semibold">
          Investment Flow Analysis
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

        {/* Investment Flow Chart */}
        <div className="px-5 mb-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Investment Flow Over Time
          </h3>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
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
                <linearGradient id="publicGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={chartConfig.public.color}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor={chartConfig.public.color}
                    stopOpacity={0.05}
                  />
                </linearGradient>
                <linearGradient
                  id="privateGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={chartConfig.private.color}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor={chartConfig.private.color}
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

              <XAxis
                dataKey="period"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
                tickMargin={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => `$${value}M`}
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

              {/* Area for Private Investment */}
              <Area
                type="monotone"
                dataKey="private"
                stackId="1"
                stroke={chartConfig.private.color}
                strokeWidth={2}
                fill="url(#privateGradient)"
                fillOpacity={1}
              />

              {/* Area for Public Investment */}
              <Area
                type="monotone"
                dataKey="public"
                stackId="1"
                stroke={chartConfig.public.color}
                strokeWidth={2}
                fill="url(#publicGradient)"
                fillOpacity={1}
              />

              {/* Line for Total Investment */}
              <Line
                type="monotone"
                dataKey="total"
                stroke={chartConfig.total.color}
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: chartConfig.total.color,
                  strokeWidth: 0,
                }}
              />
            </ComposedChart>
          </ChartContainer>
        </div>

        {/* Investment Sources Breakdown */}
        <div className="px-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Investment Sources Breakdown
          </h3>
          <div className="space-y-3">
            {investmentSources.map((source, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: source.color }}
                  />
                  <span className="font-medium text-sm">{source.source}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">${source.amount}B</div>
                  <div className="text-xs text-muted-foreground">
                    {source.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Investment Insights */}
        <div className="mt-6 px-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg">
              <div className="font-medium text-emerald-800 dark:text-emerald-200">
                Private Dominance
              </div>
              <div className="text-emerald-600 dark:text-emerald-400">
                Private investment accounts for{" "}
                {((totalPrivate / totalInvestment) * 100).toFixed(0)}% of total
                funding
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
              <div className="font-medium text-blue-800 dark:text-blue-200">
                Growth Momentum
              </div>
              <div className="text-blue-600 dark:text-blue-400">
                Investment growing at {getGrowthRate("total").toFixed(1)}% rate
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg">
              <div className="font-medium text-purple-800 dark:text-purple-200">
                Deal Activity
              </div>
              <div className="text-purple-600 dark:text-purple-400">
                Average ${(totalInvestment / totalDeals).toFixed(1)}M per deal
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
