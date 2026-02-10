import React from "react";
import type { SigilSpec } from "../../lib/sigil/types";

export default function Sigil({ spec, size = 280 }: { spec: SigilSpec; size?: number }) {
  const stroke = "currentColor";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-label="Sigil"
      role="img"
      style={{ display: "block", margin: "0 auto" }}
    >
      {spec.halo && (
        <circle
          cx={spec.halo.cx}
          cy={spec.halo.cy}
          r={spec.halo.r}
          stroke={stroke}
          strokeWidth={1.2}
          opacity={spec.halo.opacity}
          fill="none"
        />
      )}

      {spec.dots.map((d, idx) => (
        <circle key={idx} cx={d.cx} cy={d.cy} r={d.r} fill={stroke} opacity={d.opacity} />
      ))}

      {spec.arc && (
        <path
          d={`M ${spec.arc.x1} ${spec.arc.y1} A ${spec.arc.rx} ${spec.arc.ry} 0 0 1 ${spec.arc.x2} ${spec.arc.y2}`}
          stroke={stroke}
          strokeWidth={1.6}
          opacity={spec.arc.opacity}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {spec.segments.map((s, idx) => (
        <path
          key={idx}
          d={`M ${s.x1} ${s.y1} L ${s.x2} ${s.y2}`}
          stroke={stroke}
          strokeWidth={s.strokeWidth}
          opacity={s.opacity}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {spec.barrier && (
        <path
          d={`M ${spec.barrier.x1} ${spec.barrier.y1} L ${spec.barrier.x2} ${spec.barrier.y2}`}
          stroke={stroke}
          strokeWidth={spec.barrier.strokeWidth}
          opacity={spec.barrier.opacity}
          fill="none"
          strokeLinecap="round"
        />
      )}

      <circle cx={spec.anchor.cx} cy={spec.anchor.cy} r={spec.anchor.r} fill={stroke} />
    </svg>
  );
}
