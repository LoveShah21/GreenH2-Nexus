"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-3 py-2 border rounded-lg transition-colors",
            "bg-surface-light dark:bg-surface-dark",
            "text-text-primary-light dark:text-text-primary-dark",
            "border-gray-300 dark:border-gray-600",
            "focus:ring-2 focus:ring-emerald-500 focus:border-transparent",
            "placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
