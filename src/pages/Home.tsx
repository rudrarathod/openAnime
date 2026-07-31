import { useEffect, useState, useMemo } from "react";
import HeroBanner from "../components/ui/HeroBanner";
import Carousel from "../components/ui/Carousel";
import ContinueWatchingSection from "../components/ui/ContinueWatchingSection";
import RecommendationsSection from "../components/ui/RecommendationsSection";
import { fetchMalRanking, MalAnime } from "../api/mal";
import { AnimeProp } from "../components/ui/AnimeCard";
import { HeroBannerSkeleton, CarouselSkeleton } from "../components/ui/Skeletons";
import { getFormattedAnimeTitles } from "../utils/title";

const RANKING_CATEGORIES = [
  { id: "airing", title: "Top Airing Anime", type: "airing" },
  { id: "bypopularity", title: "Top Anime by Popularity", type: "bypopularity" },
  { id: "upcoming", title: "Top Upcoming Anime", type: "upcoming" },
  { id: "favorite", title: "Top Favorited Anime", type: "favorite" },
  { id: "tv", title: "Top Anime TV Series", type: "tv" },
  { id: "movie", title: "Top Anime Movies", type: "movie" },
  { id: "ova", title: "Top Anime OVA Series", type: "ova" },
  { id: "special", title: "Top Anime Specials", type: "special" },
  { id: "all", title: "Top Anime Series", type: "all" },
];

export default function Home() {
  const [rankings, setRankings] = useState<Record<string, AnimeProp[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      const formatAnime = (items: MalAnime[]) => items.map(item => {
        const titles = getFormattedAnimeTitles(item);
        return {
          id: item.id.toString(),
          title: titles.title,
          subtitle: titles.subtitle,
          image: item.main_picture?.large || item.main_picture?.medium,
          score: item.mean || "N/A",
          type: item.media_type?.toUpperCase() || "TV",
          rating: item.rating,
          genres: item.genres?.map((g: any) => typeof g === "string" ? g : g.name) || [],
        };
      });

      // Fetch all ranking categories concurrently
      const results = await Promise.all(
        RANKING_CATEGORIES.map(cat => fetchMalRanking(cat.type, 15))
      );

      const newRankings: Record<string, AnimeProp[]> = {};
      RANKING_CATEGORIES.forEach((cat, index) => {
        newRankings[cat.id] = formatAnime(results[index]);
      });

      setRankings(newRankings);
      setLoading(false);
    }
    loadData();
  }, []);

  const candidatePool = useMemo(() => {
    return Object.values(rankings).flat();
  }, [rankings]);

  const heroItems = rankings["airing"] || rankings["bypopularity"] || [];
  const heroData = heroItems.length > 0 ? {
    id: heroItems[0].id.toString(),
    title: heroItems[0].title,
    subtitle: heroItems[0].subtitle,
    description: "Check out the most popular series streaming right now!", 
    coverImage: heroItems[0].image || "https://images.unsplash.com/photo-1542451313056-b7c8e6266459?w=1600&h=900&fit=crop",
    genres: ["Trending", "Popular"],
    rating: heroItems[0].score?.toString() || "N/A",
    year: new Date().getFullYear().toString()
  } : {
    id: "1",
    title: "Loading...",
    description: "Please wait...",
    coverImage: "https://images.unsplash.com/photo-1542451313056-b7c8e6266459?w=1600&h=900&fit=crop",
    genres: [],
    rating: "",
    year: ""
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 pb-12 min-h-screen">
        <HeroBannerSkeleton />
        <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 mt-[-40px] md:mt-[-80px] z-10 relative">
          <CarouselSkeleton title="Top Airing Anime" />
          <CarouselSkeleton title="Top Anime by Popularity" />
          <CarouselSkeleton title="Top Anime TV Series" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12 min-h-screen">
      <HeroBanner anime={heroData} />
      
      <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 mt-[-40px] md:mt-[-80px] z-10 relative">
        <ContinueWatchingSection />
        <RecommendationsSection candidatePool={candidatePool} />

        {RANKING_CATEGORIES.map((cat) => {
          const items = rankings[cat.id];
          if (!items || items.length === 0) return null;
          
          return (
            <Carousel 
              key={cat.id}
              title={cat.title} 
              items={items} 
              layout="portrait" 
            />
          );
        })}
      </div>
    </div>
  );
}
