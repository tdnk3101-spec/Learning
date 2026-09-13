'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Scale,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { setCurrentPersona } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('m.sharma@institution.edu');
  const [password, setPassword] = React.useState('••••••••••••');
  const [remember, setRemember] = React.useState(true);

  const handleDemoSelect = (personaId: string, redirectPath: string) => {
    setCurrentPersona(personaId);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('persona-changed'));
    }
    router.push(redirectPath);
  };

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPersona('user-hod-cse');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('persona-changed'));
    }
    router.push('/dashboard');
  };

  return (
    <div className="max-w-5xl mx-auto py-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Column (Hero Card with Deep Navy Palette) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0B1E33] via-[#0E2744] to-[#0A182A] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl" />

          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-900/40">
                <Scale className="w-5 h-5" />
              </div>
              <span className="font-bold tracking-tight text-base">Student Discipline Agent</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Your academic journey, our priority.
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                An intelligent operations platform and support system that helps every student succeed while protecting constitutional due process.
              </p>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Track due-process checklist &amp; response clocks</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Get transparent precedent &amp; policy references</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Stay connected with mentors &amp; faculty advocates</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Protect student rights with human-only decisions</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 relative z-10 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Disciplinary Board of Inquest</span>
            <span className="font-mono text-emerald-400">FERPA Protected</span>
          </div>
        </div>

        {/* Right Column (Login Form & Interactive Demo Mode Switcher) */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-4 text-xs font-semibold">
                <button className="text-emerald-600 border-b-2 border-emerald-600 pb-1">Sign In</button>
                <button className="text-slate-400 hover:text-slate-600 pb-1">SSO Auth</button>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Agent 47 v2.4</span>
            </div>

            <div className="space-y-1 mb-6">
              <h3 className="text-xl font-bold text-slate-900">Welcome Back</h3>
              <p className="text-xs text-slate-500">Sign in to access your designated disciplinary authority dashboard.</p>
            </div>

            <form onSubmit={handleStandardSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email / Institutional ID
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Password</label>
                  <a href="#" className="text-[11px] text-emerald-600 hover:underline">Forgot password?</a>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="remember" className="text-xs text-slate-600 cursor-pointer">
                  Remember my credentials
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Sign In
              </button>
            </form>
          </div>

          {/* Demo Mode (Select Role) */}
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Demo Mode (Select Role to Instant-Login):
              </span>
              <span className="text-[10px] text-slate-400">Click any role</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSelect('user-student-portal', '/student')}
                className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 text-xs font-semibold transition text-left"
              >
                <span className="block text-[10px] text-emerald-600 uppercase font-bold">Respondent</span>
                <span className="truncate block">Student Portal</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('user-hod-cse', '/dashboard')}
                className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 text-xs font-semibold transition text-left"
              >
                <span className="block text-[10px] text-blue-600 uppercase font-bold">HOD - CSE</span>
                <span className="truncate block">Dr. Meera Sharma</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('user-dean-students', '/dashboard')}
                className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 text-xs font-semibold transition text-left"
              >
                <span className="block text-[10px] text-purple-600 uppercase font-bold">Dean of Students</span>
                <span className="truncate block">Prof. Sterling</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('user-committee-chair', '/dashboard')}
                className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 text-xs font-semibold transition text-left"
              >
                <span className="block text-[10px] text-amber-600 uppercase font-bold">Committee Chair</span>
                <span className="truncate block">Dr. Rajiv Menon</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('user-admin-registrar', '/dashboard')}
                className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 text-xs font-semibold transition text-left"
              >
                <span className="block text-[10px] text-slate-600 uppercase font-bold">Registrar Admin</span>
                <span className="truncate block">Sarah Jenkins, Esq.</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('user-governance-viewer', '/governance')}
                className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 text-xs font-semibold transition text-left"
              >
                <span className="block text-[10px] text-teal-600 uppercase font-bold">Oversight</span>
                <span className="truncate block">Senate Auditor</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
