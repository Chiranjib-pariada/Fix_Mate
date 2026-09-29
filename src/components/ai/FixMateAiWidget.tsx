import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Trash2, Bot, User, CheckCircle2, ChevronRight, ExternalLink } from 'lucide-react';
import { useAI } from '../../context/AIContext';
import { useNavigate } from 'react-router-dom';

const SUGGESTED_PROMPTS = [
  "My kitchen tap is leaking constantly",
  "AC is running but not cooling the room",
  "Need to install a new ceiling fan",
  "Check status of booking FM-2026-1001",
];

export const FixMateAiWidget: React.FC = () => {
  const { isOpen, closeAi, messages, isThinking, sendMessage, clearConversation } = useAI();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    sendMessage(input);
    setInput('');
  };

  const handlePromptClick = (p: string) => {
    sendMessage(p);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="px-4 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Bot className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-semibold text-sm">FixMate AI</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white font-medium">
                Gemini
              </span>
            </div>
            <p className="text-[11px] text-blue-100 mt-0.5">Your home repair concierge</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={clearConversation}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={closeAi}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Suggested Prompts (when only welcome msg present) */}
      {messages.length <= 1 && (
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex gap-1.5 overflow-x-auto text-xs py-2 no-scrollbar">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handlePromptClick(prompt)}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 transition-colors shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 text-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[82%] space-y-2`}>
                <div
                  className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line">{m.text}</div>
                </div>

                {/* If tool card results are attached */}
                {m.toolCalls && m.toolCalls.length > 0 && (
                  <div className="space-y-1.5">
                    {m.toolCalls.map((tc, idx) => {
                      if (tc.name === 'searchProviders' && tc.result?.providers) {
                        return (
                          <div key={idx} className="p-2.5 rounded-xl bg-white border border-blue-100 shadow-xs text-xs space-y-1.5">
                            <div className="font-semibold text-blue-900 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              Found {tc.result.count} Verified Professionals:
                            </div>
                            <div className="divide-y divide-slate-100">
                              {tc.result.providers.slice(0, 2).map((p: any) => (
                                <div key={p.id} className="pt-1.5 flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-slate-800">{p.name}</div>
                                    <div className="text-[10px] text-slate-500">★ {p.rating} ({p.reviews} reviews) • {p.experienceYears} yrs exp</div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      closeAi();
                                      navigate(`/services?category=${tc.args?.category || ''}`);
                                    }}
                                    className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold hover:bg-blue-100 transition-colors"
                                  >
                                    View
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      if (tc.name === 'getBookingStatus' && tc.result?.found) {
                        const b = tc.result;
                        return (
                          <div key={idx} className="p-2.5 rounded-xl bg-white border border-emerald-200 shadow-xs text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{b.bookingNumber}</span>
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                                {b.status}
                              </span>
                            </div>
                            <div className="text-slate-600">{b.serviceName} with {b.providerName}</div>
                            <div className="text-[10px] text-slate-400">Date: {b.date} ({b.timeSlot})</div>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                )}

                <div className={`text-[10px] text-slate-400 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                  {m.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isThinking && (
          <div className="flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200 rounded-bl-xs text-xs flex items-center gap-1.5 text-slate-500 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px]">FixMate AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about home repairs or booking..."
          className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={!input.trim() || isThinking}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
