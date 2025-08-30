"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DollarSign, TrendingDown, Calculator, PieChart } from "lucide-react";

const costBreakdown = [
  {
    category: "Capital Expenditure",
    amount: 45.2,
    percentage: 52,
    color: "bg-primary-500",
  },
  {
    category: "Operational Costs",
    amount: 18.7,
    percentage: 22,
    color: "bg-secondary-500",
  },
  {
    category: "Energy Costs",
    amount: 15.3,
    percentage: 18,
    color: "bg-accent-500",
  },
  {
    category: "Maintenance",
    amount: 6.8,
    percentage: 8,
    color: "bg-emerald-500",
  },
];

const optimizationOpportunities = [
  {
    title: "Renewable Energy Integration",
    savings: "$12.5M",
    percentage: 15,
    description: "Direct renewable energy sourcing reduces grid dependency",
  },
  {
    title: "Economies of Scale",
    savings: "$8.2M",
    percentage: 10,
    description: "Larger facility size reduces per-unit production costs",
  },
  {
    title: "Technology Optimization",
    savings: "$6.7M",
    percentage: 8,
    description: "Advanced electrolyzer technology improves efficiency",
  },
  {
    title: "Location Optimization",
    savings: "$4.1M",
    percentage: 5,
    description: "Strategic placement reduces transportation costs",
  },
];

export default function CostOptimizationPage() {
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
            Cost Optimization Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Identify opportunities to reduce hydrogen production costs
          </p>
        </div>
        <Button>
          <Calculator className="w-4 h-4 mr-2" />
          Run New Analysis
        </Button>
      </motion.div>
      {/* Cost Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current LCOH
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$4.85/kg</div>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Levelized Cost of Hydrogen
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Optimized LCOH
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">$3.47/kg</div>
              <p className="text-xs text-green-600">
                28.5% reduction potential
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Savings
              </CardTitle>
              <PieChart className="h-4 w-4 text-secondary-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$31.5M</div>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Over 20-year lifecycle
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>{" "}
      {/* Cost Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {costBreakdown.map((item, index) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 ${item.color} rounded`}></div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600 dark:text-gray-300">
                      ${item.amount}M ({item.percentage}%)
                    </span>
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 ${item.color} rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      {/* Optimization Opportunities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Optimization Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {optimizationOpportunities.map((opportunity, index) => (
                <motion.div
                  key={opportunity.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {opportunity.title}
                    </h4>
                    <span className="text-green-600 dark:text-green-400 font-bold">
                      {opportunity.savings}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {opportunity.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600 dark:text-green-400">
                      {opportunity.percentage}% cost reduction
                    </span>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      {/* Implementation Roadmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Implementation Roadmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 dark:text-white">
                    Phase 1: Renewable Integration (0-6 months)
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Establish direct renewable energy contracts and grid
                    connections
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-secondary-50 dark:bg-secondary-900/20 rounded-lg">
                <div className="w-8 h-8 bg-secondary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 dark:text-white">
                    Phase 2: Technology Upgrade (6-18 months)
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Implement advanced electrolyzer technology and automation
                    systems
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-accent-50 dark:bg-accent-900/20 rounded-lg">
                <div className="w-8 h-8 bg-accent-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 dark:text-white">
                    Phase 3: Scale Optimization (18-36 months)
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Expand facility capacity and optimize operational efficiency
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
