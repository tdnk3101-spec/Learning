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


export default function LandingPage() {
  const [activeTab, setActiveTab] = React.useState<'student' | 'faculty' | 'hod' | 'committee' | 'dean'>('hod');
  const [activeWorkflowStep, setActiveWorkflowStep] = React.useState<number>(1);
  const [selectedIncident, setSelectedIncident] = React.useState<number>(0);
  const [isAgentRunning, setIsAgentRunning] = React.useState<boolean>(false);
  const [agentOutputVisible, setAgentOutputVisible] = React.useState<boolean>(true);

  const workflows = [
    {
      num: 1,
      title: 'Detect',
      desc: 'Identify infractions',
      role: 'Faculty / Proctor',
      guardrail: 'Objective factual observation only; no guilt presumption.',
      statutoryCode: 'Reg §4.1 (Intake)',
    },
    {
      num: 2,
      title: 'Understand',
      desc: 'Classify category',
      role: 'Student Discipline Agent',
      guardrail: 'Automated policy clause matching without discretionary bias.',
      statutoryCode: 'Reg §5.2 (Offence Mapping)',
    },
    {
      num: 3,
      title: 'Hash Evidence',
      desc: 'Cryptographic lock',
      role: 'Intake System',
      guardrail: 'SHA-256 tamper-evident chain; WORM storage prevents modification.',
      statutoryCode: 'Evidence Act §65B',
    },
    {
      num: 4,
      title: 'Issue Notice',
      desc: 'Formal summons',
      role: 'HOD / Proctor',
      guardrail: 'Mandatory 5-day statutory response clock delivered to student.',
      statutoryCode: 'Reg §7.1 (Notice of Charge)',
    },
    {
      num: 5,
      title: 'Student Defense',
      desc: 'Written representation',
      role: 'Respondent Student',
      guardrail: 'Full access to evidence; right to legal advocate and written submission.',
      statutoryCode: 'Due Process §10.1',
    },
    {
      num: 6,
      title: 'Verify Quorum',
      desc: 'Check impartiality',
      role: 'Committee Chair',
      guardrail: 'Minimum 3 non-recused members; mandatory conflict-of-interest check.',
      statutoryCode: 'Reg §12.3 (Quorum Rule)',
    },
    {
      num: 7,
      title: 'Precedent RAG',
      desc: 'Policy lookup',
      role: 'Student Discipline Agent',
      guardrail: 'Informational only. AI strictly prohibited from ranking sanctions.',
      statutoryCode: 'Policy Index §15',
    },
    {
      num: 8,
      title: 'Human Order',
      desc: 'Reasoned finding',
      role: 'Disciplinary Committee',
      guardrail: 'Human-exclusive authority. Reasoned written finding with quorum signatures.',
      statutoryCode: 'Reg §18.4 (Sanction Order)',
    },
    {
      num: 9,
      title: 'Appellate Right',
      desc: 'Tribunal review',
      role: 'Appellate Authority',
      guardrail: '10-day statutory appeal window to review procedural fairness.',
      statutoryCode: 'Statute §22 (Appeals)',
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
            <span>Student Discipline Agent · Agent 47</span>
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
            The <strong>Student Discipline Agent</strong> (Agent 47) enforces procedural due process across every stage of institutional inquiry.
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
              href="/student"
              className="px-5 py-3.5 rounded-xl bg-[#0B1727] hover:bg-[#12243D] text-white font-semibold text-xs sm:text-sm shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <PlayCircle className="w-4 h-4 text-emerald-400" />
              <span>Student Due-Process Desk</span>
            </Link>

            <Link
              href="/login"
              className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm shadow-xs hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-slate-500" />
              <span>Switch Role (Demo)</span>
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

        {/* Right Column: Hero Visual Card with High-End Micro-Animations */}
        <div className="lg:col-span-5 relative">
          {/* Subtle Ambient Glow Behind Card */}
          <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-blue-500/20 rounded-3xl blur-2xl -z-10" />

          {/* Main Dark Floating Panel */}
          <div className="relative p-7 sm:p-8 bg-gradient-to-br from-[#0B1E33] via-[#0F2A4A] to-[#0A1A2E] rounded-3xl text-white shadow-2xl border border-[#1E3A5F] overflow-hidden animate-float-slow">
            {/* Animated Glow Spot */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/25 rounded-full blur-3xl animate-pulse" />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shadow-inner">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                    <span>Student Discipline Agent</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">Agent 47 · Real-Time Sentinel</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold tracking-wider">
                100% PROCEDURAL HEALTH
              </span>
            </div>

            {/* Metric Pills */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="text-[10px] text-slate-400 block font-medium">Active Dockets</span>
                <span className="text-2xl font-black text-white tracking-tight">1,284</span>
                <span className="text-[9px] text-emerald-400 block mt-0.5">All statutory clocks active</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-xs">
                <span className="text-[10px] text-emerald-300 block font-medium">Requires Quorum</span>
                <span className="text-2xl font-black text-emerald-400 tracking-tight">87</span>
                <span className="text-[9px] text-emerald-300/80 block mt-0.5">3+ committee required</span>
              </div>
            </div>

            {/* Stack of Floating Interactive Status Cards */}
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-between text-xs hover:bg-white/15 transition group cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <div>
                    <div className="font-bold text-slate-100 text-[11px]">Notice of Charge Issued</div>
                    <div className="text-[10px] text-slate-300">5-day statutory window clock active</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded">
                  5d 00h Remaining
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-between text-xs hover:bg-white/15 transition group cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <div>
                    <div className="font-bold text-slate-100 text-[11px]">Committee Quorum Verified</div>
                    <div className="text-[10px] text-slate-300">3 of 3 members confirmed · 0 recusals</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-300 bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 rounded">
                  Quorum Met
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-md flex items-center justify-between text-xs cursor-default">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-emerald-200 text-[11px]">Human Decision Imposed</div>
                    <div className="text-[10px] text-emerald-300/80">Student #CS-8902 · Educational workshop</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Concluded
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW FEATURE: Agent 47 Live Sandbox & Policy Clause RAG Simulator */}
      <section id="live-agent" className="bg-[#0B1E33] rounded-3xl p-8 sm:p-12 text-white border border-[#1E3A5F] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>INTERACTIVE AGENT 47 SANDBOX</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Experience the Student Discipline Agent in Action
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            See how Agent 47 extracts factual narratives, classifies offence codes, matches statutory clauses,
            and formulates prescribed notices without making unauthorized decisions on guilt.
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
                  ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-[10px] text-emerald-400 uppercase">
                  Scenario {idx + 1}
                </span>
                <span className="font-mono text-[10px] text-slate-400">{sc.code}</span>
              </div>
              <p className="font-bold text-slate-100 text-xs">{sc.title}</p>
            </button>
          ))}
        </div>

        {/* Live Simulation Output Terminal */}
        <div className="bg-[#071321] rounded-2xl border border-[#1E3A5F] p-6 shadow-inner space-y-5">
          <div className="flex items-center justify-between border-b border-[#1E3A5F]/80 pb-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="font-mono text-slate-400 text-[11px] ml-2">
                Agent 47 · Statutory RAG Engine v2.4
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isAgentRunning ? (
                <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Parsing Factual Signal...
                </span>
              ) : (
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Statutory Mapping Ready
                </span>
              )}
            </div>
          </div>

          {/* Incident Input Narrative */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Incident Narrative (Input Data):
            </span>
            <p className="text-slate-200 font-sans text-xs sm:text-sm leading-relaxed">
              &ldquo;{demoScenarios[selectedIncident].text}&rdquo;
            </p>
          </div>

          {/* Agent Output Processing Grid */}
          {agentOutputVisible && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Search className="w-3.5 h-3.5" />
                  <span>Statutory Policy Clause Citation</span>
                </div>
                <p className="text-slate-100 font-semibold text-xs">
                  {demoScenarios[selectedIncident].clause}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                  <span className="font-mono text-emerald-300">Category: {demoScenarios[selectedIncident].code}</span>
                  <span>·</span>
                  <span>Procedure: {demoScenarios[selectedIncident].recommendedProcedure}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Mandatory Due-Process Deadlines</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Student Response Window:</span>
                  <span className="font-bold font-mono text-amber-300">
                    {demoScenarios[selectedIncident].statutoryDeadline}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Retention &amp; Purge Clock:</span>
                  <span className="font-mono text-slate-300">{demoScenarios[selectedIncident].retentionYears}</span>
                </div>
              </div>

              {/* Strict Non-Punitive Guardrail Banner */}
              <div className="md:col-span-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-300 text-xs">
                    Agent 47 Statutory Guardrail Active
                  </h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed mt-0.5">
                    This analysis is <strong>strictly informational and procedural</strong>.
                    The Student Discipline Agent does not judge guilt, rank sanctions, or evaluate respondent credibility.
                    Only the human Disciplinary Committee has statutory authority to adjudicate.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Link
              href="/precedents"
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold transition"
            >
              <span>Explore full institutional precedent repository</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/cases/new"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              File Real Incident Report
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
            Agent 47 analyzes data and ensures statutory compliance. Humans alone decide guilt and sanctions.
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
          <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <div className="w-7 h-7 rounded-lg bg-white/20 text-white flex items-center justify-center font-bold text-xs">
                👤
              </div>
              <span>Human Authority (Sole Discretion)</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Approves or quashes disciplinary charges
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Conducts oral committee hearings &amp; testimony
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Evaluates mitigating &amp; extenuating factors
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Issues reasoned sanction finding with quorum sign-off
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
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
      <section className="bg-[#0B1E33] rounded-3xl p-8 sm:p-12 text-white border border-[#1E3A5F] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
        <div className="space-y-2 max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Protect both institutional integrity and student rights.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Ensure every disciplinary action stands up to legal scrutiny, audit inspection, and educational fairness.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md transition"
          >
            Launch Command Center
          </Link>

          <Link
            href="/student"
            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm transition"
          >
            Student Portal
          </Link>
        </div>
      </section>
    </div>
  );
}
