"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Factory, Fuel, Truck, Zap, Plus, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

const infrastructureTypes = [
  {
    id: "production",
    name: "Production Plants",
    icon: Factory,
    count: 156,
    color: "bg-primary-500",
    bgColor: "bg-primary-50 dark:bg-primary-900/20",
  },
  {
    id: "storage",
    name: "Storage Facilities",
    icon: Fuel,
    count: 89,
    color: "bg-secondary-500",
    bgColor: "bg-secondary-50 dark:bg-secondary-900/20",
  },
  {
    id: "distribution",
    name: "Distribution Hubs",
    icon: Truck,
    count: 234,
    color: "bg-accent-500",
    bgColor: "bg-accent-50 dark:bg-accent-900/20",
  },
  {
    id: "renewable",
    name: "Renewable Sources",
    icon: Zap,
    count: 412,
    color: "bg-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
  },
];

const infrastructureItems = [
  {
    id: 1,
    name: "Hamburg Green Hydrogen Plant",
    type: "Production",
    capacity: "100 MW",
    status: "Operational",
    location: "Hamburg, Germany",
    commissioned: "2023-06-15",
  },
  {
    id: 2,
    name: "Rotterdam Storage Facility",
    type: "Storage",
    capacity: "50,000 kg",
    status: "Under Construction",
    location: "Rotterdam, Netherlands",
    commissioned: "2024-03-20",
  },
  {
    id: 3,
    name: "California Solar-H2 Complex",
    type: "Production",
    capacity: "250 MW",
    status: "Planning",
    location: "California, USA",
    commissioned: "2025-01-10",
  },
  {
    id: 4,
    name: "Nordic Distribution Hub",
    type: "Distribution",
    capacity: "200 trucks/day",
    status: "Operational",
    location: "Oslo, Norway",
    commissioned: "2022-11-30",
  },
];

export default function InfrastructurePage() {
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
            Infrastructure Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Monitor and manage hydrogen infrastructure assets
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Infrastructure
        </Button>
      </motion.div>
      {/* Infrastructure Type Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {infrastructureTypes.map((type, index) => (
          <motion.div
            key={type.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 ${type.bgColor} rounded-lg flex items-center justify-center`}
                  >
                    <type.icon
                      className={`w-6 h-6 text-${type.color.split("-")[1]}-500`}
                    />
                  </div>
                  <Badge variant="secondary">{type.count}</Badge>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mt-4">
                  {type.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {type.count} facilities
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Search infrastructure..." className="pl-10" />
          </div>
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </motion.div>

      {/* Infrastructure List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Infrastructure Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {infrastructureItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                      <Factory className="w-5 h-5 text-primary-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {item.location} • {item.capacity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge
                      variant={
                        item.status === "Operational"
                          ? "default"
                          : item.status === "Under Construction"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {item.status}
                    </Badge>
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
    </div>
  );
}
