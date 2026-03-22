interface StatCellProps {
  label: string;
  value: number | string;
  className?: string;
}

export default function StatCell({ label, value, className = '' }: StatCellProps) {
  return (
    <div className={`stat-cell ${className}`}>
      <span className="stat-cell-label">{label}</span>
      <span className="stat-cell-value">{value}</span>
    </div>
  );
}
