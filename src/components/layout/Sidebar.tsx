import { Link, useLocation } from "react-router";
import { Home, Compass, Bookmark } from "lucide-react";
import { cn } from "../../utils/cn";

const NAV_ITEMS = [
  { name: "Home", path: "/", icon: Home },
  { name: "Discover", path: "/discover", icon: Compass },
  { name: "Watchlist", path: "/watchlist", icon: Bookmark },
];

export default function Sidebar({ className }: { className?: string }) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "w-[280px] lg:w-[280px] md:w-[80px] flex-col border-r border-border/40 glass z-30 transition-all duration-300",
        className
      )}
    >
      <div className="p-6 flex items-center justify-center md:justify-start lg:justify-start">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <span className="font-display font-bold text-xl tracking-tighter text-white">O</span>
          </div>
          <span className="font-display font-bold text-xl tracking-wide hidden lg:block md:hidden">
            openAnime
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-8 no-scrollbar">
        <div className="px-4">
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 hidden lg:block md:hidden">
            Menu
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                    isActive 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-muted-foreground lg:hover:text-foreground lg:hover:bg-secondary/50"
                  )}
                  title={item.name}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                  )}
                  <item.icon className={cn("w-5 h-5 shrink-0 transition-transform duration-300", isActive ? "scale-110" : "lg:group-lg:hover:scale-110")} />
                  <span className="hidden lg:block md:hidden">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
