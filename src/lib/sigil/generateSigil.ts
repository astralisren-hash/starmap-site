import type { SigilInputs, SigilSpec } from "./types";

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function pickAnchor(position: SigilInputs["position"], rnd: () => number) {
  let cx = 50, cy = 50;

  switch (position) {
    case "ahead": cy = 38 + rnd() * 8; break;
    case "behind": cy = 58 + rnd() * 8; break;
    case "beside": cx = (rnd() < 0.5 ? 38 : 62) + (rnd() * 4 - 2); break;
    case "distant":
      cx = (rnd() < 0.5 ? 12 : 88) + (rnd() * 2 - 1);
      cy = 30 + rnd() * 40;
      break;
    case "enclosing":
      cx = 50; cy = 50;
      break;
    default:
      cx = 48 + rnd() * 4; cy = 48 + rnd() * 4;
  }

  return { cx: clamp(cx, 8, 92), cy: clamp(cy, 8, 92) };
}

function densityForPresence(p: SigilInputs["presence"]) {
  if (p === "absence") return { dots: [0, 2], seg: [0, 1] };
  if (p === "unsure" || !p) return { dots: [3, 6], seg: [1, 2] };
  return { dots: [4, 10], seg: [1, 3] };
}

function styleForLight(light: SigilInputs["light"]) {
  switch (light) {
    case "diffuse": return { dotOpacity: [0.25, 0.45], strokeOpacity: 0.75, haloLikely: 0.7 };
    case "sharp": return { dotOpacity: [0.25, 0.38], strokeOpacity: 0.9, haloLikely: 0.15 };
    case "dim": return { dotOpacity: [0.35, 0.6], strokeOpacity: 0.8, haloLikely: 0.35 };
    case "absent": return { dotOpacity: [0.18, 0.32], strokeOpacity: 0.65, haloLikely: 0.0 };
    default: return { dotOpacity: [0.25, 0.55], strokeOpacity: 0.8, haloLikely: 0.35 };
  }
}

function feltModifiers(felt: SigilInputs["felt"]) {
  const set = new Set(felt || []);
  return {
    steadier: set.has("steadier"),
    alert: set.has("more_alert"),
    slower: set.has("slower"),
  };
}

export function generateSigil(inputs: SigilInputs, seed: number): SigilSpec {
  const rnd = mulberry32(seed);
  const { cx, cy } = pickAnchor(inputs.position, rnd);

  const density = densityForPresence(inputs.presence);
  const lightStyle = styleForLight(inputs.light);
  const fm = feltModifiers(inputs.felt);

  const anchor = { cx, cy, r: 1.6 };

  let dotCount = density.dots[0] + Math.floor(rnd() * (density.dots[1] - density.dots[0] + 1));
  let segCount = density.seg[0] + Math.floor(rnd() * (density.seg[1] - density.seg[0] + 1));

  const isAbsence = inputs.presence === "absence";
  if (isAbsence) {
    dotCount = Math.min(dotCount, 2);
    segCount = Math.min(segCount, 1);
  }

  const movement = inputs.movement || "unsure";

  let barrier: SigilSpec["barrier"] | undefined;
  if (movement === "block") {
    barrier = {
      x1: clamp(cx - 10 - rnd() * 6, 8, 92),
      y1: clamp(cy - 6 + rnd() * 12, 8, 92),
      x2: clamp(cx + 10 + rnd() * 6, 8, 92),
      y2: clamp(cy + 6 - rnd() * 12, 8, 92),
      strokeWidth: 2.2,
      opacity: lightStyle.strokeOpacity,
    };
  }

  let halo: SigilSpec["halo"] | undefined;
  const haloRoll = rnd();
  if (!isAbsence && (movement === "wait" || movement === "still" || haloRoll < lightStyle.haloLikely)) {
    halo = { cx, cy, r: 14 + rnd() * 8, opacity: 0.14 + rnd() * 0.08 };
  }
  if (isAbsence && inputs.light !== "absent" && rnd() < 0.35) {
    halo = { cx, cy, r: 16 + rnd() * 6, opacity: 0.12 + rnd() * 0.06 };
  }

  let arc: SigilSpec["arc"] | undefined;
  if (!isAbsence && (movement === "follow" || fm.slower) && rnd() < 0.6) {
    const x1 = clamp(cx - (12 + rnd() * 8), 8, 92);
    const y1 = clamp(cy - (6 + rnd() * 10), 8, 92);
    const x2 = clamp(cx + (10 + rnd() * 10), 8, 92);
    const y2 = clamp(cy + (6 + rnd() * 10), 8, 92);
    const r = 18 + rnd() * 12;
    arc = { x1, y1, rx: r, ry: r, x2, y2, opacity: 0.5 };
  }

  const spread = movement === "drift" ? 22 : 16;
  const dotOpacityMin = lightStyle.dotOpacity[0];
  const dotOpacityMax = lightStyle.dotOpacity[1];

  const dots = Array.from({ length: dotCount }).map(() => {
    const dx = (rnd() * 2 - 1) * spread;
    const dy = (rnd() * 2 - 1) * spread;
    return {
      cx: clamp(cx + dx, 8, 92),
      cy: clamp(cy + dy, 8, 92),
      r: 0.6 + rnd() * 0.6,
      opacity: dotOpacityMin + rnd() * (dotOpacityMax - dotOpacityMin),
    };
  });

  const segments: SigilSpec["segments"] = [];
  for (let i = 0; i < segCount; i++) {
    const len = 10 + rnd() * 18;
    const angle = rnd() * Math.PI * 2;
    const x2 = clamp(cx + Math.cos(angle) * len, 8, 92);
    const y2 = clamp(cy + Math.sin(angle) * len, 8, 92);
    segments.push({
      x1: cx,
      y1: cy,
      x2,
      y2,
      strokeWidth: 1.6,
      opacity: fm.steadier ? 0.85 : lightStyle.strokeOpacity,
    });
  }

  if (Math.abs(cx - 50) < 0.01 && Math.abs(cy - 50) < 0.01 && dots.length > 0) {
    dots[0].cx = clamp(dots[0].cx + 8, 8, 92);
  }

  return { seed, anchor, dots, segments, arc, barrier, halo };
}
