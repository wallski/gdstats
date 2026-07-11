import { motion } from "framer-motion";
import { Star, Download, ThumbsUp } from "lucide-react";
import { Level } from "../types";

interface LevelCardProps {
  level: Level;
  index: number;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "#00ff00",
  Normal: "#ffff00",
  Hard: "#ff7700",
  Harder: "#ff0000",
  Insane: "#ff00ff",
  Demon: "#8800ff",
  "Easy Demon": "#ff55ff",
  "Medium Demon": "#ff55aa",
  "Hard Demon": "#ff5555",
  "Insane Demon": "#ff0000",
  "Extreme Demon": "#000000",
};

export function LevelCard({ level, index }: LevelCardProps) {
  const diffColor = DIFFICULTY_COLORS[level.difficulty] ?? "#A855F7";

  const formatNumber = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return n.toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        type: "spring",
        stiffness: 120,
        damping: 15,
      }}
      whileHover={{
        y: -4,
        scale: 1.02,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      className="flex-shrink-0 w-[260px] rounded-lg overflow-hidden
        bg-gd-panel/50 backdrop-blur-sm
        border border-purple-500/10
        hover:border-purple-500/30
        hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]
        transition-shadow duration-300
        cursor-pointer
      "
    >
      <div
        className="h-28 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${diffColor}12, ${diffColor}04)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        <div className="absolute top-2.5 left-2.5">
          <span
            className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider"
            style={{
              background: `${diffColor}18`,
              color: diffColor,
              border: `1px solid ${diffColor}30`,
            }}
          >
            {level.difficulty}
          </span>
        </div>
        <div className="absolute bottom-2.5 left-2.5 right-2.5">
          <h3 className="text-base font-bold text-white truncate drop-shadow-md">
            {level.name}
          </h3>
          <p className="text-xs text-purple-300/50 font-mono">by {level.author}</p>
        </div>
      </div>

      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star size={12} className="text-yellow-400" />
            <span className="text-xs font-mono font-bold text-white">{level.stars}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download size={12} className="text-cyan-400/70" />
            <span className="text-[10px] font-mono text-purple-200/50">
              {formatNumber(level.downloads)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ThumbsUp size={12} className="text-green-400/70" />
            <span className="text-[10px] font-mono text-purple-200/50">
              {formatNumber(level.likes)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}