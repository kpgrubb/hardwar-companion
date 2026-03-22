import { useState } from 'react';
import { motion } from 'framer-motion';
import Panel from '../shared/Panel';
import missionsData from '../../data/missions.json';

interface Mission {
  id: string;
  name: string;
  number: number;
  table_size: string;
  ai_fc_percent: number;
  duration: number;
  objective_summary: string;
  victory_conditions: string[];
  deployment_rules: string;
  campaign_outcomes: string[];
  terrain_notes: string;
  special_rules: string;
  page_ref: number;
}

const missions = missionsData as Mission[];

export default function MissionBrowser() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = missions.find((m) => m.id === selectedId);

  if (missions.length === 0) {
    return (
      <Panel dotMatrix>
        <p className="text-body text-dark-50">Mission data is being prepared.</p>
      </Panel>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* Mission List */}
      <div className="lg:w-64 lg:shrink-0 space-y-1">
        {missions.map((m, i) => (
          <motion.button
            key={m.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: i * 0.03 }}
            onClick={() => setSelectedId(m.id)}
            className={`w-full text-left px-4 py-2.5 border cursor-pointer transition-colors flex items-center justify-between ${
              selectedId === m.id
                ? 'bg-accent text-dark border-accent'
                : 'bg-transparent text-dark border-dark-20 hover:bg-hover hover:border-dark-50'
            }`}
          >
            <div>
              <span className="text-micro block">{m.id}</span>
              <span className="text-display-section">{m.name}</span>
            </div>
            <span className="text-micro text-dark-50">
              {m.duration > 0 ? `${m.duration}T` : 'UNL'}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Mission Detail */}
      <div className="flex-1 min-w-0">
        {selected ? (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Panel statusTape="accent">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-micro text-accent-dark block mb-1">{selected.id}</span>
                  <h3 className="text-display-title text-dark m-0">{selected.name}</h3>
                </div>
                <span className="text-micro text-dark-50">p.{selected.page_ref}</span>
              </div>

              {/* Stats row */}
              <div className="flex gap-6 mb-5 pb-4 border-b border-dark-20">
                <div>
                  <span className="text-micro text-dark-50 block mb-0.5">TABLE</span>
                  <span className="text-meta text-dark">{selected.table_size}</span>
                </div>
                <div>
                  <span className="text-micro text-dark-50 block mb-0.5">DURATION</span>
                  <span className="text-meta text-dark">
                    {selected.duration > 0 ? `${selected.duration} TURNS` : 'NO LIMIT'}
                  </span>
                </div>
                <div>
                  <span className="text-micro text-dark-50 block mb-0.5">AI FC</span>
                  <span className="text-meta text-dark">{selected.ai_fc_percent}%</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-micro text-dark-50 block mb-1.5">OBJECTIVE</span>
                  <p className="text-body text-dark m-0">{selected.objective_summary}</p>
                </div>

                <div>
                  <span className="text-micro text-dark-50 block mb-1.5">DEPLOYMENT</span>
                  <p className="text-body text-secondary m-0">{selected.deployment_rules}</p>
                </div>

                <div>
                  <span className="text-micro text-dark-50 block mb-1.5">VICTORY CONDITIONS</span>
                  <ul className="list-none m-0 p-0 space-y-1.5">
                    {selected.victory_conditions.map((vc, i) => (
                      <li key={i} className="text-body-sm text-dark pl-4 border-l-2 border-accent">
                        {vc}
                      </li>
                    ))}
                  </ul>
                </div>

                {selected.special_rules && (
                  <div>
                    <span className="text-micro text-dark-50 block mb-1.5">SPECIAL RULES</span>
                    <p className="text-body-sm text-secondary m-0">{selected.special_rules}</p>
                  </div>
                )}

                {selected.campaign_outcomes.length > 0 && (
                  <div>
                    <span className="text-micro text-dark-50 block mb-1.5">CAMPAIGN OUTCOMES</span>
                    <ul className="list-none m-0 p-0 space-y-1">
                      {selected.campaign_outcomes.map((co, i) => (
                        <li key={i} className="text-meta text-secondary normal-case">{co}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Panel>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center min-h-[300px] border border-dashed border-dark-20">
            <p className="text-body text-dark-50">Select a mission to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
