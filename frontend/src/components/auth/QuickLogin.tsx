"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function QuickLogin() {
  const { login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleQuickLogin = async () => {
    try {
      setIsLoading(true);
      setError("");
      await login("test@example.com", "testpassword123");
    } catch (error: any) {
      setError(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border z-50">
      <h3 className="font-bold mb-2">Quick Login</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Login with test account to access real data
      </p>
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      <Button
        onClick={handleQuickLogin}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Logging in..." : "Login as Test User"}
      </Button>
    </div>
  );
}
