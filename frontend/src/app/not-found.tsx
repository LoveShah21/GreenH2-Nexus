"use client";

import React from "react";
import { MapPin, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-6">
      <Card className="max-w-md text-center">
        <MapPin className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
          Page Not Found
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button className="w-full">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </Link>
      </Card>
    </div>
  );
}
