import { useState, useMemo } from 'react';
import type { ElementStatCard as ElementType } from '../../types';
import ElementStatCard from './ElementStatCard';

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
      <div className="flex flex-wrap gap-3 items-center mb-6 pb-4 border-b border-dark-20">
        <input
          type="text"
          placeholder="Search elements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-body bg-surface border border-dark-20 px-4 py-2 text-dark placeholder:text-dark-50 focus:outline-none focus:border-accent transition-colors"
        />

        <div className="flex gap-1">
          {[null, 1, 2, 3, 4].map((c) => (
            <button
              key={c ?? 'all'}
              onClick={() => setClassFilter(c)}
              className={`text-meta px-3 py-1.5 border cursor-pointer transition-colors ${
                classFilter === c
                  ? 'bg-accent text-dark border-accent'
                  : 'bg-transparent text-dark-50 border-dark-20 hover:text-dark hover:border-dark-50'
              }`}
            >
              {c === null ? 'ALL' : `C${c}`}
            </button>
          ))}
        </div>

        <select
          value={motiveFilter}
          onChange={(e) => setMotiveFilter(e.target.value)}
          className="text-body bg-surface border border-dark-20 px-3 py-2 text-dark focus:outline-none focus:border-accent transition-colors"
        >
          <option value="">All Motive Types</option>
          {motiveTypes.map((mt) => (
            <option key={mt} value={mt}>{mt}</option>
          ))}
        </select>

        <select
          value={factionFilter}
          onChange={(e) => setFactionFilter(e.target.value)}
          className="text-body bg-surface border border-dark-20 px-3 py-2 text-dark focus:outline-none focus:border-accent transition-colors"
        >
          <option value="">All Factions</option>
          {factions.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <span className="text-micro text-dark-50 ml-auto">
          {filtered.length} / {elements.length} ELEMENTS
        </span>
      </div>

      {/* Element Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 auto-rows-fr">
        {filtered.map((element, i) => (
          <ElementStatCard key={element.id} element={element} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-body text-dark-50">No elements match the current filters.</p>
        </div>
      )}
    </div>
  );
}
