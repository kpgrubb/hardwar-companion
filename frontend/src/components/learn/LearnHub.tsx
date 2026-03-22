import { useState } from 'react';
import Panel from '../shared/Panel';
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

  if (selected) {
    return (
      <div>
        {/* Back + Module Title */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setSelectedId(null)}
            className="font-ui text-xs uppercase tracking-widest text-dark-50 hover:text-dark bg-transparent border-none cursor-pointer"
          >
            &larr; All Modules
          </button>
          <span className="font-mono text-[8pt] text-dark-50">
            {selected.order} / {modules.length}
          </span>
        </div>

        <Panel accentBar>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-2xl font-bold uppercase text-dark m-0">
              {selected.title}
            </h2>
            <span className="font-mono text-[8pt] text-dark-50">
              p.{selected.page_ref}
            </span>
          </div>

          {/* Plain-language summary */}
          <div className="bg-bg-secondary p-3 mb-4 border-l-4 border-accent">
            <KeywordText
              text={selected.summary}
              className="font-body text-sm text-dark leading-relaxed"
            />
          </div>

          {/* Full content */}
          <div className="space-y-3">
            {selected.content.split('\n\n').map((paragraph, i) => (
              <KeywordText
                key={i}
                text={paragraph}
                className="font-body text-sm text-dark leading-relaxed block whitespace-pre-line"
              />
            ))}
          </div>

          {/* Quickplay callout */}
          {selected.quickplay_note && (
            <div className="mt-4 bg-accent/10 border border-accent p-3">
              <div className="font-ui text-[8pt] text-accent-dark uppercase tracking-widest mb-1">
                Quickplay Difference
              </div>
              <KeywordText
                text={selected.quickplay_note}
                className="font-body text-sm text-dark"
              />
            </div>
          )}

          {/* Worked example */}
          {selected.worked_example && (
            <div className="mt-4 bg-bg-card border border-dark-20 p-3">
              <div className="font-ui text-[8pt] text-dark-50 uppercase tracking-widest mb-2">
                Worked Example
              </div>
              {selected.worked_example.split('\n\n').map((p, i) => (
                <KeywordText
                  key={i}
                  text={p}
                  className="font-mono text-[9pt] text-dark leading-relaxed block mb-2"
                />
              ))}
            </div>
          )}
        </Panel>

        {/* Previous / Next navigation */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() =>
              currentIdx > 0 && handleSelect(modules[currentIdx - 1].id)
            }
            disabled={currentIdx <= 0}
            className="font-ui text-xs uppercase tracking-widest px-4 py-2 border border-dark-20 bg-transparent text-dark cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:border-accent transition-colors"
          >
            &larr; Previous
          </button>
          <button
            onClick={() =>
              currentIdx < modules.length - 1 &&
              handleSelect(modules[currentIdx + 1].id)
            }
            disabled={currentIdx >= modules.length - 1}
            className="font-ui text-xs uppercase tracking-widest px-4 py-2 border border-dark-20 bg-transparent text-dark cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:border-accent transition-colors"
          >
            Next &rarr;
          </button>
        </div>
      </div>
    );
  }

  // Module grid view
  return (
    <div>
      <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-dark mb-2">
        Learn the Rules
      </h2>
      <p className="font-body text-sm text-dark-50 mb-4">
        {completedModules.length} / {modules.length} modules completed
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {modules.map((mod) => {
          const completed = isCompleted(mod.id);
          return (
            <button
              key={mod.id}
              onClick={() => handleSelect(mod.id)}
              className={`text-left p-4 border cursor-pointer transition-all hover:border-accent ${
                completed
                  ? 'bg-bg-card border-dark-20'
                  : 'bg-bg-primary border-dark-20'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-[8pt] text-dark-50">
                  {String(mod.order).padStart(2, '0')}
                </span>
                {completed && (
                  <span className="font-mono text-[8pt] text-accent-dark">
                    COMPLETE
                  </span>
                )}
              </div>
              <h3 className="font-ui text-xs uppercase tracking-wide text-dark m-0 mb-1">
                {mod.title}
              </h3>
              <p className="font-body text-[9pt] text-dark-50 m-0 line-clamp-2">
                {mod.summary}
              </p>
              {mod.quickplay_note && ruleset === 'quickplay' && (
                <div className="mt-2 font-mono text-[7pt] text-accent-dark">
                  HAS QUICKPLAY VARIANT
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
