import React, { useState, useEffect, useRef } from "react";
import { 
  X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, Maximize2
} from "lucide-react";
import { BiodataPhoto } from "../types";

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  photos: BiodataPhoto[];
  initialIndex: number;
}

export function ImageLightbox({ isOpen, onClose, photos, initialIndex }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const hasMovedDuringDrag = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Sync index when initialIndex changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      resetZoom();
    }
  }, [isOpen, initialIndex]);

  // Reset scale and position
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.3, 5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.3, 0.8));
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1));
    resetZoom();
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1));
    resetZoom();
  };

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          handlePrev();
          break;
        case "ArrowRight":
          handleNext();
          break;
        case "=":
        case "+":
          handleZoomIn();
          break;
        case "-":
        case "_":
          handleZoomOut();
          break;
        case "0":
          resetZoom();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, photos]);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomIntensity = 0.05;
    const delta = -e.deltaY;
    setScale(prev => {
      const nextScale = prev + (delta > 0 ? zoomIntensity : -zoomIntensity);
      return Math.min(Math.max(nextScale, 0.8), 5);
    });
  };

  // Double click to toggle zoom
  const handleDoubleClick = () => {
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2);
    }
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    hasMovedDuringDrag.current = false;
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    if (Math.abs(newX - position.x) > 4 || Math.abs(newY - position.y) > 4) {
      hasMovedDuringDrag.current = true;
    }
    
    // Bounds check to avoid dragging excessively out of screen
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale <= 1 || e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || scale <= 1 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
  };

  if (!isOpen) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/95 backdrop-blur-md transition-opacity duration-300 no-print select-none"
      ref={containerRef}
      id="lightbox-container"
    >
      {/* Top Header Bar */}
      <div className="absolute top-0 inset-x-0 h-16 flex items-center justify-between px-6 bg-gradient-to-b from-black/80 to-transparent z-10">
        {/* Info Counter */}
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
            Matrimonial Portfolio Showcase
          </span>
          <span className="text-xs font-semibold text-zinc-300 font-mono">
            Photo {currentIndex + 1} of {photos.length}
          </span>
        </div>

        {/* Floating Quick Instruction */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-zinc-900/60 border border-zinc-800/80 rounded-full text-[10px] font-mono text-zinc-400">
          <Maximize2 className="w-3 h-3 text-indigo-400" />
          <span>Double-click to zoom • Scroll to magnify • Drag to pan</span>
        </div>

        {/* Top Actions Control buttons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleZoomOut}
            className="p-2 bg-zinc-900/80 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <button 
            onClick={resetZoom}
            className="p-2 bg-zinc-900/80 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            title="Reset Zoom (0)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button 
            onClick={handleZoomIn}
            className="p-2 bg-zinc-900/80 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-6 bg-zinc-800 mx-1" />

          <button 
            onClick={onClose}
            className="p-2 bg-zinc-900/80 border border-zinc-800 hover:border-red-500/30 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/20 transition cursor-pointer"
            title="Close Lightbox (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Viewport Area */}
      <div 
        className="relative w-full h-full flex items-center justify-center overflow-hidden px-4 py-20 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUpOrLeave}
        onClick={(e) => {
          if (e.target === e.currentTarget && !hasMovedDuringDrag.current) {
            onClose();
          }
        }}
      >
        {/* Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-6 p-4 rounded-xl bg-zinc-950/80 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all z-10 cursor-pointer shadow-lg hidden sm:block"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-6 p-4 rounded-xl bg-zinc-950/80 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all z-10 cursor-pointer shadow-lg hidden sm:block"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Display Image Container */}
        {currentPhoto?.url ? (
          <div 
            className="relative select-none pointer-events-auto transition-transform duration-100 ease-out max-w-full max-h-full"
            style={{
              transform: `translate3d(${position.x}px, ${position.y}px, 0px)`,
            }}
            onWheel={handleWheel}
          >
            <img
              ref={imageRef}
              src={currentPhoto.url}
              alt={currentPhoto.caption}
              referrerPolicy="no-referrer"
              onDoubleClick={handleDoubleClick}
              className="max-w-[90vw] max-h-[75vh] md:max-h-[80vh] rounded-xl object-contain border border-zinc-900/60 shadow-2xl transition-transform duration-200 ease-out select-none pointer-events-none"
              style={{
                transform: `scale(${scale})`,
              }}
            />
          </div>
        ) : (
          <div className="text-zinc-600 font-mono text-xs">
            No image available in this slot
          </div>
        )}
      </div>

      {/* Bottom Description Overlay */}
      {currentPhoto && (
        <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col items-center text-center z-10 pointer-events-none">
          <div className="max-w-xl space-y-1 bg-zinc-950/50 backdrop-blur-md p-4 rounded-xl border border-zinc-900/50 pointer-events-auto">
            <h3 className="text-sm font-bold text-zinc-100">
              {currentPhoto.title || `Portfolio Slot 0${currentIndex + 1}`}
            </h3>
            <p className="text-2xs text-zinc-400 leading-relaxed max-w-md">
              {currentPhoto.caption || "Matrimonial biodata candidate portrait showcase."}
            </p>
          </div>

          {/* Quick swipe / navigation indicators for mobile */}
          {photos.length > 1 && (
            <div className="flex gap-1.5 mt-4 pointer-events-auto sm:hidden">
              {photos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    resetZoom();
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex ? "bg-white w-4" : "bg-zinc-700"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
