"use client";

import { useId } from "react";

function wave(y: number) {
  let d = `M -60 ${y}`;
  for (let x = -60; x < 460; x += 60) d += " q 15 -18 30 0 t 30 0";
  return d;
}

const waveRows = Array.from({ length: 10 }, (_, i) => 30 + i * 46);

/** Sea blue arch with a wavy line pattern that sits behind the hero product. */
export function Blob({ className }: { className?: string }) {
  const clipId = `blob-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <svg
      viewBox="0 0 400 440"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M0 200 A200 200 0 0 1 400 200 V440 H0 Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="400" height="440" className="fill-accent" />
        {waveRows.map((y) => (
          <path
            key={y}
            d={wave(y)}
            fill="none"
            strokeWidth={9}
            strokeLinecap="round"
            className="stroke-accent-dark"
            strokeOpacity={0.45}
          />
        ))}
      </g>
    </svg>
  );
}
