interface PanelProps {
  children: React.ReactNode;
  dotMatrix?: boolean;
  accentBar?: boolean;
  className?: string;
}

export default function Panel({ children, dotMatrix, accentBar, className = '' }: PanelProps) {
  return (
    <div
      className={`
        panel reg-marks
        ${dotMatrix ? 'panel-dotmatrix' : ''}
        ${accentBar ? 'accent-bar' : ''}
        ${className}
      `}
    >
      <div className="reg-marks-bottom">
        {children}
      </div>
    </div>
  );
}
