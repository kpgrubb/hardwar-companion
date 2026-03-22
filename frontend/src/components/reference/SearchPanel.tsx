import { useState, useMemo } from 'react';
import Panel from '../shared/Panel';
import elementsData from '../../data/elements.json';
import modulesData from '../../data/learn-modules.json';
import quickRefData from '../../data/quick-reference.json';
import type { ElementStatCard } from '../../types';

interface SearchResult {
  type: 'element' | 'module' | 'quick-ref';
  title: string;
  snippet: string;
  pageRef: number;
}

const elements = elementsData as ElementStatCard[];
const modules = modulesData as { id: string; title: string; summary: string; content: string; page_ref: number }[];
const quickRefs = quickRefData as { id: string; title: string; items: string[]; page_ref: number }[];

function searchAll(query: string): SearchResult[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  // Search elements
  for (const el of elements) {
    const searchable = [
      el.name,
      el.faction,
      el.motive_type,
      ...el.special_rules,
      ...el.performance_upgrades,
      ...el.weapon_upgrades.map((w) => w.name),
    ]
      .join(' ')
      .toLowerCase();
    if (searchable.includes(q)) {
      results.push({
        type: 'element',
        title: el.name,
        snippet: `C${el.class} ${el.motive_type} — ${el.faction} — M${el.stats.M} F${el.stats.F} D${el.stats.D} A${el.stats.A}`,
        pageRef: el.page_ref,
      });
    }
  }

  // Search learn modules
  for (const mod of modules) {
    const searchable = `${mod.title} ${mod.summary} ${mod.content}`.toLowerCase();
    if (searchable.includes(q)) {
      const idx = searchable.indexOf(q);
      const start = Math.max(0, idx - 40);
      const end = Math.min(searchable.length, idx + q.length + 60);
      results.push({
        type: 'module',
        title: mod.title,
        snippet: '...' + searchable.slice(start, end) + '...',
        pageRef: mod.page_ref,
      });
    }
  }

  // Search quick reference
  for (const qr of quickRefs) {
    const searchable = `${qr.title} ${qr.items.join(' ')}`.toLowerCase();
    if (searchable.includes(q)) {
      const matchItem = qr.items.find((item) => item.toLowerCase().includes(q));
      results.push({
        type: 'quick-ref',
        title: qr.title,
        snippet: matchItem || qr.items[0],
        pageRef: qr.page_ref,
      });
    }
  }

  return results.slice(0, 30);
}

interface SearchPanelProps {
  onClose: () => void;
}

export default function SearchPanel({ onClose }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchAll(query), [query]);

  return (
    <div className="fixed inset-0 z-40 bg-dark/50 flex items-start justify-center pt-16">
      <Panel className="w-full max-w-2xl bg-bg-primary max-h-[70vh] overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 mb-3">
          <input
            autoFocus
            type="text"
            placeholder="Search elements, rules, missions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 font-body text-sm bg-bg-secondary border border-dark-20 px-3 py-2 text-dark placeholder:text-dark-50 focus:outline-none focus:border-accent"
          />
          <button
            onClick={onClose}
            className="font-mono text-xs text-dark-50 hover:text-dark bg-transparent border-none cursor-pointer"
          >
            ESC
          </button>
        </div>

        <div className="overflow-y-auto flex-1 -mx-4 px-4">
          {query.length >= 2 && results.length === 0 && (
            <p className="font-body text-sm text-dark-50 py-4 text-center">
              No results for "{query}"
            </p>
          )}

          {results.map((r, i) => (
            <div
              key={i}
              className="py-2 border-b border-dark-20 last:border-none"
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono text-[7pt] text-accent-dark uppercase">
                  {r.type}
                </span>
                <span className="font-ui text-xs text-dark uppercase tracking-wide">
                  {r.title}
                </span>
                <span className="font-mono text-[7pt] text-dark-50 ml-auto">
                  p.{r.pageRef}
                </span>
              </div>
              <p className="font-body text-[9pt] text-dark-50 m-0 line-clamp-2">
                {r.snippet}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
