'use client';

import React from 'react';
import {
  Search,
  Filter,
  ShieldAlert,
  Scale,
  Layers,
  BookOpen,
  History,
} from 'lucide-react';
import { getPrecedents } from '@/lib/store';
import { OFFENCE_CATEGORIES } from '@/lib/mock-data';
import SimilarCaseSupport from '@/components/precedents/SimilarCaseSupport';

export default function PrecedentsPage() {
  const [activeTab, setActiveTab] = React.useState<'similar-cases' | 'archive'>('similar-cases');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');

  const precedents = getPrecedents(
    searchQuery,
    selectedCategory === 'ALL' ? undefined : selectedCategory
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
            Legal-Adjacent Reference Layer
          </span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-500 font-medium">Precedent &amp; Policy Intelligence</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Policy &amp; Precedent Archive</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Multi-factor precedent matching and statutory policy retrieval to ensure institutional consistency and fairness.
        </p>
      </div>

      {/* Tab Navigation Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('similar-cases')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'similar-cases'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          Similar Case Support (Multi-Factor Matcher)
        </button>

        <button
          onClick={() => setActiveTab('archive')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'archive'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          Precedent Archive &amp; Search Index ({precedents.length})
        </button>
      </div>

      {/* Tab 1: Similar Case Support */}
      {activeTab === 'similar-cases' && <SimilarCaseSupport />}

      {/* Tab 2: Precedent Archive & Search */}
      {activeTab === 'archive' && (
        <div className="space-y-6">
          {/* Mandatory Guardrail Notice */}
          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200/80 shadow-xs flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-amber-900">
              <p className="font-bold">
                MANDATORY COMPLIANCE DIRECTIVE: FOR REFERENCE ONLY — NOT AN AI RECOMMENDATION
              </p>
              <p className="text-amber-800 leading-relaxed text-[11px]">
                In strict observance of disciplinary regulations, the Student Discipline Agent does not prescribe sanctions.
                Precedents are indexed by category and factual similarity purely to assist human committee members in
                ensuring non-arbitrary treatment across academic terms.
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search keywords (e.g. plagiarism, examination hall, restitution, unauthorized device)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium shadow-xs"
              >
                <option value="ALL">All Offence Categories</option>
                {OFFENCE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Precedent Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {precedents.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {p.anonymizedCaseRef}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {p.categoryCode}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">Resolved: {p.yearResolved}</span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 mb-1">{p.title}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Generalized Conduct Facts:
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {p.generalizedFacts}
                    </p>
                  </div>

                  {(p.mitigatingFactors || p.aggravatingFactors) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {p.mitigatingFactors && (
                        <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100 text-slate-700">
                          <span className="font-bold text-emerald-800 block text-[10px]">Mitigating:</span>
                          {p.mitigatingFactors}
                        </div>
                      )}
                      {p.aggravatingFactors && (
                        <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-100 text-slate-700">
                          <span className="font-bold text-amber-800 block text-[10px]">Aggravating:</span>
                          {p.aggravatingFactors}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Sanction Imposed Range (Historical):
                    </span>
                    <p className="text-xs font-semibold text-slate-900 mt-0.5">{p.sanctionImposedRange}</p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {p.searchKeywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
