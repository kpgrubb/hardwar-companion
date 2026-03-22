import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LearnProgressState {
  completedModules: string[];
  markCompleted: (moduleId: string) => void;
  isCompleted: (moduleId: string) => boolean;
  reset: () => void;
}

export const useLearnProgressStore = create<LearnProgressState>()(
  persist(
    (set, get) => ({
      completedModules: [],
      markCompleted: (moduleId) =>
        set((state) => ({
          completedModules: state.completedModules.includes(moduleId)
            ? state.completedModules
            : [...state.completedModules, moduleId],
        })),
      isCompleted: (moduleId) => get().completedModules.includes(moduleId),
      reset: () => set({ completedModules: [] }),
    }),
    { name: 'hardwar-learn-progress' }
  )
);
