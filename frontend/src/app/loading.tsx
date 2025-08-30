"use client";

import React from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="text-center">
        <LoadingSpinner size="lg" className="text-emerald-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading Nexus...</p>
      </div>
    </div>
  );
}
