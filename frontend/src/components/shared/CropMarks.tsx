interface CropMarksProps {
  size?: number;
  className?: string;
}

export default function CropMarks({ size = 14, className = '' }: CropMarksProps) {
  const style = { width: size, height: size };
  return (
    <>
      <span
        className={`absolute top-0 left-0 border-t border-l border-dark-50/40 ${className}`}
        style={style}
        aria-hidden
      />
      <span
        className={`absolute top-0 right-0 border-t border-r border-dark-50/40 ${className}`}
        style={style}
        aria-hidden
      />
      <span
        className={`absolute bottom-0 left-0 border-b border-l border-dark-50/40 ${className}`}
        style={style}
        aria-hidden
      />
      <span
        className={`absolute bottom-0 right-0 border-b border-r border-dark-50/40 ${className}`}
        style={style}
        aria-hidden
      />
    </>
  );
}
