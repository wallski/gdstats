import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SearchBar } from "../components/SearchBar";
import { PlayerSearchResult } from "../types";

interface LandingPageProps {
  searchFn: (query: string) => void;
  results: PlayerSearchResult[];
  loading: boolean;
  error: string | null;
}

export function LandingPage({ searchFn, results, loading, error }: LandingPageProps) {
  const navigate = useNavigate();

  const handleSelect = (player: PlayerSearchResult) => {
    navigate(`/profile/${player.accountID}`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-6 sm:px-12 lg:px-20 pt-16 pb-12 relative">
      <div className="fixed top-4 left-4 w-6 h-6 border-t border-l border-purple-500/20 pointer-events-none z-50" />
      <div className="fixed top-4 right-4 w-6 h-6 border-t border-r border-purple-500/20 pointer-events-none z-50" />
      <div className="fixed bottom-8 left-4 w-6 h-6 border-b border-l border-purple-500/20 pointer-events-none z-50" />
      <div className="fixed bottom-8 right-4 w-6 h-6 border-b border-r border-purple-500/20 pointer-events-none z-50" />

      <div className="relative z-10 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-purple-400/50">
            Geometry Dash Player Database
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4"
        >
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9]">
            <span className="text-white">GD</span>
            <span className="text-purple-500 glow-text">_</span>
            <span className="text-white">STATS</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-base sm:text-lg text-purple-200/40 max-w-md mb-12 leading-relaxed"
        >
          Search any player. View real-time stats, rankings, and level data.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-16"
        >
          <SearchBar
            onSelect={handleSelect}
            searchFn={searchFn}
            results={results}
            loading={loading}
            error={error}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap gap-3"
        >
          {[
            { label: "LIVE STATS", color: "#A855F7" },
            { label: "LEADERBOARDS", color: "#06B6D4" },
            { label: "LEVEL DATA", color: "#EC4899" },
            { label: "REAL-TIME", color: "#FBBF24" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/5 bg-white/[0.02]"
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}60` }}
              />
              <span className="text-[10px] font-mono tracking-widest text-purple-200/50">
                {item.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="fixed bottom-12 right-6 sm:right-12 text-right hidden sm:block"
      >
        <div className="font-mono text-[10px] text-purple-400/20 leading-relaxed">
          <div>PLAYERS INDEXED: --</div>
          <div>LEVELS TRACKED: --</div>
          <div>LAST SYNC: --</div>
        </div>
      </motion.div>
    </div>
  );
}