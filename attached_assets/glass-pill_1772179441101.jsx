import { useState, useRef, useEffect } from "react";

const LONG_PRESS_DURATION = 1500;

const tabs = [
  { id: "explore", icon: "⊹", label: "Explore" },
  { id: "map", icon: "◎", label: "Map" },
  { id: "gear", icon: "⬡", label: "Gear" },
  { id: "profile", icon: "◉", label: "Profile" },
];

export default function GlassPill() {
  const [activeTab, setActiveTab] = useState("map");
  const [sosPressing, setSosPressing] = useState(false);
  const [sosProgress, setSosProgress] = useState(0);
  const [sosTriggered, setSosTriggered] = useState(false);
  const pressTimer = useRef(null);
  const progressInterval = useRef(null);
  const startTime = useRef(null);

  const handleSosStart = () => {
    if (sosTriggered) return;
    setSosPressing(true);
    startTime.current = Date.now();

    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const pct = Math.min(elapsed / LONG_PRESS_DURATION, 1);
      setSosProgress(pct);
      if (pct >= 1) {
        clearInterval(progressInterval.current);
      }
    }, 16);

    pressTimer.current = setTimeout(() => {
      setSosTriggered(true);
      setSosPressing(false);
      setSosProgress(1);
      // Simulate haptic feedback with a brief vibration API call
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      setTimeout(() => {
        setSosTriggered(false);
        setSosProgress(0);
      }, 2500);
    }, LONG_PRESS_DURATION);
  };

  const handleSosEnd = () => {
    if (sosTriggered) return;
    clearTimeout(pressTimer.current);
    clearInterval(progressInterval.current);
    setSosPressing(false);
    setSosProgress(0);
  };

  useEffect(() => {
    return () => {
      clearTimeout(pressTimer.current);
      clearInterval(progressInterval.current);
    };
  }, []);

  const circumference = 2 * Math.PI * 14;

  return (
    <div style={styles.screen}>
      {/* Simulated map background */}
      <div style={styles.mapBg}>
        <svg width="100%" height="100%" style={{ opacity: 0.12 }}>
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#a0d4b5"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {[...Array(8)].map((_, i) => (
            <ellipse
              key={i}
              cx={`${15 + i * 12}%`}
              cy={`${20 + (i % 3) * 25}%`}
              rx={30 + i * 8}
              ry={15 + i * 5}
              fill="none"
              stroke="#6db88a"
              strokeWidth="0.4"
              opacity={0.6}
            />
          ))}
          <circle cx="42%" cy="38%" r="6" fill="#4ade80" opacity="0.4" />
          <circle
            cx="42%"
            cy="38%"
            r="20"
            fill="none"
            stroke="#4ade80"
            strokeWidth="0.6"
            opacity="0.3"
          />
          <circle
            cx="42%"
            cy="38%"
            r="35"
            fill="none"
            stroke="#4ade80"
            strokeWidth="0.4"
            opacity="0.2"
          />
        </svg>
        <div style={styles.mapOverlay} />
      </div>

      {/* Page label */}
      <div style={styles.pageHeader}>
        <span style={styles.appName}>
          WILDER<span style={styles.go}>GO</span>
        </span>
        <span style={styles.pageLabel}>
          {tabs.find((t) => t.id === activeTab)?.label.toUpperCase()}
        </span>
      </div>

      {/* Glass Pill Navigation */}
      <div style={styles.pillWrapper}>
        <div style={styles.pill}>
          {/* Glass blur simulation via CSS backdrop-filter */}
          <div style={styles.pillInner}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                style={{
                  ...styles.tabBtn,
                  ...(activeTab === tab.id ? styles.tabBtnActive : {}),
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                <span
                  style={{
                    ...styles.tabIcon,
                    ...(activeTab === tab.id ? styles.tabIconActive : {}),
                  }}
                >
                  {tab.icon}
                </span>
                {activeTab === tab.id && (
                  <span style={styles.tabLabel}>{tab.label}</span>
                )}
              </button>
            ))}

            {/* SOS Button */}
            <div style={styles.sosDivider} />
            <button
              style={{
                ...styles.sosBtn,
                ...(sosPressing ? styles.sosBtnPressing : {}),
                ...(sosTriggered ? styles.sosBtnTriggered : {}),
              }}
              onMouseDown={handleSosStart}
              onMouseUp={handleSosEnd}
              onMouseLeave={handleSosEnd}
              onTouchStart={handleSosStart}
              onTouchEnd={handleSosEnd}
            >
              {/* Progress ring */}
              <svg
                width="36"
                height="36"
                style={styles.sosRingSvg}
                viewBox="0 0 36 36"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="1.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke={sosTriggered ? "#ff3b30" : "rgba(255,80,60,0.9)"}
                  strokeWidth="1.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - sosProgress)}
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)"
                  style={{ transition: sosTriggered ? "none" : "stroke 0.2s" }}
                />
              </svg>
              <span
                style={{
                  ...styles.sosText,
                  ...(sosTriggered ? styles.sosTextTriggered : {}),
                }}
              >
                {sosTriggered ? "✓" : "SOS"}
              </span>
            </button>
          </div>
        </div>

        {/* SOS hint */}
        {sosPressing && !sosTriggered && (
          <div style={styles.sosHint}>Hold to activate emergency</div>
        )}
        {sosTriggered && (
          <div style={{ ...styles.sosHint, color: "#ff3b30", fontWeight: 600 }}>
            Emergency alert sent
          </div>
        )}
      </div>

      {/* Spec callouts */}
      <div style={styles.specCard}>
        <div style={styles.specTitle}>Glass Pill Mental Model</div>
        {[
          ["Layout", "Tabs hidden, absolute sibling @ bottom: 40"],
          ["Material", "backdrop-filter blur(20px) + rgba(255,255,255,0.05)"],
          ["Border", "0.5px white + shadowRadius: 16"],
          ["SOS", "LongPress 1.5s + haptic on success"],
        ].map(([k, v]) => (
          <div key={k} style={styles.specRow}>
            <span style={styles.specKey}>{k}</span>
            <span style={styles.specVal}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  screen: {
    position: "relative",
    width: "100%",
    minHeight: "100vh",
    background: "#0d1f16",
    fontFamily: "'DM Mono', 'Courier New', monospace",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  mapBg: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(ellipse at 40% 35%, #1a3d28 0%, #0b1810 70%)",
  },
  mapOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to bottom, transparent 40%, #0b1810 100%)",
  },
  pageHeader: {
    position: "relative",
    zIndex: 2,
    marginTop: 48,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  appName: {
    fontSize: 11,
    letterSpacing: "0.3em",
    color: "rgba(255,255,255,0.35)",
    fontWeight: 500,
  },
  go: {
    color: "#4ade80",
  },
  pageLabel: {
    fontSize: 28,
    fontWeight: 300,
    letterSpacing: "0.15em",
    color: "rgba(255,255,255,0.85)",
  },
  pillWrapper: {
    position: "absolute",
    bottom: 40,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    zIndex: 10,
  },
  pill: {
    borderRadius: 50,
    overflow: "hidden",
    border: "0.5px solid rgba(255,255,255,0.18)",
    boxShadow:
      "0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
  },
  pillInner: {
    display: "flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.05)",
    padding: "8px 10px",
    gap: 2,
  },
  tabBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    borderRadius: 40,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    transition: "background 0.2s, transform 0.15s",
    color: "rgba(255,255,255,0.45)",
    outline: "none",
    minWidth: 44,
    justifyContent: "center",
  },
  tabBtnActive: {
    background: "rgba(255,255,255,0.1)",
    transform: "scale(1.02)",
  },
  tabIcon: {
    fontSize: 16,
    lineHeight: 1,
    color: "rgba(255,255,255,0.45)",
    transition: "color 0.2s",
  },
  tabIconActive: {
    color: "#4ade80",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.8)",
    whiteSpace: "nowrap",
  },
  sosDivider: {
    width: "0.5px",
    height: 28,
    background: "rgba(255,255,255,0.12)",
    margin: "0 6px",
  },
  sosBtn: {
    position: "relative",
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "none",
    background: "rgba(255,59,48,0.15)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    outline: "none",
    transition: "background 0.2s, transform 0.1s",
    userSelect: "none",
    WebkitUserSelect: "none",
  },
  sosBtnPressing: {
    background: "rgba(255,59,48,0.25)",
    transform: "scale(0.96)",
  },
  sosBtnTriggered: {
    background: "rgba(255,59,48,0.4)",
  },
  sosRingSvg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
  },
  sosText: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.05em",
    color: "rgba(255,100,90,0.9)",
    position: "relative",
    zIndex: 1,
  },
  sosTextTriggered: {
    color: "#ff3b30",
    fontSize: 14,
  },
  sosHint: {
    fontSize: 10,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: "0.05em",
    textAlign: "center",
    animation: "fadeIn 0.2s ease",
  },
  specCard: {
    position: "absolute",
    top: 140,
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(255,255,255,0.04)",
    border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: "16px 20px",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    width: "min(340px, 90vw)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
  },
  specTitle: {
    fontSize: 9,
    letterSpacing: "0.2em",
    color: "#4ade80",
    marginBottom: 12,
    fontWeight: 600,
  },
  specRow: {
    display: "flex",
    gap: 10,
    marginBottom: 6,
    alignItems: "flex-start",
  },
  specKey: {
    fontSize: 10,
    color: "rgba(255,255,255,0.35)",
    width: 58,
    flexShrink: 0,
    paddingTop: 1,
  },
  specVal: {
    fontSize: 10,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 1.5,
  },
};
