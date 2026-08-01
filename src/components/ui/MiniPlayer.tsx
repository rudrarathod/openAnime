import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Maximize2, X, GripHorizontal, Scaling } from "lucide-react";
import { useMiniPlayer } from "../../context/MiniPlayerContext";
import { cn } from "../../utils/cn";

export default function MiniPlayer() {
  const { activeStream, isMinimized, expand, close } = useMiniPlayer();
  const navigate = useNavigate();
  const location = useLocation();

  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [playerWidth, setPlayerWidth] = useState<number>(340);

  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const resizeStart = useRef<{ width: number; x: number }>({ width: 340, x: 0 });
  const elementPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const playerRef = useRef<HTMLDivElement>(null);

  const isCurrentWatchPage = location.pathname === `/watch/${activeStream?.animeId}/${activeStream?.epId}`;

  // Reset position & width when stream changes or player closes
  useEffect(() => {
    if (!isMinimized) {
      setPosition(null);
    }
  }, [isMinimized, activeStream?.animeId, activeStream?.epId]);

  if (!isMinimized || !activeStream || isCurrentWatchPage) {
    return null;
  }

  // --- Drag Handlers ---
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== undefined && e.button !== 0) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };

    if (playerRef.current) {
      const rect = playerRef.current.getBoundingClientRect();
      elementPos.current = { x: rect.left, y: rect.top };
      if (!position) {
        setPosition({ x: rect.left, y: rect.top });
      }
    }

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;

    const newX = elementPos.current.x + deltaX;
    const newY = elementPos.current.y + deltaY;

    const pWidth = playerRef.current?.offsetWidth || playerWidth;
    const pHeight = playerRef.current?.offsetHeight || (playerWidth * 9) / 16 + 40;
    const maxX = window.innerWidth - pWidth - 8;
    const maxY = window.innerHeight - pHeight - 8;

    const boundedX = Math.max(8, Math.min(maxX, newX));
    const boundedY = Math.max(8, Math.min(maxY, newY));

    setPosition({ x: boundedX, y: boundedY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging.current) {
      isDragging.current = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {
        // ignore
      }
    }
  };

  // --- Resize Handlers ---
  const handleResizeStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (e.button !== undefined && e.button !== 0) return;
    isResizing.current = true;
    resizeStart.current = { width: playerWidth, x: e.clientX };

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }
  };

  const handleResizeMove = (e: React.PointerEvent) => {
    if (!isResizing.current) return;
    const deltaX = e.clientX - resizeStart.current.x;
    const minW = 240;
    const maxW = Math.min(680, window.innerWidth - 16);
    const newW = Math.max(minW, Math.min(maxW, resizeStart.current.width + deltaX));

    setPlayerWidth(newW);
  };

  const handleResizeEnd = (e: React.PointerEvent) => {
    if (isResizing.current) {
      isResizing.current = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {
        // ignore
      }
    }
  };

  const embedUrl = `https://megaplay.buzz/stream/mal/${activeStream.animeId}/${activeStream.epId}/${activeStream.streamType}`;

  const handleMaximize = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    expand();
    navigate(`/watch/${activeStream.animeId}/${activeStream.epId}`, {
      state: { streamType: activeStream.streamType },
    });
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    close();
  };

  const style: React.CSSProperties = {
    width: `${playerWidth}px`,
    ...(position
      ? { position: "fixed", left: `${position.x}px`, top: `${position.y}px`, bottom: "auto", right: "auto" }
      : {}),
  };

  return (
    <div
      ref={playerRef}
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={cn(
        !position && "fixed bottom-20 sm:bottom-6 right-4 sm:right-6",
        "z-50 flex flex-col rounded-2xl max-w-full",
        "bg-[#0c0c0e] border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden select-none touch-none",
        "cursor-grab active:cursor-grabbing transition-shadow duration-300 animate-in fade-in slide-in-from-bottom-6 group"
      )}
    >
      {/* Top Header Bar */}
      <div className="h-10 px-3 bg-[#0c0c0e]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between gap-2 shrink-0 touch-none select-none z-20">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <GripHorizontal className="w-4 h-4 text-primary shrink-0" />
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate leading-tight">
              EP {activeStream.epId}: {activeStream.title}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0" onPointerDown={(e) => e.stopPropagation()}>
          <button
            onClick={handleMaximize}
            title="Expand to Full Player"
            aria-label="Expand to Full Player"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-primary active:bg-primary/80 text-white flex items-center justify-center transition-colors active:scale-90 touch-manipulation cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleClose}
            title="Close Mini Player"
            aria-label="Close Mini Player"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-destructive active:bg-destructive/80 text-white flex items-center justify-center transition-colors active:scale-90 touch-manipulation cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Video iframe & Full Container Drag Catcher */}
      <div className="w-full aspect-video bg-black relative overflow-hidden">
        <iframe
          src={embedUrl}
          className="w-full h-full border-0 pointer-events-none"
          frameBorder="0"
          scrolling="no"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          referrerPolicy="origin"
        />
        {/* Full-surface drag overlay */}
        <div className="absolute inset-0 z-10 touch-none cursor-grab active:cursor-grabbing" />

        {/* Bottom-Right Corner Resizer Handle */}
        <div
          onPointerDown={handleResizeStart}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
          className="absolute bottom-1 right-1 z-30 p-1.5 rounded-tl-xl bg-black/80 backdrop-blur-md border-t border-l border-white/20 text-white/80 hover:text-white hover:bg-primary cursor-nwse-resize touch-none active:scale-110 transition-all"
          title="Drag to resize mini-player"
        >
          <Scaling className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
