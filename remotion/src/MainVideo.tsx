import React from "react";
import { AbsoluteFill, Sequence, staticFile, Img, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";

const display = loadDisplay("normal", { weights: ["600", "700"], subsets: ["latin"] }).fontFamily;
const body = loadBody("normal", { weights: ["400", "500", "600"], subsets: ["latin"] }).fontFamily;

// ── Palette (bright, warm, editorial)
const CREAM = "#FBF5EA";
const IVORY = "#FFF8EC";
const GOLD = "#C9962B";
const GOLD_LIGHT = "#E9C97A";
const INK = "#2A2118";

// Scene durations
const S1 = 90;   // opening hook
const S2 = 120;  // roles reveal (5 pros)
const S3 = 90;   // "not paying for software"
const S4 = 120;  // ecosystem network of pros
const S5 = 100;  // closing statement
export const TOTAL = S1 + S2 + S3 + S4 + S5;

const PROS: { src: string; label: string }[] = [
  { src: "images/videographer.jpg", label: "Videographers" },
  { src: "images/caterer.jpg", label: "Caterers" },
  { src: "images/planner.jpg", label: "Wedding Planners" },
  { src: "images/limo-driver.jpg", label: "Limo Drivers" },
  { src: "images/tent-crew.jpg", label: "Tent Crews" },
];

// ── Persistent bright, warm gradient background with subtle drift
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const shift = Math.sin(frame / 90) * 6;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 100% at ${30 + shift}% ${20 - shift}%, ${IVORY} 0%, ${CREAM} 45%, #F4E7C7 100%)`,
      }}
    />
  );
};

