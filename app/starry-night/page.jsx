"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import StarryNightAnimated from "@/components/StarryNightAnimated";

export default function StarryNightPage() {
  const router = useRouter();

  useEffect(() => {
    // Begin preparing the portfolio immediately
    router.prefetch("/portfolio");

    // But keep Starry Night visible for at least 5 seconds
    const timer = setTimeout(() => {
      router.replace("/portfolio");
    }, 5000);

    return () => clearTimeout(timer);
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