import { NavLink } from 'react-router-dom';
import { useRulesetStore } from '../../stores/rulesetStore';

export default function Header() {
  const { ruleset, setRuleset } = useRulesetStore();

  return (
    <header className="header-stripe flex items-center justify-between no-print">
      <div className="flex items-center gap-6">
        <h1 className="font-display text-xl font-bold tracking-wider text-white uppercase m-0">
          HARDWAR
        </h1>
        <nav className="flex gap-4">
          <NavLink
            to="/learn"
            className={({ isActive }) =>
              `font-ui text-xs uppercase tracking-widest no-underline transition-colors ${
                isActive ? 'text-accent' : 'text-dark-50 hover:text-white'
              }`
            }
          >
            Learn
          </NavLink>
          <NavLink
            to="/reference"
            className={({ isActive }) =>
              `font-ui text-xs uppercase tracking-widest no-underline transition-colors ${
                isActive ? 'text-accent' : 'text-dark-50 hover:text-white'
              }`
            }
          >
            Reference
          </NavLink>
          <NavLink
            to="/session"
            className={({ isActive }) =>
              `font-ui text-xs uppercase tracking-widest no-underline transition-colors ${
                isActive ? 'text-accent' : 'text-dark-50 hover:text-white'
              }`
            }
          >
            Session
          </NavLink>
        </nav>
      </div>
      <button
        onClick={() => setRuleset(ruleset === 'core' ? 'quickplay' : 'core')}
        className="font-mono text-xs font-bold tracking-widest bg-transparent border border-accent text-accent px-3 py-1 cursor-pointer hover:bg-accent hover:text-dark transition-colors"
      >
        [{ruleset.toUpperCase()}]
      </button>
    </header>
  );
}
