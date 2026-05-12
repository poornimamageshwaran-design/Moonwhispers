"use client";

import { motion } from "framer-motion";

export function LoadingSpinner({ size = 34 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 rounded-full border border-neutral-800 border-t-accent"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, ease: "linear", repeat: Infinity }}
      />
    </div>
  );
}

