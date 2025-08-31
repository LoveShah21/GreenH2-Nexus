"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User } from "lucide-react";

export function HeaderContent() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  return (
    <>
      <div className="flex items-center space-x-4">
        <Link
          href="/"
          className="text-xl font-semibold text-emerald-600 dark:text-emerald-400"
        >
          GreenH2-Nexus
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <ThemeToggle />

        {!isLoading && (
          <>
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
