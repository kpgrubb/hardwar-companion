import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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

  for (const el of elements) {
    const searchable = [el.name, el.faction, el.motive_type, ...el.special_rules, ...el.performance_upgrades, ...el.weapon_upgrades.map((w) => w.name)].join(' ').toLowerCase();
    if (searchable.includes(q)) {
      results.push({
        type: 'element',
        title: el.name,
        snippet: `C${el.class} ${el.motive_type} — ${el.faction} — M${el.stats.M} F${el.stats.F} D${el.stats.D} A${el.stats.A}`,
        pageRef: el.page_ref,
      });
    }
  }

  for (const mod of modules) {
    const searchable = `${mod.title} ${mod.summary} ${mod.content}`.toLowerCase();
    if (searchable.includes(q)) {
      const idx = searchable.indexOf(q);
      const start = Math.max(0, idx - 40);
      const end = Math.min(searchable.length, idx + q.length + 60);
      results.push({ type: 'module', title: mod.title, snippet: '...' + searchable.slice(start, end) + '...', pageRef: mod.page_ref });
    }
  }

  for (const qr of quickRefs) {
    const searchable = `${qr.title} ${qr.items.join(' ')}`.toLowerCase();
    if (searchable.includes(q)) {
      const matchItem = qr.items.find((item) => item.toLowerCase().includes(q));
      results.push({ type: 'quick-ref', title: qr.title, snippet: matchItem || qr.items[0], pageRef: qr.page_ref });
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 bg-dark/40 flex items-start justify-center pt-20"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className="w-full max-w-xl bg-bg-card border border-dark-20 shadow-lg overflow-hidden"
      >
        {/* Search input */}
        <div className="flex items-center border-b border-dark-20">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search elements, rules, missions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-body bg-transparent border-none px-5 py-3.5 text-dark placeholder:text-dark-50 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="text-meta text-dark-50 hover:text-dark bg-transparent border-none px-4 cursor-pointer transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {query.length >= 2 && results.length === 0 && (
            <p className="text-body text-dark-50 py-8 text-center">
              No results for "{query}"
            </p>
          )}

          {results.map((r, i) => (
            <div
              key={i}
              className="px-5 py-3 border-b border-dark-20 last:border-none hover:bg-hover transition-colors"
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-micro text-accent-dark">{r.type.toUpperCase()}</span>
                <span className="text-display-section text-dark">{r.title}</span>
                <span className="text-micro text-dark-50 ml-auto">p.{r.pageRef}</span>
              </div>
              <p className="text-body-sm text-dark-50 m-0 line-clamp-2">{r.snippet}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
