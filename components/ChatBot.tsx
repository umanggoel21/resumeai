
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader2, RefreshCw } from 'lucide-react';
import { ChatMessage } from '../types';
import { createChatSession } from '../services/geminiService';
import { Chat, GenerateContentResponse } from "@google/genai";

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm your AI Career Assistant. How can I help optimize your resume or prep for your next interview today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Initialize chat session when opened for the first time
  useEffect(() => {
    if (isOpen && !chatSessionRef.current) {
      try {
        chatSessionRef.current = createChatSession();
      } catch (e) {
        console.error("Failed to init chat", e);
      }
    }
  }, [isOpen]);

  const handleResetSession = () => {
    chatSessionRef.current = createChatSession();
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        role: 'model',
        text: "Session reset. I'm ready for a new topic! What shall we discuss?",
        timestamp: new Date()
      }
    ]);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // Create placeholder for bot response
    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: botMsgId,
      role: 'model',
      text: '',
      timestamp: new Date()
    }]);

    try {
      if (!chatSessionRef.current) {
         chatSessionRef.current = createChatSession();
      }

      const result = await chatSessionRef.current.sendMessageStream({ message: userText });
      
      let fullText = '';
      for await (const chunk of result) {
        const chunkText = (chunk as GenerateContentResponse).text;
        if (chunkText) {
          fullText += chunkText;
          setMessages(prev => prev.map(msg => 
            msg.id === botMsgId 
              ? { ...msg, text: fullText }
              : msg
          ));
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId 
          ? { ...msg, text: "Sorry, I encountered an error. Please check your connection and try again." }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // Simple Markdown Parser for Bold and Lists
  const renderFormattedText = (text: string) => {
    if (!text) return null;
    
    return text.split('\n').map((line, i) => {
      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ') || line.trim().startsWith('* ')) {
        const content = line.replace(/^[-•*]\s+/, '');
        return (
          <div key={i} className="flex items-start ml-2 mb-1.5">
            <span className="mr-2 mt-2 w-1.5 h-1.5 bg-current rounded-full shrink-0 opacity-60" />
            <span>{parseBold(content)}</span>
          </div>
        );
      }
      // Numbered lists (basic detection)
      if (/^\d+\.\s/.test(line.trim())) {
         const content = line.replace(/^\d+\.\s+/, '');
         const number = line.match(/^\d+/)?.[0];
         return (
          <div key={i} className="flex items-start ml-2 mb-1.5">
            <span className="mr-2 min-w-[1.2em] font-mono text-xs opacity-70 mt-0.5">{number}.</span>
            <span>{parseBold(content)}</span>
          </div>
         )
      }
      // Standard paragraph
      return <div key={i} className={`min-h-[1.2em] ${i > 0 ? 'mt-1.5' : ''}`}>{parseBold(line)}</div>;
    });
  };

  const parseBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-cyan-200/90">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-all duration-300 z-50 flex items-center justify-center
          ${isOpen 
            ? 'bg-slate-800 text-slate-400 hover:text-white scale-90' 
            : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_20px_rgba(8,145,178,0.5)] hover:scale-105'}
        `}
        aria-label="Toggle Chat"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-24 right-6 w-[400px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-[#13141c] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right z-50
        ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'}
      `}>
        {/* Header */}
        <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <Bot className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Career Assistant</h3>
              <p className="text-[10px] text-cyan-500 font-mono uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Gemini 3 Pro
              </p>
            </div>
          </div>
          <button 
            onClick={handleResetSession}
            className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset Conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0B0C10] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
           {messages.map((msg) => (
             <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-cyan-600 text-white rounded-tr-none' 
                    : 'bg-[#1e202e] text-slate-300 border border-slate-700 rounded-tl-none'}
                `}>
                   {msg.role === 'model' ? renderFormattedText(msg.text) : msg.text}
                   {msg.role === 'model' && msg.text === '' && (
                      <div className="flex gap-1 h-5 items-center">
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                   )}
                </div>
             </div>
           ))}
           <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-3 bg-slate-900/50 border-t border-slate-800">
           <div className="relative flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about resumes or interviews..."
                className="w-full bg-[#0B0C10] border border-slate-700 text-slate-200 text-sm rounded-xl pl-4 pr-12 py-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder-slate-600"
              />
              <button 
                type="submit" 
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 p-2 bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
           </div>
        </form>
      </div>
    </>
  );
};
