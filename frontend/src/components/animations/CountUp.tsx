"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface CountUpProps {
  from?: number;
  to: number;
  duration?: number;
  delay?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  from = 0,
  to,
  duration = 2,
  delay = 0,
  suffix = "",
  prefix = "",
  decimals = 0,
  className,
}) => {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => {
    return Math.round(latest * Math.pow(10, decimals)) / Math.pow(10, decimals);
  });
  const [displayValue, setDisplayValue] = useState(from);

  useEffect(() => {
    const controls = animate(count, to, {
      duration,
      delay,
      ease: "easeOut",
    });

    const unsubscribe = rounded.onChange((latest) => {
      setDisplayValue(latest);
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [count, to, duration, delay, rounded]);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </motion.span>
  );
};
