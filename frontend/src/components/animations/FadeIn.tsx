"use client";

import React from "react";
import { motion } from "framer-motion";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 0.5,
  direction = "up",
  className,
}) => {
  const directionOffset = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
  };

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        ...directionOffset[direction],
      }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
};
