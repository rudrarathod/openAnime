import { Link, useLocation } from "react-router";
import { Home, Compass, Bookmark } from "lucide-react";
import { cn } from "../../utils/cn";

const NAV_ITEMS = [
  { name: "Home", path: "/", icon: Home },
  { name: "Discover", path: "/discover", icon: Compass },
  { name: "Watchlist", path: "/watchlist", icon: Bookmark },
];

export default function BottomNav({ className }: { className?: string }) {
  const location = useLocation();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 h-20 glass border-t border-border/40 z-40 pb-safe",
        className
      )}
    >
      <div className="flex items-center justify-around h-full px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className="flex flex-col items-center justify-center min-w-[64px] h-full gap-1 group active:scale-95 transition-transform touch-manipulation"
            >
              <div
                className={cn(
                  "flex items-center justify-center w-12 h-8 rounded-full transition-all duration-300",
                  isActive ? "bg-primary/20 text-primary font-bold shadow-sm" : "text-muted-foreground group-active:text-foreground group-hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "scale-110" : "")} />
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium transition-colors",
                  isActive ? "text-primary font-bold" : "text-muted-foreground group-active:text-foreground group-hover:text-foreground"
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
