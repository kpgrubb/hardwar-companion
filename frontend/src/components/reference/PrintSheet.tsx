import { useState } from 'react';
import type { ElementStatCard as ElementType } from '../../types';
import ElementStatCard from './ElementStatCard';

interface PrintSheetProps {
  elements: ElementType[];
}

export default function PrintSheet({ elements }: PrintSheetProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleElement = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(elements.map((e) => e.id)));
  const selectNone = () => setSelected(new Set());

  const printElements = elements.filter((e) => selected.has(e.id));
  const pages: ElementType[][] = [];
  for (let i = 0; i < printElements.length; i += 9) {
    pages.push(printElements.slice(i, i + 9));
  }

  return (
    <div>
      {/* Selection controls — hidden in print */}
      <div className="no-print mb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => window.print()}
            disabled={selected.size === 0}
            className="text-display-section bg-accent text-dark px-6 py-2.5 border-none cursor-pointer hover:bg-accent-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            PRINT {selected.size} CARD{selected.size !== 1 ? 'S' : ''}
          </button>
          <button
            onClick={selectAll}
            className="text-meta text-dark border border-dark-20 hover:border-dark-50 px-3 py-2 bg-transparent cursor-pointer transition-colors"
          >
            SELECT ALL
          </button>
          <button
            onClick={selectNone}
            className="text-meta text-dark-50 border border-dark-20 hover:border-dark-50 px-3 py-2 bg-transparent cursor-pointer transition-colors"
          >
            CLEAR
          </button>
          <span className="text-micro text-dark-50 ml-auto">
            {selected.size} / {elements.length} SELECTED — {pages.length} PAGE{pages.length !== 1 ? 'S' : ''}
          </span>
        </div>

        {/* Clickable element grid for selection */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-1.5">
          {elements.map((el) => {
            const isSelected = selected.has(el.id);
            return (
              <button
                key={el.id}
                onClick={() => toggleElement(el.id)}
                className={`text-left px-2 py-1.5 border cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-accent/20 border-accent text-dark'
                    : 'bg-transparent border-dark-20 text-dark-50 hover:border-dark-50'
                }`}
              >
                <span className="text-micro block">{el.name}</span>
                <span className="text-micro text-dark-50">C{el.class} {el.motive_type}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Print pages */}
      {pages.map((page, pageIdx) => (
        <div
          key={pageIdx}
          className="stat-card"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 3.5in)',
            gridTemplateRows: 'repeat(3, 2.5in)',
            gap: '0',
            pageBreakAfter: 'always',
            width: '10.5in',
            margin: '0 auto',
          }}
        >
          {page.map((element) => (
            <div
              key={element.id}
              style={{
                width: '3.5in',
                height: '2.5in',
                overflow: 'hidden',
                outline: '0.5px solid #ccc',
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
