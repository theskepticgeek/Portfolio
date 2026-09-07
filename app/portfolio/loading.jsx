import StarryNightAnimated from "@/components/StarryNightAnimated";

export default function Loading() {
  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#020617",
        zIndex: 999999,
      }}
    >
      <StarryNightAnimated
        intensity={1.4}
        speed={2}
      />
    </main>
  );
}2