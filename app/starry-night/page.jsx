"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import StarryNightAnimated from "@/components/StarryNightAnimated";

export default function StarryNightPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const section = params.get("section");
    const target = params.get("target");

    let destination = "/portfolio";
    let isNextRoute = true;

    // ==================================================
    // PORTFOLIO SECTION GLYPHS
    // ==================================================
    if (section) {
      destination =
        `/portfolio?section=${encodeURIComponent(section)}`;
    }

    // ==================================================
    // RESUME GLYPH
    // ==================================================
    else if (target === "resume") {
      destination = "/resume.pdf";
      isNextRoute = false;
    }

    // ==================================================
    // PLAYGROUND GLYPH
    // ==================================================
    else if (target === "playground") {
      destination = "/portfolio/playground.html";
      isNextRoute = false;
    }

    // Prefetch actual Next.js portfolio pages
    if (isNextRoute) {
      router.prefetch(destination);
    }

    // Starry Night animation duration
    const timer = window.setTimeout(() => {
      if (isNextRoute) {
        router.replace(destination);
      } else {
        window.location.replace(destination);
      }
    }, 5000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [router]);

  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#020617",
      }}
    >
      <StarryNightAnimated
        intensity={1.4}
        speed={2}
      />
    </main>
  );
}