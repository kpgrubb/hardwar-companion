import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Panel from '../shared/Panel';
import { useSessionStore } from '../../stores/sessionStore';
import { resolveEW } from '../../api/spawn';

export default function TurnControls() {
  const {
    turn, maxTurns, config,
    advanceTurn, addLog, endSession,
    aiInterferencePool, updateInterferencePool, setJammedComms,
    spottingPool, removeFromSpottingPool,
    playerVp, aiVp,
  } = useSessionStore();

  const [showForfeit, setShowForfeit] = useState(false);
  const [ewResolving, setEwResolving] = useState(false);

  const isSolo = config?.mode === 'solo' || config?.mode === 'coop';
  const gameOver = maxTurns > 0 && turn >= maxTurns;

  const handleNextTurn = () => {
    advanceTurn();
    if (spottingPool.length > 0) {
      addLog(`Spotting Pool has ${spottingPool.length} element(s) — spawn from table center.`, 'system');
    }
  };

  const handleEW = async () => {
    if (!isSolo) {
      addLog('EW: Follow the Core rulebook EW procedure for competitive play.', 'system');
      return;
    }
    setEwResolving(true);
    try {
      const result = await resolveEW(aiInterferencePool);
      updateInterferencePool(result.ai_interference_pool_remaining);
      if (result.jammed) {
        setJammedComms(true);
        addLog(`EW: AI jammed comms! (D12=${result.roll}, ${result.tokens_used} tokens spent, ${result.ai_interference_pool_remaining} remaining)`, 'system');
      } else {
        addLog(`EW: No jam. (D12=${result.roll}, ${result.tokens_used} tokens spent, ${result.ai_interference_pool_remaining} remaining)`, 'system');
      }
    } catch {
      addLog('EW: Backend unavailable — resolve manually.', 'system');
    }
    setEwResolving(false);
  };

  const handleForfeit = () => {
    addLog(`FORFEIT declared. Final VP: Player ${playerVp} / AI ${aiVp}`, 'system');
    setShowForfeit(false);
  };

  const handleEndSession = () => {
    endSession();
  };

  return (
    <Panel className="mb-4">
      <span className="text-display-section text-dark-50 block mb-3">TURN CONTROLS</span>

      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={handleNextTurn}
          disabled={gameOver}
          className="text-meta bg-accent text-dark px-4 py-2 border-none cursor-pointer hover:bg-accent-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          NEXT TURN
        </button>

        <button
          onClick={() => addLog(`Initiative: ${isSolo ? 'Player holds initiative (Solo/Co-op).' : 'Conduct Initiative bid per Core rules.'}`, 'system')}
          className="text-meta text-dark border border-dark-20 hover:border-dark-50 px-4 py-2 bg-transparent cursor-pointer transition-colors"
        >
          INITIATIVE
        </button>

        <button
          onClick={handleEW}
          disabled={ewResolving}
          className="text-meta text-dark border border-dark-20 hover:border-dark-50 px-4 py-2 bg-transparent cursor-pointer transition-colors disabled:opacity-50"
        >
          {ewResolving ? 'RESOLVING...' : 'ELECTRONIC WARFARE'}
        </button>

        <button
          onClick={() => setShowForfeit(true)}
          className="text-meta text-red-muted border border-red-muted/40 hover:border-red-muted px-4 py-2 bg-transparent cursor-pointer transition-colors ml-auto"
        >
          FORFEIT
        </button>
      </div>

      {/* Spotting pool reminder */}
      {spottingPool.length > 0 && (
        <div className="bg-accent-glow border border-accent/40 p-3 mb-3">
          <span className="text-micro text-accent-dark block mb-1.5">
            SPOTTING POOL ({spottingPool.length})
          </span>
          {spottingPool.map((el) => (
            <div key={el.name} className="flex items-center justify-between mb-1">
              <span className="text-body-sm text-dark">
                C{el.class} {el.unit_type} (spotted T{el.spotted_turn})
              </span>
              <button
                onClick={() => {
                  removeFromSpottingPool(el.name);
                  addLog(`Pool spawn: ${el.unit_type} placed from center.`, 'spawn');
                }}
                className="text-micro text-accent-dark border border-accent/40 px-2 py-0.5 bg-transparent cursor-pointer hover:bg-accent hover:text-dark transition-colors"
              >
                PLACE
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Game over */}
      {gameOver && (
        <div className="bg-surface border border-dark-20 p-4 text-center">
          <span className="text-display-card text-dark block mb-2">GAME OVER</span>
          <span className="text-meta text-dark-50 block mb-3">
            Final: Player {playerVp} VP vs AI {aiVp} VP
          </span>
          <button
            onClick={handleEndSession}
            className="text-meta bg-accent text-dark px-6 py-2 border-none cursor-pointer hover:bg-accent-dark transition-colors"
          >
            END SESSION
          </button>
        </div>
      )}

      {/* Forfeit dialog */}
      <AnimatePresence>
        {showForfeit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-dark/50 flex items-center justify-center"
          >
            <Panel className="max-w-sm bg-bg-card">
              <span className="text-display-card text-dark block mb-2">Declare Forfeit?</span>
              <p className="text-body-sm text-secondary mb-4">
                Retreating all active elements. VP will be tallied.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowForfeit(false)}
                  className="flex-1 text-meta text-dark-50 border border-dark-20 py-2 bg-transparent cursor-pointer transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleForfeit}
                  className="flex-1 text-meta bg-red-muted text-white py-2 border-none cursor-pointer transition-colors"
                >
                  FORFEIT
                </button>
              </div>
            </Panel>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  );
}
