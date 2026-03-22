import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Panel from '../shared/Panel';
import DirectionWheel from './DirectionWheel';
import { useSessionStore } from '../../stores/sessionStore';
import { spawnCheck, spawnResolve, resolveStrategicAsset } from '../../api/spawn';
import type { SpawnCheckResult, SpawnCascadeResult, StrategicAssetResult } from '../../api/spawn';

type SpawnState = 'idle' | 'checking' | 'check_result' | 'resolving' | 'resolved' | 'strategic' | 'error';

export default function SpawnPanel() {
  const { turn, aiFcSpent, aiFcTotal, aiInterferencePool, addLog, updateAiFc, addToSpottingPool, updateInterferencePool } = useSessionStore();

  const [state, setState] = useState<SpawnState>('idle');
  const [checkResult, setCheckResult] = useState<SpawnCheckResult | null>(null);
  const [cascadeResult, setCascadeResult] = useState<SpawnCascadeResult | null>(null);
  const [strategicResult, setStrategicResult] = useState<StrategicAssetResult | null>(null);
  const [dStat, setDStat] = useState(2);
  const [triggerElement, setTriggerElement] = useState('Active Element');
  const [error, setError] = useState<string | null>(null);

  const fcExhausted = aiFcSpent >= aiFcTotal;

  const handleSpawnCheck = async () => {
    setState('checking');
    setError(null);
    try {
      const result = await spawnCheck(turn, aiFcSpent, aiFcTotal);
      setCheckResult(result);
      setState('check_result');
      addLog(
        `Spawn check: D12(${result.roll}) + Turn(${result.turn}) = ${result.total} → ${result.triggered ? 'SPAWN' : 'No spawn'}`,
        'spawn'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Spawn check failed. Is the backend running?');
      setState('error');
    }
  };

  const handleResolve = async () => {
    setState('resolving');
    try {
      const result = await spawnResolve(dStat, triggerElement);
      setCascadeResult(result);
      setState('resolved');

      const fcCost = result.fc_cost || 0;
      if (fcCost > 0) {
        updateAiFc(aiFcSpent + fcCost);
      }

      if (result.spotting?.spotted) {
        addToSpottingPool({
          name: result.unit_type,
          class: parseInt(result.spawn_class.replace('C', '')) || 1,
          unit_type: result.unit_type,
          spotted_turn: turn,
        });
        addLog(`Spawned ${result.spawn_class} ${result.unit_type} → SPOTTED (to pool)`, 'spawn');
      } else if (result.spawn_class === 'strategic_asset') {
        // Strategic asset needs separate resolution
        const saResult = await resolveStrategicAsset(aiInterferencePool);
        setStrategicResult(saResult);
        setState('strategic');
        updateInterferencePool(saResult.ew_pool_remaining);
        addLog(`Strategic Asset: ${saResult.asset} — ${saResult.description}`, 'spawn');
      } else {
        addLog(
          `Spawned ${result.spawn_class} ${result.unit_type} (${result.motive}) at ${result.direction?.direction_label}, ${result.direction?.distance}"`,
          'spawn'
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Spawn resolve failed');
      setState('error');
    }
  };

  const reset = () => {
    setState('idle');
    setCheckResult(null);
    setCascadeResult(null);
    setStrategicResult(null);
    setError(null);
  };

  return (
    <Panel statusTape="accent" className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-display-section text-dark">Spawn Check</span>
        {fcExhausted && (
          <span className="text-micro text-red-muted border border-red-muted/40 px-2 py-0.5">
            FC EXHAUSTED
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* IDLE — Ready to check */}
        {state === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-body-sm text-dark-50 mb-3">
              Tap after each player action completes. Rolls D12 + turn ({turn}) — needs {8 - turn}+ to spawn.
            </p>
            <button
              onClick={handleSpawnCheck}
              disabled={fcExhausted}
              className="w-full text-display-section bg-accent text-dark py-2.5 border-none cursor-pointer hover:bg-accent-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ACTION COMPLETE — CHECK SPAWN
            </button>
          </motion.div>
        )}

        {state === 'checking' && (
          <motion.div key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
            <span className="text-meta text-dark-50 animate-pulse">Rolling D12...</span>
          </motion.div>
        )}

        {/* CHECK RESULT */}
        {state === 'check_result' && checkResult && (
          <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="bg-surface border border-dark-20 p-4 mb-3">
              <div className="flex items-center gap-4 mb-2">
                <div>
                  <span className="text-micro text-dark-50 block">D12</span>
                  <span className="text-display-title text-dark">{checkResult.roll}</span>
                </div>
                <span className="text-display-card text-dark-50">+</span>
                <div>
                  <span className="text-micro text-dark-50 block">TURN</span>
                  <span className="text-display-title text-dark">{checkResult.turn}</span>
                </div>
                <span className="text-display-card text-dark-50">=</span>
                <div>
                  <span className="text-micro text-dark-50 block">TOTAL</span>
                  <span className={`text-display-title ${checkResult.triggered ? 'text-accent-dark' : 'text-dark-50'}`}>
                    {checkResult.total}
                  </span>
                </div>
              </div>
              <span className={`text-display-section ${checkResult.triggered ? 'text-accent-dark' : 'text-dark-50'}`}>
                {checkResult.triggered ? 'SPAWN TRIGGERED' : 'NO SPAWN'}
              </span>
            </div>

            {checkResult.triggered ? (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-micro text-dark-50 block mb-1">TRIGGER ELEMENT D STAT</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={dStat}
                      onChange={(e) => setDStat(parseInt(e.target.value) || 1)}
                      className="text-body bg-surface border border-dark-20 px-3 py-2 w-full text-dark focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-micro text-dark-50 block mb-1">TRIGGER ELEMENT</label>
                    <input
                      type="text"
                      value={triggerElement}
                      onChange={(e) => setTriggerElement(e.target.value)}
                      className="text-body bg-surface border border-dark-20 px-3 py-2 w-full text-dark focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>
                <button
                  onClick={handleResolve}
                  className="w-full text-display-section bg-accent text-dark py-2.5 border-none cursor-pointer hover:bg-accent-dark transition-colors"
                >
                  RESOLVE SPAWN
                </button>
              </div>
            ) : (
              <button
                onClick={reset}
                className="w-full text-meta text-dark-50 border border-dark-20 hover:border-dark-50 py-2 bg-transparent cursor-pointer transition-colors"
              >
                OK — CONTINUE
              </button>
            )}
          </motion.div>
        )}

        {state === 'resolving' && (
          <motion.div key="resolving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
            <span className="text-meta text-dark-50 animate-pulse">Resolving spawn cascade...</span>
          </motion.div>
        )}

        {/* RESOLVED — Full cascade */}
        {state === 'resolved' && cascadeResult && (
          <motion.div key="resolved" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Steps */}
            <div className="space-y-2 mb-4">
              {cascadeResult.steps?.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="text-body-sm text-secondary pl-3 border-l-2 border-accent"
                >
                  {step}
                </motion.div>
              ))}
            </div>

            {/* Result summary */}
            <div className="bg-surface border border-dark-20 p-4 mb-3">
              <div className="flex items-center gap-4 mb-2">
                <div>
                  <span className="text-micro text-dark-50 block">CLASS</span>
                  <span className="text-display-card text-dark">{cascadeResult.spawn_class}</span>
                </div>
                <div>
                  <span className="text-micro text-dark-50 block">UNIT</span>
                  <span className="text-display-card text-dark">{cascadeResult.unit_type}</span>
                </div>
                <div>
                  <span className="text-micro text-dark-50 block">MOTIVE</span>
                  <span className="text-meta text-dark">{cascadeResult.motive}</span>
                </div>
              </div>

              {cascadeResult.spotting && (
                <div className={`text-display-section mt-2 ${cascadeResult.spotting.spotted ? 'text-accent-dark' : 'text-green'}`}>
                  {cascadeResult.spotting.spotted ? 'SPOTTED — TO POOL' : 'UNSPOTTED — PLACE NOW'}
                </div>
              )}
            </div>

            {/* Direction wheel (only if not spotted) */}
            {cascadeResult.direction && !cascadeResult.spotting?.spotted && (
              <div className="flex items-center gap-4 mb-3">
                <DirectionWheel highlightSegment={cascadeResult.direction.direction_roll} size={180} />
                <div>
                  <div className="mb-2">
                    <span className="text-micro text-dark-50 block">DIRECTION</span>
                    <span className="text-meta text-dark">{cascadeResult.direction.direction_label}</span>
                  </div>
                  <div>
                    <span className="text-micro text-dark-50 block">DISTANCE</span>
                    <span className="text-display-card text-dark">{cascadeResult.direction.distance}"</span>
                  </div>
                  <div className="mt-2 text-micro text-dark-50">
                    Min 1" from AI, 5" from player
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={reset}
              className="w-full text-meta text-dark-50 border border-dark-20 hover:border-dark-50 py-2 bg-transparent cursor-pointer transition-colors"
            >
              OK — NEXT ACTION
            </button>
          </motion.div>
        )}

        {/* STRATEGIC ASSET */}
        {state === 'strategic' && strategicResult && (
          <motion.div key="strategic" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-surface border border-dark-20 p-4 mb-3">
              <span className="text-micro text-accent-dark block mb-2">STRATEGIC ASSET</span>
              <span className="text-display-card text-dark block mb-1">{strategicResult.asset}</span>
              <p className="text-body-sm text-secondary m-0">{strategicResult.description}</p>
              <div className="flex gap-4 mt-3">
                <span className="text-micro text-dark-50">
                  EW COST: <span className="text-dark">{strategicResult.ew_tokens_cost}</span>
                </span>
                <span className="text-micro text-dark-50">
                  POOL: <span className="text-dark">{strategicResult.ew_pool_remaining}</span>
                </span>
              </div>
            </div>
            {strategicResult.steps?.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-body-sm text-secondary pl-3 border-l-2 border-accent mb-1.5"
              >
                {step}
              </motion.div>
            ))}
            <button
              onClick={reset}
              className="w-full text-meta text-dark-50 border border-dark-20 hover:border-dark-50 py-2 bg-transparent cursor-pointer transition-colors mt-3"
            >
              OK — CONTINUE
            </button>
          </motion.div>
        )}

        {/* ERROR */}
        {state === 'error' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-red-muted/10 border border-red-muted/40 p-3 mb-3">
              <span className="text-body-sm text-red-muted">{error}</span>
            </div>
            <button onClick={reset} className="text-meta text-dark-50 border border-dark-20 px-4 py-2 bg-transparent cursor-pointer transition-colors">
              DISMISS
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  );
}
