"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MapPin, Zap, Wind, Sun, Droplets, DollarSign } from "lucide-react";

const suitabilityFactors = [
  {
    name: "Renewable Energy Potential",
    icon: Zap,
    score: 85,
    color: "text-primary-500",
    bgColor: "bg-primary-50 dark:bg-primary-900/20",
  },
  {
    name: "Wind Resources",
    icon: Wind,
    score: 92,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    name: "Solar Irradiance",
    icon: Sun,
    score: 78,
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
  },
  {
    name: "Water Availability",
    icon: Droplets,
    score: 67,
    color: "text-cyan-500",
    bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
  },
  {
    name: "Economic Viability",
    icon: DollarSign,
    score: 74,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
  },
];

export default function SiteSuitabilityPage() {
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
            Site Suitability Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            AI-powered analysis for optimal hydrogen infrastructure placement
          </p>
        </div>
        <Button>
          <MapPin className="w-4 h-4 mr-2" />
          Analyze New Site
        </Button>
      </motion.div>

      {/* Overall Suitability Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Overall Suitability Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg
                  className="w-32 h-32 transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    className="text-gray-200 dark:text-gray-700"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-primary-500"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="79.2, 100"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    79%
                  </span>
                </div>
              </div>
            </div>
            <p className="text-center text-gray-600 dark:text-gray-300 mt-4">
              High suitability for hydrogen production facility
            </p>
          </CardContent>
        </Card>
      </motion.div>
      {/* Suitability Factors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {suitabilityFactors.map((factor, index) => (
          <motion.div
            key={factor.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-10 h-10 ${factor.bgColor} rounded-lg flex items-center justify-center`}
                  >
                    <factor.icon className={`w-5 h-5 ${factor.color}`} />
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {factor.score}%
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {factor.name}
                </h3>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${factor.color.replace(
                      "text-",
                      "bg-"
                    )}`}
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Detailed Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Detailed Site Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Strengths
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-center text-green-600 dark:text-green-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Excellent wind resources (Class 6-7)
                  </li>
                  <li className="flex items-center text-green-600 dark:text-green-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    High renewable energy potential
                  </li>
                  <li className="flex items-center text-green-600 dark:text-green-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Proximity to transmission infrastructure
                  </li>
                  <li className="flex items-center text-green-600 dark:text-green-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Favorable regulatory environment
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Considerations
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-center text-amber-600 dark:text-amber-400">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                    Limited water availability in summer months
                  </li>
                  <li className="flex items-center text-amber-600 dark:text-amber-400">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                    Distance from major demand centers
                  </li>
                  <li className="flex items-center text-amber-600 dark:text-amber-400">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                    Seasonal variation in renewable output
                  </li>
                  <li className="flex items-center text-amber-600 dark:text-amber-400">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                    Initial infrastructure development costs
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
