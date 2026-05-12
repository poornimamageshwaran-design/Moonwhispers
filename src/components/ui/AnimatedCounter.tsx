"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

interface Props {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

function formatNumber(v: number, decimals = 0) {
  return v.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function AnimatedCounter({ value, decimals = 0, prefix = "", suffix = "", className }: Props) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const duration = 1500;
    const start = performance.now();
    const from = 0;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (value - from) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}{formatNumber(display, decimals)}{suffix}
    </span>
  );
}

