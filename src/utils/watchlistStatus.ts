import React from "react";
import { Tv, Bookmark, Check, Pause, X, Plus } from "lucide-react";
import { WatchlistStatus } from "../context/WatchlistContext";

export interface StatusConfig {
  label: WatchlistStatus;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  // Solid color background for round icon indicators / buttons
  bgClass: string;
  // Border class for indicator button
  borderClass: string;
  // Subtle tint badge style
  badgeClass: string;
  // Text color class
  textClass: string;
  // Button background when active
  activeButtonClass: string;
}

export const WATCHLIST_STATUS_CONFIG: Record<WatchlistStatus, StatusConfig> = {
  Watching: {
    label: "Watching",
    shortLabel: "Watching",
    icon: Tv,
    bgClass: "bg-primary text-white shadow-lg shadow-primary/30 border-primary",
    borderClass: "border-primary/50",
    badgeClass: "bg-primary/20 text-primary border-primary/40",
    textClass: "text-primary",
    activeButtonClass: "bg-primary/20 text-primary border-primary/50 hover:bg-primary/30",
  },
  "Plan to Watch": {
    label: "Plan to Watch",
    shortLabel: "Plan",
    icon: Bookmark,
    bgClass: "bg-sky-500 text-white shadow-lg shadow-sky-500/30 border-sky-400",
    borderClass: "border-sky-500/50",
    badgeClass: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    textClass: "text-sky-400",
    activeButtonClass: "bg-sky-500/20 text-sky-300 border-sky-500/50 hover:bg-sky-500/30",
  },
  Completed: {
    label: "Completed",
    shortLabel: "Done",
    icon: Check,
    bgClass: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 border-emerald-400",
    borderClass: "border-emerald-500/50",
    badgeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    textClass: "text-emerald-400",
    activeButtonClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30",
  },
  "On Hold": {
    label: "On Hold",
    shortLabel: "Paused",
    icon: Pause,
    bgClass: "bg-amber-500 text-white shadow-lg shadow-amber-500/30 border-amber-400",
    borderClass: "border-amber-500/50",
    badgeClass: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    textClass: "text-amber-400",
    activeButtonClass: "bg-amber-500/20 text-amber-400 border-amber-500/50 hover:bg-amber-500/30",
  },
  Dropped: {
    label: "Dropped",
    shortLabel: "Dropped",
    icon: X,
    bgClass: "bg-rose-500 text-white shadow-lg shadow-rose-500/30 border-rose-400",
    borderClass: "border-rose-500/50",
    badgeClass: "bg-rose-500/20 text-rose-400 border-rose-500/40",
    textClass: "text-rose-400",
    activeButtonClass: "bg-rose-500/20 text-rose-400 border-rose-500/50 hover:bg-rose-500/30",
  },
};

export const ALL_WATCHLIST_STATUSES: WatchlistStatus[] = [
  "Watching",
  "Plan to Watch",
  "Completed",
  "On Hold",
  "Dropped",
];
