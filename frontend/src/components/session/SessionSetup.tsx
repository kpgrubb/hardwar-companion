import { useState } from 'react';
import { motion } from 'framer-motion';
import Panel from '../shared/Panel';
import { useRulesetStore } from '../../stores/rulesetStore';
import { useSessionStore } from '../../stores/sessionStore';
import missionsData from '../../data/missions.json';
import type { GameMode, FieldAsset } from '../../types';

interface Mission {
  id: string;
  name: string;
  ai_fc_percent: number;
  duration: number;
}

const missions = missionsData as Mission[];

export default function SessionSetup() {
  const ruleset = useRulesetStore((s) => s.ruleset);
  const startSession = useSessionStore((s) => s.startSession);

  const [mode, setMode] = useState<GameMode>('solo');
  const [missionId, setMissionId] = useState('M0');
  const [playerFc, setPlayerFc] = useState(10);
  const [fieldAsset, setFieldAsset] = useState<FieldAsset | null>('hq');

  const selectedMission = missions.find((m) => m.id === missionId);
  const aiFcPercent = selectedMission?.ai_fc_percent ?? 100;
  const aiFcTotal = Math.ceil(playerFc * (aiFcPercent / 100));
  const maxTurns = selectedMission?.duration ?? 6;
  const bp = Math.floor(playerFc / 5);

  const handleStart = () => {
    startSession(
      { ruleset, mode, missionId, playerFc, fieldAsset: mode !== 'competitive' ? fieldAsset : null },
      { aiFcTotal, maxTurns, bp }
    );
  };

  const randomMission = () => {
    const roll = Math.floor(Math.random() * 12);
    setMissionId(`M${roll}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-2xl mx-auto">
        <Panel statusTape="accent">
          <span className="text-micro text-accent-dark block mb-2">SESSION CONFIGURATION</span>
          <h2 className="text-display-title text-dark m-0 mb-6">New Game Session</h2>

          <div className="space-y-5">
            {/* Game Mode */}
            <div>
              <label className="text-display-section text-dark-50 block mb-2">Game Mode</label>
              <div className="flex gap-2">
                {(['solo', 'coop', 'competitive'] as GameMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`text-meta px-4 py-2 border cursor-pointer transition-colors ${
                      mode === m
                        ? 'bg-accent text-dark border-accent'
                        : 'bg-transparent text-dark-50 border-dark-20 hover:border-dark-50'
                    }`}
                  >
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Mission */}
            <div>
              <label className="text-display-section text-dark-50 block mb-2">Mission</label>
              <div className="flex gap-2">
                <select
                  value={missionId}
                  onChange={(e) => setMissionId(e.target.value)}
                  className="flex-1 text-body bg-surface border border-dark-20 px-4 py-2.5 text-dark focus:outline-none focus:border-accent transition-colors"
                >
                  {missions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id}: {m.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={randomMission}
                  className="text-meta text-dark-50 border border-dark-20 hover:border-accent px-4 py-2 bg-transparent cursor-pointer transition-colors"
                >
                  D12 RANDOM
                </button>
              </div>
            </div>

            {/* Player FC */}
            <div>
              <label className="text-display-section text-dark-50 block mb-2">
                Player Force Class
              </label>
              <input
                type="number"
                min={5}
                max={50}
                value={playerFc}
                onChange={(e) => setPlayerFc(parseInt(e.target.value) || 10)}
                className="text-body bg-surface border border-dark-20 px-4 py-2.5 text-dark w-32 focus:outline-none focus:border-accent transition-colors"
              />
              <div className="flex gap-6 mt-2">
                <span className="text-micro text-dark-50">
                  AI FC: <span className="text-dark">{aiFcTotal}</span> ({aiFcPercent}%)
                </span>
                <span className="text-micro text-dark-50">
                  BP: <span className="text-dark">{bp}</span>
                </span>
                <span className="text-micro text-dark-50">
                  TURNS: <span className="text-dark">{maxTurns > 0 ? maxTurns : 'UNL'}</span>
                </span>
              </div>
            </div>

            {/* Field Asset (Solo/Co-op only) */}
            {mode !== 'competitive' && (
              <div>
                <label className="text-display-section text-dark-50 block mb-2">
                  Field Asset
                </label>
                <div className="flex gap-2">
                  {([
                    { id: 'hq' as FieldAsset, label: 'Frontline HQ', desc: '+1 BP for HQ Assets' },
                    { id: 'logistics' as FieldAsset, label: 'Logistics Hub', desc: '+1 FC' },
                    { id: 'comms' as FieldAsset, label: 'Comms Node', desc: '+2 Interference Tokens' },
                  ]).map((fa) => (
                    <button
                      key={fa.id}
                      onClick={() => setFieldAsset(fa.id)}
                      className={`text-left px-3 py-2 border cursor-pointer transition-colors flex-1 ${
                        fieldAsset === fa.id
                          ? 'bg-accent text-dark border-accent'
                          : 'bg-transparent text-dark border-dark-20 hover:border-dark-50'
                      }`}
                    >
                      <span className="text-display-section block">{fa.label}</span>
                      <span className="text-micro text-dark-50 block mt-0.5">{fa.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Start button */}
          <div className="mt-8 pt-5 border-t border-dark-20">
            <button
              onClick={handleStart}
              className="w-full text-display-section bg-accent text-dark py-3 border-none cursor-pointer hover:bg-accent-dark transition-colors"
            >
              BEGIN SESSION
            </button>
          </div>
        </Panel>
      </div>
    </motion.div>
  );
}
