"use client";

import { useRef } from "react";

import { useHorizonScene } from "@/hooks/useHorizonScene";

export default function HorizonCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useHorizonScene(canvasRef);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      aria-hidden
    />
  );
}
