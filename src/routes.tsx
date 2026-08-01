import { createBrowserRouter, Navigate } from "react-router";
import RootLayout from "./components/layout/RootLayout";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Search from "./pages/Search";
import Watchlist from "./pages/Watchlist";
import AnimeDetails from "./pages/AnimeDetails";
import VideoPlayer from "./pages/VideoPlayer";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "discover", element: <Discover /> },
      { path: "search", element: <Search /> },
      { path: "watchlist", element: <Watchlist /> },
      { path: "anime/:id", element: <AnimeDetails /> },
      { path: "*", element: <div className="p-12 text-center text-xl text-muted-foreground">Page Not Found</div>}
    ],
  },
  {
    path: "/watch/:animeId/:epId",
    element: <VideoPlayer />
  }
]);
