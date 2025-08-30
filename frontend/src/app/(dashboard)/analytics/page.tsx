"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  BarChart3,
  TrendingUp,
  Zap,
  DollarSign,
  MapPin,
  Filter,
} from "lucide-react";
import CapacityTrendsChart from "@/components/analytics/CapacityTrendsChart";
import RegionalDistributionChart from "@/components/analytics/RegionalDistributionChart";
import InvestmentFlowChart from "@/components/analytics/InvestmentFlowChart";

export default function AnalyticsPage() {
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
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Advanced insights and optimization for hydrogen infrastructure
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button>
            <BarChart3 className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Capacity
            </CardTitle>
            <Zap className="h-4 w-4 text-primary-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.2 GW</div>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              +18% from last quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Investment Flow
            </CardTitle>
            <DollarSign className="h-4 w-4 text-secondary-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$124.5B</div>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              +25% from last quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Projects
            </CardTitle>
            <MapPin className="h-4 w-4 text-accent-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              +12% from last quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Efficiency Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.3%</div>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              +5.2% from last quarter
            </p>
          </CardContent>
        </Card>
      </motion.div>
      {/* Advanced Capacity Trends Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <CapacityTrendsChart />
      </motion.div>

      {/* Additional Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <RegionalDistributionChart />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <InvestmentFlowChart />
        </motion.div>
      </div>

      {/* Site Suitability Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Site Suitability Analysis</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              AI-powered analysis for optimal hydrogen infrastructure placement
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Renewable Potential
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Solar and wind resource assessment for production sites
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-8 h-8 text-secondary-500" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Location Optimization
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Strategic placement considering demand and logistics
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-100 dark:bg-accent-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-8 h-8 text-accent-500" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Cost Optimization
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Economic analysis and investment optimization
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
