"use client";

import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    let lenisInstance: InstanceType<typeof import('lenis').default> | null = null;
    let rafId: number;

    // Dynamically import Lenis to avoid SSR issues
    (async () => {
      const Lenis = (await import("lenis")).default;

      lenisInstance = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      });

      function raf(time: number) {
        lenisInstance!.raf(time);
        rafId = requestAnimationFrame(raf);
      }

      rafId = requestAnimationFrame(raf);
    })();

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (lenisInstance) {
        lenisInstance.destroy();
      }
    };
  }, []);

  return null;
}
