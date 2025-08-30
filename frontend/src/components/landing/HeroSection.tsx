"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Zap, Globe, BarChart3, Play } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-8 left-1/2 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center min-h-[80vh]">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8"
            >
              <span className="inline-flex items-center rounded-full bg-emerald-500/20 backdrop-blur-sm px-4 py-2 text-sm font-medium text-emerald-300 border border-emerald-500/30">
                <Zap className="mr-2 h-4 w-4" />
                Next-Generation Green Infrastructure
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6"
            >
              Map the Future of{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400 bg-clip-text text-transparent">
                Green Hydrogen
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8 max-w-2xl"
            >
              Advanced mapping and optimization platform for green hydrogen
              infrastructure development. Visualize projects, analyze sites, and
              optimize investment decisions with cutting-edge geospatial
              intelligence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 mb-12 justify-center lg:justify-start"
            >
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="group bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 text-lg"
                >
                  Start Exploring
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/mapping">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10 px-8 py-4 text-lg"
                >
                  <Play className="mr-2 h-5 w-5" />
                  View Interactive Map
                </Button>
              </Link>
            </motion.div>

            {/* Enhanced Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-700/50"
            >
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-2">
                  500+
                </div>
                <div className="text-sm text-gray-400">Projects Mapped</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">
                  50 GW
                </div>
                <div className="text-sm text-gray-400">Total Capacity</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-bold text-teal-400 mb-2">
                  25+
                </div>
                <div className="text-sm text-gray-400">Countries</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Enhanced Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: 30 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="relative flex items-center justify-center perspective-1000"
          >
            <div className="relative w-full max-w-md lg:max-w-lg">
              {/* Main Dashboard Container */}
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-semibold">
                      H2 Dashboard
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <motion.div
                    className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl p-4 border border-emerald-500/30"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <div className="text-emerald-300 text-sm">Production</div>
                    <div className="text-white font-bold text-lg">2.4 GW</div>
                  </motion.div>
                  <motion.div
                    className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  >
                    <div className="text-blue-300 text-sm">Efficiency</div>
                    <div className="text-white font-bold text-lg">94.7%</div>
                  </motion.div>
                </div>

                {/* Chart Area */}
                <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-xl p-4 mb-4 border border-white/10">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-white text-sm">Energy Output</div>
                    <div className="text-emerald-400 text-xs">↗ +12.5%</div>
                  </div>
                  <div className="h-16 flex items-end space-x-1">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-sm flex-1"
                        style={{ height: `${Math.random() * 100}%` }}
                        animate={{
                          height: [
                            `${Math.random() * 100}%`,
                            `${Math.random() * 100}%`,
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">System Status</span>
                    <span className="text-emerald-400 text-sm flex items-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                      Operational
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "87%" }}
                      transition={{ duration: 2, delay: 1 }}
                    />
                  </div>
                </div>
              </div>

              {/* Floating Icons */}
              <motion.div
                animate={{
                  y: [-10, 10, -10],
                  rotate: [0, 5, 0, -5, 0],
                }}
                transition={{ repeat: Infinity, duration: 6 }}
                className="absolute -top-6 -left-6 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20"
              >
                <Globe className="h-8 w-8 text-emerald-400" />
              </motion.div>

              <motion.div
                animate={{
                  y: [10, -10, 10],
                  rotate: [0, -5, 0, 5, 0],
                }}
                transition={{ repeat: Infinity, duration: 5, delay: 1 }}
                className="absolute -bottom-6 -right-6 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20"
              >
                <BarChart3 className="h-8 w-8 text-blue-400" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
