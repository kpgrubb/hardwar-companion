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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {filtered.map((card) => (
        <Panel key={card.id} accentBar>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-ui text-xs uppercase tracking-widest text-dark m-0">
              {card.title}
            </h3>
            <span className="font-mono text-[7pt] text-dark-50">
              p.{card.page_ref}
            </span>
          </div>
          <ol className="list-none m-0 p-0 space-y-1.5">
            {card.items.map((item, i) => (
              <li key={i} className="font-body text-[9pt] text-dark leading-snug">
                {item}
              </li>
            ))}
          </ol>
        </Panel>
      ))}
    </div>
  );
}
