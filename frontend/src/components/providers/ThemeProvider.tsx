"use client";

import React, { useEffect } from "react";
import { useThemeStore } from "@/lib/stores/themeStore";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Apply theme on client side after hydration
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return <>{children}</>;
};
