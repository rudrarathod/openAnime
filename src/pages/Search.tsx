import { Search as SearchIcon, X, TrendingUp, Clock, Trash2, SlidersHorizontal, ArrowUpDown, Filter, Star } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router";
import AnimeCard, { AnimeProp } from "../components/ui/AnimeCard";
import { fetchMalSearch, fetchMalRanking, MalAnime, MAL_MIN_QUERY_LENGTH } from "../api/mal";
import { useDebounce } from "../hooks/useDebounce";
import { useRecentSearches } from "../hooks/useRecentSearches";
import { AnimeGridSkeleton, Skeleton } from "../components/ui/Skeletons";
import { getFormattedAnimeTitles } from "../utils/title";
import { cn } from "../utils/cn";
import CustomSelect, { CustomSelectOption } from "../components/ui/CustomSelect";

const SCORE_OPTIONS: CustomSelectOption<number>[] = [
  { label: "Any Rating", value: 0 },
  { label: "8.0+ Rating", value: 8.0 },
  { label: "7.0+ Rating", value: 7.0 },
  { label: "6.0+ Rating", value: 6.0 },
];

const SORT_OPTIONS: CustomSelectOption<"relevance" | "score" | "title">[] = [
  { label: "Relevance", value: "relevance" },
  { label: "Highest Rated", value: "score" },
  { label: "Title (A-Z)", value: "title" },
];

