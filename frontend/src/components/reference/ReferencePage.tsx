import { useState } from 'react';
import ElementBrowser from './ElementBrowser';
import PrintSheet from './PrintSheet';
import elementsData from '../../data/elements.json';
import type { ElementStatCard } from '../../types';

const elements = elementsData as ElementStatCard[];

type Tab = 'elements' | 'print';

export default function ReferencePage() {
  const [tab, setTab] = useState<Tab>('elements');

  return (
    <div>
      {/* Sub-nav */}
      <div className="flex gap-4 mb-4 no-print">
        {(['elements', 'print'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`font-ui text-xs uppercase tracking-widest px-3 py-1.5 border-b-2 bg-transparent cursor-pointer transition-colors ${
              tab === t
                ? 'border-accent text-dark'
                : 'border-transparent text-dark-50 hover:text-dark'
            }`}
          >
            {t === 'elements' ? 'Element Browser' : 'Print Cards'}
          </button>
        ))}
      </div>

      {tab === 'elements' && <ElementBrowser elements={elements} />}
      {tab === 'print' && <PrintSheet elements={elements} />}
    </div>
  );
}
