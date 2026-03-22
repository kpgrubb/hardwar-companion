import { apiFetch } from './client';

export interface ChatResponse {
  answer: string;
  citations: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  chunks_used: Array<{
    id: string;
    section: string;
    page: number;
    distance: number;
  }>;
}

export interface ChatHistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendChatMessage(
  query: string,
  ruleset: string,
  history: ChatHistoryEntry[]
): Promise<ChatResponse> {
  return apiFetch<ChatResponse>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ query, ruleset, history }),
  });
}
