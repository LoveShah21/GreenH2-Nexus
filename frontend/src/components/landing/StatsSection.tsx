"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";

const stats = [
  {
    label: "Total Projects",
    value: "1,247",
    change: "+12%",
    changeType: "positive" as const,
  },
  {
    label: "Operational Capacity",
    value: "45.2 GW",
    change: "+18%",
    changeType: "positive" as const,
  },
  {
    label: "Planned Investment",
    value: "$124.5B",
    change: "+25%",
    changeType: "positive" as const,
  },
  {
    label: "CO₂ Reduction",
    value: "892 Mt",
    change: "+15%",
    changeType: "positive" as const,
  },
];

export function StatsSection() {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Global Hydrogen Infrastructure Impact
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Real-time data from hydrogen projects worldwide
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {stat.label}
                  </div>
                  <div className="flex items-center justify-center text-sm">
                    <span className="text-green-600 dark:text-green-400">
                      {stat.change}
                    </span>
                    <span className="ml-1 text-gray-500 dark:text-gray-400">
                      vs last quarter
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
