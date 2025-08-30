"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease";
    period: string;
  };
  icon: LucideIcon;
  color: "green" | "blue" | "amber" | "purple";
  isLoading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color,
  isLoading = false,
}) => {
  const colorClasses = {
    green:
      "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400",
    blue: "bg-secondary-50 text-secondary-600 dark:bg-secondary-900/20 dark:text-secondary-400",
    amber:
      "bg-accent-50 text-accent-600 dark:bg-accent-900/20 dark:text-accent-400",
    purple:
      "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card hover className="overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">
            {title}
          </p>
          <motion.p
            className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {typeof value === "number" ? value.toLocaleString() : value}
          </motion.p>
          {change && (
            <motion.div
              className="flex items-center mt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span
                className={cn(
                  "text-xs font-medium",
                  change.type === "increase"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {change.type === "increase" ? "+" : "-"}
                {Math.abs(change.value)}%
              </span>
              <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark ml-1">
                vs {change.period}
              </span>
            </motion.div>
          )}
        </div>
        <motion.div
          className={cn("p-3 rounded-lg", colorClasses[color])}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Icon className="w-6 h-6" />
        </motion.div>
      </div>
    </Card>
  );
};
