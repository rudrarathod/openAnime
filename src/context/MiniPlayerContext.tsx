import { createContext, useContext, useState, ReactNode } from "react";

export interface ActiveStream {
  animeId: string;
  epId: number;
  streamType: "sub" | "dub";
  title: string;
  epTitle: string;
  image: string;
}

interface MiniPlayerContextType {
  activeStream: ActiveStream | null;
  isMinimized: boolean;
  playStream: (stream: ActiveStream) => void;
  minimize: () => void;
  expand: () => void;
  close: () => void;
}

const MiniPlayerContext = createContext<MiniPlayerContextType | undefined>(undefined);

export function MiniPlayerProvider({ children }: { children: ReactNode }) {
  const [activeStream, setActiveStream] = useState<ActiveStream | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const playStream = (stream: ActiveStream) => {
    setActiveStream(stream);
  };

  const minimize = () => {
    if (activeStream) {
      setIsMinimized(true);
    }
  };

  const expand = () => {
    setIsMinimized(false);
  };

  const close = () => {
    setIsMinimized(false);
    setActiveStream(null);
  };

  return (
    <MiniPlayerContext.Provider
      value={{
        activeStream,
        isMinimized,
        playStream,
        minimize,
        expand,
        close,
      }}
    >
      {children}
    </MiniPlayerContext.Provider>
  );
}

export function useMiniPlayer() {
  const context = useContext(MiniPlayerContext);
  if (!context) {
    throw new Error("useMiniPlayer must be used within a MiniPlayerProvider");
  }
  return context;
}
