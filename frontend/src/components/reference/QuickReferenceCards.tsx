import { motion } from 'framer-motion';
import Panel from '../shared/Panel';
import { useRulesetStore } from '../../stores/rulesetStore';
import quickRefData from '../../data/quick-reference.json';

interface QuickRefCard {
  id: string;
  title: string;
  ruleset: string;
  items: string[];
  page_ref: number;
}

const cards = quickRefData as QuickRefCard[];

export default function QuickReferenceCards() {
  const ruleset = useRulesetStore((s) => s.ruleset);

  const filtered = cards.filter(
    (c) => c.ruleset === 'both' || c.ruleset === ruleset
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {filtered.map((card, i) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.06 }}
        >
          <Panel statusTape="accent" className="h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-display-section text-dark m-0">
                {card.title}
              </h3>
              <span className="text-micro text-dark-50">p.{card.page_ref}</span>
            </div>
            <ol className="list-none m-0 p-0 space-y-2">
              {card.items.map((item, j) => (
                <li key={j} className="text-body-sm text-secondary leading-relaxed">
                  {item}
                </li>
              ))}
            </ol>
          </Panel>
        </motion.div>
      ))}
    </div>
  );
}
