import Panel from '../shared/Panel';

export default function LearnHub() {
  return (
    <div>
      <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-dark mb-4">
        Learn the Rules
      </h2>
      <Panel dotMatrix>
        <p className="font-body text-sm text-dark-50">
          Structured learning modules coming in Phase 2. Each module will cover one game mechanic
          with plain-language summaries, worked examples, and keyword linking.
        </p>
      </Panel>
    </div>
  );
}
