import { useParams, Link } from "react-router";
import { Play, Share2, Star, Clock, Calendar, Bookmark, Check, ChevronDown, Trash2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { fetchMalDetails, MalAnime } from "../api/mal";
import { fetchAnimeEpisodes, JikanEpisode } from "../api/jikan";
import { fetchSubDubInfo, isSubAvailable, isDubAvailable, SubDubAvailability } from "../api/subdub";
import { cn } from "../utils/cn";
import { useWatchlist, WatchlistStatus } from "../context/WatchlistContext";
import { WATCHLIST_STATUS_CONFIG } from "../utils/watchlistStatus";
import { useContinueWatching } from "../context/ContinueWatchingContext";
import { AnimeDetailsSkeleton, EpisodeGridSkeleton } from "../components/ui/Skeletons";
import { getFormattedAnimeTitles } from "../utils/title";
import { formatAgeRating } from "../utils/rating";

const STATUS_OPTIONS: WatchlistStatus[] = ["Watching", "Plan to Watch", "Completed", "On Hold", "Dropped"];

export default function AnimeDetails() {
  const { id } = useParams();
  const [anime, setAnime] = useState<MalAnime | null>(null);
  const [episodeMap, setEpisodeMap] = useState<Record<number, JikanEpisode>>({});
  const [subDubInfo, setSubDubInfo] = useState<SubDubAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [episodesLoading, setEpisodesLoading] = useState(true);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedChunk, setSelectedChunk] = useState<number>(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const { addToWatchlist, removeFromWatchlist, getWatchlistItem, updateWatchlistStatus, syncAiredTotal } = useWatchlist();
  const { history, isEpisodeWatched, getEpisodeProgress, toggleEpisodeWatched } = useContinueWatching();

  const savedItem = id ? getWatchlistItem(id) : undefined;
  const isSaved = !!savedItem;

  const lastPlayedItem = history.find((h) => String(h.animeId) === String(id));
  const lastEpNum = lastPlayedItem?.epNumber || savedItem?.progressEp;
  const lastPlayedChunk = lastEpNum && lastEpNum > 0 ? Math.floor((lastEpNum - 1) / 100) : -1;

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      const initialChunk = lastEpNum && lastEpNum > 0 ? Math.floor((lastEpNum - 1) / 100) : 0;
      setSelectedChunk(initialChunk);
      setLoading(true);
      setEpisodesLoading(true);
      setAnime(null);
      setEpisodeMap({});
      setSubDubInfo(null);
      window.scrollTo(0, 0);

      // 1. Fetch MAL details first so the page info renders immediately!
      fetchMalDetails(id).then((resDetails) => {
        setAnime(resDetails);
        setLoading(false);
      });

      // 2. Fetch episodes in parallel with live streaming updates
      fetchAnimeEpisodes(id, (updatedMap) => {
        setEpisodeMap(updatedMap);
      }).then((epData) => {
        setEpisodeMap(epData || {});
        setEpisodesLoading(false);
      });

      // 3. Fetch Sub/Dub availability in parallel
      fetchSubDubInfo(id).then((subDubData) => {
        setSubDubInfo(subDubData);
      });
    }
    loadData();
  }, [id]);

  // Sync aired episode total with watchlist
  useEffect(() => {
    if (!anime || !id) return;
    const airedEpEntries = Object.values(episodeMap).filter((ep) => ep.hasAired !== false);
    const maxAiredEpNum = airedEpEntries.reduce((max, ep) => Math.max(max, ep.mal_id), 0);
    const effectiveTotal = anime.status === "currently_airing"
      ? (maxAiredEpNum > 0 ? maxAiredEpNum : (airedEpEntries.length > 0 ? airedEpEntries.length : 1))
      : (anime.num_episodes || maxAiredEpNum || 1);

    syncAiredTotal(anime.id, effectiveTotal);
  }, [anime, episodeMap, id, syncAiredTotal]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowStatusMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectStatus = (status: WatchlistStatus) => {
    if (!anime) return;
    const airedEpEntries = Object.values(episodeMap).filter((ep) => ep.hasAired !== false);
    const maxAiredEpNum = airedEpEntries.reduce((max, ep) => Math.max(max, ep.mal_id), 0);
    const effectiveTotal = anime.status === "currently_airing"
      ? (maxAiredEpNum > 0 ? maxAiredEpNum : (airedEpEntries.length > 0 ? airedEpEntries.length : 1))
      : (anime.num_episodes || maxAiredEpNum || 1);

    const formattedTitles = getFormattedAnimeTitles(anime);

    if (isSaved) {
      updateWatchlistStatus(anime.id, status);
      syncAiredTotal(anime.id, effectiveTotal);
    } else {
      addToWatchlist({
        id: anime.id,
        title: formattedTitles.title,
        subtitle: formattedTitles.subtitle,
        image: anime.main_picture?.large || anime.main_picture?.medium || "",
        score: anime.mean ? anime.mean.toFixed(1) : undefined,
        type: anime.media_type,
        status: status,
        totalEps: effectiveTotal,
        genres: anime.genres?.map((g: any) => typeof g === "string" ? g : g.name) || [],
      });
    }
    setShowStatusMenu(false);
  };

  const handleRemove = () => {
    if (!anime) return;
    removeFromWatchlist(anime.id);
    setShowStatusMenu(false);
  };

  const handleShare = () => {
    if (!anime) return;
    const formattedTitles = getFormattedAnimeTitles(anime);
    if (navigator.share) {
      navigator.share({ title: formattedTitles.title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <AnimeDetailsSkeleton />;
  }

  if (!anime) {
    return <div className="p-12 text-center text-destructive min-h-screen">Failed to load anime details.</div>;
  }

  // Generate episodes array based on aired status
  const airedEpEntries = Object.values(episodeMap).filter((ep) => ep.hasAired !== false);
  const maxAiredEpNum = airedEpEntries.reduce((max, ep) => Math.max(max, ep.mal_id), 0);

  let numEps = 0;
  if (anime.status === "not_yet_aired") {
    numEps = 0;
  } else if (anime.status === "currently_airing") {
    numEps = maxAiredEpNum > 0 ? maxAiredEpNum : (airedEpEntries.length > 0 ? airedEpEntries.length : 1);
  } else {
    const totalMAL = anime.num_episodes && anime.num_episodes > 0 ? anime.num_episodes : 0;
    numEps = Math.max(totalMAL, maxAiredEpNum, 1);
  }

  const episodes = Array.from({ length: numEps })
    .map((_, i) => {
      const epNum = i + 1;
      const realEp = episodeMap[epNum];
      if (realEp && realEp.hasAired === false) {
        return null;
      }
      return {
        id: epNum,
        number: epNum,
        title: realEp?.title || `Episode ${epNum}`,
        filler: realEp?.filler,
        recap: realEp?.recap,
      };
    })
    .filter((ep): ep is NonNullable<typeof ep> => ep !== null);

  const firstEp = episodes[0] || (anime.status !== "not_yet_aired" ? { number: 1, id: 1, title: "Episode 1" } : null);

  return (
    <div className="flex flex-col pb-20 min-h-screen">
      {/* Content */}
      <div className="px-4 sm:px-6 md:px-12 pt-6 md:pt-10 flex flex-col gap-6 md:gap-8">
        {/* Header row: poster + primary info side by side */}
        <div className="flex items-end gap-4 md:gap-8">
          {/* Poster */}
          <div className="w-24 sm:w-32 md:w-[240px] shrink-0">
            <div className="aspect-[2/3] rounded-xl md:rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 md:shadow-primary/10 border border-white/10 relative group">
              <img
                src={anime.main_picture?.large || anime.main_picture?.medium}
                alt="Poster"
                className="w-full h-full object-cover"
              />
              {firstEp && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 lg:group-hover:opacity-100 transition-opacity">
                  <Link to={`/watch/${anime.id}/${firstEp.number}`} className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white scale-75 lg:group-hover:scale-100 transition-transform">
                    <Play className="w-8 h-8 fill-current translate-x-0.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Primary info */}
          <div className="flex flex-col gap-1 md:gap-2 flex-1 min-w-0 pb-1 md:pb-6">
            <h1 className="text-xl sm:text-3xl md:text-5xl font-display font-bold tracking-tight text-balance">
              {getFormattedAnimeTitles(anime).title}
            </h1>
            {getFormattedAnimeTitles(anime).subtitle && (
              <p className="text-xs sm:text-base md:text-xl text-muted-foreground font-medium">
                {getFormattedAnimeTitles(anime).subtitle}
              </p>
            )}
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground/80 font-display capitalize">
              {anime.status?.replace(/_/g, " ")}
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs md:text-sm font-medium mt-1">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" />
                <span>{anime.mean || "N/A"}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>
                  {anime.num_episodes && anime.num_episodes > 0
                    ? `${anime.num_episodes} eps`
                    : episodes.length > 0
                    ? (anime.status === "currently_airing" ? `${episodes.length}+ eps` : `${episodes.length} eps`)
                    : "TBD"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="capitalize">{anime.start_season ? `${anime.start_season.season} ${anime.start_season.year}` : "N/A"}</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[10px] md:text-xs uppercase tracking-wider">
                {anime.media_type || "TV"}
              </span>
              {anime.rating && (() => {
                const ageRating = formatAgeRating(anime.rating);
                if (!ageRating) return null;
                return (
                  <span
                    title={ageRating.full}
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] md:text-xs font-bold uppercase tracking-wider border shadow-sm",
                      ageRating.badgeClass
                    )}
                  >
                    {ageRating.short}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Genres */}
        {(anime.genres || []).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(anime.genres || []).map(genre => (
              <span key={genre.id} className="px-3 py-1 rounded-full glass text-xs md:text-sm">
                {genre.name}
              </span>
            ))}
          </div>
        )}

        {/* Synopsis */}
        <div className="flex flex-col items-start gap-1">
          <p className={cn("text-sm md:text-base text-foreground/80 leading-relaxed max-w-3xl transition-all", !isDescExpanded && "line-clamp-3 md:line-clamp-4")}>
            {anime.synopsis || "No description available."}
          </p>
          {anime.synopsis && anime.synopsis.length > 150 && (
            <button
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className="text-primary font-medium text-sm lg:hover:text-primary/80 transition-colors focus:outline-none"
            >
              {isDescExpanded ? "Show Less" : "Read More"}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 relative">
          {firstEp ? (
            <Link
              to={`/watch/${anime.id}/${firstEp.number}`}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 rounded-xl bg-primary lg:hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold transition-all shadow-lg shadow-primary/25 touch-manipulation min-h-[48px]"
            >
              <Play className="w-5 h-5 fill-current" />
              Play Episode 1
            </Link>
          ) : (
            <button disabled className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-secondary text-muted-foreground font-semibold min-h-[48px]">
              No Episodes Yet
            </button>
          )}

          {/* Watchlist button with dropdown menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowStatusMenu((prev) => !prev)}
              className={cn(
                "h-12 md:h-[50px] px-4 md:px-6 rounded-xl flex items-center justify-center gap-2 transition-all font-semibold border active:scale-95 touch-manipulation min-h-[48px] shadow-lg",
                isSaved && savedItem?.status
                  ? WATCHLIST_STATUS_CONFIG[savedItem.status].bgClass
                  : "glass border-white/10 lg:hover:bg-secondary text-foreground"
              )}
            >
              {isSaved && savedItem?.status ? (
                (() => {
                  const StIcon = WATCHLIST_STATUS_CONFIG[savedItem.status].icon;
                  return <StIcon className="w-5 h-5 shrink-0" />;
                })()
              ) : (
                <Bookmark className="w-5 h-5 shrink-0" />
              )}
              <span>{savedItem ? savedItem.status : "Add to Watchlist"}</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", showStatusMenu && "rotate-180")} />
            </button>

            {showStatusMenu && (
              <div className="absolute left-0 mt-2 w-56 rounded-2xl glass-panel border border-border p-2 shadow-2xl z-30 flex flex-col gap-1 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Select Status
                </div>
                {STATUS_OPTIONS.map((status) => {
                  const cfg = WATCHLIST_STATUS_CONFIG[status];
                  const StIcon = cfg.icon;
                  const isCurrent = savedItem?.status === status;
                  return (
                    <button
                      key={status}
                      onClick={() => handleSelectStatus(status)}
                      className={cn(
                        "w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-all active:scale-98 touch-manipulation min-h-[42px] cursor-pointer",
                        isCurrent
                          ? cfg.badgeClass + " font-extrabold"
                          : "text-foreground hover:bg-secondary/80 active:bg-secondary"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <StIcon className="w-4 h-4 shrink-0" />
                        <span>{status}</span>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-current shrink-0" />}
                    </button>
                  );
                })}
                {isSaved && (
                  <>
                    <div className="h-px bg-border/50 my-1" />
                    <button
                      onClick={handleRemove}
                      className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 active:bg-destructive/20 flex items-center gap-2 transition-colors touch-manipulation min-h-[42px]"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove from Watchlist</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleShare}
            aria-label="Share anime"
            className="w-12 h-12 md:h-[50px] rounded-xl glass lg:hover:bg-secondary active:scale-95 flex items-center justify-center transition-all relative touch-manipulation min-h-[48px] shrink-0"
          >
            <Share2 className="w-5 h-5" />
            {copied && (
              <span className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-secondary text-white text-xs font-medium whitespace-nowrap shadow-md">
                Link copied!
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="mt-12 px-4 sm:px-6 md:px-12 flex flex-col gap-12">
        {/* Episodes Section */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-display font-bold">Episodes</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary text-xs font-semibold text-muted-foreground">
                {episodes.length} Total
              </span>
            </div>

            {/* Range Chunk Selector for anime with > 100 episodes */}
            {episodes.length > 100 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar max-w-full">
                {Array.from({ length: Math.ceil(episodes.length / 100) }, (_, idx) => {
                  const start = idx * 100 + 1;
                  const end = Math.min((idx + 1) * 100, episodes.length);
                  const isSelected = selectedChunk === idx;
                  const isLastPlayedChunk = lastPlayedChunk === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedChunk(idx)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0 touch-manipulation min-h-[36px] flex items-center gap-1.5",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : isLastPlayedChunk
                          ? "bg-primary/15 text-primary border-primary/40 font-bold hover:bg-primary/25"
                          : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border-border/50"
                      )}
                    >
                      {isLastPlayedChunk && (
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                      )}
                      <span>{start} - {end}</span>
                      {isLastPlayedChunk && lastEpNum && (
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                          isSelected ? "bg-white/20 text-white" : "bg-primary/20 text-primary"
                        )}>
                          Ep {lastEpNum}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          {episodesLoading && episodes.length === 0 ? (
            <EpisodeGridSkeleton count={8} />
          ) : episodes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(episodes.length > 100
                ? episodes.filter((ep) => ep.number >= selectedChunk * 100 + 1 && ep.number <= (selectedChunk + 1) * 100)
                : episodes
              ).map((ep) => {
                const epHasSub = isSubAvailable(subDubInfo, ep.number);
                const epHasDub = isDubAvailable(subDubInfo, ep.number);
                const defaultStreamType = epHasSub ? "sub" : "dub";
                const isWatched = isEpisodeWatched(anime.id, ep.number);
                const progress = getEpisodeProgress(anime.id, ep.number);

                return (
                  <div
                    key={ep.id}
                    className={cn(
                      "group flex items-center justify-between gap-3 p-3 rounded-xl glass border transition-all active:bg-secondary/40 touch-manipulation",
                      isWatched
                        ? "border-primary/30 bg-primary/5 hover:border-primary/50"
                        : "border-transparent hover:border-border/60 hover:bg-secondary/50"
                    )}
                  >
                    <Link
                      to={`/watch/${anime.id}/${ep.number}`}
                      state={{ streamType: defaultStreamType }}
                      className="flex items-center gap-3 min-w-0 flex-1"
                    >
                      <div className="relative w-28 aspect-video rounded-lg overflow-hidden shrink-0 bg-secondary flex items-center justify-center">
                        <img
                          src={anime.main_picture?.large || anime.main_picture?.medium}
                          alt={`Episode ${ep.number}`}
                          className={cn(
                            "w-full h-full object-cover blur-sm transition-transform lg:group-hover:scale-105",
                            isWatched ? "opacity-75" : "opacity-50"
                          )}
                        />
                        <span className="absolute font-bold text-white text-sm z-10">EP {ep.number}</span>
                        <div className="absolute inset-0 bg-black/20 lg:group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <Play className="w-5 h-5 text-white opacity-80 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity fill-current z-10" />
                        </div>

                        {/* Visual Progress Bar at bottom of thumbnail */}
                        {(isWatched || progress > 0) && (
                          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/70 z-20 overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-300 shadow-sm"
                              style={{ width: `${progress > 0 ? progress : 100}%` }}
                            />
                          </div>
                        )}

                        {/* Top-Right Watched Check Badge */}
                        {isWatched && (
                          <div className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-md z-20" title="Watched">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={cn("text-xs font-semibold", isWatched ? "text-primary" : "text-muted-foreground")}>
                            Episode {ep.number}
                          </span>
                          {ep.filler && <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase">Filler</span>}
                          {ep.recap && <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-bold uppercase">Recap</span>}
                        </div>
                        <h3 className="text-sm font-medium line-clamp-2 mt-0.5 lg:group-hover:text-primary transition-colors" title={ep.title}>
                          {ep.title}
                        </h3>
                      </div>
                    </Link>

                    {/* Explicit SUB and DUB buttons (only rendered if available) & Mark Watched toggle */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleEpisodeWatched(anime.id, ep.number);
                        }}
                        title={isWatched ? "Mark as unwatched" : "Mark as watched"}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-all border touch-manipulation min-h-[36px] min-w-[36px]",
                          isWatched
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30"
                            : "bg-secondary/60 text-muted-foreground border-border/40 hover:text-foreground hover:bg-secondary"
                        )}
                      >
                        <Check className={cn("w-4 h-4", isWatched ? "stroke-[3]" : "opacity-60")} />
                      </button>

                      {epHasSub && (
                        <Link
                          to={`/watch/${anime.id}/${ep.number}`}
                          state={{ streamType: "sub" }}
                          title={`Play Episode ${ep.number} SUB`}
                          className="px-3 py-1.5 rounded-lg bg-secondary/80 hover:bg-primary active:bg-primary active:scale-95 hover:text-white border border-border/50 text-muted-foreground text-[11px] font-extrabold uppercase transition-all touch-manipulation min-h-[36px] flex items-center justify-center"
                        >
                          SUB
                        </Link>
                      )}
                      {epHasDub && (
                        <Link
                          to={`/watch/${anime.id}/${ep.number}`}
                          state={{ streamType: "dub" }}
                          title={`Play Episode ${ep.number} DUB`}
                          className="px-3 py-1.5 rounded-lg bg-secondary/80 hover:bg-primary active:bg-primary active:scale-95 hover:text-white border border-border/50 text-muted-foreground text-[11px] font-extrabold uppercase transition-all touch-manipulation min-h-[36px] flex items-center justify-center"
                        >
                          DUB
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-muted-foreground bg-secondary/30 p-6 rounded-2xl border border-border/40 text-center text-sm font-medium">
              {anime.status === "not_yet_aired"
                ? "This series has not aired yet. Check back once episodes are released!"
                : "No aired episodes available yet."}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
