"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background-light via-primary-50/30 to-secondary-50/30 dark:from-background-dark dark:via-primary-900/20 dark:to-secondary-900/20 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <Zap className="w-8 h-8" />
              </div>
              <span className="text-2xl font-bold">HydrogenMapper</span>
            </div>

            <h1 className="text-4xl font-bold mb-6">
              Powering the Future of
              <br />
              Green Energy Infrastructure
            </h1>

            <p className="text-xl text-white/80 mb-8">
              Join thousands of professionals using our platform to optimize
              hydrogen infrastructure development worldwide.
            </p>

            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-3" />
                <span>Advanced geospatial analytics</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-3" />
                <span>Real-time infrastructure monitoring</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-3" />
                <span>Collaborative project management</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-end p-6">
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
