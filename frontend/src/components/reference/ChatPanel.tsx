import { useState, useRef, useEffect } from 'react';
import Panel from '../shared/Panel';
import KeywordText from '../shared/KeywordText';
import { useRulesetStore } from '../../stores/rulesetStore';
import { sendChatMessage, type ChatHistoryEntry, type ChatResponse } from '../../api/chat';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations: string[];
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
}

const SUGGESTED_QUESTIONS = {
  core: [
    'How does shooting resolution work?',
    'What happens when an element is Immobilised?',
    'How does the Initiative bid work?',
    'What are Augment Dice?',
    'How does Cover affect shooting?',
    'What is Electronic Warfare?',
  ],
  quickplay: [
    'How does Initiative work in Quickplay?',
    'What is the Quickplay Damage Bar?',
    'How do Critical Hits differ in Quickplay?',
    'How does EW work in Quickplay?',
    'What actions are different in Quickplay?',
    'How do Aircraft work in Quickplay?',
  ],
};

const CONFIDENCE_COLORS = {
  HIGH: 'text-green-600 border-green-600',
  MEDIUM: 'text-accent-dark border-accent-dark',
  LOW: 'text-red-muted border-red-muted',
};

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ruleset = useRulesetStore((s) => s.ruleset);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      citations: [],
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const history: ChatHistoryEntry[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response: ChatResponse = await sendChatMessage(
        text.trim(),
        ruleset,
        history
      );

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        citations: response.citations,
        confidence: response.confidence,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to get response. Is the backend running?'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <Panel className="flex flex-col h-full min-h-[400px] max-h-[600px]">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-dark-20">
        <h3 className="font-ui text-xs uppercase tracking-widest text-dark m-0">
          Rules AI Chat
        </h3>
        <span className="font-mono text-[7pt] text-accent-dark">
          [{ruleset.toUpperCase()}]
        </span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
        {messages.length === 0 && (
          <div>
            <p className="font-body text-[9pt] text-dark-50 mb-3">
              Ask any rules question. Answers are grounded in the official rulebook with page citations.
            </p>
            <div className="space-y-1">
              {SUGGESTED_QUESTIONS[ruleset].map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="block w-full text-left font-body text-[9pt] text-dark px-2 py-1.5 bg-bg-secondary border border-dark-20 hover:border-accent cursor-pointer transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${
              msg.role === 'user'
                ? 'bg-bg-secondary ml-8'
                : 'bg-bg-card mr-4 border-l-2 border-accent'
            } p-2`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[7pt] text-dark-50 uppercase">
                {msg.role === 'user' ? 'You' : 'Referee'}
              </span>
              {msg.confidence && (
                <span
                  className={`font-mono text-[7pt] border px-1 ${
                    CONFIDENCE_COLORS[msg.confidence]
                  }`}
                >
                  {msg.confidence}
                </span>
              )}
            </div>
            {msg.role === 'assistant' ? (
              <KeywordText
                text={msg.content}
                className="font-body text-[9pt] text-dark leading-relaxed whitespace-pre-line"
              />
            ) : (
              <p className="font-body text-[9pt] text-dark m-0">{msg.content}</p>
            )}
            {msg.citations.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {msg.citations.map((c, i) => (
                  <span
                    key={i}
                    className="font-mono text-[7pt] text-dark-50 bg-bg-primary px-1"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="bg-bg-card p-2 border-l-2 border-accent mr-4">
            <span className="font-mono text-[8pt] text-dark-50 animate-pulse">
              Consulting the rulebook...
            </span>
          </div>
        )}

        {error && (
          <div className="bg-red-muted/10 border border-red-muted p-2">
            <span className="font-body text-[9pt] text-red-muted">{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a rules question..."
          disabled={loading}
          className="flex-1 font-body text-sm bg-bg-primary border border-dark-20 px-3 py-1.5 text-dark placeholder:text-dark-50 focus:outline-none focus:border-accent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="font-ui text-xs uppercase tracking-widest bg-accent text-dark px-3 py-1.5 border-none cursor-pointer hover:bg-accent-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Ask
        </button>
      </form>
    </Panel>
  );
}
