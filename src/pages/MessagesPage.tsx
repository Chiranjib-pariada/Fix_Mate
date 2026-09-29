import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, MessageSquare, User, ShieldCheck, Clock, CheckCheck } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { Message } from '../types';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../lib/socket';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('user') || 'prov_1';
  const targetUserName = searchParams.get('name') || 'Rajesh Kumar (Electrician)';

  const conversationId = user
    ? [user._id, targetUserId].sort().join('_')
    : `default_conv_${targetUserId}`;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial message history
  useEffect(() => {
    apiRequest<Message[]>(`/messages/${conversationId}`)
      .then(res => setMessages(res.data))
      .catch(console.error);

    if (user) {
      const socket = getSocket(user._id);
      socket.emit('join_conversation', conversationId);

      socket.on('new_message', (msg: Message) => {
        if (msg.conversationId === conversationId) {
          setMessages(prev => {
            if (prev.some(m => m._id === msg._id)) return prev;
            return [...prev, msg];
          });
        }
      });

      socket.on('user_typing', (data: { conversationId: string }) => {
        if (data.conversationId === conversationId) {
          setIsTyping(true);
        }
      });

      socket.on('user_stopped_typing', (data: { conversationId: string }) => {
        if (data.conversationId === conversationId) {
          setIsTyping(false);
        }
      });

      return () => {
        socket.emit('leave_conversation', conversationId);
        socket.off('new_message');
        socket.off('user_typing');
        socket.off('user_stopped_typing');
      };
    }
  }, [conversationId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    const payload = {
      conversationId,
      senderId: user._id,
      senderRole: user.role,
      recipientId: targetUserId,
      text: inputText.trim(),
    };

    const socket = getSocket(user._id);
    socket.emit('send_message', payload);

    // Optimistic append
    const optimisticMsg: Message = {
      _id: `msg_temp_${Date.now()}`,
      ...payload,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setInputText('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[75vh]">
        {/* Chat Header */}
        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-slate-900 text-sm sm:text-base">{targetUserName}</h2>
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-[11px] text-slate-400">
                {isTyping ? <span className="text-blue-600 font-semibold animate-pulse">Typing...</span> : 'Online • Verified Pro'}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 hidden sm:block">
            End-to-end coordinated booking support
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              Send a direct message to clarify booking details, tools needed, or access codes.
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.senderId === user?._id;
              return (
                <div
                  key={m._id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-2xs ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1">
                    <span>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-500 text-slate-900"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
