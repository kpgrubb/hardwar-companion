import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useRulesetStore } from '../../stores/rulesetStore';
import SearchPanel from '../reference/SearchPanel';

export default function Header() {
  const { ruleset, setRuleset } = useRulesetStore();
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcut: Ctrl+K or / to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !searchOpen)) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchOpen]);

  return (
    <>
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="font-mono text-[10px] text-dark-50 hover:text-white bg-transparent border border-dark-50/30 px-2 py-0.5 cursor-pointer transition-colors"
          >
            Search <span className="text-dark-50/50 ml-1">Ctrl+K</span>
          </button>
          <button
            onClick={() => setRuleset(ruleset === 'core' ? 'quickplay' : 'core')}
            className="font-mono text-xs font-bold tracking-widest bg-transparent border border-accent text-accent px-3 py-1 cursor-pointer hover:bg-accent hover:text-dark transition-colors"
          >
            [{ruleset.toUpperCase()}]
          </button>
        </div>
      </header>
      {searchOpen && <SearchPanel onClose={() => setSearchOpen(false)} />}
    </>
  );
}
