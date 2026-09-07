"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CurrentWorkPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/portfolio#current-work");
  }, [router]);

  return (
    <div style={{ background: "#020617", color: "#fff", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <p>Redirecting to Current Work...</p>
    </div>
  );
}
