import Panel from '../shared/Panel';

export default function SessionPage() {
  return (
    <div>
      <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-dark mb-4">
        Session Aid
      </h2>
      <Panel dotMatrix>
        <p className="font-body text-sm text-dark-50">
          Session setup, turn flow controls, and the Solo/Co-op AI spawn engine coming in Phase 4.
        </p>
      </Panel>
    </div>
  );
}
