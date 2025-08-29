"use client";

import React, { useEffect } from "react";
import { useThemeStore } from "@/lib/stores/themeStore";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return <>{children}</>;
};
