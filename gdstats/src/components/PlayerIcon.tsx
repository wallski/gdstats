import { motion } from "framer-motion";

interface PlayerIconProps {
  icon?: number;
  color1?: number;
  color2?: number;
  glow?: boolean;
  size?: number;
  form?: string;
}

const API_BASE = "https://streams-junior-browser-dis.trycloudflare.com";

export function PlayerIcon({
  icon = 1,
  color1 = 0,
  color2 = 3,
  glow = true,
  size = 140,
  form = "cube",
}: PlayerIconProps) {
  const iconUrl = `${API_BASE}/api/icon/${form}/${icon}?col1=${color1}&col2=${color2}&glow=${glow ? 1 : 0}`;

  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width: size + 24, height: size + 24 }}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {glow && (
        <motion.div
          className="absolute rounded-full blur-2xl"
          style={{
            width: size * 1.4,
            height: size * 1.4,
            background: "radial-gradient(circle, rgba(168,85,247,0.25), transparent 70%)",
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <svg
        width={size + 24}
        height={size + 24}
        viewBox={`0 0 ${size + 24} ${size + 24}`}
        className="absolute z-10"
      >
        <defs>
          <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <filter id="hexGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <polygon
          points={getHexPoints(size + 24, size + 24, (size + 24) / 2)}
          fill="none"
          stroke="url(#hexGrad)"
          strokeWidth="1.5"
          filter="url(#hexGlow)"
          opacity="0.6"
        />
      </svg>

      <div
        className="relative z-20 rounded-xl flex items-center justify-center overflow-hidden"
        style={{
          width: size,
          height: size,
          background: "linear-gradient(135deg, rgba(168,85,247,0.1), rgba(236,72,153,0.1))",
          boxShadow: glow
            ? "0 0 30px rgba(168,85,247,0.2), 0 0 60px rgba(236,72,153,0.1)"
            : "none",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <img
          src={iconUrl}
          alt="Player Icon"
          className="w-full h-full object-contain"
          style={{ imageRendering: "pixelated" }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `<span style="font-family:'JetBrains Mono',monospace;font-size:14px;color:rgba(168,85,247,0.5)">${icon}</span>`;
            }
          }}
        />
      </div>
    </motion.div>
  );
}

function getHexPoints(w: number, h: number, r: number): string {
  const cx = w / 2;
  const cy = h / 2;
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return points.join(" ");
}