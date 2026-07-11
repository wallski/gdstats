import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function GlowCard({ children, className = "", delay = 0 }: GlowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        type: "spring",
        stiffness: 120,
        damping: 15,
      }}
      whileHover={{
        y: -3,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      className={`
        relative rounded-lg overflow-hidden
        bg-gd-panel/40 backdrop-blur-sm
        border border-purple-500/10
        hover:border-purple-500/25
        transition-colors duration-200
        ${className}
      `}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}