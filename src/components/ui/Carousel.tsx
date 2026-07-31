import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import AnimeCard, { AnimeProp } from "./AnimeCard";
import { cn } from "../../utils/cn";

interface CarouselProps {
  title: string;
  subtitle?: React.ReactNode;
  items: AnimeProp[];
  layout?: "portrait" | "landscape";
  className?: string;
}

export default function Carousel({ title, subtitle, items, layout = "portrait", className }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeft(scrollLeft > 0);
    setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, [items]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    const scrollAmount = direction === "left" ? -clientWidth + 100 : clientWidth - 100;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <div className={cn("relative flex flex-col gap-2.5 sm:gap-3 py-1", className)}>
      <div className="flex items-end justify-between px-4 sm:px-6 md:px-12">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight">{title}</h2>
          {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button 
            onClick={() => scroll("left")} 
            disabled={!showLeft}
            aria-label="Scroll left"
            className="w-9 h-9 rounded-full glass flex items-center justify-center disabled:opacity-30 lg:hover:bg-secondary active:scale-90 transition-all touch-manipulation"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => scroll("right")}
            disabled={!showRight}
            aria-label="Scroll right"
            className="w-9 h-9 rounded-full glass flex items-center justify-center disabled:opacity-30 lg:hover:bg-secondary active:scale-90 transition-all touch-manipulation"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative group overflow-hidden">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto gap-3.5 sm:gap-4 px-4 sm:px-6 md:px-12 scroll-pl-4 sm:scroll-pl-6 md:scroll-pl-12 pb-3 sm:pb-4 pt-1 no-scrollbar snap-x snap-mandatory touch-pan-x overscroll-x-contain"
        >
          {items.map((item) => (
            <div 
              key={item.id} 
              className={cn(
                "snap-start shrink-0",
                layout === "portrait" ? "w-[140px] md:w-[180px] lg:w-[220px]" : "w-[240px] md:w-[320px] lg:w-[400px]"
              )}
            >
              <AnimeCard anime={item} layout={layout} />
            </div>
          ))}
        </div>
        
        {/* Mobile fading edges */}
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />
      </div>
    </div>
  );
}
