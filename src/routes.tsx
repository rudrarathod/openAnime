import { createBrowserRouter, Link, useRouteError } from "react-router";
import RootLayout from "./components/layout/RootLayout";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Search from "./pages/Search";
import Watchlist from "./pages/Watchlist";
import AnimeDetails from "./pages/AnimeDetails";
import VideoPlayer from "./pages/VideoPlayer";
import { AlertTriangle, Home as HomeIcon } from "lucide-react";

function RouteErrorBoundary() {
  const error: any = useRouteError();
  console.error("Route error:", error);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold font-display">Something went wrong</h1>
      <p className="text-sm text-muted-foreground max-w-md mt-2">
        {error?.message || "An unexpected error occurred while loading this page."}
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 rounded-xl bg-primary text-white font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
      >
        <HomeIcon className="w-4 h-4" />
        Return to Home
      </Link>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Home /> },
      { path: "discover", element: <Discover /> },
      { path: "search", element: <Search /> },
      { path: "watchlist", element: <Watchlist /> },
      { path: "anime/:id", element: <AnimeDetails /> },
      { path: "*", element: <div className="p-12 text-center text-xl text-muted-foreground">Page Not Found</div> }
    ],
  },
  {
    path: "/watch/:animeId/:epId",
    element: <VideoPlayer />,
    errorElement: <RouteErrorBoundary />
  }
]);
