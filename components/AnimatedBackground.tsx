"use client";

import { useRef } from "react";

import { useAnimatedCanvas } from "@/hooks/useAnimatedCanvas";

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useAnimatedCanvas(canvasRef);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      aria-hidden
    />
  );
}
