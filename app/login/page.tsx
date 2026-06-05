"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";

const DEMO_USERS = [
  { name: "Sarah Chen",    email: "s.chen@riskops.io",    role: "BSA Officer"       },
  { name: "Priya Patel",   email: "p.patel@riskops.io",   role: "Sr. Investigator"  },
  { name: "Marcus Johnson",email: "m.johnson@riskops.io", role: "Compliance Mgr"    },
  { name: "Devon Williams",email: "d.williams@riskops.io",role: "Analyst"           },
  { name: "Admin User",    email: "admin@riskops.io",     role: "Admin"             },
];

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") ?? "/dashboard";
  const [email, setEmail] = useState(params.get("email") ?? "s.chen@riskops.io");
  const [password, setPassword] = useState("riskops2026");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push(from);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-900/50">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">RiskOps OS</h1>
          <p className="text-slate-400 text-sm mt-1">Compliance Operations Platform</p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Sign in to your account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@company.com" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-9 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">{error}</p>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Demo Accounts — password: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">riskops2026</code></p>
            <div className="space-y-1">
              {DEMO_USERS.map(u => (
                <button key={u.email} onClick={() => setEmail(u.email)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 text-left transition-colors group">
                  <span className="text-xs font-medium text-slate-700 group-hover:text-blue-600">{u.name}</span>
                  <span className="text-[10px] text-slate-400">{u.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          Protected by RiskOps OS · All activity is audited
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
