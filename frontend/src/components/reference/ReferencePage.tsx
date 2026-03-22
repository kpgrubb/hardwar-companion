import { useState } from 'react';
import { motion } from 'framer-motion';
import ElementBrowser from './ElementBrowser';
import PrintSheet from './PrintSheet';
import QuickReferenceCards from './QuickReferenceCards';
import MissionBrowser from './MissionBrowser';
import ChatPanel from './ChatPanel';
import elementsData from '../../data/elements.json';
import type { ElementStatCard } from '../../types';

const elements = elementsData as ElementStatCard[];

type Tab = 'quick-ref' | 'elements' | 'missions' | 'print';

const tabs: { id: Tab; label: string; code: string }[] = [
  { id: 'quick-ref', label: 'Quick Reference', code: 'QR' },
  { id: 'elements', label: 'Elements', code: 'EL' },
  { id: 'missions', label: 'Missions', code: 'MS' },
  { id: 'print', label: 'Print Cards', code: 'PT' },
];

export default function ReferencePage() {
  const [tab, setTab] = useState<Tab>('quick-ref');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Page header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="text-micro text-dark-50 block mb-1">CORE &gt; REFERENCE</span>
          <h1 className="text-display-title text-dark m-0">Rules Reference</h1>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Tab bar */}
          <div className="flex gap-1 mb-6 pb-3 border-b border-dark-20 no-print">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3 py-1.5 border-none cursor-pointer transition-colors ${
                  tab === t.id
                    ? 'bg-accent text-dark'
                    : 'bg-transparent text-dark-50 hover:text-dark hover:bg-hover'
                }`}
              >
                <span className="text-micro">{t.code}</span>
                <span className="text-display-section hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {tab === 'quick-ref' && <QuickReferenceCards />}
          {tab === 'elements' && <ElementBrowser elements={elements} />}
          {tab === 'missions' && <MissionBrowser />}
          {tab === 'print' && <PrintSheet elements={elements} />}
        </div>

        {/* Chat sidebar */}
        <div className="xl:w-[380px] xl:shrink-0 no-print">
          <div className="xl:sticky xl:top-4">
            <ChatPanel />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
