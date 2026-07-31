import { Search as SearchIcon, X } from "lucide-react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { useRecentSearches } from "../../hooks/useRecentSearches";

export default function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { addSearch } = useRecentSearches();

  const urlQuery = searchParams.get("q") || "";
  const [input, setInput] = useState(urlQuery);
  const debounced = useDebounce(input, 400);

  const onSearchPage = location.pathname === "/search";

  // Keep the field in sync when the URL query changes elsewhere (Search page, quick tags).
  useEffect(() => {
    setInput(urlQuery);
  }, [urlQuery]);

  // Live search: push the debounced value into the URL, navigating to /search as needed.
  useEffect(() => {
    const value = debounced.trim();
    if (value === urlQuery) return;
    if (value) {
      navigate(`/search?q=${encodeURIComponent(value)}`, { replace: onSearchPage });
    } else if (onSearchPage) {
      navigate("/search", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = input.trim();
    if (value) {
      addSearch(value);
      navigate(`/search?q=${encodeURIComponent(value)}`);
    } else {
      navigate("/search");
    }
  };

  const handleClear = () => {
    setInput("");
    if (onSearchPage) navigate("/search", { replace: true });
  };

  const handleFocus = () => {
    if (!onSearchPage) {
      const value = input.trim();
      if (value) {
        navigate(`/search?q=${encodeURIComponent(value)}`);
      } else {
        navigate("/search");
      }
    }
  };

  return (
    <header className="h-20 shrink-0 sticky top-0 z-20 glass border-b border-border/40 px-4 sm:px-6 flex items-center justify-between gap-3">
      {/* Brand / Logo */}
      <Link to="/" className="flex items-center gap-2.5 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/20">
          <span className="font-display font-bold text-base text-white">O</span>
        </div>
        <span className="font-display font-bold text-lg hidden sm:inline-block bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          openAnime
        </span>
      </Link>

      {/* Search Bar (Mobile & Desktop) */}
      <div className="flex-1 flex items-center max-w-xl">
        <form onSubmit={handleSubmit} className="relative w-full group">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
            <SearchIcon className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            value={input}
            onFocus={handleFocus}
            onClick={handleFocus}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search anime, genres..."
            className="w-full h-10 md:h-12 bg-secondary/30 border border-border/50 rounded-full pl-10 md:pl-12 pr-10 md:pr-12 text-sm outline-none focus:border-primary/50 focus:bg-secondary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/70"
          />
          {input && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="absolute inset-y-0 right-2.5 my-auto h-7 w-7 md:h-8 md:w-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          )}
        </form>
      </div>
    </header>
  );
}
