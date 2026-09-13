'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  FilePlus,
  Scale,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  Hash,
  Clock,
  Users,
  BookOpen,
} from 'lucide-react';
import { OFFENCE_CATEGORIES } from '@/lib/mock-data';
import { createNewIncident, getCurrentPersona } from '@/lib/store';
import { computeSha256 } from '@/lib/audit';

export default function NewIncidentPage() {
  const router = useRouter();
  const [persona, setPersona] = React.useState(getCurrentPersona());

  const [title, setTitle] = React.useState('');
  const [department, setDepartment] = React.useState(persona.department || 'Computer Science & Engineering');
  const [studentRef, setStudentRef] = React.useState('');
  const [categoryId, setCategoryId] = React.useState(OFFENCE_CATEGORIES[0].id);
  const [location, setLocation] = React.useState('');
  const [incidentDate, setIncidentDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = React.useState('');

  const [evidenceList, setEvidenceList] = React.useState<
    { name: string; size: number; mime: string; hash: string }[]
  >([
    {
      name: 'initial_incident_report_signed.pdf',
      size: 245000,
      mime: 'application/pdf',
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
  ]);

  const [simulatingFile, setSimulatingFile] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    const handleUpdate = () => {
      const current = getCurrentPersona();
      setPersona(current);
      if (current.department) setDepartment(current.department);
    };
    window.addEventListener('persona-changed', handleUpdate);
    return () => window.removeEventListener('persona-changed', handleUpdate);
  }, []);

  const selectedCategory = OFFENCE_CATEGORIES.find((c) => c.id === categoryId) || OFFENCE_CATEGORIES[0];

  const handleSimulateEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setSimulatingFile(true);
    const file = files[0];
    const dummyContent = `${file.name}-${file.size}-${Date.now()}`;
    const hash = await computeSha256(dummyContent);

    setTimeout(() => {
      setEvidenceList((prev) => [
        ...prev,
        {
          name: file.name,
          size: file.size,
          mime: file.type || 'application/octet-stream',
          hash,
        },
      ]);
      setSimulatingFile(false);
    }, 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !studentRef || !description) {
      alert('Please fill out all mandatory fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createNewIncident(
        title,
        department,
        studentRef.startsWith('Student Ref') ? studentRef : `Student Ref #${studentRef}`,
        categoryId,
        description,
        location || 'Campus Premises',
        new Date(incidentDate).toISOString(),
        evidenceList,
        persona
      );

      // Trigger event for store updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('persona-changed'));
      }

      router.push(`/cases/${created.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error creating case';
      alert(`Error creating case: ${message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            Stage 1: Case Intake
          </span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-500 font-medium">Reporting Authority: {persona.name}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Initiate Disciplinary Case File</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Formally record an incident, register cryptographic evidence hashes, and initialize the procedural checklist.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Incident Particulars */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <FilePlus className="w-4 h-4 text-emerald-600" />
            1. Docket Title &amp; Respondent Identification
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Case Title / Incident Summary <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Assessment Irregularity in Final Database Systems Exam"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Pseudonymized Ref <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={studentRef}
                onChange={(e) => setStudentRef(e.target.value)}
                placeholder="e.g. CS-9041 (Never store full academic profile here)"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Physical segregation: Case dockets do not cross-link to placement/grades tables.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department In Jurisdiction <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Incident Date</label>
              <input
                type="date"
                required
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Ramanujan Computer Lab 201"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Offence Classification & Procedure Mapping */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              2. Offence Policy Category &amp; Statutory Rules
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">Rules-Based Procedural Generator</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Institutional Offence Category <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium"
            >
              {OFFENCE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name} ({c.severity})
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Policy Rule Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-semibold text-slate-800">
                Procedure: <code className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{selectedCategory.procedureReference}</code>
              </span>
              <span className="text-slate-500">
                Severity Rating: <strong className="text-slate-700 uppercase">{selectedCategory.severity}</strong>
              </span>
            </div>

            <p className="text-slate-600">{selectedCategory.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/60 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Response Window: <strong>{selectedCategory.responseWindowDays} calendar days</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Hearing Quorum: <strong>min {selectedCategory.defaultQuorum} members</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Scale className="w-3.5 h-3.5 text-purple-600" />
                <span>Appeal Period: <strong>{selectedCategory.appealWindowDays} days</strong></span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-1">
              <strong className="text-slate-700">Permissible Sanction Range Guide:</strong> {selectedCategory.sanctionRangeGuide}
            </div>
          </div>
        </div>

        {/* Section 3: Narrative Description */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            3. Factual Incident Statement
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Narrative Description of Conduct / Allegation <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State the observed facts chronologically without conclusions of law..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Section 4: Tamper-Evident Evidence Locker */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Hash className="w-4 h-4 text-emerald-600" />
                4. Cryptographic Evidence Locker (WORM Storage)
              </h2>
              <p className="text-[11px] text-slate-500">
                All attachments are hashed with SHA-256 upon intake. Immutability guaranteed.
              </p>
            </div>

            <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
              <span>{simulatingFile ? 'Hashing File...' : 'Attach File'}</span>
              <input type="file" onChange={handleSimulateEvidenceUpload} className="hidden" />
            </label>
          </div>

          <div className="space-y-2">
            {evidenceList.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {(item.size / 1024).toFixed(1)} KB · {item.mime}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    SHA-256: {item.hash.substring(0, 16)}...
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-slate-500">
            Submitting seals the incident, assigns a permanent case number, and initiates the audit chain.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSubmitting ? 'Opening Docket & Sealing Hashes...' : 'Confirm & Open Case File'}
          </button>
        </div>
      </form>
    </div>
  );
}
