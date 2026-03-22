import { useSessionStore } from '../../stores/sessionStore';

export default function SessionHUD() {
  const {
    turn, maxTurns, config,
    aiFcSpent, aiFcTotal, aiInterferencePool,
    playerVp, aiVp, playerBp,
    spottingPool, jammedComms,
  } = useSessionStore();

  if (!config) return null;

  const fcPercent = aiFcTotal > 0 ? Math.round((aiFcSpent / aiFcTotal) * 100) : 0;

  return (
    <div className="bg-dark text-white px-4 py-2 flex items-center gap-4 flex-wrap mb-4">
      {/* Turn */}
      <div className="flex items-center gap-1.5">
        <span className="text-micro text-dark-50">TURN</span>
        <span className="text-meta text-accent font-bold">
          {turn}{maxTurns > 0 ? `/${maxTurns}` : ''}
        </span>
      </div>

      <div className="w-px h-4 bg-dark-50/30" aria-hidden />

      {/* Mission */}
      <div className="flex items-center gap-1.5">
        <span className="text-micro text-dark-50">MISSION</span>
        <span className="text-meta text-white">{config.missionId}</span>
      </div>

      <div className="w-px h-4 bg-dark-50/30" aria-hidden />

      {/* Ruleset */}
      <span className="text-micro text-accent">{config.ruleset.toUpperCase()}</span>

      <div className="w-px h-4 bg-dark-50/30" aria-hidden />

      {/* AI FC */}
      {config.mode !== 'competitive' && (
        <>
          <div className="flex items-center gap-1.5">
            <span className="text-micro text-dark-50">AI FC</span>
            <span className="text-meta text-white">{aiFcSpent}/{aiFcTotal}</span>
            <div className="w-16 h-1.5 bg-dark-50/30 overflow-hidden">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${fcPercent}%` }}
              />
            </div>
          </div>

          <div className="w-px h-4 bg-dark-50/30" aria-hidden />

          {/* Interference */}
          <div className="flex items-center gap-1.5">
            <span className="text-micro text-dark-50">INT</span>
            <span className="text-meta text-white">{aiInterferencePool}</span>
          </div>

          <div className="w-px h-4 bg-dark-50/30" aria-hidden />
        </>
      )}

      {/* VP */}
      <div className="flex items-center gap-1.5">
        <span className="text-micro text-dark-50">VP</span>
        <span className="text-meta text-white">{playerVp}</span>
        <span className="text-micro text-dark-50">vs</span>
        <span className="text-meta text-white">{aiVp}</span>
      </div>

      <div className="w-px h-4 bg-dark-50/30" aria-hidden />

      {/* BP */}
      <div className="flex items-center gap-1.5">
        <span className="text-micro text-dark-50">BP</span>
        <span className="text-meta text-white">{playerBp}</span>
      </div>

      {/* Status flags */}
      <div className="ml-auto flex gap-2">
        {jammedComms && (
          <span className="text-micro text-red-muted border border-red-muted/40 px-2 py-0.5">
            JAMMED COMMS
          </span>
        )}
        {spottingPool.length > 0 && (
          <span className="text-micro text-accent border border-accent/40 px-2 py-0.5">
            POOL: {spottingPool.length}
          </span>
        )}
      </div>
    </div>
  );
}
