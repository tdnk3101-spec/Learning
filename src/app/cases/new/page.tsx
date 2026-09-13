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
  UserPlus,
  Trash2,
  ShieldCheck,
  Building,
  UserCheck,
  Eye,
} from 'lucide-react';
import { OFFENCE_CATEGORIES } from '@/lib/mock-data';
import { createNewIncident, getCurrentPersona, getAllCasesForGovernance } from '@/lib/store';
import { computeSha256 } from '@/lib/audit';
import { PersonInvolved, Witness } from '@/types';

export default function NewIncidentPage() {
  const router = useRouter();
  const [persona, setPersona] = React.useState(getCurrentPersona());

  const [title, setTitle] = React.useState('');
  const [department, setDepartment] = React.useState(persona.department || 'Computer Science & Engineering');
  const [categoryId, setCategoryId] = React.useState(OFFENCE_CATEGORIES[0].id);
  const [location, setLocation] = React.useState('');
  const [incidentDate, setIncidentDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = React.useState('');

  // 1. Students / Persons Involved
  const [personsInvolved, setPersonsInvolved] = React.useState<PersonInvolved[]>([
    {
      id: 'p-1',
      name: 'Rahul Verma',
      identifier: 'Student Ref #CS-8902',
      role: 'RESPONDENT',
      department: 'Computer Science & Engineering',
      notes: 'Alleged respondent student',
    },
  ]);

  const [newPersonName, setNewPersonName] = React.useState('');
  const [newPersonRef, setNewPersonRef] = React.useState('');
  const [newPersonRole, setNewPersonRole] = React.useState<PersonInvolved['role']>('RESPONDENT');
  const [newPersonDept, setNewPersonDept] = React.useState('');

  // 2. Witnesses
  const [witnesses, setWitnesses] = React.useState<Witness[]>([
    {
      id: 'w-1',
      name: 'Vikram Joshi',
      designation: 'Senior Lab Teaching Assistant',
      statementSummary: 'Logged parallel workstation logs and AST overlap flag.',
      contactRef: 'v.joshi@institution.edu',
    },
  ]);

  const [newWitnessName, setNewWitnessName] = React.useState('');
  const [newWitnessDesig, setNewWitnessDesig] = React.useState('');
  const [newWitnessStatement, setNewWitnessStatement] = React.useState('');

  // 3. Evidence
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
  const predictedNextId = `EDU-2026-${(getAllCasesForGovernance().length + 43).toString().padStart(5, '0')}`;

  const handleAddPerson = () => {
    if (!newPersonName.trim() || !newPersonRef.trim()) return;
    setPersonsInvolved((prev) => [
      ...prev,
      {
        id: `p-${Date.now()}`,
        name: newPersonName.trim(),
        identifier: newPersonRef.trim().startsWith('Student Ref') ? newPersonRef.trim() : `Student Ref #${newPersonRef.trim()}`,
        role: newPersonRole,
        department: newPersonDept.trim() || department,
      },
    ]);
    setNewPersonName('');
    setNewPersonRef('');
    setNewPersonDept('');
  };

  const handleRemovePerson = (id: string) => {
    setPersonsInvolved((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddWitness = () => {
    if (!newWitnessName.trim()) return;
    setWitnesses((prev) => [
      ...prev,
      {
        id: `w-${Date.now()}`,
        name: newWitnessName.trim(),
        designation: newWitnessDesig.trim() || 'Witness / Faculty Member',
        statementSummary: newWitnessStatement.trim() || 'Witness deposition to be recorded during inquiry.',
      },
    ]);
    setNewWitnessName('');
    setNewWitnessDesig('');
    setNewWitnessStatement('');
  };

  const handleRemoveWitness = (id: string) => {
    setWitnesses((prev) => prev.filter((w) => w.id !== id));
  };

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
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || personsInvolved.length === 0 || !description) {
      alert('Please fill out mandatory fields (Title, at least one Person Involved, and Incident Description).');
      return;
    }

    setIsSubmitting(true);
    try {
      const primaryRespondent = personsInvolved.find((p) => p.role === 'RESPONDENT') || personsInvolved[0];

      const created = await createNewIncident(
        title,
        department,
        primaryRespondent.identifier,
        categoryId,
        description,
        location || 'Campus Premises',
        new Date(incidentDate).toISOString(),
        evidenceList,
        persona,
        personsInvolved,
        witnesses
      );

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
      {/* Page Header with Step Badges */}
      <div>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            EDUguard · Step 1: Incident Registration
          </span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
            Step 2: Policy &amp; Offence Mapping
          </span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-500 font-medium">Reporting Authority: {persona.name}</span>
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap mt-1">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Register Disciplinary Incident</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter incident particulars, map institutional policies, catalog involved persons, and lock evidence.
            </p>
          </div>

          {/* Auto-generated Case ID Banner */}
          <div className="bg-slate-900 text-white px-4 py-2 rounded-xl border border-slate-800 shadow-xs flex items-center gap-2.5">
            <Hash className="w-4 h-4 text-emerald-400" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Auto-Generated Case ID</span>
              <span className="font-mono text-xs font-bold text-emerald-300">{predictedNextId}</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Incident Title, Date, Location & Jurisdiction */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <FilePlus className="w-4 h-4 text-emerald-600" />
            1. Incident Particulars &amp; Location
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Incident Title / Summary of Allegation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Code Structure Duplication in Advanced Algorithms Lab Assessment"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Incident Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                required
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Incident Campus Location <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Turing Computer Lab 3B, Ramanujan Academic Block"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Step 2 — Policy & Offence Mapping (Explicit 5-Point Mapping) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                2. Policy &amp; Offence Mapping Engine
              </h2>
              <p className="text-[11px] text-slate-500">
                The system checks the institution&apos;s policy database and identifies the 5 statutory parameters.
              </p>
            </div>
            <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-bold">
              Automatic Policy Grounding
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Institutional Offence Category <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-medium"
            >
              {OFFENCE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name} ({c.severity} Severity)
                </option>
              ))}
            </select>
          </div>

          {/* Explicit 5-Point Policy & Offence Mapping Card */}
          <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/50 to-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-blue-200/70 pb-2">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Statutory Policy Mapping Identification
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                Severity: {selectedCategory.severity}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">1. Offence Category</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedCategory.name}</p>
                <span className="text-[10px] text-slate-500 font-mono">Code: {selectedCategory.code}</span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">2. Applicable Policy</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedCategory.applicablePolicy}</p>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">3. Relevant Policy Clause</span>
                <p className="font-semibold text-emerald-800 mt-0.5 bg-emerald-50 px-2 py-1 rounded border border-emerald-200/70">
                  {selectedCategory.relevantClause}
                </p>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">4. Required Procedure</span>
                <p className="font-medium text-slate-800 mt-0.5">{selectedCategory.requiredProcedure}</p>
              </div>

              <div className="sm:col-span-2 p-2.5 bg-white rounded-lg border border-slate-200/80 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">5. Competent Disciplinary Authority</span>
                  <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    {selectedCategory.competentAuthority}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-600 border-l border-slate-200 pl-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Response Clock:</span>
                    <strong>{selectedCategory.responseWindowDays} Days</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Quorum:</span>
                    <strong>min {selectedCategory.defaultQuorum} members</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-1">
              <strong className="text-slate-700">Permissible Sanction Range Guide:</strong> {selectedCategory.sanctionRangeGuide}
            </div>
          </div>
        </div>

        {/* Section 3: Add Students / Persons Involved */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                3. Students &amp; Persons Involved ({personsInvolved.length})
              </h2>
              <p className="text-[11px] text-slate-500">
                Catalog respondents, complainants, and involved students with pseudonymized identifiers.
              </p>
            </div>
          </div>

          {/* Current List of Persons */}
          <div className="space-y-2">
            {personsInvolved.map((person) => (
              <div
                key={person.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {person.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{person.name}</span>
                      <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                        {person.identifier}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">Dept: {person.department || department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      person.role === 'RESPONDENT'
                        ? 'bg-red-100 text-red-800'
                        : person.role === 'COMPLAINANT'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {person.role}
                  </span>

                  {personsInvolved.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePerson(person.id)}
                      className="text-slate-400 hover:text-red-600 p-1 transition"
                      title="Remove person"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Person Inline Input */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <span className="text-[11px] font-bold text-slate-700 block">Add Person to Case:</span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Full Name (e.g. Kavita Iyer)"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <input
                type="text"
                placeholder="Identifier / Ref # (e.g. CS-8915)"
                value={newPersonRef}
                onChange={(e) => setNewPersonRef(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <select
                value={newPersonRole}
                onChange={(e) => setNewPersonRole(e.target.value as PersonInvolved['role'])}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="RESPONDENT">Respondent (Accused)</option>
                <option value="COMPLAINANT">Complainant / Reporter</option>
                <option value="INVOLVED">Involved Peer</option>
                <option value="VICTIM">Affected Person</option>
              </select>
              <button
                type="button"
                onClick={handleAddPerson}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add Person
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Add Witnesses */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                4. Witnesses ({witnesses.length})
              </h2>
              <p className="text-[11px] text-slate-500">
                Add observing faculty, lab assistants, or peer witnesses with initial statements.
              </p>
            </div>
          </div>

          {witnesses.length > 0 ? (
            <div className="space-y-2">
              {witnesses.map((w) => (
                <div
                  key={w.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{w.name}</span>
                      <span className="text-[10px] text-slate-500">· {w.designation}</span>
                    </div>
                    {w.statementSummary && (
                      <p className="text-[11px] text-slate-600 mt-1 italic">&ldquo;{w.statementSummary}&rdquo;</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveWitness(w.id)}
                    className="text-slate-400 hover:text-red-600 p-1 transition shrink-0"
                    title="Remove witness"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No witnesses added yet.</p>
          )}

          {/* Add Witness Inline Input */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <span className="text-[11px] font-bold text-slate-700 block">Add Witness:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Witness Full Name (e.g. Dr. K. Rangan)"
                value={newWitnessName}
                onChange={(e) => setNewWitnessName(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <input
                type="text"
                placeholder="Designation / Role (e.g. Lab Proctor / TA)"
                value={newWitnessDesig}
                onChange={(e) => setNewWitnessDesig(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <div className="sm:col-span-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Summary of observed facts or statement preview..."
                  value={newWitnessStatement}
                  onChange={(e) => setNewWitnessStatement(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={handleAddWitness}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow-2xs shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add Witness
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Factual Incident Statement */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            5. Factual Incident Statement
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
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Section 6: Cryptographic Evidence Locker (WORM Storage) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Hash className="w-4 h-4 text-emerald-600" />
                6. Cryptographic Evidence Locker (WORM Storage)
              </h2>
              <p className="text-[11px] text-slate-500">
                All attachments are hashed with SHA-256 upon intake. Immutability guaranteed.
              </p>
            </div>

            <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
              <span>{simulatingFile ? 'Hashing File...' : 'Upload Evidence'}</span>
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
                  <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                    SHA-256: {item.hash.substring(0, 16)}...
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
          <p className="text-[11px] text-slate-500">
            Submitting registers the incident in EDUguard, assigns permanent Case ID <strong>{predictedNextId}</strong>, and initializes the 8 statutory checklist items.
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
