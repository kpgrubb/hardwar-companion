interface StatusTapeProps {
  variant?: 'accent' | 'muted' | 'danger';
}

const COLORS = {
  accent: 'bg-accent',
  muted: 'bg-dark-20',
  danger: 'bg-red-muted',
};

export default function StatusTape({ variant = 'accent' }: StatusTapeProps) {
  return (
    <div
      className={`absolute top-0 bottom-0 left-0 w-1 ${COLORS[variant]}`}
      aria-hidden
    />
  );
}
