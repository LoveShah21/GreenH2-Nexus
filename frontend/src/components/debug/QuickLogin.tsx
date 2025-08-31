"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api/auth";

export function QuickLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { login } = useAuth();

  const handleQuickLogin = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      // Try to login with test credentials
      await login("test@example.com", "password123");
      setMessage("Login successful!");
    } catch (error: any) {
      console.error("Login failed:", error);
      setMessage(`Login failed: ${error.message}`);

      // If login fails, try to register first
      try {
        setMessage("Trying to register test user...");
        await authApi.register({
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          password: "password123",
          organization: "Test Organization",
          role: "admin",
        });
        setMessage("Registration successful! Now logging in...");

        // Now try to login again
        await login("test@example.com", "password123");
        setMessage("Login successful!");
      } catch (regError: any) {
        console.error("Registration failed:", regError);
        setMessage(`Registration failed: ${regError.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-20 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border z-50 max-w-sm">
      <h3 className="font-bold mb-2">Quick Login</h3>
      <button
        onClick={handleQuickLogin}
        disabled={isLoading}
        className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? "Loading..." : "Login as Test User"}
      </button>
      {message && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {message}
        </div>
      )}
    </div>
  );
}
