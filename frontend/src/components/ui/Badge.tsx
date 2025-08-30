import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const baseClasses =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

  const variantClasses = {
    default:
      "border-transparent bg-primary-500 text-white hover:bg-primary-600",
    secondary:
      "border-transparent bg-secondary-100 text-secondary-800 hover:bg-secondary-200 dark:bg-secondary-800 dark:text-secondary-100",
    destructive: "border-transparent bg-red-500 text-white hover:bg-red-600",
    outline:
      "text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600",
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    />
  );
}

export { Badge };
