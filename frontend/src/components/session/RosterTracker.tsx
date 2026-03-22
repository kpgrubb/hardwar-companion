import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Panel from '../shared/Panel';
import CropMarks from '../shared/CropMarks';
import StatCell from '../shared/StatCell';
import type { ElementStatCard, ElementStatus } from '../../types';
import elementsData from '../../data/elements.json';

const allElements = elementsData as ElementStatCard[];

interface RosterElement {
  id: string;
  element: ElementStatCard;
  currentM: number;
  currentF: number;
  currentD: number;
  currentA: number;
  damageBar: number;
  maxDamage: number;
  actionTokens: number;
  statuses: ElementStatus[];
  activatedThisTurn: boolean;
}

function createRosterElement(element: ElementStatCard): RosterElement {
  return {
    id: `${element.id}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    element,
    currentM: element.stats.M,
    currentF: element.stats.F,
    currentD: element.stats.D,
    currentA: element.stats.A,
    damageBar: 0,
    maxDamage: element.stats.A,
    actionTokens: 2,
    statuses: [],
    activatedThisTurn: false,
  };
}

const STATUS_OPTIONS: { id: ElementStatus; label: string; color: string }[] = [
  { id: 'guard', label: 'GUARD', color: 'bg-accent text-dark' },
  { id: 'vulnerable', label: 'VULN', color: 'bg-accent-dark/20 text-accent-dark' },
  { id: 'exhausted', label: 'EXHT', color: 'bg-dark-50/20 text-dark-50' },
  { id: 'disabled', label: 'DSBL', color: 'bg-red-muted/20 text-red-muted' },
  { id: 'immobilised', label: 'IMMB', color: 'bg-red-muted/20 text-red-muted' },
  { id: 'destroyed', label: 'DEAD', color: 'bg-red-muted text-white' },
];

export default function RosterTracker() {
  const [roster, setRoster] = useState<RosterElement[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');

  const addElement = (element: ElementStatCard) => {
    setRoster((prev) => [...prev, createRosterElement(element)]);
    setShowPicker(false);
    setSearch('');
  };

  const updateElement = (id: string, updates: Partial<RosterElement>) => {
    setRoster((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const removeElement = (id: string) => {
    setRoster((prev) => prev.filter((el) => el.id !== id));
  };

  const applyHit = (id: string) => {
    setRoster((prev) =>
      prev.map((el) => {
        if (el.id !== id) return el;
        const newDamage = Math.min(el.damageBar + 1, el.maxDamage);
        const destroyed = newDamage >= el.maxDamage;
        return {
          ...el,
          damageBar: newDamage,
          statuses: destroyed
            ? [...el.statuses.filter((s) => s !== 'destroyed'), 'destroyed']
            : el.statuses,
        };
      })
    );
  };

  const spendToken = (id: string) => {
    setRoster((prev) =>
      prev.map((el) => {
        if (el.id !== id || el.actionTokens <= 0) return el;
        const newTokens = el.actionTokens - 1;
        return {
          ...el,
          actionTokens: newTokens,
          activatedThisTurn: newTokens === 0,
        };
      })
    );
  };

  const toggleStatus = (id: string, status: ElementStatus) => {
    setRoster((prev) =>
      prev.map((el) => {
        if (el.id !== id) return el;
        const has = el.statuses.includes(status);
        return {
          ...el,
          statuses: has
            ? el.statuses.filter((s) => s !== status)
            : [...el.statuses, status],
        };
      })
    );
  };

  const resetTurn = () => {
    setRoster((prev) =>
      prev.map((el) => ({
        ...el,
        actionTokens: el.statuses.includes('destroyed') ? 0 : 2,
        activatedThisTurn: false,
        statuses: el.statuses.filter((s) => s !== 'guard'),
      }))
    );
  };

  const filteredElements = allElements.filter(
    (e) => !search || e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Panel className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-display-section text-dark">Force Roster</span>
        <div className="flex gap-2">
          <button
            onClick={resetTurn}
            className="text-micro text-dark-50 border border-dark-20 hover:border-dark-50 px-2 py-1 bg-transparent cursor-pointer transition-colors"
          >
            RESET TOKENS
          </button>
          <button
            onClick={() => setShowPicker(true)}
            className="text-micro text-accent-dark border border-accent/40 hover:bg-accent hover:text-dark px-2 py-1 bg-transparent cursor-pointer transition-colors"
          >
            + ADD ELEMENT
          </button>
        </div>
      </div>

      {/* Element picker modal */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-dark/40 flex items-start justify-center pt-16"
            onClick={(e) => e.target === e.currentTarget && setShowPicker(false)}
          >
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              className="w-full max-w-lg bg-bg-card border border-dark-20 shadow-lg overflow-hidden"
            >
              <div className="flex items-center border-b border-dark-20">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search elements..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 text-body bg-transparent border-none px-5 py-3 text-dark placeholder:text-dark-50 focus:outline-none"
                />
                <button
                  onClick={() => { setShowPicker(false); setSearch(''); }}
                  className="text-meta text-dark-50 px-4 bg-transparent border-none cursor-pointer"
                >
                  ESC
                </button>
              </div>
              <div className="max-h-[50vh] overflow-y-auto">
                {filteredElements.slice(0, 40).map((el) => (
                  <button
                    key={el.id}
                    onClick={() => addElement(el)}
                    className="w-full text-left px-5 py-2.5 border-b border-dark-20 hover:bg-hover cursor-pointer transition-colors bg-transparent"
                  >
                    <span className="text-display-section text-dark">{el.name}</span>
                    <span className="text-micro text-dark-50 ml-2">
                      C{el.class} {el.motive_type} — M{el.stats.M} F{el.stats.F} D{el.stats.D} A{el.stats.A}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roster grid */}
      {roster.length === 0 ? (
        <p className="text-body-sm text-dark-50 text-center py-6">
          No elements in roster. Add elements to track their state during play.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {roster.map((el) => (
            <motion.div
              key={el.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{
                opacity: el.statuses.includes('destroyed') ? 0.4 : el.activatedThisTurn ? 0.6 : 1,
                scale: 1,
              }}
              transition={{ duration: 0.2 }}
              className="relative border border-dark-20 bg-bg-card overflow-hidden"
            >
              <CropMarks size={8} />

              {/* Header */}
              <div className="bg-dark flex items-center justify-between px-3 py-1.5">
                <span className="text-display-card text-white text-sm">{el.element.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-micro text-accent">C{el.element.class}</span>
                  <button
                    onClick={() => removeElement(el.id)}
                    className="text-micro text-dark-50 hover:text-white bg-transparent border-none cursor-pointer"
                  >
                    X
                  </button>
                </div>
              </div>

              <div className="p-3">
                {/* Stats row */}
                <div className="grid grid-cols-4 gap-0 mb-2">
                  <StatCell label="m" value={el.currentM} className="!min-h-[36px]" />
                  <StatCell label="f" value={el.currentF} className="!min-h-[36px]" />
                  <StatCell label="d" value={el.currentD} className="!min-h-[36px]" />
                  <StatCell label="a" value={el.currentA} className="!min-h-[36px]" />
                </div>

                {/* Damage bar */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-micro text-dark-50 w-8">DMG</span>
                  <div className="flex gap-0.5 flex-1">
                    {Array.from({ length: el.maxDamage }, (_, i) => (
                      <div
                        key={i}
                        className={`h-3 flex-1 border border-dark-20 ${
                          i < el.damageBar ? 'bg-red-muted' : 'bg-bg-primary'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => applyHit(el.id)}
                    disabled={el.damageBar >= el.maxDamage}
                    className="text-micro text-red-muted border border-red-muted/40 px-1.5 py-0.5 bg-transparent cursor-pointer hover:bg-red-muted hover:text-white transition-colors disabled:opacity-30"
                  >
                    +HIT
                  </button>
                </div>

                {/* Action tokens */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-micro text-dark-50 w-8">AT</span>
                  <div className="flex gap-1">
                    {[0, 1].map((i) => (
                      <button
                        key={i}
                        onClick={() => spendToken(el.id)}
                        disabled={el.actionTokens <= i}
                        className={`w-6 h-6 border transition-colors cursor-pointer ${
                          i < el.actionTokens
                            ? 'bg-accent border-accent hover:bg-accent-dark'
                            : 'bg-dark-20/30 border-dark-20'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-micro text-dark-50">{el.actionTokens}/2</span>
                </div>

                {/* Status badges */}
                <div className="flex flex-wrap gap-1">
                  {STATUS_OPTIONS.map((st) => {
                    const active = el.statuses.includes(st.id);
                    return (
                      <button
                        key={st.id}
                        onClick={() => toggleStatus(el.id, st.id)}
                        className={`text-micro px-1.5 py-0.5 border cursor-pointer transition-colors ${
                          active
                            ? `${st.color} border-transparent`
                            : 'bg-transparent text-dark-50 border-dark-20 hover:border-dark-50'
                        }`}
                      >
                        {st.label}
                      </button>
                    );
                  })}
                </div>

                {/* Stat adjustment */}
                <div className="flex gap-1 mt-2">
                  {(['M', 'F', 'D', 'A'] as const).map((stat) => {
                    const key = `current${stat}` as keyof RosterElement;
                    const base = el.element.stats[stat];
                    const current = el[key] as number;
                    return (
                      <div key={stat} className="flex items-center gap-0.5">
                        <button
                          onClick={() => updateElement(el.id, { [key]: Math.max(0, current - 1) })}
                          disabled={current <= 0}
                          className="text-micro w-4 h-4 flex items-center justify-center bg-transparent border border-dark-20 text-dark-50 cursor-pointer disabled:opacity-30"
                        >
                          -
                        </button>
                        <span className={`text-micro w-4 text-center ${current < base ? 'text-red-muted' : 'text-dark-50'}`}>
                          {stat}
                        </span>
                        <button
                          onClick={() => updateElement(el.id, { [key]: Math.min(base, current + 1) })}
                          disabled={current >= base}
                          className="text-micro w-4 h-4 flex items-center justify-center bg-transparent border border-dark-20 text-dark-50 cursor-pointer disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Panel>
  );
}
