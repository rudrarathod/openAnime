import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router";
import {
  Play,
  Clock,
  CheckCircle,
  ListPlus,
  Trash2,
  Plus,
  Minus,
  Search,
  Star,
  Compass,
  XCircle,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import { useWatchlist, WatchlistStatus, WatchlistItem } from "../context/WatchlistContext";
import { WATCHLIST_STATUS_CONFIG } from "../utils/watchlistStatus";
import { fetchAnimeEpisodes } from "../api/jikan";
import { cn } from "../utils/cn";
import CustomSelect, { CustomSelectOption } from "../components/ui/CustomSelect";
import { Tv, Bookmark, Check, Pause, X } from "lucide-react";

const TABS: { name: string; status: WatchlistStatus | "All"; icon: any }[] = [
  { name: "All", status: "All", icon: null },
  { name: "Watching", status: "Watching", icon: Tv },
  { name: "Plan to Watch", status: "Plan to Watch", icon: Bookmark },
  { name: "Completed", status: "Completed", icon: Check },
  { name: "On Hold", status: "On Hold", icon: Pause },
  { name: "Dropped", status: "Dropped", icon: X },
];

const STATUS_OPTIONS: WatchlistStatus[] = [
  "Watching",
  "Plan to Watch",
  "Completed",
  "On Hold",
  "Dropped",
];

const WATCHLIST_STATUS_SELECT_OPTIONS: CustomSelectOption<WatchlistStatus>[] = [
  { label: "Watching", value: "Watching", icon: <Tv className="w-3.5 h-3.5 text-primary shrink-0" /> },
  { label: "Plan to Watch", value: "Plan to Watch", icon: <Bookmark className="w-3.5 h-3.5 text-sky-400 shrink-0" /> },
  { label: "Completed", value: "Completed", icon: <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> },
  { label: "On Hold", value: "On Hold", icon: <Pause className="w-3.5 h-3.5 text-amber-400 shrink-0" /> },
  { label: "Dropped", value: "Dropped", icon: <X className="w-3.5 h-3.5 text-rose-400 shrink-0" /> },
];

const WATCHLIST_SORT_OPTIONS: CustomSelectOption<"added" | "score" | "title" | "progress">[] = [
  { label: "Recently Added", value: "added" },
  { label: "Highest Rated", value: "score" },
  { label: "Title (A-Z)", value: "title" },
  { label: "Most Episodes Watched", value: "progress" },
];

export default function Watchlist() {
  const {
    watchlist,
    removeFromWatchlist,
    updateWatchlistStatus,
    updateWatchlistProgress,
    syncAiredTotal,
  } = useWatchlist();

  const [activeTab, setActiveTab] = useState<WatchlistStatus | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"added" | "score" | "title" | "progress">("added");

  // Sync aired episode totals for items in watchlist on mount
  useEffect(() => {
    if (watchlist.length === 0) return;
    let isMounted = true;

    async function checkAiredEpisodes() {
      // Sync active or completed items to check for new episodes
      const itemsToCheck = watchlist.slice(0, 12);
      for (const item of itemsToCheck) {
        if (!isMounted) break;
        try {
          const epData = await fetchAnimeEpisodes(item.id);
          const airedEpEntries = Object.values(epData).filter((ep) => ep.hasAired !== false);
          const maxAired = airedEpEntries.reduce((max, ep) => Math.max(max, ep.mal_id), 0);
          if (maxAired > 0) {
            syncAiredTotal(item.id, maxAired);
          }
        } catch (e) {
          // ignore error
        }
      }
    }

    checkAiredEpisodes();
    return () => {
      isMounted = false;
    };
  }, [watchlist.length, syncAiredTotal]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { All: watchlist.length };
    TABS.forEach((t) => {
      if (t.status !== "All") {
        counts[t.status] = watchlist.filter((item) => item.status === t.status).length;
      }
    });
    return counts;
  }, [watchlist]);

  // Filter & Sort
  const filteredItems = useMemo(() => {
    return watchlist
      .filter((item) => {
        const matchesTab = activeTab === "All" || item.status === activeTab;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesTab && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "score") {
          const scoreA = parseFloat(String(a.score || 0));
          const scoreB = parseFloat(String(b.score || 0));
          return scoreB - scoreA;
        }
        if (sortBy === "title") {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === "progress") {
          return (b.progressEp || 0) - (a.progressEp || 0);
        }
        // default "added"
        return b.addedAt - a.addedAt;
      });
  }, [watchlist, activeTab, searchQuery, sortBy]);

  // Summary statistics
  const stats = useMemo(() => {
    const total = watchlist.length;
    const watching = watchlist.filter((i) => i.status === "Watching").length;
    const completed = watchlist.filter((i) => i.status === "Completed").length;
    const totalEpsWatched = watchlist.reduce((sum, i) => sum + (i.progressEp || 0), 0);
    return { total, watching, completed, totalEpsWatched };
  }, [watchlist]);

  return (
    <div className="flex flex-col gap-8 px-4 sm:px-6 md:px-12 py-8 min-h-screen pb-24">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight">
            My Watchlist
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Track, organize, and manage your anime progress seamlessly.
          </p>
        </div>

        {/* Stats summary pill */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-4 p-3 sm:p-2.5 sm:px-4 rounded-2xl glass border border-white/10 text-xs sm:text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Total</span>
            <span className="font-bold text-foreground">{stats.total}</span>
          </div>
          <div className="hidden sm:block h-6 w-px bg-border/60" />
          <div className="flex flex-col">
            <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Watching</span>
            <span className="font-bold text-primary">{stats.watching}</span>
          </div>
          <div className="hidden sm:block h-6 w-px bg-border/60" />
          <div className="flex flex-col">
            <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Completed</span>
            <span className="font-bold text-emerald-400">{stats.completed}</span>
          </div>
          <div className="hidden sm:block h-6 w-px bg-border/60" />
          <div className="flex flex-col">
            <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Eps Watched</span>
            <span className="font-bold text-amber-400">{stats.totalEpsWatched}</span>
          </div>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-border/40 no-scrollbar touch-auto overscroll-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.status;
          const count = tabCounts[tab.status] || 0;
          const Icon = tab.icon;

          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.status)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-medium text-sm shrink-0 border min-h-[42px] active:scale-95 touch-manipulation",
                isActive
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/25 font-semibold"
                  : "glass border-transparent text-muted-foreground hover:text-foreground hover:border-border/60"
              )}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{tab.name}</span>
              <span
                className={cn(
                  "ml-1 text-xs px-2 py-0.5 rounded-full font-bold",
                  isActive ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Local Search */}
        <div className="relative flex-1 max-w-md group">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved titles..."
            className="w-full h-10 pl-10 pr-10 rounded-xl glass border border-border/60 hover:border-border text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search input"
              title="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors cursor-pointer touch-manipulation"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <CustomSelect
            options={WATCHLIST_SORT_OPTIONS}
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            size="md"
            variant="glass"
            icon={<ArrowUpDown className="w-4 h-4 text-muted-foreground" />}
          />
        </div>
      </div>

      {/* Content Grid / Empty State */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 mt-2">
          {filteredItems.map((item) => (
            <WatchlistCard
              key={item.id}
              item={item}
              onRemove={() => removeFromWatchlist(item.id)}
              onStatusChange={(newStatus) => updateWatchlistStatus(item.id, newStatus)}
              onProgressChange={(newEp) => updateWatchlistProgress(item.id, newEp)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center glass-panel rounded-3xl border border-white/5 mt-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="text-xl md:text-2xl font-display font-bold">
            {watchlist.length === 0 ? "Your watchlist is empty" : "No anime found"}
          </h2>
          <p className="text-muted-foreground max-w-md text-sm mt-2">
            {watchlist.length === 0
              ? "Start building your personal collection by saving your favorite anime series!"
              : "No titles match your current tab or search query."}
          </p>
          {watchlist.length === 0 ? (
            <Link
              to="/discover"
              className="mt-6 px-6 py-3 rounded-xl bg-primary text-white font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
            >
              <Compass className="w-4 h-4" />
              Explore Popular Anime
            </Link>
          ) : (
            <div className="flex items-center gap-3 mt-6">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold flex items-center gap-2 shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  Clear Search
                </button>
              )}
              {activeTab !== "All" && (
                <button
                  type="button"
                  onClick={() => setActiveTab("All")}
                  className="px-4 py-2.5 rounded-xl glass border border-border/60 text-sm font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
                >
                  Show All Items
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WatchlistCard({
  item,
  onRemove,
  onStatusChange,
  onProgressChange,
}: {
  item: WatchlistItem;
  onRemove: () => void;
  onStatusChange: (status: WatchlistStatus) => void;
  onProgressChange: (ep: number) => void;
}) {
  const currentEp = item.progressEp || 0;
  const totalEps = item.totalEps || 0;
  const progressPercent = totalEps > 0 ? Math.min(100, Math.round((currentEp / totalEps) * 100)) : 0;
  const watchTargetEp = currentEp < totalEps ? currentEp + 1 : (currentEp > 0 ? currentEp : 1);
  const isAtMaxAired = totalEps > 0 && currentEp >= totalEps;
  const hasNewEp = totalEps > 0 && totalEps > currentEp && currentEp > 0;

  // Border color indicator based on status
  const statusBorderClass = {
    Watching: "border-l-4 border-l-primary",
    Completed: "border-l-4 border-l-emerald-400",
    "Plan to Watch": "border-l-4 border-l-sky-400",
    "On Hold": "border-l-4 border-l-amber-400",
    Dropped: "border-l-4 border-l-rose-400",
  }[item.status] || "";

  return (
    <div
      className={cn(
        "glass-panel rounded-2xl p-3 sm:p-4 flex gap-3.5 sm:gap-4 border border-white/5 hover:border-white/15 transition-all group relative",
        statusBorderClass
      )}
    >
      {/* Cover image & Link */}
      <Link
        to={`/anime/${item.id}`}
        className="relative w-24 sm:w-28 md:w-32 aspect-[2/3] rounded-xl overflow-hidden shrink-0 bg-secondary active:scale-95 transition-transform touch-manipulation group/img shadow-md"
      >
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/20 group-hover/img:bg-black/40 transition-colors flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-primary/90 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 scale-75 group-hover/img:scale-100 transition-all duration-200 shadow-lg">
            <Play className="w-4 h-4 fill-current translate-x-0.5" />
          </div>
        </div>
        {item.score && (
          <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-amber-400 text-[10px] font-bold border border-white/10 shadow-sm">
            <Star className="w-3 h-3 fill-current" />
            <span>{item.score}</span>
          </div>
        )}
      </Link>

      {/* Item info & controls */}
      <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5 gap-2">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <Link
                to={`/anime/${item.id}`}
                className="font-semibold text-sm sm:text-base line-clamp-2 hover:text-primary active:text-primary transition-colors leading-snug"
                title={item.title}
              >
                {item.title}
              </Link>
              {item.subtitle && (
                <p className="text-[11px] text-muted-foreground/80 line-clamp-1 font-normal mt-0.5">
                  {item.subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onRemove}
              title="Remove from Watchlist"
              aria-label="Remove from Watchlist"
              className="w-8 h-8 rounded-lg text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10 active:scale-90 flex items-center justify-center transition-all shrink-0 touch-manipulation cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Status selector & New Episode badge */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
            <CustomSelect
              options={WATCHLIST_STATUS_SELECT_OPTIONS}
              value={item.status}
              onChange={(val) => onStatusChange(val)}
              size="sm"
              variant={item.status === "Watching" ? "badge" : "glass"}
              buttonClassName={cn(
                "font-bold transition-all min-h-[32px] text-xs px-2 sm:px-2.5",
                item.status === "Completed" && "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30",
                item.status === "Plan to Watch" && "bg-sky-500/15 text-sky-400 border-sky-500/30 hover:bg-sky-500/25",
                item.status === "On Hold" && "bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30",
                item.status === "Dropped" && "bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30"
              )}
            />

            {hasNewEp && (
              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/40 text-[10px] font-extrabold flex items-center gap-1 shadow-sm shrink-0">
                <Sparkles className="w-3 h-3 animate-pulse" />
                <span>{totalEps - currentEp} New</span>
              </span>
            )}
          </div>
        </div>

        {/* Episode Progress Controller & Progress Bar */}
        <div className="pt-2 border-t border-border/40 flex flex-col gap-2">
          {/* Progress label & bar */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider">Progress</span>
              <span className="font-mono text-foreground font-bold text-xs">
                EP {currentEp} {totalEps ? `/ ${totalEps}` : ""}
              </span>
            </div>
            {totalEps > 0 && (
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-300 rounded-full",
                    item.status === "Completed" ? "bg-emerald-400" : "bg-primary"
                  )}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onProgressChange(Math.max(0, currentEp - 1))}
              disabled={currentEp <= 0}
              title="Decrease Episode Progress"
              aria-label="Decrease Episode Progress"
              className="w-8 h-8 rounded-lg bg-secondary/80 hover:bg-secondary disabled:opacity-30 active:scale-90 flex items-center justify-center text-foreground transition-all shrink-0 touch-manipulation cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            {/* Quick episode increment */}
            <button
              onClick={() => onProgressChange(currentEp + 1)}
              disabled={isAtMaxAired}
              title={isAtMaxAired ? "Up to date with latest aired episodes!" : "Increment Episode Progress (+1)"}
              className={cn(
                "flex-1 py-1 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all min-h-[32px] touch-manipulation cursor-pointer",
                isAtMaxAired
                  ? "bg-secondary/50 text-muted-foreground opacity-50 cursor-not-allowed"
                  : "bg-primary/20 hover:bg-primary/30 active:scale-95 text-primary border border-primary/30"
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAtMaxAired ? "Completed" : "+1 Ep"}</span>
            </button>

            {/* Watch Episode Link */}
            <Link
              to={`/watch/${item.id}/${watchTargetEp}`}
              className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary/90 active:scale-90 transition-all shrink-0 touch-manipulation shadow-md shadow-primary/20"
              title={`Watch Episode ${watchTargetEp}`}
              aria-label={`Watch Episode ${watchTargetEp}`}
            >
              <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
