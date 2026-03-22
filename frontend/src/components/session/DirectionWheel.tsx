interface DirectionWheelProps {
  highlightSegment?: number; // 1-12, null for none
  size?: number;
}

const LABELS = [
  'Toward', 'Fwd-R', 'Right', 'Back-R', 'Back-R', 'Away',
  'Away', 'Back-L', 'Back-L', 'Left', 'Fwd-L', 'Toward',
];

export default function DirectionWheel({ highlightSegment, size = 220 }: DirectionWheelProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 20;

  const segments = Array.from({ length: 12 }, (_, i) => {
    const segNum = i + 1;
    const startAngle = (i * 30 - 90 - 15) * (Math.PI / 180);
    const endAngle = ((i + 1) * 30 - 90 - 15) * (Math.PI / 180);
    const midAngle = (startAngle + endAngle) / 2;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);

    const labelR = r + 14;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);

    const isHighlighted = highlightSegment === segNum;

    return { segNum, x1, y1, x2, y2, lx, ly, midAngle, isHighlighted, startAngle, endAngle };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background circle */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-dark-20)" strokeWidth="1" />

      {/* Segments */}
      {segments.map((seg) => {
        const largeArc = 0;
        const path = `M ${cx} ${cy} L ${seg.x1} ${seg.y1} A ${r} ${r} 0 ${largeArc} 1 ${seg.x2} ${seg.y2} Z`;
        return (
          <g key={seg.segNum}>
            <path
              d={path}
              fill={seg.isHighlighted ? 'var(--color-accent)' : 'transparent'}
              stroke="var(--color-dark-20)"
              strokeWidth="1"
              opacity={seg.isHighlighted ? 1 : 0.3}
            />
            {/* Segment number */}
            <text
              x={cx + (r * 0.65) * Math.cos((seg.startAngle + seg.endAngle) / 2)}
              y={cy + (r * 0.65) * Math.sin((seg.startAngle + seg.endAngle) / 2)}
              textAnchor="middle"
              dominantBaseline="central"
              fill={seg.isHighlighted ? 'var(--color-dark)' : 'var(--color-dark-50)'}
              fontSize="11"
              fontFamily="var(--font-mono)"
              fontWeight={seg.isHighlighted ? '700' : '400'}
            >
              {seg.segNum}
            </text>
          </g>
        );
      })}

      {/* Direction labels */}
      {segments.map((seg) => (
        <text
          key={`label-${seg.segNum}`}
          x={seg.lx}
          y={seg.ly}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--color-dark-50)"
          fontSize="7"
          fontFamily="var(--font-mono)"
          letterSpacing="0.05em"
        >
          {LABELS[seg.segNum - 1]}
        </text>
      ))}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={3} fill="var(--color-dark)" />

      {/* "1 = toward deployment" indicator */}
      <text
        x={cx}
        y={12}
        textAnchor="middle"
        fill="var(--color-accent-dark)"
        fontSize="7"
        fontFamily="var(--font-mono)"
        fontWeight="700"
      >
        YOUR DEPLOYMENT
      </text>
    </svg>
  );
}
