"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type ButtonBaseProps = {
  className?: string;
  children: ReactNode;
};

type ButtonProps =
  | (ButtonBaseProps & {
      href: string;
      onClick?: never;
    })
  | (ButtonBaseProps & {
      onClick?: () => void;
      href?: never;
      type?: "button" | "submit" | "reset";
    });

export function Button({
  className,
  children,
  href,
  onClick,
  type = "button"
}: ButtonProps & { type?: "button" | "submit" | "reset" }) {
  const base =
    "group inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 font-sans";

  const variant =
    "bg-accent/90 text-[#080c14] shadow-glow hover:bg-accent-soft hover:shadow-[0_0_0_1px_rgba(232,185,154,0.4),0_0_35px_rgba(232,185,154,0.2)] hover:-translate-y-px";

  const motionProps = {
    whileTap: { scale: 0.97 },
    transition: { type: "spring" as const, stiffness: 400, damping: 25 }
  };

  const cls = cn(base, variant, className);

  if (href) {
    return (
      <motion.span {...motionProps} style={{ display: "inline-block" }}>
        <Link className={cls} href={href}>
          {children}
        </Link>
      </motion.span>
    );
  }

  return (
    <motion.button {...motionProps} type={type} onClick={onClick} className={cls}>
      {children}
    </motion.button>
  );
}