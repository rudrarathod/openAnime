import { RouterProvider } from "react-router";
import { router } from "./routes";
import { WatchlistProvider } from "./context/WatchlistContext";
import { ContinueWatchingProvider } from "./context/ContinueWatchingContext";
import { MiniPlayerProvider } from "./context/MiniPlayerContext";

function App() {
  return (
    <WatchlistProvider>
      <ContinueWatchingProvider>
        <MiniPlayerProvider>
          <RouterProvider router={router} />
        </MiniPlayerProvider>
      </ContinueWatchingProvider>
    </WatchlistProvider>
  );
}

export default App;
