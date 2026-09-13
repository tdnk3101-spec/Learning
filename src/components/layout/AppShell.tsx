'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Scale,
  ArrowRight,
  User,
  LayoutDashboard,
  Lock,
} from 'lucide-react';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileLandingMenuOpen, setMobileLandingMenuOpen] = React.useState(false);

  // Landing page has its own full-width layout with institutional header
  if (pathname === '/') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
        {/* Top Institutional Navigation Bar */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs text-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#059669] to-[#10B981] flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                    EDUguard
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    DISCIPLINE AGENT
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  Institutional Due-Process Guardrail &amp; Workflow Orchestration
                </p>
              </div>
            </Link>

            {/* Quick Links (Desktop) */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
              <a href="#workflows" className="hover:text-emerald-700 transition">
                9 Workflows
              </a>
              <a href="#live-agent" className="hover:text-emerald-700 transition flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Demo
              </a>
              <a href="#stakeholders" className="hover:text-emerald-700 transition">
                Stakeholders
              </a>
              <a href="#guardrail" className="hover:text-emerald-700 transition">
                AI Guardrails
              </a>
              <Link href="/audit" className="hover:text-emerald-700 transition">
                SHA-256 Audit
              </Link>
            </nav>

            {/* Direct Action Portal Access */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/student"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-semibold transition"
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Student Portal</span>
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition group shrink-0"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Staff Center</span>
                <span className="xs:hidden">Staff</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* Mobile Landing Hamburger */}
              <button
                onClick={() => setMobileLandingMenuOpen(!mobileLandingMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                aria-label="Toggle navigation"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileLandingMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Collapsible Nav Menu */}
          {mobileLandingMenuOpen && (
            <div className="md:hidden px-4 pt-2 pb-4 border-t border-slate-200 bg-white space-y-2 text-xs font-semibold shadow-md">
              <a
                href="#workflows"
                onClick={() => setMobileLandingMenuOpen(false)}
                className="block py-2 text-slate-700 hover:text-emerald-600"
              >
                9 Statutory Workflows
              </a>
              <a
                href="#live-agent"
                onClick={() => setMobileLandingMenuOpen(false)}
                className="block py-2 text-slate-700 hover:text-emerald-600"
              >
                Live Demo
              </a>
              <a
                href="#stakeholders"
                onClick={() => setMobileLandingMenuOpen(false)}
                className="block py-2 text-slate-700 hover:text-emerald-600"
              >
                Stakeholders View
              </a>
              <a
                href="#guardrail"
                onClick={() => setMobileLandingMenuOpen(false)}
                className="block py-2 text-slate-700 hover:text-emerald-600"
              >
                AI Guardrails
              </a>
              <Link
                href="/audit"
                onClick={() => setMobileLandingMenuOpen(false)}
                className="block py-2 text-slate-700 hover:text-emerald-600"
              >
                SHA-256 Audit Trail
              </Link>
              <Link
                href="/student"
                onClick={() => setMobileLandingMenuOpen(false)}
                className="block py-2 text-emerald-700 font-bold"
              >
                Student Due-Process Portal →
              </Link>
            </div>
          )}
        </header>

        {/* Full-Width Main Content */}
        <main className="flex-1 w-full">{children}</main>

        {/* Institutional Footer */}
        <footer className="bg-white text-slate-600 border-t border-slate-200 py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center font-bold">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">EDUguard — Student Discipline Agent</p>
                <p className="text-[11px] text-slate-500">
                  Strictly non-punitive case management with human-only sanction authority.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-slate-600 flex-wrap justify-center font-medium">
              <Link href="/login" className="hover:text-emerald-700 transition">
                Role Switcher (Demo)
              </Link>
              <Link href="/cases" className="hover:text-emerald-700 transition">
                Active Dockets
              </Link>
              <Link href="/precedents" className="hover:text-emerald-700 transition">
                Precedents RAG
              </Link>
              <Link href="/audit" className="hover:text-emerald-700 transition">
                Cryptographic Ledger
              </Link>
              <Link href="/governance" className="hover:text-emerald-700 transition">
                Equity Analytics
              </Link>
              <Link href="/retention" className="hover:text-emerald-700 transition">
                Retention Engine
              </Link>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Immutable SHA-256 Hash Chaining Enforced</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Dedicated Login Portal (clean full-screen layout)
  if (pathname === '/login') {
    return <main className="min-h-screen bg-slate-50">{children}</main>;
  }

  // Dedicated Student Due-Process Portal (focused, distraction-free)
  if (pathname === '/student') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="h-16 bg-white text-slate-900 px-6 flex items-center justify-between border-b border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">Student Discipline Agent</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
                  Student Due-Process Portal
                </span>
              </div>
              <p className="text-[10px] text-slate-500">Respondent Case Access &amp; Defense Desk</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-slate-600 hover:text-slate-900 transition px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              Public Home
            </Link>
            <Link
              href="/dashboard"
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3.5 py-1.5 rounded-lg transition shadow-xs"
            >
              Staff Command Center
            </Link>
          </div>
        </header>

        <main className="flex-1 max-w-5xl mx-auto w-full p-3.5 sm:p-6 lg:p-8">{children}</main>
      </div>
    );
  }

  // Default Staff Workspace: Full Dashboard with Sidebar & Header
  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 antialiased w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
