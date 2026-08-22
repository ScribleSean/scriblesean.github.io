"use client";

import dynamic from "next/dynamic";

const HorizonCanvas = dynamic(() => import("@/components/HorizonCanvas"), {
  ssr: false,
});

export function HorizonScene() {
  return <HorizonCanvas />;
}
