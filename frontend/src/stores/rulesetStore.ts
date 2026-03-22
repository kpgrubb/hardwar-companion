import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Ruleset } from '../types';

interface RulesetState {
  ruleset: Ruleset;
  setRuleset: (ruleset: Ruleset) => void;
}

export const useRulesetStore = create<RulesetState>()(
  persist(
    (set) => ({
      ruleset: 'core',
      setRuleset: (ruleset) => set({ ruleset }),
    }),
    { name: 'hardwar-ruleset' }
  )
);
