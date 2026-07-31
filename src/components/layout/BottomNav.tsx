import { Link, useLocation } from "react-router";
import { Home, Compass, Search, Bookmark } from "lucide-react";
import { cn } from "../../utils/cn";

const NAV_ITEMS = [
  { name: "Home", path: "/", icon: Home },
  { name: "Discover", path: "/discover", icon: Compass },
  { name: "Search", path: "/search", icon: Search },
  { name: "Watchlist", path: "/watchlist", icon: Bookmark },
];

export default function BottomNav({ className }: { className?: string }) {
  const location = useLocation();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 h-16 bg-[#0c0c0e]/95 backdrop-blur-2xl border-t border-white/10 z-50 shadow-[0_-8px_32px_rgba(0,0,0,0.8)] pb-safe transition-all",
        className
      )}
    >
      <div className="grid grid-cols-4 items-center h-full px-2 max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === "/search" && location.pathname.startsWith("/search"));

          return (
            <Link
              key={item.name}
              to={item.path}
              className="flex flex-col items-center justify-center h-full gap-1 group active:scale-95 transition-transform touch-manipulation cursor-pointer"
            >
              <div
                className={cn(
                  "flex items-center justify-center w-12 h-7 rounded-full transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 font-bold"
                    : "text-muted-foreground group-hover:text-foreground group-active:bg-white/10"
                )}
              >
                <item.icon
                  className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    isActive ? "scale-110 stroke-[2.5]" : "stroke-[1.8]"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold tracking-tight transition-colors",
                  isActive ? "text-primary font-bold" : "text-muted-foreground group-hover:text-foreground"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
