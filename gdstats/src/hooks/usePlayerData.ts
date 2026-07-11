import { useState, useCallback, useRef } from "react";
import { PlayerSearchResult, PlayerProfile } from "../types";

const API_BASE = "https://spouse-regulatory-red-films.trycloudflare.com";

export function usePlayerSearch() {
  const [results, setResults] = useState<PlayerSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_BASE}/api/search?query=${encodeURIComponent(query)}`,
        { signal: abortRef.current.signal }
      );
      if (!res.ok) throw new Error("SEARCH_FAILED");
      const data: PlayerSearchResult[] = await res.json();
      setResults(data);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "UNKNOWN_ERROR");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
    setLoading(false);
  }, []);

  return { results, loading, error, search, clear };
}

export function usePlayerProfile() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (accountID: number) => {
    setLoading(true);
    setError(null);
    setProfile(null);

    try {
      const res = await fetch(`${API_BASE}/api/profile/${accountID}`);
      if (!res.ok) throw new Error("PROFILE_LOAD_FAILED");
      const data: PlayerProfile = await res.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "UNKNOWN_ERROR");
    } finally {
      setLoading(false);
    }
  }, []);

  return { profile, loading, error, fetchProfile };
}