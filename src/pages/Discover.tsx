import { useState, useEffect } from "react";
import { Compass, Loader2, Sparkles, Filter } from "lucide-react";
import { ANIME_GENRES, fetchAnimeByGenre, Genre } from "../api/mal";
import AnimeCard, { AnimeProp } from "../components/ui/AnimeCard";
import { AnimeCardSkeleton } from "../components/ui/Skeletons";

export default function Discover() {
  const [selectedGenre, setSelectedGenre] = useState<Genre>(ANIME_GENRES[0]);
  const [animeList, setAnimeList] = useState<AnimeProp[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setPage(1);
    setHasMore(true);

    async function loadGenreAnime() {
      try {
        const res = await fetchAnimeByGenre(selectedGenre.id, 1, 24);
        if (!isMounted) return;

        const mapped: AnimeProp[] = res.map((item) => ({
          id: item.id.toString(),
          title: item.title,
          subtitle: item.alternative_titles?.ja || item.alternative_titles?.en || "",
          image: item.main_picture?.large || item.main_picture?.medium || "",
          score: item.mean || "N/A",
          type: item.media_type?.toUpperCase() || "TV",
          rating: item.rating,
          genres: item.genres?.map((g) => g.name) || [],
        }));

        setAnimeList(mapped);
        if (mapped.length < 20) setHasMore(false);
      } catch (err) {
        console.error("Failed to fetch anime by genre:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadGenreAnime();

    return () => {
      isMounted = false;
    };
  }, [selectedGenre]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const res = await fetchAnimeByGenre(selectedGenre.id, nextPage, 24);
      const mapped: AnimeProp[] = res.map((item) => ({
        id: item.id.toString(),
        title: item.title,
        subtitle: item.alternative_titles?.ja || item.alternative_titles?.en || "",
        image: item.main_picture?.large || item.main_picture?.medium || "",
        score: item.mean || "N/A",
        type: item.media_type?.toUpperCase() || "TV",
        rating: item.rating,
        genres: item.genres?.map((g) => g.name) || [],
      }));

      if (mapped.length === 0) {
        setHasMore(false);
      } else {
        setAnimeList((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const newItems = mapped.filter((a) => !existingIds.has(a.id));
          return [...prev, ...newItems];
        });
        setPage(nextPage);
        if (mapped.length < 20) setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more genre anime:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full min-h-screen pb-16">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
            Discover Anime
          </h1>
        </div>
        <p className="text-sm text-muted-foreground pl-0.5">
          Explore top-rated anime across various genres and categories
        </p>
      </div>

      {/* Genre Pills Container */}
      <div className="flex flex-col gap-2 bg-secondary/20 p-3 sm:p-4 rounded-2xl border border-border/40">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
          <Filter className="w-3.5 h-3.5 text-primary" />
          <span>Select Genre</span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {ANIME_GENRES.map((genre) => {
            const isSelected = selectedGenre.id === genre.id;
            return (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/30"
                }`}
              >
                {genre.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Genre Header Indicator */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="text-lg sm:text-xl font-bold font-display">
            {selectedGenre.name} Anime
          </h2>
          {!loading && (
            <span className="text-xs text-muted-foreground bg-secondary/60 px-2.5 py-0.5 rounded-full border border-border/30">
              {animeList.length} items
            </span>
          )}
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 md:gap-5">
          {Array.from({ length: 18 }).map((_, i) => (
            <AnimeCardSkeleton key={i} />
          ))}
        </div>
      ) : animeList.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 md:gap-5">
            {animeList.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-6">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border/60 text-sm font-medium transition-all cursor-pointer disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>Load More {selectedGenre.name} Anime</span>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
          <Compass className="w-12 h-12 opacity-40" />
          <p className="text-base font-medium">No anime found for {selectedGenre.name}</p>
          <p className="text-xs text-muted-foreground/80">
            Try selecting a different genre above.
          </p>
        </div>
      )}
    </div>
  );
}
