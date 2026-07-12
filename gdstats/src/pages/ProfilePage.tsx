import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Skull,
  Gem,
  Coins,
  CircleDollarSign,
  Trophy,
  Youtube,
  Twitter,
  MonitorPlay,
  Sparkles,
  Loader2,
  Zap,
  Moon,
} from "lucide-react";
import { PlayerProfile } from "../types";
import { PlayerIcon } from "../components/PlayerIcon";
import { StatCard } from "../components/StatCard";
import { LevelCard } from "../components/LevelCard";

interface ProfilePageProps {
  profile: PlayerProfile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: (id: number) => void;
}

export function ProfilePage({ profile, loading, error, fetchProfile }: ProfilePageProps) {
  const { accountID } = useParams<{ accountID: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (accountID) {
      fetchProfile(Number(accountID));
    }
  }, [accountID, fetchProfile]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <p className="text-red-400/80 text-lg mb-4 font-mono">ERR: {error ?? "PROFILE_NOT_FOUND"}</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/")}
            className="px-6 py-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300
              hover:bg-purple-500/20 hover:border-purple-500/30 transition-colors font-mono text-sm"
          >
            {"< RETURN"}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pb-20"
    >
      <div className="fixed top-5 left-5 z-50">
        <motion.button
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg
            bg-gd-panel/60 backdrop-blur-xl border border-purple-500/15
            text-purple-300 hover:text-white hover:border-purple-500/30
            transition-colors font-mono text-xs tracking-wider"
        >
          <ArrowLeft size={14} />
          <span>BACK</span>
        </motion.button>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 pt-20">
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            className="flex-shrink-0 mb-8 lg:mb-0 flex justify-center lg:justify-start"
          >
            <PlayerIcon
              icon={profile.icon}
              color1={profile.color1}
              color2={profile.color2}
              glow={profile.glow}
              size={140}
              form="cube"
            />
          </motion.div>

          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-2"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-purple-400/40">
                Account #{profile.accountID}
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight"
              style={{ textShadow: "0 0 40px rgba(168,85,247,0.25)" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {profile.playerName}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 mb-6"
            >
              {profile.youtube && (
                <SocialPill
                  icon={Youtube}
                  label="YT"
                  href={`https://youtube.com/channel/${profile.youtube}`}
                  color="#FF0000"
                />
              )}
              {profile.twitter && (
                <SocialPill
                  icon={Twitter}
                  label="X"
                  href={`https://twitter.com/${profile.twitter}`}
                  color="#1DA1F2"
                />
              )}
              {profile.twitch && (
                <SocialPill
                  icon={MonitorPlay}
                  label="Twitch"
                  href={`https://twitch.tv/${profile.twitch}`}
                  color="#9146FF"
                />
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-6"
            >
              <QuickStat icon={Star} value={profile.stars} label="STARS" color="#FBBF24" />
              <QuickStat icon={Skull} value={profile.demons} label="DEMONS" color="#EF4444" />
              <QuickStat icon={Gem} value={profile.diamonds} label="DIAMONDS" color="#06B6D4" />
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-4"
        >
          <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-purple-400/40 mb-4 flex items-center gap-2">
            <Zap size={12} />
            Statistics
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          <StatCard label="Stars" value={profile.stars} icon={Star} color="#FBBF24" delay={0.1} />
          <StatCard label="Demons" value={profile.demons} icon={Skull} color="#EF4444" delay={0.15} />
          <StatCard label="Diamonds" value={profile.diamonds} icon={Gem} color="#06B6D4" delay={0.2} />
          <StatCard label="Moons" value={profile.moons} icon={Moon} color="#C084FC" delay={0.22} />
          <StatCard label="Coins" value={profile.coins} icon={Coins} color="#F59E0B" delay={0.25} />
          <StatCard label="User Coins" value={profile.userCoins} icon={CircleDollarSign} color="#10B981" delay={0.3} />
          <StatCard label="Creator Pts" value={profile.creatorPoints} icon={Trophy} color="#EC4899" delay={0.35} />
          <StatCard label="Jetpack" value={profile.jetpack} icon={Sparkles} color="#8B5CF6" delay={0.4} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-purple-400/40 mb-4 flex items-center gap-2">
            <Sparkles size={12} />
            Icon Collection
          </h2>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "CUBE", id: profile.icon, form: "cube" },
              { label: "SHIP", id: profile.ship, form: "ship" },
              { label: "BALL", id: profile.ball, form: "ball" },
              { label: "UFO", id: profile.ufo, form: "ufo" },
              { label: "WAVE", id: profile.wave, form: "wave" },
              { label: "ROBOT", id: profile.robot, form: "robot" },
              { label: "SPIDER", id: profile.spider, form: "spider" },
              { label: "SWING", id: profile.swing, form: "swing" },
              { label: "JETPACK", id: profile.jetpack, form: "jetpack" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55 + i * 0.04 }}
                whileHover={{ scale: 1.08, y: -3 }}
                className="flex flex-col items-center gap-2 px-3 py-3 rounded-lg bg-gd-panel/40 border border-purple-500/10
                  hover:border-purple-500/25 transition-colors cursor-default"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-black/40 flex items-center justify-center"
                  style={{ border: "1px solid rgba(168,85,247,0.15)" }}
                >
                  <img
                    src={`https://could-constant-felt-gaming.trycloudflare.com/api/icon/${item.form}/${item.id}?col1=${profile.color1}&col2=${profile.color2}&glow=${profile.glow ? 1 : 0}`}
                    alt={item.label}
                    className="w-12 h-12 object-contain"
                    style={{ imageRendering: "pixelated" }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(168,85,247,0.4)">${item.id}</span>`;
                      }
                    }}
                  />
                </div>
                <span className="text-[9px] font-mono text-purple-200/40 tracking-wider">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {profile.levelsCreated && profile.levelsCreated.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-purple-400/40 mb-4 flex items-center gap-2">
              <Trophy size={12} />
              Levels Created
              <span className="text-purple-400/20 font-mono normal-case">
                ({profile.levelsCreated.length})
              </span>
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
              {profile.levelsCreated.map((level, i) => (
                <LevelCard key={level.levelID} level={level} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function QuickStat({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: typeof Star;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} style={{ color }} />
      <span className="font-mono text-sm text-white/80">{value.toLocaleString()}</span>
      <span className="font-mono text-[10px] text-purple-300/30 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function SocialPill({
  icon: Icon,
  label,
  href,
  color,
}: {
  icon: typeof Youtube;
  label: string;
  href: string;
  color: string;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-mono tracking-wider
        bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
      style={{ color }}
    >
      <Icon size={12} />
      <span>{label}</span>
    </motion.a>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="flex flex-col items-center gap-3"
      >
        <Loader2 size={32} className="text-purple-500 animate-spin" />
        <p className="text-purple-300/40 text-xs font-mono tracking-wider">LOADING PROFILE...</p>
      </motion.div>
    </div>
  );
}
