import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Panel from '../shared/Panel';
import CropMarks from '../shared/CropMarks';
import KeywordText from '../shared/KeywordText';
import { useLearnProgressStore } from '../../stores/learnProgressStore';
import { useRulesetStore } from '../../stores/rulesetStore';
import modulesData from '../../data/learn-modules.json';

interface LearnModule {
  id: string;
  title: string;
  order: number;
  summary: string;
  content: string;
  quickplay_note: string | null;
  page_ref: number;
  worked_example?: string;
}

const modules = (modulesData as LearnModule[]).sort((a, b) => a.order - b.order);

export default function LearnHub() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { completedModules, markCompleted, isCompleted } = useLearnProgressStore();
  const ruleset = useRulesetStore((s) => s.ruleset);

  const selected = modules.find((m) => m.id === selectedId);
  const currentIdx = modules.findIndex((m) => m.id === selectedId);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    markCompleted(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Page header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="text-micro text-dark-50 block mb-1">CORE &gt; LEARN</span>
          <h1 className="text-display-title text-dark m-0">Learn the Rules</h1>
        </div>
        <span className="text-meta text-dark-50">
          {completedModules.length}/{modules.length} COMPLETE
        </span>
      </div>

      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div
            key="module"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            {/* Back nav */}
            <button
              onClick={() => setSelectedId(null)}
              className="text-meta text-dark-50 hover:text-dark bg-transparent border border-dark-20 hover:border-dark-50 px-3 py-1.5 cursor-pointer transition-colors mb-6"
            >
              &larr; ALL MODULES
            </button>

            <Panel statusTape="accent">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-micro text-accent-dark block mb-1">
                    MODULE {String(selected.order).padStart(2, '0')}
                  </span>
                  <h2 className="text-display-title text-dark m-0">
                    {selected.title}
                  </h2>
                </div>
                <span className="text-micro text-dark-50">p.{selected.page_ref}</span>
              </div>

              {/* Summary highlight */}
              <div className="bg-accent-glow border-l-4 border-accent p-4 mb-6">
                <KeywordText
                  text={selected.summary}
                  className="text-body text-dark"
                />
              </div>

              {/* Content */}
              <div className="space-y-4">
                {selected.content.split('\n\n').map((paragraph, i) => (
                  <KeywordText
                    key={i}
                    text={paragraph}
                    className="text-body text-secondary block whitespace-pre-line"
                  />
                ))}
              </div>

              {/* Quickplay callout */}
              {selected.quickplay_note && (
                <div className="mt-6 bg-accent-glow border border-accent/40 p-4">
                  <span className="text-micro text-accent-dark block mb-2">
                    QUICKPLAY VARIANT
                  </span>
                  <KeywordText
                    text={selected.quickplay_note}
                    className="text-body text-dark"
                  />
                </div>
              )}

              {/* Worked example */}
              {selected.worked_example && (
                <div className="mt-6 bg-surface border border-dark-20 p-4">
                  <span className="text-micro text-dark-50 block mb-2">
                    WORKED EXAMPLE
                  </span>
                  {selected.worked_example.split('\n\n').map((p, i) => (
                    <KeywordText
                      key={i}
                      text={p}
                      className="text-meta text-secondary block mb-2 leading-relaxed normal-case"
                    />
                  ))}
                </div>
              )}
            </Panel>

            {/* Nav */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => currentIdx > 0 && handleSelect(modules[currentIdx - 1].id)}
                disabled={currentIdx <= 0}
                className="text-meta text-dark-50 hover:text-dark bg-transparent border border-dark-20 hover:border-dark-50 px-4 py-2 cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                &larr; PREVIOUS
              </button>
              <button
                onClick={() =>
                  currentIdx < modules.length - 1 && handleSelect(modules[currentIdx + 1].id)
                }
                disabled={currentIdx >= modules.length - 1}
                className="text-meta text-dark hover:text-dark bg-transparent border border-dark-20 hover:border-dark-50 px-4 py-2 cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                NEXT &rarr;
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((mod, i) => {
                const completed = isCompleted(mod.id);
                return (
                  <motion.button
                    key={mod.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    onClick={() => handleSelect(mod.id)}
                    className="relative text-left p-5 border border-dark-20 bg-bg-card cursor-pointer transition-all duration-200 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:border-dark-50"
                  >
                    <CropMarks size={10} />
                    {completed && (
                      <div className="absolute top-0 bottom-0 left-0 w-1 bg-accent" aria-hidden />
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-micro text-dark-50">
                        {String(mod.order).padStart(2, '0')}
                      </span>
                      {completed && (
                        <span className="text-micro text-accent-dark">DONE</span>
                      )}
                    </div>
                    <h3 className="text-display-card text-dark m-0 mb-2">
                      {mod.title}
                    </h3>
                    <p className="text-body-sm text-dark-50 m-0 line-clamp-2">
                      {mod.summary}
                    </p>
                    {mod.quickplay_note && ruleset === 'quickplay' && (
                      <span className="text-micro text-accent-dark mt-2 block">
                        HAS QP VARIANT
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
