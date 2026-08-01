import { RouterProvider } from "react-router";
import { router } from "./routes";
import { WatchlistProvider } from "./context/WatchlistContext";
import { ContinueWatchingProvider } from "./context/ContinueWatchingContext";

function App() {
  return (
    <WatchlistProvider>
      <ContinueWatchingProvider>
        <RouterProvider router={router} />
      </ContinueWatchingProvider>
    </WatchlistProvider>
  );
}

export default App;
