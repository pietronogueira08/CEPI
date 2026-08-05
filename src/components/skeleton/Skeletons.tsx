// Skeleton Screen Components — CEPI
// Elegant loading states that mimic page structure

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{
      background: "white",
      borderRadius: 14,
      padding: 20,
      border: "1px solid #E2E8F0",
    }}>
      <div className="skeleton" style={{ height: 20, width: "60%", marginBottom: 12 }} />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            height: 14,
            width: i === lines - 1 ? "40%" : "100%",
            marginBottom: 8,
          }}
        />
      ))}
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="stat-card" style={{ position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div className="skeleton" style={{ height: 14, width: "40%" }} />
        <div className="skeleton" style={{ height: 36, width: 36, borderRadius: 10 }} />
      </div>
      <div className="skeleton" style={{ height: 32, width: "55%", marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 12, width: "70%" }} />
    </div>
  );
}

export function SkeletonTableRow({ cols = 4 }: { cols?: number }) {
  const widths = ["30%", "25%", "20%", "15%", "10%"];
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: "14px 16px" }}>
          <div className="skeleton" style={{ height: 14, width: widths[i] || "20%" }} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div style={{
      background: "white",
      borderRadius: 14,
      border: "1px solid #E2E8F0",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 16,
        padding: "12px 16px",
        background: "#F8FAFC",
        borderBottom: "1px solid #E2E8F0",
      }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 12, width: "60%" }} />
        ))}
      </div>
      {/* Rows */}
      <table style={{ width: "100%" }}>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonInvoiceCard() {
  return (
    <div style={{
      background: "white",
      borderRadius: 14,
      border: "1px solid #E2E8F0",
      padding: "16px 20px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 14, width: "55%", marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 11, width: "40%" }} />
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="skeleton" style={{ height: 18, width: 80, marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 20, width: 60, borderRadius: 20 }} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGradeCard() {
  return (
    <div style={{
      background: "white",
      borderRadius: 14,
      border: "1px solid #E2E8F0",
      padding: 20,
    }}>
      <div className="skeleton" style={{ height: 16, width: "45%", marginBottom: 16 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div className="skeleton" style={{ height: 12, width: "70%", margin: "0 auto 8px" }} />
            <div className="skeleton" style={{ height: 48, width: 60, margin: "0 auto", borderRadius: 10 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div>
      {/* Header skeleton */}
      <div style={{ marginBottom: 28 }}>
        <div className="skeleton" style={{ height: 28, width: "35%", marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 14, width: "55%" }} />
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <SkeletonCard lines={4} />
        <SkeletonCard lines={3} />
      </div>
    </div>
  );
}
