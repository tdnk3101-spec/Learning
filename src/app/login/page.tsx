'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Scale,
  CheckCircle2,
  UserCheck,
  GraduationCap,
  Briefcase,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Lock,
  Building2,
  Mail,
  User,
  Hash,
} from 'lucide-react';
import { getCurrentPersona, registerNewUser, setCurrentPersona, loginAsPersona, verifyAndAttachStudentCase } from '@/lib/store';
import { UserRole } from '@/types';

export default function LoginPage() {
  const router = useRouter();

  // Tab State: 'signin' | 'signup' | 'sso'
  const [authMode, setAuthMode] = React.useState<'signin' | 'signup' | 'sso'>('signin');

  // Sign In Role Filter: 'FACULTY' | 'STUDENT'
  const [signInRole, setSignInRole] = React.useState<'FACULTY' | 'STUDENT'>('FACULTY');

  // Faculty Sign In State
  const [facultyEmployeeId, setFacultyEmployeeId] = React.useState('EMP-1001');
  const [signInPassword, setSignInPassword] = React.useState('••••••••••••');
  const [showSignInPassword, setShowSignInPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);

  // Student Sign In State
  const [studentAccessMode, setStudentAccessMode] = React.useState<'GENERAL' | 'DEFENSE'>('GENERAL');
  const [studentRoll, setStudentRoll] = React.useState('CS-9104');
  const [caseIdInput, setCaseIdInput] = React.useState('EDU-2026-00042');

  // Sign Up State
  const [signUpRole, setSignUpRole] = React.useState<'STUDENT' | 'FACULTY'>('STUDENT');
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [identifier, setIdentifier] = React.useState(''); // Student Roll No or Faculty Staff ID
  const [department, setDepartment] = React.useState('Computer Science & Engineering');
  const [batch, setBatch] = React.useState('2024 - 2028');
  const [facultyDesignation, setFacultyDesignation] = React.useState<UserRole>('HEAD_OF_DEPARTMENT');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  // Status feedback
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const departmentsList = [
    'Computer Science & Engineering',
    'Electrical Engineering & Ethics Council',
    'Mechanical Engineering',
    'Electronics & Communication',
    'Office of Student Affairs',
    'Biotechnology & Chemical Engineering',
    'Registrar & Legal Compliance',
  ];

  // Quick Demo Login Handler
  const handleDemoSelect = (personaId: string, redirectPath: string) => {
    loginAsPersona(personaId);
    router.push(redirectPath);
  };

  // Sign In Submission
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      if (signInRole === 'FACULTY') {
        const cleanEmpId = facultyEmployeeId.trim();
        const lower = cleanEmpId.toLowerCase();

        if (lower === 'emp-1001' || lower.includes('sharma') || lower.includes('hod')) {
          loginAsPersona('user-hod-cse');
          router.push('/dashboard');
          return;
        }
        if (lower === 'emp-1002' || lower.includes('menon') || lower.includes('chair')) {
          loginAsPersona('user-committee-chair');
          router.push('/dashboard');
          return;
        }
        if (lower === 'emp-1003' || lower.includes('jenkins') || lower.includes('registrar')) {
          loginAsPersona('user-admin-registrar');
          router.push('/dashboard');
          return;
        }
        if (lower === 'emp-1004' || lower.includes('sterling') || lower.includes('dean')) {
          loginAsPersona('user-dean-students');
          router.push('/dashboard');
          return;
        }
        if (lower === 'emp-9000' || lower.includes('audit')) {
          loginAsPersona('user-governance-viewer');
          router.push('/governance');
          return;
        }

        // Search persona by employeeId or email
        const matched = setCurrentPersona(cleanEmpId);
        loginAsPersona(matched.id);
        router.push(matched.role === 'GOVERNANCE_VIEWER' ? '/governance' : '/dashboard');
        return;
      }

      // Student Role Submission
      if (signInRole === 'STUDENT') {
        if (studentAccessMode === 'DEFENSE') {
          if (!caseIdInput.trim()) {
            setErrorMessage('Please provide your official Case ID (e.g. EDU-2026-00042) to unlock your defense section.');
            setIsSubmitting(false);
            return;
          }
          const res = verifyAndAttachStudentCase(caseIdInput.trim());
          if (!res.success) {
            setErrorMessage(res.error || 'Case ID not found in institutional disciplinary registry.');
            setIsSubmitting(false);
            return;
          }
          loginAsPersona('user-student-portal');
          router.push('/student');
          return;
        } else {
          // General student: agent & explainer only
          loginAsPersona('user-student-general');
          router.push('/student');
          return;
        }
      }
    }, 350);
  };


  // Sign Up Submission
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full legal name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid institutional email address.');
      return;
    }
    if (!identifier.trim()) {
      setErrorMessage(
        signUpRole === 'STUDENT'
          ? 'Please provide your Student Roll / Registration Number.'
          : 'Please provide your Faculty / Staff ID.'
      );
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (signUpRole === 'STUDENT') {
        const studentPersona = registerNewUser({
          name: fullName.trim(),
          role: 'STUDENT',
          department,
          designation: `Undergraduate Student (${batch})`,
          email: email.trim(),
          studentRollNo: identifier.trim(),
          studentBatch: batch,
        });

        loginAsPersona(studentPersona.id);
        setSuccessMessage(`Account created for ${studentPersona.name}! Redirecting to Student Due-Process Desk...`);

        setTimeout(() => {
          router.push('/student');
        }, 800);
      } else {
        const roleTitles: Record<UserRole, string> = {
          HEAD_OF_DEPARTMENT: 'Professor & Head of Department',
          COMMITTEE_MEMBER: 'Disciplinary Committee Member',
          DEAN_STUDENT_AFFAIRS: 'Dean of Student Affairs',
          FACULTY: 'Faculty Proctor & Ethics Representative',
          ADMIN_REGISTRAR: 'Compliance Officer & Registrar',
          GOVERNANCE_VIEWER: 'Senate Oversight Auditor',
          STUDENT: 'Student Respondent',
        };

        const staffPersona = registerNewUser({
          name: fullName.trim(),
          role: facultyDesignation,
          department,
          designation: roleTitles[facultyDesignation] || 'Faculty Member',
          email: email.trim(),
        });

        loginAsPersona(staffPersona.id);
        setSuccessMessage(`Faculty account registered for ${staffPersona.name}! Redirecting to Staff Dashboard...`);

        setTimeout(() => {
          router.push('/dashboard');
        }, 800);
      }

    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
        {/* Left Column (Brand Hero & Safeguard Benefits) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0B1E33] via-[#0E2744] to-[#0A182A] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl" />

          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-900/40">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold tracking-tight text-base block">EDUguard Sentinel</span>
                <span className="text-[10px] text-emerald-400 font-mono">Institutional Due Process</span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Empowering fairness across campus.
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect students, faculty proctors, and committee chairs to a transparent, policy-grounded due-process workflow.
              </p>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>Full access to official charges and statutory response clocks</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>Cryptographic SHA-256 evidence sealing &amp; audit logging</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>Transparent precedent archive for fair, uniform outcomes</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>Strict statutory reservation: Guilt decided only by humans</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 relative z-10 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Disciplinary Registry v2.4</span>
            <span className="font-mono text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>FERPA &amp; Senate Guarded</span>
            </span>
          </div>
        </div>

        {/* Right Column (Sign In & Sign Up Forms) */}
        <div className="lg:col-span-7 p-7 sm:p-10 flex flex-col justify-between bg-white overflow-y-auto max-h-[750px]">
          <div>
            {/* Top Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    authMode === 'signin'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    authMode === 'signup'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Create Account (Sign Up)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('sso');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    authMode === 'sso'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  SSO Auth
                </button>
              </div>

              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline-block">
                EDUguard Secure Auth
              </span>
            </div>

            {/* Error / Success Notifications */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* TAB 1: SIGN IN FORM */}
            {authMode === 'signin' && (
              <div className="space-y-4">
                <div className="space-y-1 mb-2">
                  <h3 className="text-xl font-bold text-slate-900">Sign In to EDUguard</h3>
                  <p className="text-xs text-slate-500">
                    Select your institutional role to authenticate with your Employee ID or Student Credentials.
                  </p>
                </div>

                {/* Role Switcher */}
                <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setSignInRole('FACULTY');
                      setErrorMessage(null);
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      signInRole === 'FACULTY'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    <span>Faculty / Staff (Employee ID)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSignInRole('STUDENT');
                      setErrorMessage(null);
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      signInRole === 'STUDENT'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Student Portal</span>
                  </button>
                </div>

                {/* 1. FACULTY / EMPLOYEE ID SIGN IN FORM */}
                {signInRole === 'FACULTY' && (
                  <form onSubmit={handleSignInSubmit} className="space-y-3.5 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Official Employee ID / Email</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">e.g. EMP-1001</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={facultyEmployeeId}
                        onChange={(e) => setFacultyEmployeeId(e.target.value)}
                        placeholder="Enter Employee ID (e.g. EMP-1001) or Email"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono font-medium"
                      />

                      {/* Quick Select Employee ID Chips */}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[10px]">
                        <span className="text-slate-400">Quick Fill:</span>
                        <button
                          type="button"
                          onClick={() => setFacultyEmployeeId('EMP-1001')}
                          className="px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-mono border border-blue-200 transition"
                        >
                          EMP-1001 (HoD)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFacultyEmployeeId('EMP-1002')}
                          className="px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-mono border border-amber-200 transition"
                        >
                          EMP-1002 (Chair)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFacultyEmployeeId('EMP-1003')}
                          className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-mono border border-emerald-200 transition"
                        >
                          EMP-1003 (Registrar)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFacultyEmployeeId('EMP-1004')}
                          className="px-2 py-0.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-mono border border-purple-200 transition"
                        >
                          EMP-1004 (Dean)
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Institutional Password</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowSignInPassword(!showSignInPassword)}
                          className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                        >
                          {showSignInPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showSignInPassword ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                      <input
                        type={showSignInPassword ? 'text' : 'password'}
                        required
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>Keep faculty session active</span>
                      </label>
                      <a href="#" className="text-blue-700 font-semibold hover:underline text-[11px]">
                        Forgot Employee Credentials?
                      </a>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                    >
                      <span>{isSubmitting ? 'Verifying Employee ID...' : 'Sign In with Employee ID'}</span>
                      <ArrowRight className="w-4 h-4 text-emerald-400" />
                    </button>
                  </form>
                )}

                {/* 2. STUDENT SIGN IN FORM (GENERAL vs AFFECTED CANDIDATE WITH CASE ID) */}
                {signInRole === 'STUDENT' && (
                  <form onSubmit={handleSignInSubmit} className="space-y-3.5 pt-1">
                    {/* Student Access Mode Switcher */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setStudentAccessMode('GENERAL');
                          setStudentRoll('CS-9104');
                          setErrorMessage(null);
                        }}
                        className={`p-2 rounded-lg text-left transition ${
                          studentAccessMode === 'GENERAL'
                            ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <span className="block text-[11px] font-bold">General Student</span>
                        <span className="text-[10px] text-slate-400 block">Agent &amp; Due Process Guide</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setStudentAccessMode('DEFENSE');
                          setStudentRoll('CS-8902');
                          setCaseIdInput('EDU-2026-00042');
                          setErrorMessage(null);
                        }}
                        className={`p-2 rounded-lg text-left transition ${
                          studentAccessMode === 'DEFENSE'
                            ? 'bg-white text-emerald-900 shadow-xs border border-emerald-300 font-bold'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <span className="block text-[11px] font-bold text-emerald-700">Affected / Case Defense</span>
                        <span className="text-[10px] text-slate-400 block">Requires Notice Case ID</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Student Roll / Registration Number</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={studentRoll}
                        onChange={(e) => setStudentRoll(e.target.value)}
                        placeholder="e.g. CS-9104 or CS-8902"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                      />
                    </div>

                    {/* Case ID input — strictly required for affected candidate */}
                    {studentAccessMode === 'DEFENSE' ? (
                      <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-300/80 space-y-2">
                        <label className="block text-xs font-bold text-emerald-900 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Hash className="w-3.5 h-3.5 text-emerald-700" />
                            <span>System-Generated Case ID / Docket Reference</span>
                          </span>
                          <span className="text-[10px] text-emerald-700 font-mono font-normal">From official notice</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={caseIdInput}
                          onChange={(e) => setCaseIdInput(e.target.value)}
                          placeholder="e.g. EDU-2026-00042"
                          className="w-full px-3.5 py-2 text-xs bg-white border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 font-mono font-bold text-slate-900"
                        />
                        <p className="text-[11px] text-emerald-800 leading-relaxed">
                          🔒 Validating this Case ID unlocks your confidential evidence dossier, written defense submission desk, and summons schedule.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                        <p className="font-semibold text-slate-900">Campus Member Preview Mode:</p>
                        <p className="text-[11px] text-slate-500">
                          As an uninvolved student, you can interact with the EDUguard AI agent and review how university policies safeguard due process without being subjected to disciplinary inquiries.
                        </p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                    >
                      <span>
                        {isSubmitting
                          ? 'Authenticating...'
                          : studentAccessMode === 'DEFENSE'
                          ? 'Unlock Case Defense Desk'
                          : 'Enter Student Information Desk'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB 2: CREATE ACCOUNT (SIGN UP) FORM */}
            {authMode === 'signup' && (
              <div className="space-y-4">
                <div className="space-y-1 mb-3">
                  <h3 className="text-xl font-bold text-slate-900">Create New Account</h3>
                  <p className="text-xs text-slate-500">
                    Register a new institutional profile for student due process or faculty operations.
                  </p>
                </div>

                {/* Role Switcher: Student vs Faculty */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSignUpRole('STUDENT')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                      signUpRole === 'STUDENT'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    <span>Student Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignUpRole('FACULTY')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                      signUpRole === 'FACULTY'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <span>Faculty / Staff</span>
                  </button>
                </div>

                <form onSubmit={handleSignUpSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>Full Name</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Rahul Verma"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>Institutional Email</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. r.verma@institution.edu"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                        <Hash className="w-3 h-3 text-slate-400" />
                        <span>{signUpRole === 'STUDENT' ? 'Student Roll / Reg No' : 'Staff / Faculty ID'}</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={signUpRole === 'STUDENT' ? 'e.g. CS-8902' : 'e.g. FAC-4102'}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>Department</span>
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                      >
                        {departmentsList.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {signUpRole === 'STUDENT' ? (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Academic Batch / Year
                      </label>
                      <input
                        type="text"
                        value={batch}
                        onChange={(e) => setBatch(e.target.value)}
                        placeholder="e.g. 2024 - 2028"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Disciplinary Role / Designation
                      </label>
                      <select
                        value={facultyDesignation}
                        onChange={(e) => setFacultyDesignation(e.target.value as UserRole)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                      >
                        <option value="HEAD_OF_DEPARTMENT">Head of Department (HoD)</option>
                        <option value="COMMITTEE_MEMBER">Disciplinary Committee Member / Chair</option>
                        <option value="DEAN_STUDENT_AFFAIRS">Dean of Student Affairs</option>
                        <option value="FACULTY">Faculty Proctor / Examiner</option>
                        <option value="ADMIN_REGISTRAR">Chief Compliance Officer &amp; Registrar</option>
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Password
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold text-slate-700">
                          Confirm Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[10px] text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-2"
                  >
                    <span>{isSubmitting ? 'Creating Profile...' : 'Complete Registration & Access Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 3: SSO AUTH */}
            {authMode === 'sso' && (
              <div className="space-y-4">
                <div className="space-y-1 mb-4">
                  <h3 className="text-xl font-bold text-slate-900">Institutional Single Sign-On</h3>
                  <p className="text-xs text-slate-500">
                    Authenticate via your university identity provider (SAML 2.0 / Shibboleth).
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => handleDemoSelect('user-student-portal', '/student')}
                    className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                        EDU
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Campus Student SSO</div>
                        <div className="text-[11px] text-slate-500">Instant login as student respondent</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-700 transition" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoSelect('user-hod-cse', '/dashboard')}
                    className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                        STAFF
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Faculty &amp; Officer SSO</div>
                        <div className="text-[11px] text-slate-500">Instant login as Head of Department</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-700 transition" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Demo Quick-Switch Switcher (Always accessible at bottom for paired pair-programming / evaluation) */}
          <div className="mt-8 pt-5 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant 1-Click Persona Login (Testing Presets):</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">No password required</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSelect('user-student-general', '/student')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 text-xs font-semibold transition text-left"
              >
                <span className="block text-[9px] text-teal-600 uppercase font-bold">General Student</span>
                <span className="truncate block font-medium">Ananya (CS-9104)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('user-student-portal', '/student')}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100 hover:border-emerald-300 border border-emerald-200 text-emerald-950 text-xs font-semibold transition text-left"
              >
                <span className="block text-[9px] text-emerald-700 uppercase font-bold">Affected (Defense)</span>
                <span className="truncate block font-medium">Rahul (EDU-2026-00042)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('user-hod-cse', '/dashboard')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-slate-700 text-xs font-semibold transition text-left"
              >
                <span className="block text-[9px] text-blue-600 uppercase font-bold">HoD (EMP-1001)</span>
                <span className="truncate block font-medium">Dr. Meera Sharma</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('user-committee-chair', '/dashboard')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 text-slate-700 text-xs font-semibold transition text-left"
              >
                <span className="block text-[9px] text-amber-600 uppercase font-bold">Chair (EMP-1002)</span>
                <span className="truncate block font-medium">Dr. Rajiv Menon</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('user-admin-registrar', '/dashboard')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 text-xs font-semibold transition text-left"
              >
                <span className="block text-[9px] text-emerald-600 uppercase font-bold">Registrar (EMP-1003)</span>
                <span className="truncate block font-medium">Sarah Jenkins, Esq.</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('user-dean-students', '/dashboard')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-300 border border-slate-200 text-slate-700 text-xs font-semibold transition text-left"
              >
                <span className="block text-[9px] text-purple-600 uppercase font-bold">Dean (EMP-1004)</span>
                <span className="truncate block font-medium">Prof. Arthur Sterling</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
