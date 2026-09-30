import React, { useState } from 'react';
import { useDpi } from '../context/DpiContext';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  HelpCircle, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';

interface AiExplanationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  source?: string;
  timestamp: string;
}

export const AiExplanationDrawer: React.FC<AiExplanationDrawerProps> = ({ isOpen, onClose }) => {
  const { askAiExplanation, activeIncident, simulationState } = useDpi();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your **Autonomous DPI Swarm Reliability AI**. I monitor active schema drifts, formal verification proofs, and zero-downtime edge hot-patches.\n\nAsk me about current failure diagnostics, why safety invariants passed or failed, or what happens if amounts deviate.`,
      source: 'gemini-3.8-flash',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sampleQuestions = [
    'Why did this transaction fail?',
    'Why was this adapter considered safe?',
    'What changed in the schema?',
    'Why was the adapter rejected?',
    'What would happen if the amount changed?',
  ];

  const handleAsk = async (questionText: string) => {
    if (!questionText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: questionText,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const response = await askAiExplanation(questionText);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        source: response.source,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Error generating response: ' + (err.message || 'Unknown error'),
        source: 'system-error',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-700/80 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>AI Incident Explainer</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300">
                  Gemini 3.8 Flash
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Contextual reasoning on current DPI incidents & verification proofs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Incident Context Snapshot Pill */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-slate-500 font-mono text-[11px]">Context:</span>
            <span className="text-slate-200 font-semibold truncate">
              {simulationState.activeParticipant} ({simulationState.activeScenario})
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
            simulationState.isBlockedBySafety
              ? 'bg-red-950 text-red-400 border border-red-800'
              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
          }`}>
            {simulationState.isBlockedBySafety ? 'BLOCKED' : activeIncident?.status || 'NOMINAL'}
          </span>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => {
            const isAi = msg.sender === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAi ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isAi
                      ? 'bg-cyan-950 border border-cyan-800 text-cyan-400'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                    isAi
                      ? 'bg-slate-950 border border-slate-800 text-slate-200'
                      : 'bg-cyan-600 text-white shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  {isAi && msg.source && (
                    <div className="mt-2 pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Source: {msg.source}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-cyan-400 animate-pulse">
              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
              <span>Analyzing current incident state with Gemini 3.8 Flash...</span>
            </div>
          )}
        </div>

        {/* Predefined Prompt Chips */}
        <div className="px-5 py-3 border-t border-slate-850 bg-slate-950/70">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-cyan-400" />
            <span>Recommended Incident Queries:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sampleQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleAsk(q)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[11px] transition-colors cursor-pointer disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk(inputQuestion);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask why it failed, why it's safe, or test invariants..."
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuestion.trim()}
              className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
