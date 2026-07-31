import React from "react";
import { Play, Plus, Info, Check } from "lucide-react";
import { Link } from "react-router";
import { cn } from "../../utils/cn";
import { useWatchlist } from "../../context/WatchlistContext";
import { WATCHLIST_STATUS_CONFIG } from "../../utils/watchlistStatus";

interface HeroBannerProps {
  anime: {
    id: string;
    title: string;
    subtitle?: string;
    description: string;
    coverImage: string;
    logoImage?: string;
    genres: string[];
    rating: string;
    year: string;
  };
}

export default function HeroBanner({ anime }: HeroBannerProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, getWatchlistItem } = useWatchlist();
  const saved = isInWatchlist(anime.id);
  const watchlistItem = getWatchlistItem(anime.id);

  const currentStatus = watchlistItem?.status || "Plan to Watch";
  const statusConfig = WATCHLIST_STATUS_CONFIG[currentStatus];
  const StatusIcon = statusConfig?.icon || Check;

  const handleToggleList = (e: React.MouseEvent) => {
    e.preventDefault();
    if (saved) {
      removeFromWatchlist(anime.id);
    } else {
      addToWatchlist({
        id: anime.id,
        title: anime.title,
        subtitle: anime.subtitle,
        image: anime.coverImage,
        score: anime.rating,
        type: "TV",
        status: "Plan to Watch",
        genres: anime.genres,
      });
    }
  };

  return (
    <div className="relative w-full h-[60vh] md:h-[70vh] min-h-[400px] flex items-end pb-12 md:pb-24 pt-32 px-6 md:px-12 group">
      {/* Background Image with Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={anime.coverImage || "https://images.unsplash.com/photo-1542451313056-b7c8e6266459?w=1600&h=900&fit=crop"}
          alt={anime.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out lg:group-lg:hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl flex flex-col gap-4 md:gap-6">
        <div className="flex items-center gap-3 text-xs md:text-sm font-medium">
          <span className="px-2 py-1 rounded bg-primary/20 text-primary border border-primary/20 backdrop-blur-md">
            New Episode
          </span>
          <span className="text-muted-foreground">{anime.year}</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span className="text-accent">{anime.rating}</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <div className="flex gap-2">
            {anime.genres.slice(0, 3).map((genre) => (
              <span key={genre} className="text-muted-foreground">{genre}</span>
            ))}
          </div>
        </div>

        {anime.logoImage ? (
          <img src={anime.logoImage} alt={anime.title} className="h-16 md:h-24 object-contain origin-left" />
        ) : (
          <div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black tracking-tight text-white drop-shadow-lg">
              {anime.title}
            </h1>
            {anime.subtitle && (
              <p className="text-base md:text-xl font-medium text-white/70 mt-1 drop-shadow">
                {anime.subtitle}
              </p>
            )}
          </div>
        )}

        <p className="text-sm md:text-base text-foreground/80 line-clamp-2 md:line-clamp-3 max-w-2xl drop-shadow">
          {anime.description}
        </p>

        <div className="flex items-center gap-3 mt-2">
          <Link
            to={`/anime/${anime.id}`}
            className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-black font-semibold lg:hover:bg-white/90 active:scale-95 transition-all shadow-lg shadow-white/10 touch-manipulation min-h-[48px]"
          >
            <Play className="w-5 h-5 fill-current" />
            Watch Now
          </Link>

          <button
            onClick={handleToggleList}
            aria-label={saved ? `Remove from My List (${currentStatus})` : "Add to My List"}
            className={cn(
              "flex items-center gap-2 px-6 py-3.5 rounded-full transition-all font-semibold border active:scale-95 touch-manipulation min-h-[48px] cursor-pointer shadow-lg",
              saved
                ? statusConfig.activeButtonClass
                : "glass border-white/10 lg:hover:bg-white/10 text-white"
            )}
          >
            {saved ? (
              <>
                <StatusIcon className="w-5 h-5 shrink-0" />
                <span>In My List</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 shrink-0" />
                <span className="hidden md:inline">My List</span>
                <span className="md:hidden">Add</span>
              </>
            )}
          </button>

          <Link
            to={`/anime/${anime.id}`}
            className="w-12 h-12 rounded-full glass lg:hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center text-white md:hidden touch-manipulation shrink-0"
            aria-label="Anime details"
          >
            <Info className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
