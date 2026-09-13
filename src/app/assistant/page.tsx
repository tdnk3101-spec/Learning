'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Scale,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  User,
  FileText,
  Clock,
  Search,
  ExternalLink,
  BookOpen,
  History,
  Lock,
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { getCurrentPersona, getFilteredCases, getAuditLogs } from '@/lib/store';
import { Case, ChatMessage, UserPersona } from '@/types';
import { OFFENCE_CATEGORIES, PRECEDENT_INDEX } from '@/lib/mock-data';
import MarkdownContent from '@/components/chat/MarkdownContent';

const PROMPT_CATEGORIES = [
  {
    category: 'Policies & Clauses',
    icon: BookOpen,
    prompts: [
      'Explain the plagiarism policy (ACAD-01) and prescribed consequences',
      'What is the statutory response window for examination compromise (ACAD-02)?',
      'What is the competent disciplinary authority for campus disruption (COND-01)?',
    ],
  },
  {
    category: 'Active Case Dockets',
    icon: FileText,
    prompts: [
      'What is the current status and response deadline for case EDU-2026-00042?',
      'Show the 8-step Due-Process Checklist progress for case EDU-2026-00042',
      'What evidence files and SHA-256 checksums are sealed for case EDU-2026-00042?',
    ],
  },
  {
    category: 'Notice & Document Drafting',
    icon: Scale,
    prompts: [
      'Draft a formal statutory Show-Cause Notice for case EDU-2026-00042 citing Section 4.2(B)',
      'Generate a Committee Hearing Summons Notice with 72-hour statutory notice',
      'Draft a formal Reasoned Determination and Decision Communication',
    ],
  },
  {
    category: 'Precedents & Similar Cases',
    icon: History,
    prompts: [
      'Find similar precedents for case CS-8902 with AST code duplication',
      'Compare first-time code plagiarism with repeat contract cheating precedents',
      'What historical sanction was recorded for microscope damage in PREC-2024-0042?',
    ],
  },
  {
    category: 'Guardrail Verification',
    icon: ShieldAlert,
    prompts: [
      'Is student CS-8902 guilty of cheating in algorithms lab?',
      'What punishment should we give to the student in case EDU-2026-00042?',
      'Should we immediately expel the respondent without a committee hearing?',
    ],
  },
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [persona, setPersona] = useState<UserPersona>(getCurrentPersona());
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [auditHash, setAuditHash] = useState<string>('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync persona and cases
  useEffect(() => {
    const update = () => {
      const p = getCurrentPersona();
      setPersona(p);
      const cList = getFilteredCases(p);
      setCases(cList);
      if (!selectedCaseId && cList.length > 0) {
        setSelectedCaseId(cList[0].id);
      }
      const logs = getAuditLogs();
      if (logs.length > 0) {
        setAuditHash(logs[logs.length - 1].currHash);
      }
    };
    update();
    window.addEventListener('persona-changed', update);
    return () => window.removeEventListener('persona-changed', update);
  }, [selectedCaseId]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-init',
          role: 'assistant',
          content: `### EDUguard AI Disciplinary Assistant Console\nWelcome, **${persona.name}** (${persona.role.replace(/_/g, ' ')}). You are connected to the institutional due-process information system powered by **Groq High-Performance Intelligence**.\n\n#### Key Operational Rules & Guardrails:\n- ⚖️ **Due-Process Boundary:** This console explains policies, tracks procedural checklists, retrieves evidence hashes, and compares historical precedents. It **never** decides guilt or recommends punishments.\n- 🔒 **Cryptographic Ledger:** Every query and retrieval is automatically recorded into the tamper-evident SHA-256 audit log.\n- 👥 **Role-Based Access Control:** Data visibility is strictly governed by your active persona role.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [messages.length, persona.name, persona.role]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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

        // Refresh audit hash
        const logs = getAuditLogs();
        if (logs.length > 0) {
          setAuditHash(logs[logs.length - 1].currHash);
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err: unknown) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Service Notice**: ${err instanceof Error ? err.message : 'Unable to complete request'}. Please try again.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportTranscript = () => {
    const transcript = messages
      .map((m) => `[${m.role.toUpperCase()} - ${new Date(m.timestamp).toLocaleString()}]\n${m.content}\n`)
      .join('\n---\n\n');
    const blob = new Blob([transcript], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eduguard-chat-transcript-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeCase = cases.find((c) => c.id === selectedCaseId);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
              Natural Language Due-Process Engine
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Groq Cloud LLM (120B)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">EDUguard Disciplinary AI Assistant</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Query statutory policies, inspect sealed evidence, verify procedural deadlines, draft notices, and analyze precedents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportTranscript}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export Transcript
          </button>
          <button
            onClick={() => setMessages([])}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Thread
          </button>
        </div>
      </div>

      {/* Statutory Guardrail Directive Card */}
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-300 shadow-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs text-amber-950">
          <strong className="font-bold text-amber-900 block">
            STATUTORY DUE-PROCESS GUARDRAIL: SYSTEM DOES NOT DETERMINE GUILT OR PUNISHMENTS
          </strong>
          <p className="text-amber-800 text-[11px] leading-relaxed">
            EDUguard operates strictly as an institutional information retrieval and due-process tracking system.
            It provides exact policy clauses, procedural deadlines, notice templates, and historical precedents.
            The evaluation of evidence and determination of responsibility resides exclusively with the authorized Disciplinary Committee.
          </p>
        </div>
      </div>

      {/* 3-Column Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Quick Knowledge Browser (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Quick Prompts Categories */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Prompt Directory
            </h3>

            <div className="space-y-3">
              {PROMPT_CATEGORIES.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                    <cat.icon className="w-3 h-3 text-slate-400" /> {cat.category}
                  </span>
                  <div className="space-y-1">
                    {cat.prompts.map((p, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => handleSendMessage(p)}
                        className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-200 border border-slate-100 text-[11px] text-slate-700 transition"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Policy Catalog Quick Links */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" /> Policy Library
            </h3>
            <div className="space-y-1 text-xs">
              {OFFENCE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleSendMessage(`Explain the policy and prescribed sanctions for ${cat.code}: ${cat.name}`)}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between border border-transparent hover:border-slate-200 transition"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-slate-800 text-[11px] block">{cat.code}</span>
                    <span className="text-[10px] text-slate-500 truncate block">{cat.name}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {cat.severity}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: Chat Console (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[760px] overflow-hidden">
          {/* Chat Header Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900">EDUguard Assistant</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                    Active Groq 120B
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Role: <strong>{persona.name}</strong> ({persona.role.replace(/_/g, ' ')})
                </p>
              </div>
            </div>

            {/* Context Selector */}
            {cases.length > 0 && (
              <div className="text-right">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Focus Docket:
                </label>
                <select
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="text-xs bg-white border border-slate-200 text-slate-800 font-medium rounded-lg px-2 py-1 max-w-[170px] truncate shadow-2xs"
                >
                  <option value="">All Cases</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div key={m.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5 shadow-2xs">
                      <Scale className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                    {/* Guardrail alert badge */}
                    {m.guardrailTriggered && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[11px] flex items-start gap-2 mb-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold text-amber-950">Statutory Guardrail Enforced</strong>
                          Guilt and punishments cannot be determined by AI. Returning objective statutory frameworks.
                        </div>
                      </div>
                    )}

                    <div
                      className={`p-4 rounded-2xl text-xs leading-relaxed break-words ${
                        isUser
                          ? 'bg-slate-900 text-white rounded-tr-xs shadow-xs font-medium'
                          : 'bg-slate-50 text-slate-800 rounded-tl-xs border border-slate-200 shadow-2xs'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      ) : (
                        <MarkdownContent content={m.content} />
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 px-1">
                      <span>{new Date(m.timestamp).toLocaleTimeString()}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(m.content, m.id)}
                          className="text-slate-500 hover:text-slate-800 flex items-center gap-1 transition"
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
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-2xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 animate-pulse">
                  <Scale className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>Evaluating statutory clauses &amp; precedents on Groq 120B...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask about policies, deadlines, case status, notices, or precedents..."
              disabled={isLoading}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </form>
        </div>

        {/* Right Column: Docket & Security Inspector (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Active Docket Profile */}
          {activeCase ? (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Focused Docket
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">{activeCase.caseNumber}</h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {activeCase.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Title:</span>
                  <p className="text-slate-800 font-semibold mt-0.5">{activeCase.title}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Student Reference:</span>
                  <span className="font-mono text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block mt-0.5">
                    {activeCase.studentDisplayRef}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Due-Process Checklist:</span>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{
                          width: `${Math.round(
                            (activeCase.checklistItems.filter((i) => i.status === 'COMPLETED').length /
                              activeCase.checklistItems.length) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="font-bold text-slate-700 text-[11px]">
                      {activeCase.checklistItems.filter((i) => i.status === 'COMPLETED').length}/8
                    </span>
                  </div>
                </div>

                {activeCase.incidentReport?.evidenceItems && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Sealed Evidence Cryptography:
                    </span>
                    <ul className="mt-1 space-y-1 text-[11px] text-slate-600">
                      {activeCase.incidentReport.evidenceItems.map((ev) => (
                        <li key={ev.id} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <strong className="text-slate-800 block truncate">{ev.fileName}</strong>
                          <span className="font-mono text-[9px] text-slate-400 block truncate">
                            SHA-256: {ev.sha256Checksum}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100">
                  <Link
                    href={`/cases/${activeCase.id}`}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    Open Master Docket <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs text-center text-xs text-slate-500">
              No specific docket selected. Queries evaluate central repository.
            </div>
          )}

          {/* Cryptographic Audit Status Card */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Cryptographic Audit Active</h4>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Every query and response is timestamped and cryptographically linked to the institutional immutable ledger.
            </p>
            {auditHash && (
              <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
                  Current Block Hash (SHA-256):
                </span>
                <span className="font-mono text-[10px] text-emerald-300 break-all block">
                  {auditHash}
                </span>
              </div>
            )}
            <Link
              href="/audit"
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition pt-1"
            >
              Verify Audit Ledger <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
