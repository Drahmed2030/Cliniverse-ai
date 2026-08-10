"use client";
// AfiaSkeletonScreen — Light 2026 pulse skeleton
// يظهر عند فتح عافية قبل تحميل البطاقات

export default function AfiaSkeletonScreen() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#F8FAFC",
        padding: "0 0 100px 0",
        fontFamily: "-apple-system, 'SF Pro Display', sans-serif",
      }}
    >
      {/* Header skeleton */}
      <div style={{ padding: "52px 20px 24px" }}>
        <div style={pulse({ width: 120, height: 14, borderRadius: 8, marginBottom: 12 })} />
        <div style={pulse({ width: 200, height: 28, borderRadius: 10, marginBottom: 8 })} />
        <div style={pulse({ width: 160, height: 14, borderRadius: 8 })} />
      </div>

      {/* Family switcher skeleton */}
      <div style={{ padding: "0 20px 28px", display: "flex", gap: 12 }}>
        {[44, 44, 44, 44].map((s, i) => (
          <div key={i} style={pulse({ width: s, height: s, borderRadius: "50%" })} />
        ))}
        <div style={pulse({ width: 44, height: 44, borderRadius: "50%" })} />
      </div>

      {/* Cards grid skeleton */}
      <div style={{ padding: "0 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      <style>{`
        @keyframes afia-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 18,
        padding: "18px 16px",
        border: "1px solid #E2E8F0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <div style={pulse({ width: 36, height: 36, borderRadius: 10, marginBottom: 12 })} />
      <div style={pulse({ width: "70%", height: 13, borderRadius: 6, marginBottom: 8 })} />
      <div style={pulse({ width: "50%", height: 11, borderRadius: 6 })} />
    </div>
  );
}

function pulse(size: {
  width: number | string;
  height: number | string;
  borderRadius: number | string;
  marginBottom?: number;
}): React.CSSProperties {
  return {
    width: size.width,
    height: size.height,
    borderRadius: size.borderRadius,
    marginBottom: size.marginBottom ?? 0,
    background: "linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%)",
    backgroundSize: "200% 100%",
    animation: "afia-pulse 1.4s ease-in-out infinite",
    flexShrink: 0,
  };
}
