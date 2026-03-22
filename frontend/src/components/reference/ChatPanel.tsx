import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
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

const CONFIDENCE_STYLES = {
  HIGH: 'text-green border-green',
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

      const response: ChatResponse = await sendChatMessage(text.trim(), ruleset, history);

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
        err instanceof Error ? err.message : 'Failed to connect. Is the backend running on localhost:8000?'
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
    <Panel className="flex flex-col !p-0 overflow-hidden" cropMarks={false}>
      {/* Header */}
      <div className="bg-dark px-4 py-2.5 flex items-center justify-between">
        <span className="text-display-section text-white">Rules Referee</span>
        <span className="text-micro text-accent">{ruleset.toUpperCase()}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[500px]">
        {messages.length === 0 && (
          <div>
            <p className="text-body-sm text-dark-50 mb-3">
              Ask any rules question. Answers cite the official rulebook.
            </p>
            <div className="space-y-1.5">
              {SUGGESTED_QUESTIONS[ruleset].map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="block w-full text-left text-body-sm text-dark px-3 py-2 bg-surface border border-dark-20 hover:border-accent hover:bg-hover cursor-pointer transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`p-3 ${
              msg.role === 'user'
                ? 'bg-surface ml-6'
                : 'bg-bg-card border-l-2 border-accent mr-2'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-micro text-dark-50">
                {msg.role === 'user' ? 'YOU' : 'REFEREE'}
              </span>
              {msg.confidence && (
                <span className={`text-micro border px-1.5 py-0.5 ${CONFIDENCE_STYLES[msg.confidence]}`}>
                  {msg.confidence}
                </span>
              )}
            </div>
            {msg.role === 'assistant' ? (
              <KeywordText
                text={msg.content}
                className="text-body-sm text-dark leading-relaxed whitespace-pre-line"
              />
            ) : (
              <p className="text-body-sm text-dark m-0">{msg.content}</p>
            )}
            {msg.citations.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {msg.citations.map((c, i) => (
                  <span key={i} className="text-micro text-dark-50 bg-surface px-1.5 py-0.5 border border-dark-20">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}

        {loading && (
          <div className="p-3 bg-bg-card border-l-2 border-accent mr-2">
            <span className="text-meta text-dark-50 animate-pulse">
              Consulting rulebook...
            </span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-muted/10 border border-red-muted/40">
            <span className="text-body-sm text-red-muted">{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex border-t border-dark-20">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a rules question..."
          disabled={loading}
          className="flex-1 text-body bg-bg-primary border-none px-4 py-3 text-dark placeholder:text-dark-50 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="text-meta bg-accent text-dark px-4 border-none cursor-pointer hover:bg-accent-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ASK
        </button>
      </form>
    </Panel>
  );
}
