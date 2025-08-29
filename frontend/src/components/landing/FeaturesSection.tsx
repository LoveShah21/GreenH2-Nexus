"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Map, BarChart3, Zap, Globe, Users, Lightbulb } from "lucide-react";

const features = [
  {
    icon: Map,
    title: "Interactive Mapping",
    description:
      "Visualize hydrogen infrastructure projects on an interactive map with real-time data and geospatial analysis.",
    color: "text-primary-500",
    bgColor: "bg-primary-50 dark:bg-primary-900/20",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Get insights from complex data analysis, capacity trends, and investment flow tracking.",
    color: "text-secondary-500",
    bgColor: "bg-secondary-50 dark:bg-secondary-900/20",
  },
  {
    icon: Zap,
    title: "Site Optimization",
    description:
      "AI-powered site suitability analysis for optimal hydrogen production and storage facility placement.",
    color: "text-accent-500",
    bgColor: "bg-accent-50 dark:bg-accent-900/20",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description:
      "Access worldwide hydrogen project data with regional analysis and international collaboration tools.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    icon: Users,
    title: "Collaboration Hub",
    description:
      "Connect with stakeholders, share project insights, and collaborate on infrastructure development.",
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    icon: Lightbulb,
    title: "Smart Recommendations",
    description:
      "Get intelligent suggestions for project optimization, cost reduction, and strategic planning.",
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Powerful Features for Infrastructure Development
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Everything you need to plan, analyze, and optimize green hydrogen
            infrastructure projects with confidence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Advanced Geospatial Analysis
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Multi-layer Mapping
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Overlay multiple data layers including renewable sources,
                    demand centers, and existing infrastructure.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Route Optimization
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Find optimal pipeline routes considering terrain,
                    regulations, and cost factors.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Proximity Analysis
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Analyze relationships between renewable sources, production
                    facilities, and demand centers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 p-1 shadow-2xl">
              <div className="h-full w-full rounded-xl bg-white dark:bg-gray-900 p-8 flex items-center justify-center">
                <div className="text-center">
                  <Map className="w-16 h-16 text-primary-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Interactive Dashboard
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Comprehensive view of your hydrogen infrastructure ecosystem
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
