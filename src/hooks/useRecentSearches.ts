import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "openAnime_recent_searches_v1";
const EVENT_KEY = "openAnime_recent_searches_updated";

const DEFAULT_RECENT = ["Frieren", "Attack on Titan", "Spy x Family"];

function getStoredSearches(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load recent searches from localStorage", e);
  }
  return DEFAULT_RECENT;
}

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>(getStoredSearches);

  useEffect(() => {
    const handleUpdate = () => {
      setRecentSearches(getStoredSearches());
    };
    window.addEventListener(EVENT_KEY, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(EVENT_KEY, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const addSearch = useCallback((term: string) => {
    const cleaned = term.trim();
    if (!cleaned || cleaned.length < 2) return;

    try {
      const current = getStoredSearches();
      const filtered = current.filter(
        (item) => item.toLowerCase() !== cleaned.toLowerCase()
      );
      const updated = [cleaned, ...filtered].slice(0, 10);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
      window.dispatchEvent(new Event(EVENT_KEY));
    } catch (e) {
      console.error("Failed to save recent search", e);
    }
  }, []);

  const removeSearch = useCallback((term: string) => {
    try {
      const current = getStoredSearches();
      const updated = current.filter(
        (item) => item.toLowerCase() !== term.toLowerCase()
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
      window.dispatchEvent(new Event(EVENT_KEY));
    } catch (e) {
      console.error("Failed to remove recent search", e);
    }
  }, []);

  const clearSearches = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      setRecentSearches([]);
      window.dispatchEvent(new Event(EVENT_KEY));
    } catch (e) {
      console.error("Failed to clear recent searches", e);
    }
  }, []);

  return {
    recentSearches,
    addSearch,
    removeSearch,
    clearSearches,
  };
}
