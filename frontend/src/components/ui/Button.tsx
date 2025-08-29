"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500 shadow-sm",
      secondary:
        "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 shadow-sm",
      outline:
        "border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 focus:ring-emerald-500",
      ghost:
        "text-text-primary-light dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500",
      danger:
        "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-sm",
    };

    const sizes = {
      sm: "px-3 py-2 text-sm h-8",
      md: "px-4 py-3 text-base h-10",
      lg: "px-6 py-4 text-lg h-12",
    };

    return (
      <motion.button
        ref={ref}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            Loading...
          </div>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button };
