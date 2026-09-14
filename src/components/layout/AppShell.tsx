'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Scale,
  ArrowRight,
  User,
  LayoutDashboard,
  Lock,
  LogIn,
  LogOut,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { getCurrentPersona, isUserAuthenticated, logoutUser } from '@/lib/store';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileLandingMenuOpen, setMobileLandingMenuOpen] = React.useState(false);
  const [persona, setPersona] = React.useState(getCurrentPersona());
  const [isAuth, setIsAuth] = React.useState(isUserAuthenticated());

  React.useEffect(() => {
    const handleUpdate = () => {
      setPersona(getCurrentPersona());
      setIsAuth(isUserAuthenticated());
    };

    window.addEventListener('persona-changed', handleUpdate);
    window.addEventListener('auth-changed', handleUpdate);
    return () => {
      window.removeEventListener('persona-changed', handleUpdate);
      window.removeEventListener('auth-changed', handleUpdate);
    };
  }, []);

  // RBAC Route Guard & Guest Security Gate
  React.useEffect(() => {
    // 1. If user is logged in as a STUDENT, restrict strictly to Student Defense related pages
    if (persona.role === 'STUDENT') {
      const staffOnlyPrefixes = ['/dashboard', '/cases', '/retention', '/audit', '/governance', '/precedents'];
      if (staffOnlyPrefixes.some((path) => pathname.startsWith(path))) {
        router.replace('/student');
        return;
      }
    }

    // 2. If guest (not logged in), allow preview of landing (/) and dashboard (/dashboard preview) and login (/login).
    // Gating all sensitive docket management and personal student records behind authentication.
    if (!isAuth) {
      const protectedPrefixes = ['/cases', '/audit', '/governance', '/retention', '/precedents', '/student'];
      if (protectedPrefixes.some((path) => pathname.startsWith(path))) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }
    }
  }, [pathname, persona.role, isAuth, router]);

  const handleLogout = () => {
    logoutUser();
    router.push('/');
  };

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
              <Link href="/dashboard" className="hover:text-emerald-700 transition">
                Main Dashboard
              </Link>
            </nav>

            {/* Direct Action Portal Access */}
            <div className="flex items-center gap-2 sm:gap-3">
              {isAuth ? (
                <>
                  {persona.role === 'STUDENT' ? (
                    <Link
                      href="/student"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition group shrink-0"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>My Defense Portal</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition group shrink-0"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Staff Center</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-semibold hover:bg-slate-100 transition"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                    <span>View Dashboard</span>
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition group shrink-0"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </>
              )}

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
              <Link
                href="/dashboard"
                onClick={() => setMobileLandingMenuOpen(false)}
                className="block py-2 text-slate-700 hover:text-emerald-600"
              >
                Main Dashboard Preview
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileLandingMenuOpen(false)}
                className="block py-2 text-emerald-700 font-bold"
              >
                Sign In to Full Portal →
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
                Sign In / Role Switcher
              </Link>
              <Link href="/dashboard" className="hover:text-emerald-700 transition">
                Main Dashboard
              </Link>
              <Link href="/cases?status=CLOSED" className="hover:text-emerald-700 transition">
                Closed Cases Archive
              </Link>
              <Link href="/audit" className="hover:text-emerald-700 transition">
                Cryptographic Ledger
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
              <p className="text-[10px] text-slate-500">Respondent Defense Desk · Guaranteed Due Process</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/assistant"
              className="text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 font-semibold transition px-3 py-1.5 rounded-lg flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Rights Guide</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-slate-600 hover:text-red-600 transition px-3 py-1.5 rounded-lg hover:bg-slate-100 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
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

