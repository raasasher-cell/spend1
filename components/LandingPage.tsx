"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck, Bell, Briefcase, UserCheck, FileText,
  ShieldAlert, History, ArrowRight, Lock, ChevronRight,
} from "lucide-react";

const ROLES = [
  {
    name: "Sarah Chen",
    email: "s.chen@riskops.io",
    role: "BSA Officer",
    icon: "🏛",
    description: "Full compliance authority — SAR approvals, all workflow access, executive reporting",
    accent: "border-blue-500 bg-blue-500/10 shadow-[0_0_12px_rgba(59,130,246,0.15)]",
    label: "text-blue-300",
  },
  {
    name: "Priya Patel",
    email: "p.patel@riskops.io",
    role: "Sr. Investigator",
    icon: "🔍",
    description: "Case management, EDD requests, SAR recommendations, complex investigations",
    accent: "border-purple-500 bg-purple-500/10 shadow-[0_0_12px_rgba(168,85,247,0.15)]",
    label: "text-purple-300",
  },
  {
    name: "Marcus Johnson",
    email: "m.johnson@riskops.io",
    role: "Compliance Mgr",
    icon: "📊",
    description: "Team oversight, KPI dashboard, data exports, compliance reporting",
    accent: "border-emerald-500 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.15)]",
    label: "text-emerald-300",
  },
  {
    name: "Devon Williams",
    email: "d.williams@riskops.io",
    role: "Analyst",
    icon: "🔔",
    description: "Alert triage, KYC queue, case creation, transaction review",
    accent: "border-amber-500 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.15)]",
    label: "text-amber-300",
  },
];

const FEATURES = [
  {
    Icon: Bell,
    title: "Alert Management",
    description: "Triage, assign, and escalate AML/fraud alerts with SLA tracking",
    stat: "31 active alerts",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    Icon: Briefcase,
    title: "Case Management",
    description: "Full investigation lifecycle — from first alert to SAR filing",
    stat: "7 open cases",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    Icon: UserCheck,
    title: "KYC Verification",
    description: "Mock Jumio integration — score, verify, and approve customer identities",
    stat: "Mock vendor API",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    Icon: FileText,
    title: "SAR Filing",
    description: "Multi-stage workflow: recommend → BSA review → approve → file with FinCEN",
    stat: "10 SAR reviews",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    Icon: ShieldAlert,
    title: "Fraud & Screening",
    description: "Chargeback tracking, risk scoring, and mock sanctions/PEP screening",
    stat: "LexisNexis mock",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
  {
    Icon: History,
    title: "Audit Trail",
    description: "Immutable compliance log — every action recorded and exportable to CSV",
    stat: "All actions logged",
    color: "text-slate-400",
    bg: "bg-slate-500/10 border-slate-500/20",
  },
];

const STATS = [
  { value: "31", label: "Active Alerts", sub: "25 AML · 6 Fraud" },
  { value: "7",  label: "Open Cases",    sub: "4 high priority"  },
  { value: "10", label: "SAR Reviews",   sub: "Under review"     },
  { value: "25", label: "Customers",     sub: "Monitored"        },
];

export function LandingPage({ isDemoMode }: { isDemoMode: boolean }) {
  const [selected, setSelected] = useState(0);
  const role = ROLES[selected];

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14 bg-slate-950/90 backdrop-blur border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 bg-blue-600 rounded-lg shrink-0">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold">RiskOps OS</span>
          {isDemoMode && (
            <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
              Demo
            </span>
          )}
        </div>
        <Link
          href="/login"
          className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          Sign in <ChevronRight className="w-3 h-3" />
        </Link>
      </nav>

      {/* Hero */}
      <section className="pt-14 min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right,#1e293b 1px,transparent 1px),linear-gradient(to bottom,#1e293b 1px,transparent 1px)",
            backgroundSize: "4rem 4rem",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,235,0.12), transparent)",
          }}
        />

        <div className="relative z-10 w-full max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
            AML · BSA · FinCrime Compliance Operations
          </div>

          <h1 className="text-5xl font-extrabold leading-tight mb-4">
            Compliance Operations<br />
            <span className="text-blue-400">For Financial Crime Teams</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            End-to-end demo platform — alert triage, case management, KYC
            verification, SAR filing, and audit reporting in one connected workflow.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            {STATS.map(s => (
              <div
                key={s.label}
                className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 text-left"
              >
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs font-semibold text-slate-300 mt-0.5">{s.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Role selector */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-left">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-4 text-center">
              Choose a role to explore
            </p>

            <div className="grid grid-cols-4 gap-2 mb-5">
              {ROLES.map((r, i) => (
                <button
                  key={r.email}
                  onClick={() => setSelected(i)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl p-3 border text-center transition-all ${
                    selected === i
                      ? r.accent
                      : "border-slate-700 bg-slate-800/60 hover:border-slate-600 hover:bg-slate-800"
                  }`}
                >
                  <span className="text-xl leading-none">{r.icon}</span>
                  <span
                    className={`text-[11px] font-semibold leading-tight ${
                      selected === i ? r.label : "text-slate-400"
                    }`}
                  >
                    {r.role}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="text-sm font-semibold text-white">{role.name}</div>
                <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  {role.description}
                </div>
              </div>
            </div>

            <Link
              href={`/login?email=${encodeURIComponent(role.email)}`}
              className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Continue as {role.role}
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>

            <p className="text-[11px] text-slate-600 mt-2 text-center">
              Password pre-filled · every action is written to the audit log
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-slate-800">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">
              Full compliance workflow in one platform
            </h2>
            <p className="text-slate-400 text-sm">
              Every module connected — from first alert to filed SAR
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <div
                key={f.title}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-600 transition-colors"
              >
                <div
                  className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border ${f.bg} mb-4`}
                >
                  <f.Icon className={`w-4 h-4 ${f.color}`} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{f.description}</p>
                <span className={`text-[11px] font-semibold ${f.color}`}>{f.stat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 px-6">
        <div className="flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5 text-slate-700" />
          <span className="text-xs text-slate-600">
            {isDemoMode
              ? "Demo environment — mock data only, not for production use"
              : "RiskOps OS · Session-based auth · All activity audited"}
          </span>
        </div>
      </footer>
    </div>
  );
}
