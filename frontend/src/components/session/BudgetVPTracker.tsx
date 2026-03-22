import { useState } from 'react';
import { motion } from 'framer-motion';
import Panel from '../shared/Panel';
import { useSessionStore } from '../../stores/sessionStore';

export default function BudgetVPTracker() {
  const {
    playerVp, aiVp, playerBp, config,
    updateVp, updateBp, addLog,
  } = useSessionStore();

  const [collapsed, setCollapsed] = useState(false);
  const [vpInput, setVpInput] = useState('');
  const [bpSpend, setBpSpend] = useState('');

  const playerFc = config?.playerFc ?? 10;
  const maxCutFc = Math.floor(playerFc * 0.25);

  const handleAddPlayerVp = (amount: number) => {
    updateVp(amount, 0);
    addLog(`Player VP ${amount > 0 ? '+' : ''}${amount} (total: ${playerVp + amount})`, 'combat');
  };

  const handleAddAiVp = (amount: number) => {
    updateVp(0, amount);
    addLog(`AI VP ${amount > 0 ? '+' : ''}${amount} (total: ${aiVp + amount})`, 'combat');
  };

  const handleSpendBp = () => {
    const amount = parseInt(bpSpend);
    if (!amount || amount <= 0 || amount > playerBp) return;
    updateBp(playerBp - amount);
    addLog(`Spent ${amount} BP (remaining: ${playerBp - amount})`, 'system');
    setBpSpend('');
  };

  return (
    <Panel className="mb-4">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between bg-transparent border-none cursor-pointer p-0"
      >
        <span className="text-display-section text-dark">Budget & VP</span>
        <span className="text-micro text-dark-50">{collapsed ? 'EXPAND' : 'COLLAPSE'}</span>
      </button>

      {!collapsed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
          className="mt-4 space-y-4"
        >
          {/* VP Summary */}
          <div className="flex gap-4">
            <div className="flex-1 bg-surface border border-dark-20 p-3 text-center">
              <span className="text-micro text-dark-50 block mb-1">PLAYER VP</span>
              <span className="text-display-title text-dark">{playerVp}</span>
              <div className="flex justify-center gap-1 mt-2">
                <button
                  onClick={() => handleAddPlayerVp(1)}
                  className="text-micro bg-accent text-dark w-6 h-6 border-none cursor-pointer hover:bg-accent-dark transition-colors"
                >
                  +1
                </button>
                <button
                  onClick={() => handleAddPlayerVp(-1)}
                  className="text-micro text-dark-50 border border-dark-20 w-6 h-6 bg-transparent cursor-pointer hover:border-dark-50 transition-colors"
                >
                  -1
                </button>
                {vpInput === 'player' ? (
                  <input
                    autoFocus
                    type="number"
                    className="text-micro w-10 bg-surface border border-accent px-1 text-dark focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddPlayerVp(parseInt((e.target as HTMLInputElement).value) || 0);
                        setVpInput('');
                      }
                      if (e.key === 'Escape') setVpInput('');
                    }}
                    onBlur={() => setVpInput('')}
                  />
                ) : (
                  <button
                    onClick={() => setVpInput('player')}
                    className="text-micro text-dark-50 border border-dark-20 px-1.5 h-6 bg-transparent cursor-pointer hover:border-dark-50 transition-colors"
                  >
                    +N
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 bg-surface border border-dark-20 p-3 text-center">
              <span className="text-micro text-dark-50 block mb-1">AI VP</span>
              <span className="text-display-title text-dark">{aiVp}</span>
              <div className="flex justify-center gap-1 mt-2">
                <button
                  onClick={() => handleAddAiVp(1)}
                  className="text-micro bg-red-muted/20 text-red-muted w-6 h-6 border-none cursor-pointer hover:bg-red-muted/30 transition-colors"
                >
                  +1
                </button>
                <button
                  onClick={() => handleAddAiVp(-1)}
                  className="text-micro text-dark-50 border border-dark-20 w-6 h-6 bg-transparent cursor-pointer hover:border-dark-50 transition-colors"
                >
                  -1
                </button>
                {vpInput === 'ai' ? (
                  <input
                    autoFocus
                    type="number"
                    className="text-micro w-10 bg-surface border border-accent px-1 text-dark focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddAiVp(parseInt((e.target as HTMLInputElement).value) || 0);
                        setVpInput('');
                      }
                      if (e.key === 'Escape') setVpInput('');
                    }}
                    onBlur={() => setVpInput('')}
                  />
                ) : (
                  <button
                    onClick={() => setVpInput('ai')}
                    className="text-micro text-dark-50 border border-dark-20 px-1.5 h-6 bg-transparent cursor-pointer hover:border-dark-50 transition-colors"
                  >
                    +N
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Budget Points */}
          <div className="border-t border-dark-20 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-display-section text-dark-50">BUDGET POINTS</span>
              <span className="text-meta text-dark">{playerBp} BP</span>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={playerBp}
                value={bpSpend}
                onChange={(e) => setBpSpend(e.target.value)}
                placeholder="Amount"
                className="text-body bg-surface border border-dark-20 px-3 py-1.5 w-24 text-dark placeholder:text-dark-50 focus:outline-none focus:border-accent transition-colors"
              />
              <button
                onClick={handleSpendBp}
                disabled={!bpSpend || parseInt(bpSpend) > playerBp}
                className="text-meta text-dark border border-dark-20 hover:border-dark-50 px-3 py-1.5 bg-transparent cursor-pointer transition-colors disabled:opacity-30"
              >
                SPEND BP
              </button>
            </div>
            <p className="text-micro text-dark-50 mt-2">
              Cost-cutting: max {maxCutFc} FC benchable (25% of {playerFc} FC).
              Unspent BP at mission end can convert to VP.
            </p>
          </div>
        </motion.div>
      )}
    </Panel>
  );
}
