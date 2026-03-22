import { apiFetch } from './client';

export interface SpawnCheckResult {
  triggered: boolean;
  roll: number;
  turn: number;
  total: number;
  reason: string;
  steps: string[];
}

export interface SpawnCascadeResult {
  spawn_class: string;
  class_roll: number;
  unit_type: string;
  motive: string;
  subtable_roll: number;
  cascaded: boolean;
  cascade_reason: string;
  spotting: {
    spotted: boolean;
    rolls: number[];
    highest: number;
    d_stat: number;
  };
  direction: {
    direction_roll: number;
    direction_label: string;
    distance: number;
    distance_roll: number;
  };
  fc_cost: number;
  steps: string[];
}

export interface StrategicAssetResult {
  roll: number;
  asset: string;
  description: string;
  ew_roll: number;
  ew_tokens_cost: number;
  ew_pool_remaining: number;
  steps: string[];
}

export interface EWResult {
  roll: number;
  tokens_used: number;
  ai_interference_pool_remaining: number;
  jammed?: boolean;
  steps: string[];
}

export async function spawnCheck(
  turn: number,
  aiFcSpent: number,
  aiFcTotal: number
): Promise<SpawnCheckResult> {
  return apiFetch<SpawnCheckResult>('/api/spawn/check', {
    method: 'POST',
    body: JSON.stringify({ turn, ai_fc_spent: aiFcSpent, ai_fc_total: aiFcTotal }),
  });
}

export async function spawnResolve(
  playerDStat: number,
  triggerElement: string
): Promise<SpawnCascadeResult> {
  return apiFetch<SpawnCascadeResult>('/api/spawn/resolve', {
    method: 'POST',
    body: JSON.stringify({ player_d_stat: playerDStat, trigger_element: triggerElement }),
  });
}

export async function resolveStrategicAsset(
  aiInterferencePool: number
): Promise<StrategicAssetResult> {
  return apiFetch<StrategicAssetResult>('/api/spawn/strategic-asset', {
    method: 'POST',
    body: JSON.stringify({ ai_interference_pool: aiInterferencePool }),
  });
}

export async function resolveEW(
  aiInterferencePool: number
): Promise<EWResult> {
  return apiFetch<EWResult>('/api/spawn/ew-resolve', {
    method: 'POST',
    body: JSON.stringify({ ai_interference_pool: aiInterferencePool }),
  });
}
