"use client";

import { type RefObject, useEffect } from "react";

const BG = "#0a0a0a";
const DOT = "rgba(0, 255, 136, 0.169)";
const DOT_DIM = "rgba(60, 60, 60, 0.424)";

const spacing = 28;
const influenceRadius = 140;
const repelStrength = 48;

type Dot = { bx: number; by: number };

export function useAnimatedCanvas(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const node = canvasRef.current;
    if (!node) return;
    const canvas = node;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const g = ctx;

    let dots: Dot[] = [];
    let mouseX = -9999;
    let mouseY = -9999;
    let raf = 0;

    function buildDots() {
      dots = [];
      const w = canvas.width;
      const h = canvas.height;
      for (let x = spacing; x < w; x += spacing) {
        for (let y = spacing; y < h; y += spacing) {
          dots.push({ bx: x, by: y });
        }
      }
    }

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      buildDots();
    }

    function onMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    function tick() {
      const w = canvas.width;
      const h = canvas.height;

      g.fillStyle = BG;
      g.fillRect(0, 0, w, h);

      for (const d of dots) {
        const dx = d.bx - mouseX;
        const dy = d.by - mouseY;
        const dist = Math.hypot(dx, dy) || 1;
        let px = d.bx;
        let py = d.by;
        if (dist < influenceRadius) {
          const t = (influenceRadius - dist) / influenceRadius;
          const nx = dx / dist;
          const ny = dy / dist;
          px += nx * t * repelStrength;
          py += ny * t * repelStrength;
        }

        const near = dist < influenceRadius;
        g.fillStyle = near ? DOT : DOT_DIM;
        g.beginPath();
        g.arc(px, py, 1.1, 0, Math.PI * 2);
        g.fill();
      }

      raf = requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [canvasRef]);
}
