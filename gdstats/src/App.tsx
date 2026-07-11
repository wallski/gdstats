import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { LandingPage } from "./pages/LandingPage";
import { ProfilePage } from "./pages/ProfilePage";
import { usePlayerSearch, usePlayerProfile } from "./hooks/usePlayerData";

function AnimatedRoutes() {
  const location = useLocation();
  const { results, loading, error, search, clear } = usePlayerSearch();
  const { profile, loading: profileLoading, error: profileError, fetchProfile } = usePlayerProfile();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <LandingPage
                searchFn={search}
                results={results}
                loading={loading}
                error={error}
              />
            </PageTransition>
          }
        />
        <Route
          path="/profile/:accountID"
          element={
            <PageTransition>
              <ProfilePage
                profile={profile}
                loading={profileLoading}
                error={profileError}
                fetchProfile={fetchProfile}
              />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10"
    >
      <motion.div
        className="fixed inset-0 z-[100] pointer-events-none"
        style={{ background: "#A855F7" }}
        initial={{ opacity: 0.12 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen text-white font-display antialiased">
        <AnimatedBackground />
        <AnimatedRoutes />
        <StatusBar />
      </div>
    </BrowserRouter>
  );
}

function StatusBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-6 py-2 flex items-center justify-between text-[10px] font-mono text-purple-400/40 border-t border-purple-500/10 bg-gd-dark/80 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500/80 animate-pulse" />
          API: ONLINE
        </span>
        <span className="hidden sm:inline">LATENCY: --ms</span>
      </div>
      <div className="flex items-center gap-4">
        <span>v1.0.0-alpha</span>
        <span className="hidden sm:inline">BUILD 2026.07.06</span>
      </div>
    </div>
  );
}