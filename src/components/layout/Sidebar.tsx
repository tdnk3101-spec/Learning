'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileSpreadsheet,
  PlusCircle,
  Scale,
  ShieldCheck,
  BarChart3,
  UserCheck,
  ChevronRight,
  ShieldAlert,
  User,
  History,
  Home,
  X,
} from 'lucide-react';
import { getCurrentPersona, setCurrentPersona } from '@/lib/store';
import { USER_PERSONAS } from '@/lib/mock-data';

export default function Sidebar() {
  const pathname = usePathname();
  const [currentPersona, setPersona] = React.useState(getCurrentPersona());
  const [showRoleMenu, setShowRoleMenu] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const handlePersonaChange = () => setPersona(getCurrentPersona());
    const handleToggleMobile = () => setIsMobileOpen((prev) => !prev);
    const handleCloseMobile = () => setIsMobileOpen(false);

    window.addEventListener('persona-changed', handlePersonaChange);
    window.addEventListener('toggle-mobile-sidebar', handleToggleMobile);
    window.addEventListener('close-mobile-sidebar', handleCloseMobile);

    return () => {
      window.removeEventListener('persona-changed', handlePersonaChange);
      window.removeEventListener('toggle-mobile-sidebar', handleToggleMobile);
      window.removeEventListener('close-mobile-sidebar', handleCloseMobile);
    };
  }, []);

  // Close mobile sidebar on route change
  React.useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const handleRoleChange = (personaId: string) => {
    const updated = setCurrentPersona(personaId);
    setPersona(updated);
    setShowRoleMenu(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('persona-changed'));
    }
  };

  const navItems = [
    {
      label: 'Home / Public Overview',
      href: '/',
      icon: Home,
      rolesAllowed: ['ADMIN_REGISTRAR', 'HEAD_OF_DEPARTMENT', 'DEAN_STUDENT_AFFAIRS', 'COMMITTEE_MEMBER', 'GOVERNANCE_VIEWER'],
    },
    {
      label: 'Command Center',
      href: '/dashboard',
      icon: LayoutDashboard,
      rolesAllowed: ['ADMIN_REGISTRAR', 'HEAD_OF_DEPARTMENT', 'DEAN_STUDENT_AFFAIRS', 'COMMITTEE_MEMBER', 'GOVERNANCE_VIEWER'],
    },
    {
      label: 'Active Dockets',
      href: '/cases',
      icon: FileSpreadsheet,
      rolesAllowed: ['ADMIN_REGISTRAR', 'HEAD_OF_DEPARTMENT', 'DEAN_STUDENT_AFFAIRS', 'COMMITTEE_MEMBER'],
    },
    {
      label: 'Student Defense Portal',
      href: '/student',
      icon: User,
      rolesAllowed: ['ADMIN_REGISTRAR', 'HEAD_OF_DEPARTMENT', 'DEAN_STUDENT_AFFAIRS', 'COMMITTEE_MEMBER', 'GOVERNANCE_VIEWER'],
    },
    {
      label: 'File Incident (Intake)',
      href: '/cases/new',
      icon: PlusCircle,
      rolesAllowed: ['ADMIN_REGISTRAR', 'HEAD_OF_DEPARTMENT'],
    },
    {
      label: 'Precedents & Policy',
      href: '/precedents',
      icon: Scale,
      rolesAllowed: ['ADMIN_REGISTRAR', 'HEAD_OF_DEPARTMENT', 'DEAN_STUDENT_AFFAIRS', 'COMMITTEE_MEMBER'],
    },
    {
      label: 'Retention & Purge',
      href: '/retention',
      icon: History,
      rolesAllowed: ['ADMIN_REGISTRAR', 'DEAN_STUDENT_AFFAIRS', 'GOVERNANCE_VIEWER'],
    },
    {
      label: 'Cryptographic Audit',
      href: '/audit',
      icon: ShieldCheck,
      rolesAllowed: ['ADMIN_REGISTRAR', 'DEAN_STUDENT_AFFAIRS', 'GOVERNANCE_VIEWER', 'COMMITTEE_MEMBER', 'HEAD_OF_DEPARTMENT'],
    },
    {
      label: 'Governance Analytics',
      href: '/governance',
      icon: BarChart3,
      rolesAllowed: ['ADMIN_REGISTRAR', 'DEAN_STUDENT_AFFAIRS', 'GOVERNANCE_VIEWER'],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full select-none">
      {/* Brand & Header */}
      <div className="p-4 sm:p-5 border-b border-[#1E3A5F]/60 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#059669] to-[#10B981] flex items-center justify-center text-white shadow-lg shadow-emerald-900/30 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white tracking-tight text-sm">Student Discipline</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                AGENT 47
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Due-Process Engine</p>
            </div>
          </div>
        </Link>

        {/* Mobile Close (X) button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Current User Persona Card */}
      <div className="p-4 border-b border-[#1E3A5F]/60 bg-[#0E1F35]/70">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Active Persona
          </span>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition"
          >
            Switch Role
            <ChevronRight className={`w-3 h-3 transition-transform ${showRoleMenu ? 'rotate-90' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-700/40 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-300 text-sm shrink-0">
            {currentPersona.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{currentPersona.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{currentPersona.designation}</p>
            <div className="mt-1">
              <span className="inline-block text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-[#1A365D] text-blue-300 border border-blue-400/30">
                {currentPersona.role.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Switch Persona Dropdown Menu */}
        {showRoleMenu && (
          <div className="mt-3 p-2 bg-[#0B1727] rounded-lg border border-[#1E3A5F] shadow-xl space-y-1">
            <p className="text-[10px] text-slate-400 font-semibold px-2 py-1">Simulate User Persona:</p>
            {USER_PERSONAS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleRoleChange(p.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition flex items-center justify-between ${
                  p.id === currentPersona.id
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'text-slate-300 hover:bg-[#152B47]'
                }`}
              >
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-[10px] opacity-75">{p.designation}</div>
                </div>
                {p.id === currentPersona.id && <UserCheck className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-500">
          Workflows &amp; Dockets
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isAllowed = item.rolesAllowed.includes(currentPersona.role);

          if (!isAllowed) {
            return null;
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition group ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-slate-300 hover:bg-[#12243D] hover:text-white'
              }`}
            >
              <item.icon
                className={`w-4 h-4 transition shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                }`}
              />
              <span className="flex-1 truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Strict Guardrail Badge */}
      <div className="p-4 border-t border-[#1E3A5F]/60 bg-[#081220] shrink-0">
        <div className="p-3 rounded-xl bg-gradient-to-br from-[#0F233A] to-[#0A1A2E] border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] font-bold text-emerald-300">Statutory Guardrail</span>
          </div>
          <p className="text-[10px] text-slate-300 leading-relaxed">
            <strong className="text-white">Agent 47.</strong> Automated procedural compliance engine.
            <span className="block text-emerald-400 font-semibold mt-0.5">
              Humans alone decide guilt &amp; sanctions.
            </span>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop & Laptop Sidebar (Fixed & visible on screens >= 1024px) */}
      <aside className="hidden lg:flex w-72 bg-[#0B1727] text-slate-200 flex-col shrink-0 border-r border-[#1E3A5F] h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* 2. Mobile & Tablet Off-Canvas Drawer (< 1024px) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0B1727] text-slate-200 z-50 shadow-2xl border-r border-[#1E3A5F]">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