export default function Search() {
  // The URL ?q= param is the shared source of truth with the TopBar search.
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [input, setInput] = useState(query);
  const debouncedInput = useDebounce(input, 400);

  const [results, setResults] = useState<AnimeProp[]>([]);
  const [trending, setTrending] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Search Filter States
  const [formatFilter, setFormatFilter] = useState("all");
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState<"relevance" | "score" | "title">("relevance");

  const { recentSearches, addSearch, removeSearch, clearSearches } = useRecentSearches();

  const isSearching = query.length > 0;
  const isQueryTooShort = query.trim().length > 0 && query.trim().length < MAL_MIN_QUERY_LENGTH;

  useEffect(() => {
    // Load trending tags once
    async function loadTrending() {
      const data = await fetchMalRanking("bypopularity", 5);
      setTrending(data.map((item) => getFormattedAnimeTitles(item).title));
    }
    loadTrending();
  }, []);

  // Keep the field in sync when the URL query changes elsewhere (TopBar, quick tags).
  useEffect(() => {
    setInput(query);
  }, [query]);

  // Push the debounced input into the URL so both search inputs stay synchronized.
  useEffect(() => {
    const value = debouncedInput.trim();
    if (value === query) return;
    setSearchParams(value ? { q: value } : {}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput]);

  // Run the search whenever the committed URL query changes.
  useEffect(() => {
    async function searchAnime() {
      if (!query) {
        setResults([]);
        return;
      }

      if (query.trim().length >= MAL_MIN_QUERY_LENGTH) {
        addSearch(query.trim());
      }

      setLoading(true);
      const data = await fetchMalSearch(query, 36);

      const formatted = data.map((item: MalAnime) => {
        const titles = getFormattedAnimeTitles(item);
        return {
          id: item.id.toString(),
          title: titles.title,
          subtitle: titles.subtitle,
          image: item.main_picture?.large || item.main_picture?.medium,
          score: item.mean || "N/A",
          type: item.media_type?.toUpperCase() || "TV",
          genres: item.genres?.map((g) => g.name) || [],
          status: item.status || "",
          rating: item.rating,
        };
      });

      setResults(formatted);
      setLoading(false);
    }
    searchAnime();
  }, [query, addSearch]);

  const handleQuickSearch = (term: string) => {
    addSearch(term);
    setSearchParams({ q: term });
  };

  const handleClear = () => {
    setInput("");
    setSearchParams({});
  };

  // Filter & Sort results
  const filteredResults = useMemo(() => {
    return results
      .filter((anime) => {
        // Format filter
        if (formatFilter !== "all") {
          const type = (anime.type || "").toUpperCase();
          if (type !== formatFilter.toUpperCase()) return false;
        }
        // Rating filter
        if (minScore > 0) {
          const numScore = typeof anime.score === "number" ? anime.score : parseFloat(String(anime.score || 0));
          if (isNaN(numScore) || numScore < minScore) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "score") {
          const scoreA = parseFloat(String(a.score || 0)) || 0;
          const scoreB = parseFloat(String(b.score || 0)) || 0;
          return scoreB - scoreA;
        }
        if (sortBy === "title") {
          return a.title.localeCompare(b.title);
        }
        return 0; // default relevance
      });
  }, [results, formatFilter, minScore, sortBy]);

  const hasActiveFilters = formatFilter !== "all" || minScore > 0 || sortBy !== "relevance";

  const resetFilters = () => {
    setFormatFilter("all");
    setMinScore(0);
    setSortBy("relevance");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="p-6 md:p-12">
        {!isSearching ? (
          <div className="flex flex-col gap-10 max-w-3xl">
            {/* Recent Searches */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent Searches
                </h2>
                {recentSearches.length > 0 && (
                  <button
                    onClick={clearSearches}
                    className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1.5 transition-colors px-2 py-1 rounded-md hover:bg-destructive/10"
                    title="Clear recent searches"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear all</span>
                  </button>
                )}
              </div>
              {recentSearches.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      className="group flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-xl bg-secondary/50 lg:hover:bg-secondary text-sm transition-all border border-border/40 lg:hover:border-border"
                    >
                      <button
                        onClick={() => handleQuickSearch(term)}
                        className="font-medium text-foreground text-left"
                      >
                        {term}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSearch(term);
                        }}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary-foreground/10 transition-colors"
                        title="Remove search"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/70 italic">No recent searches yet.</p>
              )}
            </section>

            {/* Trending Searches */}
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Trending Searches
              </h2>
              <div className="flex flex-col gap-2">
                {trending.length > 0 ? (
                  trending.map((term, i) => (
                    <button
                      key={term}
                      onClick={() => handleQuickSearch(term)}
                      className="flex items-center gap-4 p-3 rounded-xl lg:hover:bg-secondary/50 transition-colors text-left group"
                    >
                      <span className="w-6 text-center text-sm font-bold text-muted-foreground lg:group-hover:text-primary transition-colors">
                        {i + 1}
                      </span>
                      <span className="font-medium line-clamp-1">{term}</span>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/20">
                        <Skeleton className="w-6 h-4" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
              <h2 className="text-xl font-medium">
                Results for <span className="font-bold text-primary">"{query}"</span>
              </h2>

              {/* Filters & Sorting Bar */}
              {!isQueryTooShort && results.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {/* Format Selector */}
                  <div className="flex items-center gap-1 bg-secondary/40 p-1 rounded-xl border border-border/40 text-xs">
                    {["all", "TV", "MOVIE", "OVA", "SPECIAL"].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setFormatFilter(fmt)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg font-medium transition-colors uppercase",
                          formatFilter === fmt
                            ? "bg-primary text-white shadow-sm font-bold"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {fmt === "all" ? "All" : fmt}
                      </button>
                    ))}
                  </div>

                  {/* Rating Score Selector */}
                  <CustomSelect
                    options={SCORE_OPTIONS}
                    value={minScore}
                    onChange={(val) => setMinScore(val)}
                    size="sm"
                    variant={minScore > 0 ? "badge" : "glass"}
                    icon={<Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                  />

                  {/* Sort Order Selector */}
                  <CustomSelect
                    options={SORT_OPTIONS}
                    value={sortBy}
                    onChange={(val) => setSortBy(val)}
                    size="sm"
                    variant="glass"
                    icon={<ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />}
                  />

                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="text-xs text-muted-foreground hover:text-destructive px-2 py-1 rounded-lg hover:bg-destructive/10 transition-colors"
                      title="Reset filters"
                    >
                      Reset
                    </button>
                  )}
                </div>
              )}
            </div>

            {isQueryTooShort ? (
              <div className="py-20 text-center text-muted-foreground">
                Keep typing — enter at least {MAL_MIN_QUERY_LENGTH} characters to search.
              </div>
            ) : loading ? (
              <AnimeGridSkeleton count={12} />
            ) : filteredResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {filteredResults.map((anime) => (
                  <AnimeCard key={anime.id} anime={anime} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center">
                <Filter className="w-10 h-10 text-muted-foreground/50 mb-3" />
                <p className="font-medium text-base">No matching results found</p>
                <p className="text-sm text-muted-foreground/80 mt-1 max-w-sm">
                  Try adjusting your format or score filters, or try a different search term.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="mt-4 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
