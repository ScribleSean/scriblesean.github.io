"use client";

import { useRef } from "react";

import { useHorizonScene } from "@/hooks/useHorizonScene";

export default function HorizonCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useHorizonScene(canvasRef);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_42%,#d56a2a_0%,#4a1b12_38%,#140c0a_72%,#0c0908_100%)]">
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(12,9,8,0.28)_100%)]"
        aria-hidden
      />
    </div>
  );
}