// Floating soft light orbs
const Orbs: React.FC = () => {
  const frame = useCurrentFrame();
  const orbs = [
    { x: 12, y: 18, r: 260, hue: GOLD_LIGHT, phase: 0 },
    { x: 82, y: 72, r: 320, hue: GOLD, phase: 40 },
    { x: 70, y: 12, r: 180, hue: GOLD_LIGHT, phase: 80 },
    { x: 20, y: 82, r: 220, hue: GOLD, phase: 120 },
  ];
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: 0.55 }}>
      {orbs.map((o, i) => {
        const dy = Math.sin((frame + o.phase) / 60) * 20;
        const dx = Math.cos((frame + o.phase) / 70) * 25;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${o.x}%`,
              top: `${o.y}%`,
              width: o.r,
              height: o.r,
              transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px)`,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${o.hue}55 0%, ${o.hue}00 70%)`,
              filter: "blur(6px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ── Utility: fade-slide in
function useEnter(delay = 0, dur = 22) {
  const frame = useCurrentFrame();
  const t = interpolate(frame - delay, [0, dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return t;
}

// ── Scene 1: Opening hook
const Scene1: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const line1 = spring({ frame: frame - 6, fps, config: { damping: 200 } });
  const line2 = spring({ frame: frame - 32, fps, config: { damping: 200 } });
  const line3 = spring({ frame: frame - 58, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ padding: "0 160px", justifyContent: "center", color: INK }}>
      <div
        style={{
          fontFamily: body,
          letterSpacing: 8,
          fontSize: 22,
          color: GOLD,
          textTransform: "uppercase",
          opacity: line1,
          transform: `translateY(${(1 - line1) * 20}px)`,
          marginBottom: 32,
        }}
      >
        Weddings.io Manifesto · 004
      </div>
      <div
        style={{
          fontFamily: display,
          fontSize: 120,
          lineHeight: 1.05,
          fontWeight: 700,
          maxWidth: 1500,
          opacity: line2,
          transform: `translateY(${(1 - line2) * 30}px)`,
        }}
      >
        The next SaaS moat isn't <em style={{ color: GOLD, fontStyle: "italic" }}>software</em>.
      </div>
      <div
        style={{
          fontFamily: display,
          fontSize: 120,
          lineHeight: 1.05,
          fontWeight: 700,
          maxWidth: 1500,
          opacity: line3,
          transform: `translateY(${(1 - line3) * 30}px)`,
          marginTop: 12,
        }}
      >
        It's <span style={{ color: GOLD }}>shared success.</span>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 2: Roles reveal — 5 pro photos with labels, staggered
const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const heading = spring({ frame: frame - 4, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ padding: "80px 100px", color: INK }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 48 }}>
        <div
          style={{
            fontFamily: display,
            fontSize: 78,
            fontWeight: 700,
            opacity: heading,
            transform: `translateX(${(1 - heading) * -30}px)`,
          }}
        >
          The people the platform serves.
        </div>
        <div
          style={{
            fontFamily: body,
            fontSize: 20,
            letterSpacing: 4,
            color: GOLD,
            textTransform: "uppercase",
            opacity: heading,
          }}
        >
          Not users. Members.
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 24, flex: 1 }}>
        {PROS.map((p, i) => {
          const delay = 14 + i * 10;
          const t = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 140 } });
          const zoom = 1 + Math.sin((frame - delay) / 80) * 0.02;
          return (
            <div
              key={p.label}
              style={{
                position: "relative",
                borderRadius: 18,
                overflow: "hidden",
                boxShadow: "0 30px 60px rgba(80,50,10,0.18)",
                opacity: t,
                transform: `translateY(${(1 - t) * 60}px) scale(${0.96 + t * 0.04})`,
              }}
            >
              <Img
                src={staticFile(p.src)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: `scale(${zoom})`,
                  transition: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(20,10,0,0.7) 100%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 22,
                  left: 22,
                  right: 22,
                  color: IVORY,
                  fontFamily: display,
                  fontSize: 32,
                  fontWeight: 700,
                  lineHeight: 1.1,
                }}
              >
                {p.label}
              </div>
              <div
                style={{
                  position: "absolute",
                  top: 18,
                  left: 18,
                  color: GOLD_LIGHT,
                  fontFamily: body,
                  fontSize: 14,
                  letterSpacing: 3,
                  fontWeight: 600,
                }}
              >
                0{i + 1}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: "Not paying for software. Investing in an ecosystem."
const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: frame - 4, fps, config: { damping: 200 } });
  const b = spring({ frame: frame - 34, fps, config: { damping: 200 } });
  const strike = interpolate(frame, [20, 55], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ padding: "0 180px", justifyContent: "center", color: INK }}>
      <div style={{ fontFamily: body, letterSpacing: 6, fontSize: 20, color: GOLD, textTransform: "uppercase", marginBottom: 28, opacity: a }}>
        The shift
      </div>
      <div
        style={{
          fontFamily: display,
          fontSize: 96,
          lineHeight: 1.1,
          fontWeight: 700,
          opacity: a,
          transform: `translateY(${(1 - a) * 20}px)`,
        }}
      >
        They're not paying for{" "}
        <span style={{ position: "relative", display: "inline-block" }}>
          software
          <span
            style={{
              position: "absolute",
              left: 0,
              top: "58%",
              height: 8,
              width: `${strike * 100}%`,
              background: GOLD,
              borderRadius: 4,
            }}
          />
        </span>
        .
      </div>
      <div
        style={{
          fontFamily: display,
          fontSize: 96,
          lineHeight: 1.1,
          fontWeight: 700,
          marginTop: 30,
          opacity: b,
          transform: `translateY(${(1 - b) * 20}px)`,
        }}
      >
        They're investing in a <span style={{ color: GOLD }}>business ecosystem.</span>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 4: Network of pros — 5 photos as nodes, lines connecting them
const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const heading = spring({ frame: frame - 4, fps, config: { damping: 200 } });

  // Node layout (percent)
  const nodes = [
    { x: 0.22, y: 0.38 },
    { x: 0.42, y: 0.72 },
    { x: 0.5, y: 0.28 },
    { x: 0.72, y: 0.62 },
    { x: 0.82, y: 0.32 },
  ];
  const edges = [
    [0, 2], [2, 4], [0, 1], [1, 3], [2, 3], [3, 4], [1, 2],
  ] as const;

  return (
    <AbsoluteFill style={{ color: INK }}>
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 100,
          right: 100,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          opacity: heading,
        }}
      >
        <div style={{ fontFamily: display, fontSize: 64, fontWeight: 700, maxWidth: 900, lineHeight: 1.1 }}>
          Every profile strengthens the network.
        </div>
        <div style={{ fontFamily: body, fontSize: 20, letterSpacing: 4, color: GOLD, textTransform: "uppercase" }}>
          The community is the moat
        </div>
      </div>

      {/* SVG edges */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {edges.map(([a, b], i) => {
          const start = 30 + i * 4;
          const t = interpolate(frame - start, [0, 24], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const x1 = nodes[a].x * width;
          const y1 = nodes[a].y * height;
          const x2 = nodes[b].x * width;
          const y2 = nodes[b].y * height;
          const dx = x2 - x1;
          const dy = y2 - y1;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x1 + dx * t}
              y2={y1 + dy * t}
              stroke={GOLD}
              strokeWidth={2.5}
              opacity={0.55}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Nodes = pro photos */}
      {nodes.map((n, i) => {
        const delay = 12 + i * 8;
        const t = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 160 } });
        const size = 200;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: n.x * width,
              top: n.y * height,
              width: size,
              height: size,
              transform: `translate(-50%, -50%) scale(${0.5 + t * 0.5})`,
              opacity: t,
              borderRadius: "50%",
              overflow: "hidden",
              boxShadow: `0 0 0 6px ${IVORY}, 0 0 0 8px ${GOLD}, 0 30px 60px rgba(80,50,10,0.25)`,
            }}
          >
            <Img
              src={staticFile(PROS[i].src)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        );
      })}

      {/* Labels floating near nodes */}
      {nodes.map((n, i) => {
        const delay = 28 + i * 8;
        const t = interpolate(frame - delay, [0, 18], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={"lbl" + i}
            style={{
              position: "absolute",
              left: n.x * width,
              top: n.y * height + 120,
              transform: "translateX(-50%)",
              opacity: t,
              fontFamily: body,
              fontWeight: 600,
              fontSize: 22,
              color: INK,
              background: IVORY,
              padding: "6px 14px",
              borderRadius: 999,
              boxShadow: "0 6px 16px rgba(80,50,10,0.15)",
              letterSpacing: 1,
            }}
          >
            {PROS[i].label}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ── Scene 5: Closing statement
const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: frame - 4, fps, config: { damping: 200 } });
  const b = spring({ frame: frame - 40, fps, config: { damping: 200 } });
  const c = spring({ frame: frame - 70, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ padding: "0 200px", justifyContent: "center", color: INK }}>
      <div
        style={{
          fontFamily: display,
          fontSize: 82,
          lineHeight: 1.15,
          fontWeight: 700,
          opacity: a,
          transform: `translateY(${(1 - a) * 20}px)`,
          maxWidth: 1500,
        }}
      >
        Success isn't measured by how many
        <br />
        subscriptions you sell.
      </div>
      <div
        style={{
          fontFamily: display,
          fontSize: 82,
          lineHeight: 1.15,
          fontWeight: 700,
          marginTop: 26,
          opacity: b,
          transform: `translateY(${(1 - b) * 20}px)`,
          maxWidth: 1500,
        }}
      >
        It's measured by how many <span style={{ color: GOLD }}>successful businesses</span> you help create.
      </div>
      <div
        style={{
          marginTop: 60,
          display: "flex",
          alignItems: "center",
          gap: 20,
          opacity: c,
          transform: `translateY(${(1 - c) * 15}px)`,
        }}
      >
        <div style={{ width: 60, height: 2, background: GOLD }} />
        <div style={{ fontFamily: body, letterSpacing: 8, fontSize: 20, color: INK, textTransform: "uppercase", fontWeight: 600 }}>
          Weddings.io — the wedding economy
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <Orbs />
      <Sequence from={0} durationInFrames={S1}>
        <Scene1 />
      </Sequence>
      <Sequence from={S1} durationInFrames={S2}>
        <Scene2 />
      </Sequence>
      <Sequence from={S1 + S2} durationInFrames={S3}>
        <Scene3 />
      </Sequence>
      <Sequence from={S1 + S2 + S3} durationInFrames={S4}>
        <Scene4 />
      </Sequence>
      <Sequence from={S1 + S2 + S3 + S4} durationInFrames={S5}>
        <Scene5 />
      </Sequence>
    </AbsoluteFill>
  );
};
