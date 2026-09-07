"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProjectsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/portfolio#projects");
  }, [router]);

  return (
    <div style={{ background: "#020617", color: "#fff", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <p>Redirecting to Projects...</p>
    </div>
  );
}
