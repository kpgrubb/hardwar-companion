import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Panel from '../shared/Panel';
import { useSessionStore } from '../../stores/sessionStore';

const TYPE_COLORS = {
  system: 'text-dark-50',
  spawn: 'text-accent-dark',
  combat: 'text-red-muted',
  user: 'text-dark',
};

export default function BattleLog() {
  const { log, addLog } = useSessionStore();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log.length]);

  const handleAddNote = () => {
    const note = prompt('Add a note to the battle log:');
    if (note?.trim()) {
      addLog(note.trim(), 'user');
    }
  };

  return (
    <Panel className="flex flex-col !p-0 overflow-hidden">
      <div className="bg-dark px-4 py-2 flex items-center justify-between">
        <span className="text-display-section text-white">Battle Log</span>
        <button
          onClick={handleAddNote}
          className="text-micro text-dark-50 hover:text-white bg-transparent border border-dark-50/30 px-2 py-0.5 cursor-pointer transition-colors"
        >
          + NOTE
        </button>
      </div>

      <div className="overflow-y-auto max-h-[300px] p-3 space-y-1">
        {log.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className="flex gap-2 items-start"
          >
            <span className="text-micro text-dark-50 shrink-0 w-6 text-right">
              T{entry.turn}
            </span>
            <span className={`text-body-sm ${TYPE_COLORS[entry.type] || 'text-dark'}`}>
              {entry.message}
            </span>
          </motion.div>
        ))}
        <div ref={endRef} />
      </div>

      {log.length === 0 && (
        <div className="p-4 text-center">
          <span className="text-body-sm text-dark-50">Session events will appear here.</span>
        </div>
      )}
    </Panel>
  );
}
