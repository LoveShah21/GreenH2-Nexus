"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Zap, Globe, BarChart3 } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <div className="mb-6">
              <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                <Zap className="mr-1 h-3 w-3" />
                Next-Generation Infrastructure
              </span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="block"
              >
                Map the Future of
              </motion.span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="block bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent"
              >
                Green Hydrogen
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-6 text-lg text-gray-600 dark:text-gray-300"
            >
              Advanced mapping and optimization platform for green hydrogen
              infrastructure development. Visualize projects, analyze sites, and
              optimize investment decisions with cutting-edge geospatial
              intelligence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-8 flex flex-col gap-4 sm:flex-row"
            >
              <Link href="/dashboard">
                <Button size="lg" className="group">
                  Start Exploring
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/mapping">
                <Button variant="outline" size="lg">
                  View Interactive Map
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="mt-12 grid grid-cols-3 gap-8 border-t border-gray-200 pt-8 dark:border-gray-700"
            >
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  500+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Projects Mapped
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  50 GW
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Capacity
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  25+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Countries
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative flex items-center justify-center"
          >
            <div className="relative h-96 w-full rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 p-1 shadow-2xl">
              <div className="h-full w-full rounded-xl bg-white dark:bg-gray-900 p-8">
                {/* Mock Dashboard Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="flex space-x-2">
                      <div className="h-6 w-6 rounded-full bg-primary-500" />
                      <div className="h-6 w-6 rounded-full bg-secondary-500" />
                      <div className="h-6 w-6 rounded-full bg-accent-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-20 rounded-lg bg-primary-50 dark:bg-primary-900/20" />
                    <div className="h-20 rounded-lg bg-secondary-50 dark:bg-secondary-900/20" />
                  </div>
                  <div className="h-32 rounded-lg bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30" />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-4 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute -top-4 -left-4 rounded-lg bg-white p-3 shadow-lg dark:bg-gray-800"
            >
              <Globe className="h-6 w-6 text-primary-500" />
            </motion.div>

            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ repeat: Infinity, duration: 3, delay: 1 }}
              className="absolute -bottom-4 -right-4 rounded-lg bg-white p-3 shadow-lg dark:bg-gray-800"
            >
              <BarChart3 className="h-6 w-6 text-secondary-500" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
