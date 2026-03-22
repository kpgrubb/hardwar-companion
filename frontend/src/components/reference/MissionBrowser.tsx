import { useState } from 'react';
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
        <p className="font-body text-sm text-dark-50">
          Mission data is being prepared. Check back soon.
        </p>
      </Panel>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Mission List */}
      <div className="lg:col-span-1 space-y-1">
        {missions.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedId(m.id)}
            className={`w-full text-left px-3 py-2 border cursor-pointer transition-colors flex items-center justify-between ${
              selectedId === m.id
                ? 'bg-accent text-dark border-accent'
                : 'bg-transparent text-dark border-dark-20 hover:border-accent'
            }`}
          >
            <span className="font-ui text-xs uppercase tracking-wide">
              {m.id}: {m.name}
            </span>
            <span className="font-mono text-[8pt] text-dark-50">
              {m.duration}T
            </span>
          </button>
        ))}
      </div>

      {/* Mission Detail */}
      <div className="lg:col-span-2">
        {selected ? (
          <Panel accentBar>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-2xl font-bold uppercase text-dark m-0">
                {selected.id}: {selected.name}
              </h3>
              <span className="font-mono text-[8pt] text-dark-50">
                p.{selected.page_ref}
              </span>
            </div>

            {/* Stats row */}
            <div className="flex gap-4 mb-4 pb-3 border-b border-dark-20">
              <div>
                <span className="font-ui text-[7pt] text-dark-50 uppercase tracking-widest block">
                  Table
                </span>
                <span className="font-mono text-sm text-dark">{selected.table_size}</span>
              </div>
              <div>
                <span className="font-ui text-[7pt] text-dark-50 uppercase tracking-widest block">
                  Duration
                </span>
                <span className="font-mono text-sm text-dark">{selected.duration} turns</span>
              </div>
              <div>
                <span className="font-ui text-[7pt] text-dark-50 uppercase tracking-widest block">
                  AI FC
                </span>
                <span className="font-mono text-sm text-dark">{selected.ai_fc_percent}%</span>
              </div>
            </div>

            {/* Objective */}
            <div className="mb-3">
              <h4 className="font-ui text-[8pt] text-dark-50 uppercase tracking-widest mb-1">
                Objective
              </h4>
              <p className="font-body text-sm text-dark">{selected.objective_summary}</p>
            </div>

            {/* Deployment */}
            <div className="mb-3">
              <h4 className="font-ui text-[8pt] text-dark-50 uppercase tracking-widest mb-1">
                Deployment
              </h4>
              <p className="font-body text-sm text-dark">{selected.deployment_rules}</p>
            </div>

            {/* Victory Conditions */}
            <div className="mb-3">
              <h4 className="font-ui text-[8pt] text-dark-50 uppercase tracking-widest mb-1">
                Victory Conditions
              </h4>
              <ul className="list-none m-0 p-0 space-y-1">
                {selected.victory_conditions.map((vc, i) => (
                  <li key={i} className="font-body text-sm text-dark pl-3 border-l-2 border-accent">
                    {vc}
                  </li>
                ))}
              </ul>
            </div>

            {/* Special Rules */}
            {selected.special_rules && (
              <div className="mb-3">
                <h4 className="font-ui text-[8pt] text-dark-50 uppercase tracking-widest mb-1">
                  Special Rules
                </h4>
                <p className="font-body text-sm text-dark">{selected.special_rules}</p>
              </div>
            )}

            {/* Campaign Outcomes */}
            {selected.campaign_outcomes.length > 0 && (
              <div>
                <h4 className="font-ui text-[8pt] text-dark-50 uppercase tracking-widest mb-1">
                  Campaign Outcomes
                </h4>
                <ul className="list-none m-0 p-0 space-y-1">
                  {selected.campaign_outcomes.map((co, i) => (
                    <li key={i} className="font-mono text-[9pt] text-dark-50">
                      {co}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Panel>
        ) : (
          <Panel dotMatrix className="flex items-center justify-center min-h-[300px]">
            <p className="font-body text-sm text-dark-50">
              Select a mission to view details.
            </p>
          </Panel>
        )}
      </div>
    </div>
  );
}
