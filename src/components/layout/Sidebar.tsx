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
  Sparkles,
  Archive,
  LogOut,
} from 'lucide-react';
import { getCurrentPersona, setCurrentPersona, loginAsPersona, logoutUser } from '@/lib/store';
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
    const updated = loginAsPersona(personaId);
    setPersona(updated);
    setShowRoleMenu(false);
  };

  const handleLogout = () => {
    logoutUser();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  // Dedicated Student Navigation Menu (Strictly Student Defense Only)
  const studentNavItems = [
    {
      label: 'Student Defense Portal',
      href: '/student',
      icon: User,
      badge: 'Defense Desk',
    },
    {
      label: 'EDUguard AI Rights Assistant',
      href: '/assistant',
      icon: Sparkles,
      badge: 'Rights RAG',
    },
    {
      label: 'Closed Case History',
      href: '/student#closed',
      icon: Archive,
    },
  ];

  // Faculty, Administration & Committee Navigation
  const staffNavItems = [
    {
      label: 'Home / Overview',
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
      label: 'EDUguard AI Assistant',
      href: '/assistant',
      icon: Sparkles,
      rolesAllowed: ['ADMIN_REGISTRAR', 'HEAD_OF_DEPARTMENT', 'DEAN_STUDENT_AFFAIRS', 'COMMITTEE_MEMBER', 'GOVERNANCE_VIEWER'],
      badge: '120B AI',
    },
    {
      label: 'Active Dockets',
      href: '/cases',
      icon: FileSpreadsheet,
      rolesAllowed: ['ADMIN_REGISTRAR', 'HEAD_OF_DEPARTMENT', 'DEAN_STUDENT_AFFAIRS', 'COMMITTEE_MEMBER'],
    },
    {
      label: 'Closed Cases Archive',
      href: '/cases?status=CLOSED',
      icon: Archive,
      rolesAllowed: ['ADMIN_REGISTRAR', 'HEAD_OF_DEPARTMENT', 'DEAN_STUDENT_AFFAIRS', 'COMMITTEE_MEMBER', 'GOVERNANCE_VIEWER'],
      badge: 'Archived',
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
      label: 'Precedents & Similar Cases',
      href: '/precedents',
      icon: Scale,
      rolesAllowed: ['ADMIN_REGISTRAR', 'HEAD_OF_DEPARTMENT', 'DEAN_STUDENT_AFFAIRS', 'COMMITTEE_MEMBER'],
      badge: 'Matcher',
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

  const activeNavItems =
    currentPersona.role === 'STUDENT'
      ? studentNavItems
      : staffNavItems.filter((i) => i.rolesAllowed.includes(currentPersona.role));


  const sidebarContent = (
    <div className="flex flex-col h-full select-none bg-white text-slate-800">
      {/* Brand & Header */}
      <div className="p-5 border-b border-slate-200/80 flex items-center justify-between gap-3 bg-white">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 tracking-tight text-base">EDUguard</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                DISCIPLINE AGENT
              </span>
              <p className="text-[10px] text-slate-500 font-medium">Due-Process</p>
            </div>
          </div>
        </Link>

        {/* Mobile Close (X) button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Current User Persona Card (Light Style) */}
      <div className="p-4 border-b border-slate-200/80 bg-slate-50/70">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Active Persona
          </span>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 transition"
          >
            Switch Role
            <ChevronRight className={`w-3 h-3 transition-transform ${showRoleMenu ? 'rotate-90' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center font-bold text-emerald-800 text-sm shrink-0">
            {currentPersona.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">{currentPersona.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{currentPersona.designation}</p>
            <div className="mt-1">
              <span className="inline-block text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                {currentPersona.role.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Switch Persona Dropdown Menu */}
        {showRoleMenu && (
          <div className="mt-3 p-2 bg-white rounded-xl border border-slate-200 shadow-xl space-y-1">
            <p className="text-[10px] text-slate-400 font-bold px-2 py-1 uppercase tracking-wider">Simulate User Persona:</p>
            {USER_PERSONAS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleRoleChange(p.id)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition flex items-center justify-between ${
                  p.id === currentPersona.id
                    ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-[10px] text-slate-500">{p.designation}</div>
                </div>
                {p.id === currentPersona.id && <UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
            ))}

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-red-600 hover:bg-red-50 font-semibold flex items-center gap-2 transition"
              >
                <LogOut className="w-3.5 h-3.5 text-red-500" />
                <span>Sign Out (Guest Mode)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
          {currentPersona.role === 'STUDENT' ? 'Student Defense Desk' : 'Workflows & Dockets'}
        </div>
        {activeNavItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800 shadow-xs border border-emerald-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon
                className={`w-4 h-4 transition shrink-0 ${
                  isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-600'
                }`}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {'badge' in item && Boolean(item.badge) && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  {String(item.badge)}
                </span>
              )}
            </Link>
          );
        })}
      </nav>


      {/* Friendly Light Guardrail Badge */}
      <div className="p-4 border-t border-slate-200/80 bg-slate-50/60 shrink-0">
        <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-emerald-900">Fairness &amp; Due Process</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <strong className="text-slate-800">EDUguard</strong> provides information and precedent matching.
            <span className="block text-emerald-700 font-semibold mt-0.5">
              Authorized humans alone decide guilt &amp; penalties.
            </span>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Sidebar (Fixed & visible on screens >= 1024px) */}
      <aside className="hidden lg:flex w-72 bg-white text-slate-800 flex-col shrink-0 border-r border-slate-200/90 h-screen sticky top-0 shadow-xs">
        {sidebarContent}
      </aside>

      {/* 2. Mobile Off-Canvas Drawer (< 1024px) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white text-slate-800 z-50 shadow-2xl border-r border-slate-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
