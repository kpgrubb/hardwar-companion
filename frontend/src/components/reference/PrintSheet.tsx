import type { ElementStatCard as ElementType } from '../../types';
import ElementStatCard from './ElementStatCard';

interface PrintSheetProps {
  elements: ElementType[];
}

export default function PrintSheet({ elements }: PrintSheetProps) {
  // Chunk elements into groups of 9 for 3x3 grid on Letter page
  const pages: ElementType[][] = [];
  for (let i = 0; i < elements.length; i += 9) {
    pages.push(elements.slice(i, i + 9));
  }

  return (
    <div>
      {/* Print button — hidden in print */}
      <div className="no-print mb-4">
        <button
          onClick={() => window.print()}
          className="font-ui text-xs uppercase tracking-widest bg-accent text-dark px-4 py-2 border-none cursor-pointer hover:bg-accent-dark transition-colors"
        >
          Print Cards
        </button>
        <span className="font-mono text-[10px] text-dark-50 ml-3">
          {elements.length} cards / {pages.length} page{pages.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Print pages */}
      {pages.map((page, pageIdx) => (
        <div
          key={pageIdx}
          className="print-page"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 3.5in)',
            gridTemplateRows: 'repeat(3, 2.5in)',
            gap: '0',
            pageBreakAfter: 'always',
            width: '10.5in',
          }}
        >
          {page.map((element) => (
            <div
              key={element.id}
              style={{
                width: '3.5in',
                height: '2.5in',
                overflow: 'hidden',
                border: '0.5px solid #ccc',
              }}
            >
              <ElementStatCard element={element} compact />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
