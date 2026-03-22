// Element Stat Card
export interface ElementStats {
  M: number;
  F: number;
  D: number;
  A: number;
  C: number;
}

export interface WeaponUpgrade {
  name: string;
  f_bonus: number;
  notes: string;
}

export interface ElementStatCard {
  id: string;
  name: string;
  class: 1 | 2 | 3 | 4;
  motive_type: string;
  faction: string;
  stats: ElementStats;
  special_rules: string[];
  weapon_upgrades: WeaponUpgrade[];
  performance_upgrades: string[];
  page_ref: number;
}

// Session State
export type Ruleset = 'core' | 'quickplay';
export type GameMode = 'solo' | 'coop' | 'competitive';
export type FieldAsset = 'hq' | 'logistics' | 'comms';

export interface LogEntry {
  id: string;
  turn: number;
  timestamp: string;
  message: string;
  type: 'system' | 'spawn' | 'combat' | 'user';
}

export interface SpottedElement {
  name: string;
  class: number;
  unit_type: string;
  spotted_turn: number;
}

export interface ElementInstance {
  element: ElementStatCard;
  current_stats: ElementStats;
  damage_bar: number;
  action_tokens: number;
  status: ElementStatus[];
  activated_this_turn: boolean;
}

export type ElementStatus =
  | 'guard'
  | 'vulnerable'
  | 'exhausted'
  | 'disabled'
  | 'immobilised'
  | 'destroyed';

export interface SessionState {
  id: string;
  ruleset: Ruleset;
  mode: GameMode;
  mission: MissionDefinition;
  turn: number;
  max_turns: number;
  player_fc: number;
  ai_fc_total: number;
  ai_fc_spent: number;
  ai_interference_pool: number;
  spotting_pool: SpottedElement[];
  field_asset: FieldAsset | null;
  field_asset_captured: boolean;
  player_vp: number;
  ai_vp: number;
  player_bp: number;
  roster: ElementInstance[];
  log: LogEntry[];
}

// Mission Definition
export interface MissionDefinition {
  id: string;
  name: string;
  number: number;
  table_size: string;
  ai_fc_percent: number;
  duration: number;
  objective_summary: string;
  victory_conditions: string[];
  deployment_rules: string;
  campaign_outcomes: string[];
  page_ref: number;
}

// Keyword Definition
export type KeywordCategory =
  | 'stat'
  | 'action'
  | 'terrain'
  | 'status'
  | 'motive'
  | 'special_rule'
  | 'solo';

export interface KeywordDefinition {
  term: string;
  aliases: string[];
  category: KeywordCategory;
  definition_core: string;
  definition_quickplay: string | null;
  page_ref_core: number;
  page_ref_quickplay: number | null;
}

// Chat
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations: string[];
  confidence?: ConfidenceLevel;
  timestamp: string;
}

// Spawn
export interface SpawnCheckResult {
  triggered: boolean;
  roll: number;
  total: number;
  reason: string;
}

export interface SpawnCascadeResult {
  spawn_class: string;
  unit_type: string;
  cascaded: boolean;
  cascade_reason: string;
  spotting: SpottingResult;
  direction: DirectionResult;
}

export interface SpottingResult {
  spotted: boolean;
  rolls: number[];
  highest: number;
}

export interface DirectionResult {
  direction_roll: number;
  direction_label: string;
  distance: number;
  constraints: string;
}
