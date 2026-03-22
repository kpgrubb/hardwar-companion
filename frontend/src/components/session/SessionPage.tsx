import { motion } from 'framer-motion';
import Panel from '../shared/Panel';

export default function SessionPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6">
        <span className="text-micro text-dark-50 block mb-1">CORE &gt; SESSION</span>
        <h1 className="text-display-title text-dark m-0">Session Aid</h1>
      </div>

      <Panel statusTape="muted" dotMatrix>
        <span className="text-micro text-dark-50 block mb-2">PHASE 4 — IN DEVELOPMENT</span>
        <p className="text-body text-secondary">
          Session setup, turn flow controls, and the Solo/Co-op AI spawn engine are coming next.
          This will include the full spawn cascade system, target priority resolver, AI activation
          advisor, and element state tracking.
        </p>
      </Panel>
    </motion.div>
  );
}
