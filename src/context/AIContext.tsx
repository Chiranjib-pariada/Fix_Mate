import React, { createContext, useContext, useState } from 'react';
import { apiRequest } from '../lib/api';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  toolCalls?: any[];
  suggestedCategory?: string;
  timestamp: string;
}

interface AIContextType {
  isOpen: boolean;
  messages: AIMessage[];
  isThinking: boolean;
  openAi: (initialPrompt?: string) => void;
  closeAi: () => void;
  toggleAi: () => void;
  sendMessage: (text: string) => Promise<void>;
  clearConversation: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome_1',
      role: 'assistant',
      text: "👋 Hi there! I'm **FixMate AI**, your smart home-service concierge.\n\nTell me about what you need fixed (e.g. leaking sink, flickering switch, AC maintenance), or ask me to check your booking status!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const openAi = (initialPrompt?: string) => {
    setIsOpen(true);
    if (initialPrompt) {
      sendMessage(initialPrompt);
    }
  };

  const closeAi = () => setIsOpen(false);
  const toggleAi = () => setIsOpen(prev => !prev);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isThinking) return;

    const userMsg: AIMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const res = await apiRequest<{
        reply: string;
        toolCalls?: any[];
        suggestedCategory?: string;
      }>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          prompt: text.trim(),
          history,
        }),
      });

      const assistantMsg: AIMessage = {
        id: `msg_${Date.now()}_a`,
        role: 'assistant',
        text: res.data.reply,
        toolCalls: res.data.toolCalls,
        suggestedCategory: res.data.suggestedCategory,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: AIMessage = {
        id: `msg_${Date.now()}_err`,
        role: 'assistant',
        text: `⚠️ I encountered a temporary connection issue. Please feel free to browse our categories directly in the Services tab or ask again!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const clearConversation = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        text: "Conversation cleared. How can I help you with your home services today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <AIContext.Provider
      value={{
        isOpen,
        messages,
        isThinking,
        openAi,
        closeAi,
        toggleAi,
        sendMessage,
        clearConversation,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
