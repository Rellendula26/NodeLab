"use client";

interface CurrentParticlesProps {
  pathId: string;
  d: string;
  current: number;
  color?: string;
}

export function CurrentParticles({
  pathId,
  d,
  current,
  color = "#A94848",
}: CurrentParticlesProps) {
  const magnitude = Math.abs(current);
  if (magnitude < 1e-6) return null;

  const count = Math.min(7, Math.max(2, Math.round(2 + magnitude * 3)));
  const duration = Math.max(0.9, Math.min(5, 2.4 / Math.sqrt(magnitude)));
  const reverse = current < 0;

  return (
    <g>
      <path id={pathId} d={d} fill="none" stroke="none" />
      {Array.from({ length: count }, (_, index) => (
        <circle key={index} r={2.4} fill={color} opacity={0.85}>
          <animateMotion
            dur={`${duration}s`}
            begin={`${(index / count) * duration}s`}
            repeatCount="indefinite"
            keyPoints={reverse ? "1;0" : "0;1"}
            keyTimes="0;1"
            calcMode="linear"
          >
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
      ))}
    </g>
  );
}
