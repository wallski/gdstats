import { useEffect, useState } from "react";
import { motion, animate } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color?: string;
  delay?: number;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color = "#A855F7",
  delay = 0,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const controls = animate(0, value, {
        duration: 1.8,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (v) => setDisplayValue(Math.round(v)),
      });
      return () => controls.stop();
    }, delay * 1000 + 300);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  const formatNumber = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return n.toLocaleString();
  };

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
      className="relative rounded-lg overflow-hidden
        bg-gd-panel/40 backdrop-blur-sm
        border-t-2 border-purple-500/20
        hover:border-t-purple-500/50
        transition-colors duration-200
        p-5
      "
      style={{ borderTopColor: `${color}30` }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderTopColor = `${color}80`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderTopColor = `${color}30`;
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }}
      />

      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-purple-300/40">
          {label}
        </span>
        <div
          className="w-7 h-7 rounded flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${color}15, ${color}08)`,
            border: `1px solid ${color}20`,
          }}
        >
          <Icon size={14} style={{ color }} />
        </div>
      </div>

      <div
        className="stat-value text-3xl sm:text-4xl font-bold text-white"
        style={{ textShadow: `0 0 25px ${color}30` }}
      >
        {formatNumber(displayValue)}
      </div>
    </motion.div>
  );
}
