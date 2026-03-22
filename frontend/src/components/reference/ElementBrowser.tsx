import { useState, useMemo } from 'react';
import type { ElementStatCard as ElementType } from '../../types';
import ElementStatCard from './ElementStatCard';
import Panel from '../shared/Panel';

interface ElementBrowserProps {
  elements: ElementType[];
}

export default function ElementBrowser({ elements }: ElementBrowserProps) {
  const [classFilter, setClassFilter] = useState<number | null>(null);
  const [motiveFilter, setMotiveFilter] = useState('');
  const [factionFilter, setFactionFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const motiveTypes = useMemo(
    () => [...new Set(elements.map((e) => e.motive_type))].sort(),
    [elements]
  );
  const factions = useMemo(
    () => [...new Set(elements.map((e) => e.faction).filter(Boolean))].sort(),
    [elements]
  );

  const filtered = useMemo(() => {
    return elements.filter((e) => {
      if (classFilter !== null && e.class !== classFilter) return false;
      if (motiveFilter && e.motive_type !== motiveFilter) return false;
      if (factionFilter && e.faction !== factionFilter) return false;
      if (searchTerm && !e.name.toLowerCase().includes(searchTerm.toLowerCase()))
        return false;
      return true;
    });
  }, [elements, classFilter, motiveFilter, factionFilter, searchTerm]);

  return (
    <div>
      {/* Filter Bar */}
      <Panel className="mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search elements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="font-body text-sm bg-bg-primary border border-dark-20 px-3 py-1.5 text-dark placeholder:text-dark-50 focus:outline-none focus:border-accent"
          />

          <div className="flex gap-1">
            {[null, 1, 2, 3, 4].map((c) => (
              <button
                key={c ?? 'all'}
                onClick={() => setClassFilter(c)}
                className={`font-mono text-xs px-2 py-1 border cursor-pointer transition-colors ${
                  classFilter === c
                    ? 'bg-accent text-dark border-accent'
                    : 'bg-transparent text-dark-50 border-dark-20 hover:border-accent'
                }`}
              >
                {c === null ? 'ALL' : `C${c}`}
              </button>
            ))}
          </div>

          <select
            value={motiveFilter}
            onChange={(e) => setMotiveFilter(e.target.value)}
            className="font-body text-sm bg-bg-primary border border-dark-20 px-2 py-1.5 text-dark focus:outline-none focus:border-accent"
          >
            <option value="">All Motive Types</option>
            {motiveTypes.map((mt) => (
              <option key={mt} value={mt}>{mt}</option>
            ))}
          </select>

          <select
            value={factionFilter}
            onChange={(e) => setFactionFilter(e.target.value)}
            className="font-body text-sm bg-bg-primary border border-dark-20 px-2 py-1.5 text-dark focus:outline-none focus:border-accent"
          >
            <option value="">All Factions</option>
            {factions.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          <span className="font-mono text-[10px] text-dark-50 ml-auto">
            {filtered.length} / {elements.length} ELEMENTS
          </span>
        </div>
      </Panel>

      {/* Element Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((element) => (
          <ElementStatCard key={element.id} element={element} />
        ))}
      </div>

      {filtered.length === 0 && (
        <Panel className="text-center py-12">
          <p className="font-body text-dark-50">No elements match the current filters.</p>
        </Panel>
      )}
    </div>
  );
}
