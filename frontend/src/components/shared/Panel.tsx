import CropMarks from './CropMarks';
import StatusTape from './StatusTape';

interface PanelProps {
  children: React.ReactNode;
  cropMarks?: boolean;
  statusTape?: 'accent' | 'muted' | 'danger';
  dotMatrix?: boolean;
  className?: string;
}

export default function Panel({
  children,
  cropMarks = true,
  statusTape,
  dotMatrix,
  className = '',
}: PanelProps) {
  return (
    <div
      className={`relative border border-dark-20 bg-bg-card p-5 ${
        statusTape ? 'pl-6' : ''
      } ${dotMatrix ? 'bg-dot-matrix' : ''} ${className}`}
    >
      {cropMarks && <CropMarks />}
      {statusTape && <StatusTape variant={statusTape} />}
      {children}
    </div>
  );
}
