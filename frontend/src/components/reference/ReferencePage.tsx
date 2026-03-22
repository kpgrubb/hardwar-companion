import { useState } from 'react';
import ElementBrowser from './ElementBrowser';
import PrintSheet from './PrintSheet';
import QuickReferenceCards from './QuickReferenceCards';
import MissionBrowser from './MissionBrowser';
import elementsData from '../../data/elements.json';
import type { ElementStatCard } from '../../types';

const elements = elementsData as ElementStatCard[];

type Tab = 'quick-ref' | 'elements' | 'missions' | 'print';

const tabs: { id: Tab; label: string }[] = [
  { id: 'quick-ref', label: 'Quick Reference' },
  { id: 'elements', label: 'Elements' },
  { id: 'missions', label: 'Missions' },
  { id: 'print', label: 'Print Cards' },
];

export default function ReferencePage() {
  const [tab, setTab] = useState<Tab>('quick-ref');

  return (
    <div>
      {/* Sub-nav */}
      <div className="flex gap-4 mb-4 no-print border-b border-dark-20 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`font-ui text-xs uppercase tracking-widest px-3 py-1.5 bg-transparent border-none cursor-pointer transition-colors ${
              tab === t.id
                ? 'text-dark border-b-2 border-accent -mb-[2px] pb-[7px]'
                : 'text-dark-50 hover:text-dark'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'quick-ref' && <QuickReferenceCards />}
      {tab === 'elements' && <ElementBrowser elements={elements} />}
      {tab === 'missions' && <MissionBrowser />}
      {tab === 'print' && <PrintSheet elements={elements} />}
    </div>
  );
}
