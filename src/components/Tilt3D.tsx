import React, { useState, useRef } from "react";

interface Tilt3DProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}

export function Tilt3D({ children, className = "", maxTilt = 8 }: Tilt3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Relative coordinates from card center
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;

    // Normalised position: -1 to 1
    const xNormalized = mouseX / (width / 2);
    const yNormalized = mouseY / (height / 2);

    // Rotation angles
    const rotateY = Number((xNormalized * maxTilt).toFixed(2));
    const rotateX = Number((-yNormalized * maxTilt).toFixed(2));

    // Glare position percentage
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    const xPct = (mouseXPos / width) * 100;
    const yPct = (mouseYPos / height) * 100;

    setCoords({ x: rotateX, y: rotateY });
    setGlarePos({ x: xPct, y: yPct });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
    setGlarePos({ x: 50, y: 50 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-all duration-300 ease-out ${className}`}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${coords.x}deg) rotateY(${coords.y}deg) scale3d(1.03, 1.03, 1.03)`
          : `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
        transformStyle: "preserve-3d",
        willChange: "transform",
        boxShadow: isHovered
          ? "0 30px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px -10px rgba(99, 102, 241, 0.25)"
          : "0 10px 30px -15px rgba(0, 0, 0, 0.4)",
      }}
    >
      {/* Glare effect overlay */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none rounded-xl z-20 mix-blend-screen opacity-60 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.15) 0%, transparent 60%)`,
          }}
        />
      )}
      
      <div
        className="w-full h-full"
        style={{
          transform: isHovered ? "translateZ(30px)" : "translateZ(0px)",
          transformStyle: "preserve-3d",
          transition: "transform 0.3s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}
