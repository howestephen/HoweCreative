import { useState } from "react";

export type ModelStatus = {
  src: string;
  label: string;
  state: "checking" | "ok" | "error";
  detail: string;
};

interface HeroDebugOverlayProps {
  iosLike: boolean;
  hasWebGL: boolean;
  heroType: "lite" | "morphing" | "css-fallback";
  modelStatuses: ModelStatus[];
  morphError: string | null;
  canvasCount: number;
  userAgent: string;
}

export function HeroDebugOverlay({
  iosLike,
  hasWebGL,
  heroType,
  modelStatuses,
  morphError,
  canvasCount,
  userAgent,
}: HeroDebugOverlayProps) {
  const [open, setOpen] = useState(true);

  const stateIcon = (s: ModelStatus["state"]) =>
    s === "ok" ? "✓" : s === "error" ? "✗" : "…";
  const stateColor = (s: ModelStatus["state"]) =>
    s === "ok" ? "#4ade80" : s === "error" ? "#f87171" : "#facc15";

  return (
    <div
      style={{
        position: "fixed",
        top: 8,
        right: 8,
        zIndex: 99999,
        maxWidth: open ? 320 : "auto",
        fontFamily: "monospace",
        fontSize: 11,
        lineHeight: 1.5,
        color: "#e2e8f0",
        background: "rgba(0,0,0,0.88)",
        border: "1px solid rgba(255,0,60,0.5)",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      {/* Header / toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          width: "100%",
          padding: "5px 8px",
          background: "rgba(255,0,60,0.18)",
          border: "none",
          borderBottom: open ? "1px solid rgba(255,0,60,0.3)" : "none",
          color: "#ff003c",
          fontFamily: "monospace",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          cursor: "pointer",
          textTransform: "uppercase",
        }}
      >
        <span>HC DEBUG</span>
        <span style={{ marginLeft: "auto" }}>{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div style={{ padding: "6px 8px 8px", display: "flex", flexDirection: "column", gap: 6 }}>

          {/* Device section */}
          <Section label="Device">
            <Row label="isIOSLike" value={String(iosLike)} ok={!iosLike} />
            <Row label="hasWebGL" value={String(hasWebGL)} ok={hasWebGL} />
            <Row label="canvas #" value={String(canvasCount)} />
            <div style={{ marginTop: 2, color: "#94a3b8", wordBreak: "break-all" }}>
              {userAgent}
            </div>
          </Section>

          {/* Hero section */}
          <Section label="Hero">
            <Row
              label="type"
              value={heroType}
              ok={heroType !== "css-fallback"}
            />
          </Section>

          {/* Models section — only relevant for morphing */}
          {heroType === "morphing" && (
            <Section label={`Models (${modelStatuses.length})`}>
              {modelStatuses.length === 0 && (
                <span style={{ color: "#94a3b8" }}>checking…</span>
              )}
              {modelStatuses.map((m) => (
                <div key={m.src} style={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
                  <span style={{ color: stateColor(m.state), flexShrink: 0 }}>
                    {stateIcon(m.state)}
                  </span>
                  <span style={{ color: "#cbd5e1", flexShrink: 0 }}>
                    {m.src.split("/").pop()}
                  </span>
                  <span style={{ color: "#64748b", wordBreak: "break-all" }}>
                    {m.detail}
                  </span>
                </div>
              ))}
            </Section>
          )}

          {/* Error section */}
          {morphError && (
            <Section label="Error">
              <div style={{ color: "#f87171", wordBreak: "break-all", whiteSpace: "pre-wrap" }}>
                {morphError}
              </div>
            </Section>
          )}

          {heroType === "css-fallback" && (
            <Section label="Fallback reason">
              <div style={{ color: "#facc15" }}>
                {!hasWebGL ? "WebGL not available" : iosLike ? "iOS device — WebGL disabled to avoid context limit" : "Unknown"}
              </div>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ color: "#ff003c", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ paddingLeft: 4, display: "flex", flexDirection: "column", gap: 1 }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  const color = ok === undefined ? "#cbd5e1" : ok ? "#4ade80" : "#f87171";
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <span style={{ color: "#64748b", flexShrink: 0, minWidth: 64 }}>{label}</span>
      <span style={{ color }}>{value}</span>
    </div>
  );
}
