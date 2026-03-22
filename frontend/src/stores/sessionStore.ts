import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Ruleset, GameMode, FieldAsset, LogEntry, SpottedElement } from '../types';

interface SessionConfig {
  ruleset: Ruleset;
  mode: GameMode;
  missionId: string;
  playerFc: number;
  fieldAsset: FieldAsset | null;
}

interface SessionState {
  // Config
  active: boolean;
  config: SessionConfig | null;

  // Game state
  turn: number;
  maxTurns: number;
  aiFcTotal: number;
  aiFcSpent: number;
  aiInterferencePool: number;
  spottingPool: SpottedElement[];
  fieldAssetCaptured: boolean;
  playerVp: number;
  aiVp: number;
  playerBp: number;
  log: LogEntry[];
  jammedComms: boolean;

  // Actions
  startSession: (config: SessionConfig, aiData: { aiFcTotal: number; maxTurns: number; bp: number }) => void;
  endSession: () => void;
  advanceTurn: () => void;
  addLog: (message: string, type: LogEntry['type']) => void;
  updateAiFc: (spent: number) => void;
  updateInterferencePool: (tokens: number) => void;
  addToSpottingPool: (element: SpottedElement) => void;
  removeFromSpottingPool: (name: string) => void;
  setJammedComms: (jammed: boolean) => void;
  updateVp: (player: number, ai: number) => void;
  updateBp: (bp: number) => void;
  captureFieldAsset: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      active: false,
      config: null,
      turn: 0,
      maxTurns: 6,
      aiFcTotal: 0,
      aiFcSpent: 0,
      aiInterferencePool: 5,
      spottingPool: [],
      fieldAssetCaptured: false,
      playerVp: 0,
      aiVp: 0,
      playerBp: 0,
      log: [],
      jammedComms: false,

      startSession: (config, aiData) =>
        set({
          active: true,
          config,
          turn: 1,
          maxTurns: aiData.maxTurns,
          aiFcTotal: aiData.aiFcTotal,
          aiFcSpent: 0,
          aiInterferencePool: 5,
          spottingPool: [],
          fieldAssetCaptured: false,
          playerVp: 0,
          aiVp: 0,
          playerBp: aiData.bp,
          log: [{
            id: `log-${Date.now()}`,
            turn: 1,
            timestamp: new Date().toISOString(),
            message: `Session started: ${config.missionId} / ${config.mode} / ${config.ruleset} / Player FC ${config.playerFc} / AI FC ${aiData.aiFcTotal}`,
            type: 'system',
          }],
          jammedComms: false,
        }),

      endSession: () =>
        set({
          active: false,
          config: null,
          turn: 0,
          log: [],
          spottingPool: [],
        }),

      advanceTurn: () => {
        const { turn, maxTurns } = get();
        if (maxTurns > 0 && turn >= maxTurns) return;
        const newTurn = turn + 1;
        set((s) => ({
          turn: newTurn,
          jammedComms: false,
          log: [
            ...s.log,
            {
              id: `log-${Date.now()}`,
              turn: newTurn,
              timestamp: new Date().toISOString(),
              message: `Turn ${newTurn} begins.`,
              type: 'system',
            },
          ],
        }));
      },

      addLog: (message, type) =>
        set((s) => ({
          log: [
            ...s.log,
            {
              id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              turn: s.turn,
              timestamp: new Date().toISOString(),
              message,
              type,
            },
          ],
        })),

      updateAiFc: (spent) => set({ aiFcSpent: spent }),
      updateInterferencePool: (tokens) => set({ aiInterferencePool: tokens }),
      addToSpottingPool: (element) =>
        set((s) => ({ spottingPool: [...s.spottingPool, element] })),
      removeFromSpottingPool: (name) =>
        set((s) => ({
          spottingPool: s.spottingPool.filter((e) => e.name !== name),
        })),
      setJammedComms: (jammed) => set({ jammedComms: jammed }),
      updateVp: (player, ai) =>
        set((s) => ({
          playerVp: s.playerVp + player,
          aiVp: s.aiVp + ai,
        })),
      updateBp: (bp) => set({ playerBp: bp }),
      captureFieldAsset: () => set({ fieldAssetCaptured: true }),
    }),
    { name: 'hardwar-session' }
  )
);
