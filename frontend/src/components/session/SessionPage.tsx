import { motion } from 'framer-motion';
import { useSessionStore } from '../../stores/sessionStore';
import SessionSetup from './SessionSetup';
import SessionHUD from './SessionHUD';
import TurnControls from './TurnControls';
import SpawnPanel from './SpawnPanel';
import BattleLog from './BattleLog';

export default function SessionPage() {
  const active = useSessionStore((s) => s.active);
  const config = useSessionStore((s) => s.config);
  const endSession = useSessionStore((s) => s.endSession);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="text-micro text-dark-50 block mb-1">CORE &gt; SESSION</span>
          <h1 className="text-display-title text-dark m-0">
            {active ? `${config?.missionId} — Active Session` : 'Session Aid'}
          </h1>
        </div>
        {active && (
          <button
            onClick={endSession}
            className="text-micro text-red-muted border border-red-muted/40 hover:border-red-muted px-3 py-1 bg-transparent cursor-pointer transition-colors"
          >
            END SESSION
          </button>
        )}
      </div>

      {!active ? (
        <SessionSetup />
      ) : (
        <>
          <SessionHUD />

          <div className="flex flex-col xl:flex-row gap-5">
            {/* Main — Spawn + Turn Controls */}
            <div className="flex-1 min-w-0">
              {(config?.mode === 'solo' || config?.mode === 'coop') && (
                <SpawnPanel />
              )}
              <TurnControls />
            </div>

            {/* Sidebar — Battle Log */}
            <div className="xl:w-[380px] xl:shrink-0">
              <div className="xl:sticky xl:top-4">
                <BattleLog />
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
