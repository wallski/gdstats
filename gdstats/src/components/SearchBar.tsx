import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Star, Skull } from "lucide-react";
import { PlayerSearchResult } from "../types";

interface SearchBarProps {
  onSelect: (player: PlayerSearchResult) => void;
  searchFn: (query: string) => void;
  results: PlayerSearchResult[];
  loading: boolean;
  error: string | null;
}

export function SearchBar({
  onSelect,
  searchFn,
  results,
  loading,
  error,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim()) {
        searchFn(query);
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [query, searchFn]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && results[focusedIndex]) {
        handleSelect(results[focusedIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelect = (player: PlayerSearchResult) => {
    setQuery(player.playerName);
    setIsOpen(false);
    onSelect(player);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative"
      >
        <div
          className={`
            relative flex items-center rounded-lg
            bg-gd-panel/60 backdrop-blur-xl
            border-b-2 transition-all duration-300
            ${isOpen && (results.length > 0 || loading || error)
              ? "border-b-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.15)]"
              : "border-b-purple-500/20 hover:border-b-purple-500/40"
            }
          `}
        >
          <span className="pl-4 pr-2 font-mono text-sm text-purple-400/40 select-none">
            {">"}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setFocusedIndex(-1);
            }}
            onFocus={() => query.trim() && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="search player..."
            className="w-full py-4 pr-12 bg-transparent text-white placeholder-purple-300/25
              text-base font-mono outline-none rounded-lg"
            autoComplete="off"
            spellCheck={false}
          />
          {loading ? (
            <Loader2 size={18} className="absolute right-4 text-purple-400 animate-spin" />
          ) : (
            <Search size={18} className="absolute right-4 text-purple-400/30" />
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-lg overflow-hidden
              bg-gd-panel/95 backdrop-blur-2xl
              border border-purple-500/15
              shadow-[0_8px_32px_rgba(0,0,0,0.4)]
              z-50
            "
          >
            {error && (
              <div className="p-4 text-center text-red-400/80 text-sm font-mono">
                ERR: {error}
              </div>
            )}

            {!loading && !error && results.length === 0 && query.trim() && (
              <div className="p-4 text-center text-purple-300/30 text-sm font-mono">
                NO MATCHES
              </div>
            )}

            {results.map((player, i) => (
              <motion.button
                key={player.accountID}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 200 }}
                onClick={() => handleSelect(player)}
                onMouseEnter={() => setFocusedIndex(i)}
                className={`
                  w-full flex items-center gap-4 px-5 py-3.5 text-left
                  transition-colors duration-100
                  ${focusedIndex === i
                    ? "bg-purple-500/10"
                    : "hover:bg-purple-500/5"
                  }
                  ${i < results.length - 1 ? "border-b border-purple-500/5" : ""}
                `}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/30 flex items-center justify-center flex-shrink-0"
                  style={{ border: "1px solid rgba(168,85,247,0.2)" }}
                >
                  <img
                    src={`https://streams-junior-browser-dis.trycloudflare.com/api/icon/cube/${player.icon}?col1=${player.color1}&col2=${player.color2}&glow=0`}
                    alt={player.playerName}
                    className="w-8 h-8 object-contain"
                    style={{ imageRendering: "pixelated" }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span style="font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(168,85,247,0.5)">${player.icon}</span>`;
                      }
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">
                    {player.playerName}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-[10px] font-mono text-yellow-400/70">
                      <Star size={10} fill="currentColor" />
                      {player.stars.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-mono text-red-400/70">
                      <Skull size={10} />
                      {player.demons}
                    </span>
                  </div>
                </div>

                <motion.div
                  className="w-5 h-5 rounded border border-purple-500/20 flex items-center justify-center"
                  animate={focusedIndex === i ? { scale: 1.1, borderColor: "rgba(168,85,247,0.6)" } : {}}
                >
                  <motion.div
                    className="w-1.5 h-1.5 rounded-sm bg-purple-500"
                    initial={{ scale: 0 }}
                    animate={focusedIndex === i ? { scale: 1 } : { scale: 0 }}
                  />
                </motion.div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
