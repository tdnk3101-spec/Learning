'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  ShieldAlert,
  Bot,
  User,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  Scale,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { getCurrentPersona, getFilteredCases } from '@/lib/store';
import { Case, ChatMessage, UserPersona } from '@/types';
import MarkdownContent from './MarkdownContent';

const SUGGESTED_PROMPTS = [
  'Explain the plagiarism policy (ACAD-01) and prescribed consequences',
  'What is the status and response deadline for case EDU-2026-00042?',
  'Find similar precedents for case CS-8902 with AST code duplication',
  'Generate a formal Show-Cause Notice draft for case EDU-2026-00042',
  'Should we expel the student in case EDU-2026-00042?', // Guardrail demonstration
  'What are the 8 statutory steps in the Due-Process Checklist?',
];

export default function EduguardChatModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [persona, setPersona] = useState<UserPersona>(getCurrentPersona());
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync persona and cases
  useEffect(() => {
    const update = () => {
      const p = getCurrentPersona();
      setPersona(p);
      setCases(getFilteredCases(p));
    };
    update();
    window.addEventListener('persona-changed', update);
    return () => window.removeEventListener('persona-changed', update);
  }, []);

  // Set initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-msg',
          role: 'assistant',
          content: `### Welcome to EDUguard AI Disciplinary Assistant\nI am your institutional due-process companion powered by **Groq High-Performance Intelligence**.\n\n**What I can do for you:**\n- 🔍 **Search & explain policies** with exact clauses and prescribed sanction guides\n- ⏱️ **Track active dockets**, response windows, and checklist deadlines\n- ⚖️ **Analyze closed precedents** and multi-factor similarity for committee consistency\n- 📄 **Draft formal statutory notices** (Show-Cause, Hearing Summons, Decisions)\n- 🔒 **Verify evidence integrity** and SHA-256 cryptographic hashes\n\n> **Statutory Guardrail Notice**: In strict compliance with due-process governance, I provide information, policy references, and precedent comparisons only. I **never** determine guilt or prescribe punishments.`,
          timestamp: new Date().toISOString(),
          suggestedPrompts: SUGGESTED_PROMPTS.slice(0, 4),
        },
      ]);
    }
  }, [messages.length]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          persona,
          activeCaseId: selectedCaseId || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          timestamp: data.timestamp || new Date().toISOString(),
          guardrailTriggered: data.guardrailTriggered,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err: unknown) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Connection Error**: ${err instanceof Error ? err.message : 'Unable to connect to assistant service'}. Please retry or verify system settings.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Floating Toggle Trigger Button (Fixed Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs shadow-xl shadow-emerald-700/25 hover:from-emerald-500 hover:to-teal-500 hover:scale-[1.03] active:scale-[0.98] transition-all border border-emerald-400/30"
          aria-label="Toggle EDUguard Assistant"
        >
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
          </div>
          <span className="tracking-tight font-bold">Ask EDUguard AI</span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-black/20 text-[10px] font-mono text-emerald-100">
            Groq AI
          </span>
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white animate-ping" />
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />
        </button>
      </div>

      {/* Slide-Up Drawer / Modal Window */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white text-slate-800 shadow-2xl border-l border-slate-200 flex flex-col transition-all animate-in slide-in-from-right duration-300">
          {/* Top Bar */}
          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/10">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 tracking-tight">EDUguard Disciplinary AI</h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
                    Groq 20B
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Ask questions about policies, deadlines &amp; precedents</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                href="/assistant"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition text-xs flex items-center gap-1"
                title="Open Full Console"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                title="Clear Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                aria-label="Close Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active Persona & Context Bar */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-slate-500 shrink-0">Signed in:</span>
              <span className="font-semibold text-emerald-800 truncate">{persona.name}</span>
              <span className="text-slate-400">·</span>
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {persona.role.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Case Context Selector */}
            {cases.length > 0 && (
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="text-[11px] bg-white border border-slate-200 text-slate-700 rounded-lg px-2 py-0.5 focus:outline-none focus:border-emerald-500 max-w-[160px] truncate shadow-2xs"
              >
                <option value="">All Cases</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber} ({c.studentDisplayRef})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Mandatory Guardrail Banner */}
          <div className="px-3.5 py-2 bg-amber-50 border-b border-amber-200 flex items-center gap-2 text-[11px] text-amber-900">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">
              <strong>Fair Process Notice:</strong> AI explains policies and tracks timelines. Human committees make all decisions.
            </span>
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-slate-50/50">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div key={m.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0 mt-0.5 shadow-2xs">
                      <Scale className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                    {/* Guardrail Directive Banner if triggered */}
                    {m.guardrailTriggered && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[11px] flex items-start gap-2 mb-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-[10px] uppercase font-bold text-amber-800">
                            Statutory Guardrail Notice
                          </strong>
                          The assistant cannot determine guilt or recommend sanctions. Providing objective policy guidance:
                        </div>
                      </div>
                    )}

                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed break-words shadow-xs ${
                        isUser
                          ? 'bg-emerald-600 text-white rounded-tr-xs font-medium shadow-emerald-700/10'
                          : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/90'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      ) : (
                        <MarkdownContent content={m.content} />
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 px-1">
                      <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(m.content, m.id)}
                          className="text-slate-400 hover:text-slate-700 flex items-center gap-1 transition"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Suggested follow-up prompts */}
                    {m.suggestedPrompts && m.suggestedPrompts.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {m.suggestedPrompts.map((p, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(p)}
                            className="text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg transition text-left"
                          >
                            + {p}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-2xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0 shadow-2xs">
                  <Scale className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-600 text-xs flex items-center gap-2 shadow-xs">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>Searching university policies and precedents...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Selector */}
          <div className="px-4 py-2 border-t border-slate-200 bg-slate-50/80 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Suggested:</span>
            {SUGGESTED_PROMPTS.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="text-[11px] text-slate-700 bg-white hover:bg-slate-50 hover:text-emerald-700 border border-slate-200 px-2.5 py-1 rounded-full whitespace-nowrap transition shrink-0 shadow-2xs"
              >
                {prompt.length > 38 ? `${prompt.slice(0, 38)}...` : prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask anything about policies, deadlines, notices, or past cases..."
              disabled={isLoading}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-xs shadow-md shadow-emerald-700/20 transition flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
