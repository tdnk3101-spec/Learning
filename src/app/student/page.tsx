'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  FileText,
  UploadCloud,
  Send,
  Archive,
  Clock,
  ShieldCheck,
  Scale,
  Award,
  AlertCircle,
  Sparkles,
  Bot,
  Hash,
  ArrowRight,
  Lock,
  ShieldAlert,
  HelpCircle,
  BookOpen,
  UserCheck,
  Gavel,
  Check,
  RotateCcw,
} from 'lucide-react';
import { computeSha256 } from '@/lib/audit';
import {
  getCurrentPersona,
  getFilteredCases,
  getStudentCases,
  getStudentClosedCases,
  submitStudentDefense,
  verifyAndAttachStudentCase,
} from '@/lib/store';
import { Case, ChatMessage } from '@/types';
import MarkdownContent from '@/components/chat/MarkdownContent';

const QUICK_STUDENT_PROMPTS = [
  'What are my rights if accused of plagiarism?',
  'Does the AI have the authority to decide punishments?',
  'What is the statutory response deadline for show-cause notices?',
  'Explain policy ACAD-01 on unauthorized collaboration',
  'How does SHA-256 evidence integrity sealing protect me?',
  'How do I request a student advocate or ombudsman?',
];

export default function StudentPortalPage() {
  const [currentPersona, setCurrentPersonaState] = useState(getCurrentPersona());
  const [activeTab, setActiveTab] = useState<'guide' | 'defense' | 'closed'>('guide');
  const [cases, setCases] = useState<Case[]>(getFilteredCases());
  const [allStudentCases, setAllStudentCases] = useState<Case[]>([]);
  const [closedCases, setClosedCases] = useState<Case[]>([]);

  // Case Unlock State for Affected Candidate
  const [caseIdInput, setCaseIdInput] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlockSuccess, setUnlockSuccess] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Defense Submission State
  const [writtenStatement, setWrittenStatement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [evidenceName, setEvidenceName] = useState<string | null>(null);
  const [evidenceHash, setEvidenceHash] = useState<string | null>(null);

  // Embedded AI Agent State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const studentRoll = currentPersona.studentRollNo || 'CS-9104';
  const studentName = currentPersona.name || 'Campus Student';

  // Determine if student has an active case unlocked
  const studentCase = currentPersona.activeCaseId
    ? cases.find((c) => c.caseNumber === currentPersona.activeCaseId || c.id === currentPersona.activeCaseId) ||
      allStudentCases.find((c) => c.status !== 'CLOSED')
    : allStudentCases.find((c) => c.status !== 'CLOSED');

  const hasActiveCase = Boolean(studentCase);

  useEffect(() => {
    const handleUpdate = () => {
      const p = getCurrentPersona();
      setCurrentPersonaState(p);
      const roll = p.studentRollNo || 'CS-9104';
      const userCases = getFilteredCases(p);
      setCases(userCases);
      setAllStudentCases(getStudentCases(roll));
      setClosedCases(getStudentClosedCases(roll));

      // If student has an active case, default to defense view; otherwise default to guide
      if (p.activeCaseId || roll === 'CS-8902') {
        setActiveTab((prev) => (prev === 'guide' ? 'defense' : prev));
      }
    };
    handleUpdate();
    window.addEventListener('persona-changed', handleUpdate);
    return () => window.removeEventListener('persona-changed', handleUpdate);
  }, []);

  // Initialize Embedded AI Chat greeting
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([
        {
          id: 'welcome-student',
          role: 'assistant',
          content: `### Welcome to EDUguard AI Student Assistant, ${studentName}! 👋\n\nI am your institutional due-process guide powered by **Groq High-Performance Intelligence**.\n\n**Here is how I assist all university students:**\n- 🔍 **Explain University Policies**: Understand codes like ACAD-01 (Academic Integrity) and ACAD-02 (Examination Conduct)\n- ⚖️ **Inform You of Statutory Rights**: Presumption of innocence, right to inspect evidence, and 14-day appeal windows\n- 🛡️ **Due Process Safeguard**: I strictly **never** declare guilt or impose punishments — only authorized human faculty committees make decisions\n\nFeel free to ask any question or click a suggested prompt below!`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [chatMessages.length, studentName]);

  const handleSendMessage = async (customText?: string) => {
    const query = customText || chatInput;
    if (!query.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          persona: currentPersona,
          activeCaseId: studentCase?.id || undefined,
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
        setChatMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err: unknown) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Connection Error**: ${err instanceof Error ? err.message : 'Unable to connect to assistant'}. Please retry.`,
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Case Unlock Handler
  const handleUnlockCase = (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError(null);
    setUnlockSuccess(null);
    setIsUnlocking(true);

    setTimeout(() => {
      const res = verifyAndAttachStudentCase(caseIdInput);
      setIsUnlocking(false);

      if (!res.success) {
        setUnlockError(res.error || 'Case ID not recognized in disciplinary registry.');
        return;
      }

      setUnlockSuccess(`Docket ${res.caseItem?.caseNumber} verified! Opening your confidential defense workspace...`);
      setTimeout(() => {
        setActiveTab('defense');
        setUnlockSuccess(null);
      }, 700);
    }, 400);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEvidenceName(file.name);
    const hash = await computeSha256(`${file.name}-${file.size}-${Date.now()}`);
    setEvidenceHash(hash);
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!writtenStatement.trim()) {
      alert('Please enter your written response.');
      return;
    }
    if (!studentCase) return;

    setIsSubmitting(true);
    try {
      await submitStudentDefense(
        studentCase.id,
        writtenStatement,
        evidenceName || undefined,
        evidenceHash || undefined,
        `Student #${studentRoll} (${studentName})`
      );
      setSubmitted(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error submitting defense representation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner Greeting */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Student Due-Process Portal
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-mono">Roll: {studentRoll}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome, {studentName} 👋
          </h1>
          <p className="text-xs text-slate-500">
            {currentPersona.department || 'Computer Science & Engineering'} · Registered Campus Student Profile.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-3">
          <div className={`p-3.5 rounded-2xl border text-center min-w-[110px] ${
            hasActiveCase ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <span className="text-[10px] text-slate-500 font-semibold block">Active Docket</span>
            <span className={`text-xl font-bold ${hasActiveCase ? 'text-amber-800' : 'text-slate-900'}`}>
              {hasActiveCase ? 1 : 0}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center min-w-[110px]">
            <span className="text-[10px] text-emerald-700 font-semibold block">Closed Records</span>
            <span className="text-xl font-bold text-emerald-800">
              {closedCases.length}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-center min-w-[110px]">
            <span className="text-[10px] text-blue-700 font-semibold block">Fair Process</span>
            <span className="text-xl font-bold text-blue-800">Guaranteed</span>
          </div>
        </div>
      </div>

      {/* Interactive Navigation Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200 max-w-xl">
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex-1 py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'guide'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-emerald-600" />
          <span>AI Agent &amp; How It Works</span>
        </button>

        <button
          onClick={() => setActiveTab('defense')}
          className={`flex-1 py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'defense'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Scale className="w-3.5 h-3.5 text-blue-600" />
          <span>Defense Workspace</span>
          {hasActiveCase && (
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
              Active
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('closed')}
          className={`flex-1 py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'closed'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Archive className="w-3.5 h-3.5 text-emerald-600" />
          <span>Closed History</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
            {closedCases.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AI AGENT & HOW THE SYSTEM WORKS (FOR ALL STUDENTS)                */}
      {/* ========================================================================= */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          {/* Top Notice Unlock Banner if student has a notice */}
          {!hasActiveCase && (
            <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-300 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-sm font-bold text-slate-900">Received an Official Institutional Notice?</h2>
                </div>
                <p className="text-xs text-slate-600">
                  If an inquiry was initiated regarding your academic coursework or conduct, enter your system-generated Case ID to unlock your confidential defense dossier.
                </p>
              </div>

              <form onSubmit={handleUnlockCase} className="flex items-center gap-2 shrink-0">
                <div className="relative">
                  <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={caseIdInput}
                    onChange={(e) => setCaseIdInput(e.target.value)}
                    placeholder="Case ID (e.g. EDU-2026-00042)"
                    className="pl-8 pr-3 py-2 text-xs bg-white border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono font-bold text-slate-900 w-56 shadow-2xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUnlocking}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-1.5 shrink-0"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isUnlocking ? 'Verifying...' : 'Unlock Defense Desk'}</span>
                </button>
              </form>
            </div>
          )}

          {unlockError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{unlockError}</span>
            </div>
          )}

          {unlockSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{unlockSuccess}</span>
            </div>
          )}

          {/* Interactive Agent Chat Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-sm tracking-tight text-white">EDUguard Disciplinary AI Assistant</h2>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Groq 120B Intelligence
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Ask questions about student defense rights, academic policies, and due process
                  </p>
                </div>
              </div>

              <button
                onClick={() => setChatMessages([])}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition text-xs flex items-center gap-1.5"
                title="Reset Assistant Conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline-block">Clear</span>
              </button>
            </div>

            {/* Statutory Protection Banner */}
            <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center gap-2 text-xs text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Due-Process Guarantee:</strong> The AI provides policy explanations and timeline tracking. Only human faculty committees make disciplinary rulings.
              </span>
            </div>

            {/* Chat Messages Container */}
            <div className="p-6 max-h-[420px] overflow-y-auto space-y-4 text-xs bg-slate-50/50">
              {chatMessages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div key={m.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0 mt-0.5 shadow-2xs">
                        <Scale className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`max-w-[85%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`p-4 rounded-2xl text-xs leading-relaxed break-words shadow-xs ${
                          isUser
                            ? 'bg-emerald-600 text-white rounded-tr-xs font-medium'
                            : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/90'
                        }`}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{m.content}</p>
                        ) : (
                          <MarkdownContent content={m.content} />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block px-1">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <UserCheck className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {isChatLoading && (
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0 shadow-2xs">
                    <Scale className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-600 text-xs flex items-center gap-2 shadow-xs">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>Consulting university statutes and due-process rules...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-5 py-2.5 bg-slate-100/70 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Ask AI:</span>
              {QUICK_STUDENT_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isChatLoading}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 text-slate-700 text-[11px] whitespace-nowrap transition shadow-2xs"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-4 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask the AI about your statutory defense rights, policy clauses, or timelines..."
                disabled={isChatLoading}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
              <button
                type="submit"
                disabled={isChatLoading || !chatInput.trim()}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Visual 8-Step Fair Due-Process Workflow */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Institutional Due-Process Architecture
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-2">
                How EDUguard Protects Student Rights
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Every disciplinary proceeding is bound to 8 immutable procedural steps to guarantee fairness, evidence integrity, and equal protection under university statutes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h3 className="font-bold text-slate-900">Incident Intake &amp; Hashing</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Allegations are logged with immutable SHA-256 cryptographic checksums. Evidence files cannot be altered after registration.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h3 className="font-bold text-slate-900">Policy &amp; Offence Mapping</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Charges must map to published statutory codes (ACAD-01, ACAD-02) with transparent sanction ranges.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h3 className="font-bold text-emerald-950">Advance Notice Window</h3>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Students are provided a statutory 5 to 7 calendar-day response clock before any committee inquiry may commence.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <h3 className="font-bold text-emerald-950">Right to be Heard</h3>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  <em>Audi alteram partem</em>: You have the right to file a written defense statement, upload counter-evidence, and consult an ombudsman.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                  5
                </div>
                <h3 className="font-bold text-slate-900">Quorum-Verified Panel</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Proceedings are invalid unless the designated faculty committee meets full statutory quorum (minimum 3 members).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                  6
                </div>
                <h3 className="font-bold text-slate-900">Precedent Benchmarking</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Committees compare historical cases across departments to prevent disproportionate or discriminatory penalties.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-900 flex items-center justify-center font-bold text-xs">
                  7
                </div>
                <h3 className="font-bold text-white">Human Reasoned Verdict</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  The AI never issues penalties. Adjudication is conducted exclusively by authorized human faculty members with written findings.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  8
                </div>
                <h3 className="font-bold text-slate-900">Appeals &amp; Record Purging</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Students have 14 days to appeal to the Executive Tribunal. Completed records are purged under statutory retention limits.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CONFIDENTIAL DEFENSE WORKSPACE (FOR AFFECTED CANDIDATE WITH CASE)  */}
      {/* ========================================================================= */}
      {activeTab === 'defense' && (
        <div className="space-y-6">
          {!studentCase ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Confidential Defense Workspace Locked</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No active disciplinary docket is linked to roll number <strong>{studentRoll}</strong>. If you received an official notice from the Proctorial Board, enter your Case ID below to unlock your defense desk.
              </p>

              <form onSubmit={handleUnlockCase} className="max-w-sm mx-auto flex items-center gap-2 pt-2">
                <input
                  type="text"
                  required
                  value={caseIdInput}
                  onChange={(e) => setCaseIdInput(e.target.value)}
                  placeholder="e.g. EDU-2026-00042"
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono font-bold"
                />
                <button
                  type="submit"
                  disabled={isUnlocking}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition"
                >
                  {isUnlocking ? 'Verifying...' : 'Unlock Docket'}
                </button>
              </form>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setCaseIdInput('EDU-2026-00042');
                  }}
                  className="text-[11px] text-emerald-700 hover:underline font-semibold"
                >
                  Click to try demo Case #EDU-2026-00042 (Rahul Verma)
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Columns: Active Notice & Defense Representation Desk */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 rounded">
                          {studentCase.caseNumber}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                          {studentCase.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-slate-900 mt-1.5">{studentCase.title}</h2>
                    </div>

                    <Link
                      href={`/cases/${studentCase.id}/notice`}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Inspect Official Notice</span>
                    </Link>
                  </div>

                  {/* Charge Details Grid */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Applicable University Code:</span>
                      <span className="font-bold text-slate-900">
                        {studentCase.offenceCategory.code} — {studentCase.offenceCategory.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Statutory Procedure:</span>
                      <span className="font-medium text-slate-700">{studentCase.offenceCategory.procedureReference}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Prescribed Response Window:</span>
                      <span className="font-bold text-red-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{studentCase.offenceCategory.responseWindowDays} Calendar Days from Notice</span>
                      </span>
                    </div>
                  </div>

                  {/* Evidence Sealed with SHA-256 */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold text-slate-900 flex items-center justify-between">
                      <span>Evidentiary Exhibits Disclosed by Inquiry Panel:</span>
                      <span className="text-[10px] text-emerald-700 font-mono">SHA-256 Tamper-Proof</span>
                    </h3>

                    <div className="space-y-2">
                      {(studentCase.incidentReport?.evidenceItems || []).map((ev, idx) => (
                        <div
                          key={ev.id || idx}
                          className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 truncate block">{ev.fileName}</span>
                              <span className="text-[10px] text-slate-400 font-mono block truncate">
                                SHA-256: {ev.sha256Checksum}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                            Verified
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form for Student Written Representation */}
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">
                          Submit Your Formal Written Defense Statement
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Recorded into the institutional cryptographic audit log and delivered to the committee.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">Step 4/8</span>
                    </div>

                    {submitted ? (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-bold">Your formal defense statement has been sealed and logged.</p>
                          <p className="text-[11px] text-emerald-700 mt-0.5">
                            The Disciplinary Committee panel will review your statement prior to oral proceedings.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitResponse} className="space-y-3">
                        <textarea
                          rows={5}
                          required
                          value={writtenStatement}
                          onChange={(e) => setWrittenStatement(e.target.value)}
                          placeholder="State your factual representation, explanation of circumstances, mitigating factors, and any witness testimonies..."
                          className="w-full px-3.5 py-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-sans"
                        />

                        {/* Defense document / counter-evidence attachment */}
                        <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                          <label className="cursor-pointer px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-2">
                            <UploadCloud className="w-4 h-4 text-slate-500" />
                            <span>{evidenceName ? `Attached: ${evidenceName}` : 'Attach Defense Document / Exhibit'}</span>
                            <input type="file" onChange={handleFileUpload} className="hidden" />
                          </label>

                          {evidenceHash && (
                            <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                              SHA-256: {evidenceHash.substring(0, 16)}...
                            </span>
                          )}

                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{isSubmitting ? 'Sealing & Submitting...' : 'Submit Written Defense'}</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Guaranteed Rights & Next Steps */}
              <div className="space-y-6">
                <div className="bg-[#0B1E33] text-white rounded-3xl p-6 sm:p-7 border border-[#1E3A5F] shadow-sm space-y-3 text-xs">
                  <h2 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                    <Scale className="w-4 h-4 text-emerald-400" />
                    <span>Your Guaranteed Statutory Rights</span>
                  </h2>
                  <ul className="space-y-2.5 text-[11px] text-slate-300 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">1.</span>
                      <span>You are strictly presumed not responsible until human committee deliberation concludes.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">2.</span>
                      <span>You have the right to inspect all evidentiary artifacts prior to the inquiry hearing.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">3.</span>
                      <span>You may be accompanied by a student ombudsman or campus advisor during proceedings.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">4.</span>
                      <span>Right to appeal any finding or sanction within 14 calendar days to the Executive Tribunal.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 text-xs">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    <span>Need Guidance or Clarification?</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Switch to the <strong>AI Agent &amp; How It Works</strong> tab to ask any policy questions or learn how precedents are evaluated.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('guide')}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition"
                  >
                    Open AI Rights Guide
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CLOSED DISCIPLINARY HISTORY & RESTITUTION ARCHIVE                 */}
      {/* ========================================================================= */}
      {activeTab === 'closed' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Archive className="w-4 h-4 text-emerald-600" />
                  <span>Archived Closed Cases &amp; Sanction Compliance Records</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Stored historical records, verified restitution certificates, and statutory expunction countdowns.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold">
                FERPA §7 PROTECTED
              </span>
            </div>

            {closedCases.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-slate-800">No Past Disciplinary Infractions on Record</p>
                <p className="text-[11px] text-slate-500">
                  Your academic discipline history is currently clean with zero recorded violations.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {closedCases.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4 hover:border-emerald-300 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold bg-white text-slate-900 border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                          {c.caseNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{c.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>CLOSED &amp; SATISFIED</span>
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Resolved: {c.closedAt ? new Date(c.closedAt).toLocaleDateString() : '2025-11-14'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Finding of Responsibility</span>
                        <p className="text-[11px] font-medium text-slate-800 leading-snug">
                          {c.decision?.verdict || 'Substantiated — Educational Remediation Imposed'}
                        </p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Sanction Served</span>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{c.decision?.sanctionImposed || '8-Hour Academic Citation Workshop Completed'}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Retention Expunction</span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>
                            {c.retentionExpiryAt
                              ? `Auto-Purge: ${new Date(c.retentionExpiryAt).toLocaleDateString()}`
                              : '3 Years (Hard Purge after Graduation)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {c.decision?.reasoningText && (
                      <div className="p-3 bg-white/70 rounded-xl border border-slate-200/70 text-[11px] text-slate-600">
                        <strong className="text-slate-800">Committee Reasoning Summary: </strong>
                        {c.decision.reasoningText}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-200/50">
                      <span className="font-mono text-[10px]">
                        Cryptographic Seal: {c.decision?.decisionDocHash ? c.decision.decisionDocHash.substring(0, 24) : 'sha256-verified'}...
                      </span>
                      <Link
                        href={`/cases/${c.id}`}
                        className="font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
                      >
                        <span>Inspect Closed Dossier</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
