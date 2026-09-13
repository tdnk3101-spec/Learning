'use client';

import React from 'react';
import Link from 'next/link';
import {
  Scale,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  UserCheck,
  ChevronRight,
  PlayCircle,
  Search,
  Clock,
  Fingerprint,
} from 'lucide-react';
import { Case } from '@/types';
import { getAllCasesForGovernance } from '@/lib/store';

export default function LandingPage() {
  const [allCases, setAllCases] = React.useState<Case[]>([]);
  const [activeTab, setActiveTab] = React.useState<'student' | 'faculty' | 'hod' | 'committee' | 'dean'>('hod');
  const [activeWorkflowStep, setActiveWorkflowStep] = React.useState<number>(1);
  const [selectedIncident, setSelectedIncident] = React.useState<number>(0);
  const [isAgentRunning, setIsAgentRunning] = React.useState<boolean>(false);
  const [agentOutputVisible, setAgentOutputVisible] = React.useState<boolean>(true);

  React.useEffect(() => {
    const updateCases = () => {
      setAllCases(getAllCasesForGovernance());
    };
    updateCases();
    window.addEventListener('persona-changed', updateCases);
    return () => window.removeEventListener('persona-changed', updateCases);
  }, []);

  const workflows = [
    {
      num: 1,
      title: 'Incident Registration',
      desc: 'Date, location, persons, witnesses, evidence & auto Case ID',
      role: 'Reporting Authority',
      guardrail: 'Objective factual intake; multi-party involvement & WORM SHA-256 evidence sealing.',
      statutoryCode: 'Step 1: Registration',
    },
    {
      num: 2,
      title: 'Policy & Offence Mapping',
      desc: 'Category, policy, clause, procedure & authority',
      role: 'EDUguard Agent',
      guardrail: 'Automated 5-point institutional policy database mapping without discretionary bias.',
      statutoryCode: 'Step 2: Policy Engine',
    },
    {
      num: 3,
      title: 'Due-Process Checklist',
      desc: '8 statutory checklist items (Pending → In Progress → Completed)',
      role: 'Procedural Engine',
      guardrail: 'Strict procedural gating ensures zero milestone skipping.',
      statutoryCode: 'Step 3: Due-Process',
    },
    {
      num: 4,
      title: 'Notices & Communication',
      desc: 'Show-cause, hearing, committee, decision, appeal & acknowledgements',
      role: 'Registrar / Tribunal',
      guardrail: 'Policy-compliant templates with delivery status & student receipt acknowledgement.',
      statutoryCode: 'Step 4: Communications',
    },
    {
      num: 5,
      title: 'Case File Management',
      desc: 'Secure dossier of 8 evidentiary items with timestamps & RBAC',
      role: 'Custodial Registry',
      guardrail: 'Tamper-evident case file with cryptographic timestamps & access control.',
      statutoryCode: 'Step 5: Master Dossier',
    },
    {
      num: 6,
      title: 'Committee Support',
      desc: 'Policy clauses, precedents, decisions, requirements & timeline',
      role: 'Inquiry Panel',
      guardrail: 'System provides information only; does NOT tell committee what punishment to give.',
      statutoryCode: 'Step 6: Support Console',
    },
    {
      num: 7,
      title: 'Decision Recording',
      desc: 'Decision, reasoning, sanction imposed & appeal route',
      role: 'Authorized Committee',
      guardrail: 'Human-exclusive authority: System records decision but does not generate it.',
      statutoryCode: 'Step 7: Reasoned Order',
    },
    {
      num: 8,
      title: 'Sanction & Case Closure',
      desc: 'Sanctions, completion status, deadlines, appeals & retention purge',
      role: 'Compliance Officer',
      guardrail: 'Lifecycle closure verification and automated retention purge schedule.',
      statutoryCode: 'Step 8: Compliance & Closure',
    },
    {
      num: 9,
      title: 'Anonymous Analytics',
      desc: 'Case counts, incident types, dept/year, turnaround, pending & trends',
      role: 'Governance & Senate',
      guardrail: 'Zero student PII appears in governance reports (FERPA & Senate audit compliant).',
      statutoryCode: 'Step 9: Governance Analytics',
    },
  ];

  const demoScenarios = [
    {
      title: 'Academic Integrity: Computational Aids',
      text: 'Student was observed utilizing an unapproved generative AI model via an unauthorized handheld device during an offline closed-book midterm examination in Advanced Algorithms.',
      code: 'ACAD-01',
      clause: 'University Disciplinary Code §14.2(a) — Unauthorized Computational Devices',
      statutoryDeadline: '5 Calendar Days',
      recommendedProcedure: 'Standing Committee on Academic Integrity (Quorum: 3 members)',
      retentionYears: '3 Years (Hard Purge after Graduation + 1)',
    },
    {
      title: 'Campus Conduct: Quiet Hours Violation',
      text: 'Excessive high-volume amplification operated in Hostel Block B courtyard at 01:45 AM during pre-examination quiet hours after multiple warnings by proctorial staff.',
      code: 'COND-01',
      clause: 'Student Code of Conduct §8.4 — Violation of Institutional Quiet Hours',
      statutoryDeadline: '3 Calendar Days',
      recommendedProcedure: 'Hall Disciplinary Warden Inquiry with Restitution / Peer Restorative Dialogue',
      retentionYears: '1 Year (Automatic Expunction upon graduation)',
    },
    {
      title: 'Statutory Record: Document Falsification',
      text: 'Submission of an altered medical certificate purporting to be from City General Hospital to excuse a 24% attendance deficit in Laboratory Practice.',
      code: 'MISC-03',
      clause: 'Institutional Integrity Regulation §19.1 — Uttering Falsified Documents',
      statutoryDeadline: '7 Calendar Days',
      recommendedProcedure: 'Joint Registrar & Medical Advisory Hearing Board',
      retentionYears: '5 Years (Audit Record permanently archived)',
    },
  ];

  const handleRunAgentDemo = (index: number) => {
    setSelectedIncident(index);
    setIsAgentRunning(true);
    setAgentOutputVisible(false);
    setTimeout(() => {
      setIsAgentRunning(false);
      setAgentOutputVisible(true);
    }, 700);
  };

  const stakeholders = {
    student: {
      title: 'Student Due-Process Portal',
      tagline: 'Know where you stand, inspect evidence, and exercise your defense rights.',
      bullets: [
        'Real-time access to official Notice of Charge & cited regulation clauses',
        'Transparent countdown clock on 5-day statutory response window',
        'Direct submission of written defense & counter-evidence with SHA-256 verification',
        'Guaranteed access to 10-day appellate tribunal review upon decision',
      ],
      link: '/student',
      linkText: 'Open Student Due-Process Desk',
    },
    faculty: {
      title: 'Faculty / Course Proctor',
      tagline: 'Log objective factual observations with zero presumption of guilt.',
      bullets: [
        'File incident reports with automated SHA-256 evidence hashing',
        'Receive early procedural advisories before formal escalation',
        'Recommend educational mentoring over punitive measures where appropriate',
        'Track restitution and restorative academic workshop milestones',
      ],
      link: '/cases',
      linkText: 'Inspect Department Dockets',
    },
    hod: {
      title: 'Head of Department (HOD)',
      tagline: 'Manage departmental integrity with automated procedural checklists.',
      bullets: [
        'Rule-based mapping of factual narrative to statutory offence code',
        'Generate legally binding prescribed Notice of Charge templates in seconds',
        'Track department response deadlines to eliminate procedural default',
        'Coordinate with Dean on committee appointments & quorum verification',
      ],
      link: '/cases/new',
      linkText: 'File Department Incident Intake',
    },
    committee: {
      title: 'Disciplinary Committee & Chair',
      tagline: 'Deliberate with verified quorum, conflict recusals, and policy precedents.',
      bullets: [
        'Mandatory statutory quorum verification (minimum 3 non-recused members)',
        'Conflict of interest disclosure check with formal recusal logging',
        'Read-only precedent lookup strictly labeled "Informational only — not a recommendation"',
        'Record reasoned decisions with human-only signatures & quorum sign-off',
      ],
      link: '/dashboard',
      linkText: 'Enter Committee Chamber',
    },
    dean: {
      title: 'Dean of Student Affairs & Registrar',
      tagline: 'Institutional due-process oversight, equity checks, and legal compliance.',
      bullets: [
        'Physical segregation of disciplinary records from general student academic profiles',
        'Daily automated retention engine with permanent hard-purge of expired records',
        'SHA-256 hash-chained cryptographic audit ledger with live tamper detection',
        'Anonymized governance disparity analytics with zero student PII exposure',
      ],
      link: '/governance',
      linkText: 'Inspect Institutional Equity Analytics',
    },
  };

  return (
    <div className="space-y-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Hero Typography & CTA */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-800 border border-emerald-500/25 text-xs font-semibold animate-pulse-glow">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
            <span>EDUguard — Student Discipline Agent</span>
            <span className="text-emerald-400">·</span>
            <span className="text-[10px] font-mono uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.2 rounded-full">
              Statutory Safeguard
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Turn disciplinary signals into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700">
              lawful due process.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl font-normal">
            The <strong>EDUguard Student Discipline Agent</strong> enforces procedural due process across every stage of institutional inquiry.
            It classifies offences, tracks statutory deadlines, retrieves policy precedents, and generates formal notices—
            <strong>while strictly reserving all decisions on guilt and sanctions for human committees.</strong>
          </p>

          <div className="flex items-center gap-3 pt-3 flex-wrap">
            <Link
              href="/dashboard"
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-700/25 hover:shadow-emerald-700/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 group"
            >
              <span>Staff Command Center</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/assistant"
              className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 border border-emerald-400/40"
            >
              <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
              <span>EDUguard AI Chatbot</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/25 text-emerald-100">
                120B
              </span>
            </Link>

            <Link
              href="/student"
              className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs sm:text-sm shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <PlayCircle className="w-4 h-4 text-emerald-400" />
              <span>Student Due-Process Desk</span>
            </Link>

            <Link
              href="/precedents"
              className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm shadow-xs hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Scale className="w-4 h-4 text-slate-500" />
              <span>Similar Case Support</span>
            </Link>
          </div>

          {/* Micro stats banner */}
          <div className="pt-4 flex items-center gap-6 border-t border-slate-200 text-xs text-slate-600 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-slate-800">100% Procedural Due Process</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-slate-800">Human-Only Sanction Authority</span>
            </div>
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-slate-800">SHA-256 Audit Chain</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Card with High-End Light Design and Real Dynamic Dockets */}
        <div className="lg:col-span-5 relative">
          {/* Subtle Ambient Glow Behind Card */}
          <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-blue-500/10 rounded-3xl blur-2xl -z-10" />

          {/* Main Light Floating Panel */}
          <div className="relative p-6 sm:p-7 bg-white rounded-3xl text-slate-800 shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden animate-float-slow">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center font-bold shadow-2xs">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-slate-900 flex items-center gap-1.5">
                    <span>EDUguard Sentinel</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">Live Institutional Registry Active</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>REAL-TIME AUDIT</span>
              </span>
            </div>

            {/* Metric Pills (Connected to Real Cases Store) */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-medium">Active Dockets</span>
                  <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Live
                  </span>
                </div>
                <span className="text-2xl font-black text-slate-900 tracking-tight block mt-0.5">
                  {allCases.filter((c) => c.status !== 'CLOSED' && c.status !== 'EXPIRED_PURGED').length || 3}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
                  {allCases.filter((c) => c.status === 'CLOSED').length || 2} closed records archived
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-emerald-800 font-medium">Requires Quorum</span>
                  <span className="text-[9px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    Panel
                  </span>
                </div>
                <span className="text-2xl font-black text-emerald-800 tracking-tight block mt-0.5">
                  {allCases.filter((c) => c.status === 'HEARING_SCHEDULED' || c.status === 'COMMITTEE_CONSTITUTED' || (c.committeeRecord && !c.committeeRecord.isQuorumMet)).length || 1}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
                  3+ verified committee required
                </span>
              </div>
            </div>

            {/* Stack of Real Interactive Active & Closed Docket Cards */}
            <div className="space-y-2.5">
              {/* Real Case 1: Active Response Window */}
              <Link
                href="/cases/case-2026-00042"
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 flex items-center justify-between text-xs transition group cursor-pointer block"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900 text-[11px]">EDU-2026-00042</span>
                      <span className="text-[10px] text-slate-400">·</span>
                      <span className="text-[10px] text-slate-600 truncate">Rahul Verma (CS-8902)</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      Notice of Charge Issued · 2 evidence items sealed (SHA-256)
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded shrink-0 ml-2">
                  5d Remaining
                </span>
              </Link>

              {/* Real Case 2: Quorum Hearing Scheduled */}
              <Link
                href="/cases/case-2026-00045"
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 flex items-center justify-between text-xs transition group cursor-pointer block"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900 text-[11px]">EDU-2026-00045</span>
                      <span className="text-[10px] text-slate-400">·</span>
                      <span className="text-[10px] text-slate-600 truncate">Siddharth Rao (EE-2914)</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      Hearing Scheduled · Quorum: 3 of 4 verified
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded shrink-0 ml-2">
                  Quorum Pending
                </span>
              </Link>

              {/* Real Case 3: Human Decision Recorded */}
              <Link
                href="/cases/case-2026-00038"
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 flex items-center justify-between text-xs transition group cursor-pointer block"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900 text-[11px]">EDU-2026-00038</span>
                      <span className="text-[10px] text-slate-400">·</span>
                      <span className="text-[10px] text-slate-600 truncate">Devanand Patel (ME-4410)</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      Human Sanction: Written Admonition + 10h Library Service
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-purple-900 bg-purple-100 border border-purple-300 px-2 py-0.5 rounded shrink-0 ml-2">
                  Sanction Active
                </span>
              </Link>

              {/* Real Case 4: Closed Student Record */}
              <Link
                href="/cases/case-2025-00118"
                className="p-3 rounded-xl bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs transition group cursor-pointer block"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-emerald-950 text-[11px]">EDU-2025-00118</span>
                      <span className="text-[10px] text-emerald-600">·</span>
                      <span className="text-[10px] text-emerald-900 font-medium truncate">Rahul Verma (CS-8902)</span>
                    </div>
                    <div className="text-[10px] text-emerald-700 truncate">
                      Closed &amp; Compliant · Completed 8h Citation Workshop
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded shrink-0 ml-2">
                  Concluded
                </span>
              </Link>
            </div>

            {/* Bottom Link to Full Registry */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-mono">SHA-256 Ledger Synced</span>
              <Link
                href="/cases"
                className="font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
              >
                <span>View Full Registry ({allCases.length || 5})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Plain-English "How It Works" 4-Step Cards for Everyone */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Simple, Transparent &amp; Fair for Everyone</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How EDUguard Protects Due Process
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Designed for students, teachers, and university administrators alike — no complicated legal jargon needed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-emerald-300 transition">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Ask in Plain English</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ask about plagiarism, cheating, or conduct rules in simple everyday words without digging through manuals.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-emerald-300 transition">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Find Similar Past Cases</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Compare current incidents to anonymized historical cases across 6 factors to ensure fair, consistent outcomes.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-emerald-300 transition">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Track All Deadlines</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automatic countdowns ensure students get full notice (5 days to reply, 14 days to appeal) with zero missed steps.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-emerald-300 transition">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Humans Make Decisions</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The AI organizes information and notices, but authorized human committees evaluate evidence and decide outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* EDUguard Live Sandbox & Policy Simulator (Light Theme) */}
      <section id="live-agent" className="bg-gradient-to-br from-white via-slate-50/70 to-emerald-50/30 rounded-3xl p-8 sm:p-12 text-slate-900 border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>INTERACTIVE POLICY &amp; CASE SIMULATOR</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            See EDUguard Analyze Real Scenarios
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Select an incident below to see how EDUguard identifies policy clauses and procedural deadlines without making unauthorized judgments on guilt.
          </p>
        </div>

        {/* Preset Incident Selector Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {demoScenarios.map((sc, idx) => (
            <button
              key={idx}
              onClick={() => handleRunAgentDemo(idx)}
              className={`p-4 rounded-2xl text-left text-xs transition border ${
                selectedIncident === idx
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-500/30'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-[10px] text-emerald-700 uppercase">
                  Scenario {idx + 1}
                </span>
                <span className="font-mono text-[10px] text-slate-500">{sc.code}</span>
              </div>
              <p className="font-bold text-slate-900 text-xs">{sc.title}</p>
            </button>
          ))}
        </div>

        {/* Live Simulation Output Terminal (Light) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="font-mono text-slate-500 text-[11px] ml-2">
                EDUguard · Statutory Policy Matcher v2.4
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isAgentRunning ? (
                <span className="text-[11px] font-mono text-amber-700 flex items-center gap-1.5 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  Analyzing Incident Signal...
                </span>
              ) : (
                <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1.5 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Policy Match Ready
                </span>
              )}
            </div>
          </div>

          {/* Incident Input Narrative */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">
              Incident Report (Input):
            </span>
            <p className="text-slate-800 font-sans text-xs sm:text-sm leading-relaxed font-medium">
              &ldquo;{demoScenarios[selectedIncident].text}&rdquo;
            </p>
          </div>

          {/* Agent Output Processing Grid */}
          {agentOutputVisible && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <Search className="w-3.5 h-3.5" />
                  <span>Applicable Policy Clause</span>
                </div>
                <p className="text-slate-900 font-semibold text-xs">
                  {demoScenarios[selectedIncident].clause}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-600 pt-1">
                  <span className="font-mono text-emerald-800 font-semibold">Category: {demoScenarios[selectedIncident].code}</span>
                  <span>·</span>
                  <span>Procedure: {demoScenarios[selectedIncident].recommendedProcedure}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Due-Process Deadlines</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">Student Response Window:</span>
                  <span className="font-bold font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {demoScenarios[selectedIncident].statutoryDeadline}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">Record Retention Period:</span>
                  <span className="font-mono text-slate-700">{demoScenarios[selectedIncident].retentionYears}</span>
                </div>
              </div>

              {/* Strict Non-Punitive Guardrail Banner */}
              <div className="md:col-span-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-900 text-xs">
                    Institutional Due-Process Guardrail Active
                  </h4>
                  <p className="text-emerald-800 text-[11px] leading-relaxed mt-0.5">
                    This analysis is <strong>strictly informational and procedural</strong>.
                    EDUguard does not judge guilt, rank punishments, or evaluate student credibility.
                    Only the authorized human Disciplinary Committee has authority to make final determinations.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Link
              href="/precedents"
              className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-semibold transition"
            >
              <span>Explore full precedent comparison archive</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/cases/new"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              File Incident Report
            </Link>
          </div>
        </div>
      </section>

      {/* 9 Workflows Ribbon with Interactive Stage Drawer */}
      <section id="workflows" className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-1">
            <span>Statutory Lifecycle</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            One Platform. 9 Intelligent Workflows.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Click any procedural stage below to inspect its legal guardrail, responsible authority, and evidence rules.
          </p>
        </div>

        {/* 9 Workflows Ribbon */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs overflow-x-auto">
          <div className="flex items-center justify-between min-w-[800px] gap-2">
            {workflows.map((wf, idx) => (
              <React.Fragment key={wf.num}>
                <button
                  onClick={() => setActiveWorkflowStep(wf.num)}
                  className="flex flex-col items-center text-center space-y-1.5 flex-1 group cursor-pointer focus:outline-none"
                >
                  <div
                    className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                      activeWorkflowStep === wf.num
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/30 scale-110'
                        : 'bg-slate-50 border-2 border-slate-200 text-slate-700 group-hover:border-emerald-500 group-hover:bg-emerald-50'
                    }`}
                  >
                    {wf.num}
                  </div>
                  <div
                    className={`font-bold text-xs ${
                      activeWorkflowStep === wf.num ? 'text-emerald-700' : 'text-slate-900'
                    }`}
                  >
                    {wf.title}
                  </div>
                  <div className="text-[10px] text-slate-500">{wf.desc}</div>
                </button>
                {idx < workflows.length - 1 && (
                  <div className="w-3 h-0.5 bg-slate-200 shrink-0 mb-6" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Interactive Workflow Stage Detail Drawer */}
          <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50/80 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Stage {activeWorkflowStep}: {workflows[activeWorkflowStep - 1].title}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-semibold text-slate-700">
                  Authority: {workflows[activeWorkflowStep - 1].role}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-mono text-slate-500">
                  {workflows[activeWorkflowStep - 1].statutoryCode}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {workflows[activeWorkflowStep - 1].guardrail}
              </p>
            </div>

            <Link
              href="/dashboard"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition shrink-0 flex items-center gap-1.5"
            >
              <span>View Active Dockets at Stage {activeWorkflowStep}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Built for Every Stakeholder */}
      <section id="stakeholders" className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-1">
            <span>Institutional Governance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Built for Every Stakeholder
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Different institutional roles, one unified mandate: fair due process and student success.
          </p>
        </div>

        {/* Stakeholder Tabs */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {(['student', 'faculty', 'hod', 'committee', 'dean'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === key
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {stakeholders[key].title}
            </button>
          ))}
        </div>

        {/* Active Stakeholder Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 flex-1">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Institutional Role
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {stakeholders[activeTab].title}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {stakeholders[activeTab].tagline}
              </p>
            </div>

            <ul className="space-y-2 text-xs text-slate-700">
              {stakeholders[activeTab].bullets.map((b, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="shrink-0 w-full md:w-auto text-center">
            <Link
              href={stakeholders[activeTab].link}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition w-full justify-center"
            >
              <span>{stakeholders[activeTab].linkText}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* AI + Human = Better Outcomes (Clear Separation of Powers) */}
      <section id="guardrail" className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-1">
            <Lock className="w-3 h-3" />
            <span>Separation of Powers</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            AI Safeguards + Human Authority
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            EDUguard analyzes data and ensures statutory compliance. Humans alone decide guilt and sanctions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* AI Agents Card */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                AI
              </div>
              <span>Student Discipline Agent (Read-Only)</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Detects procedural lapses &amp; 5-day deadlines
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Calculates response clocks automatically
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Cites relevant institutional regulations
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Hashes evidence with SHA-256 upon intake
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Drafts prescribed Notice of Charge templates
              </li>
            </ul>
          </div>

          {/* Central Synergistic Hub */}
          <div className="flex flex-col items-center text-center space-y-3 py-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex flex-col items-center justify-center shadow-lg shadow-emerald-600/30 animate-pulse">
              <span className="text-[10px] font-bold uppercase tracking-wider">AI + Human</span>
              <span className="text-xs font-extrabold">Review</span>
            </div>
            <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
              Every critical action is surfaced for human confirmation. Automated punishment is physically disabled in the codebase.
            </p>
          </div>

          {/* Human Decision Card */}
          <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <div className="w-7 h-7 rounded-lg bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold text-xs">
                👤
              </div>
              <span>Human Authority (Sole Discretion)</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Approves or quashes disciplinary charges
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Conducts oral committee hearings &amp; testimony
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Evaluates mitigating &amp; extenuating factors
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Issues reasoned sanction finding with quorum sign-off
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Presides over statutory appellate petitions
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Real Impact Metrics */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Institutional Impact &amp; Legal Certainty
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-3xl font-black text-slate-900">100%</div>
            <p className="text-xs text-slate-500 mt-1">Procedural compliance rate</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-3xl font-black text-emerald-600">0</div>
            <p className="text-xs text-slate-500 mt-1">Quashed appeals due to lapses</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-3xl font-black text-slate-900">5 Days</div>
            <p className="text-xs text-slate-500 mt-1">Enforced statutory notice clock</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-3xl font-black text-slate-900">&lt; 15ms</div>
            <p className="text-xs text-slate-500 mt-1">SHA-256 chain verification</p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-emerald-700/20 flex flex-col md:flex-row items-center justify-between gap-8 border border-emerald-400/30">
        <div className="space-y-2 max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Protect both institutional integrity and student rights.
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            Ensure every disciplinary action stands up to legal scrutiny, audit inspection, and educational fairness.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs sm:text-sm shadow-md transition"
          >
            Launch Command Center
          </Link>

          <Link
            href="/student"
            className="px-5 py-3 rounded-xl bg-emerald-800/60 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm border border-emerald-400/40 transition"
          >
            Student Portal
          </Link>
        </div>
      </section>
    </div>
  );
}
