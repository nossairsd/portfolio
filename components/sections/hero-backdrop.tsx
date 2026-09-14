"use client";

import dynamic from "next/dynamic";

// The wave shader from Meta Ads Report Studio: one visual language across both.
const GradientWaves = dynamic(() => import("@/components/effects/gradient-waves"), { ssr: false });

export function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[820px]">
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_75%_20%,#eff6ff,transparent_70%)]" />
      <GradientWaves
        horizonColor="#EFF6FF"
        waveColor="#3B82F6"
        crestColor="#DBEAFE"
        speed={0.25}
        amplitude={1.6}
        waveScale={0.55}
        waveRatio={0.9}
        swell={22}
        turbulence={12}
        fogDepth={46}
        opacity={0.75}
        mouseInteraction
        parallaxStrength={0.25}
        grain={false}
      />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-b from-transparent via-white/70 to-white" />
    </div>
  );
}
