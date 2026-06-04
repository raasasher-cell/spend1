"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { CheckCircle, Clock, RefreshCw, Search, AlertTriangle, UserCheck } from "lucide-react";
import Link from "next/link";

type KycCustomer = {
  id: string; name: string; type: string; status: string;
  riskRating: string; kycStatus: string; screeningStatus: string;
  dateOnboarded: string; country: string;
  kycVerifiedAt: string | null; kycExpiresAt: string | null;
  kycVendorRef: string | null; kycDocScore: number | null; kycFaceScore: number | null; kycDecision: string | null;
  _count: { alerts: number };
};

type VerifyResult = {
  requestId: string; overallDecision: string; processingTimeMs: number;
  checks: {
    documentVerification: { result: string; confidence: number; documentType: string };
    faceMatch: { result: string; confidence: number; livenessDetected: boolean };
    addressVerification: { result: string; confidence: string };
    watchlistCheck: { result: string; listsChecked: string[] };
  };
};

type RunningMap = Record<string, boolean>;
type ResultMap = Record<string, VerifyResult>;

const PAGE_LOAD_TIME = Date.now();

export default function KycQueuePage() {
  const [customers, setCustomers] = useState<KycCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [running, setRunning] = useState<RunningMap>({});
  const [results, setResults] = useState<ResultMap>({});
  const [reload, setReload] = useState(0);

  function load() { setReload(n => n + 1); }

  useEffect(() => {
    let cancelled = false;
    const qs = filter !== "all" ? `?status=${encodeURIComponent(filter)}` : "";
    fetch(`/api/kyc-queue${qs}`)
      .then(r => r.ok ? r.json() : { customers: [] })
      .then(data => {
        if (cancelled) return;
        setCustomers(data.customers ?? []);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [filter, reload]);

  async function runVerification(c: KycCustomer) {
    setRunning(r => ({ ...r, [c.id]: true }));
    try {
      const res = await fetch("/api/vendor/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: c.name, entityId: c.id, kycStatus: c.kycStatus }),
      });
      if (res.ok) {
        const data: VerifyResult = await res.json();
        setResults(r => ({ ...r, [c.id]: data }));
        load();
      }
    } finally {
      setRunning(r => ({ ...r, [c.id]: false }));
    }
  }

  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase())
  );

  const pending = customers.filter(c => c.kycStatus === "Pending").length;
  const manual = customers.filter(c => c.kycStatus === "Manual Review").length;
  const expiringSoon = customers.filter(c => {
    if (!c.kycExpiresAt) return false;
    const days = (new Date(c.kycExpiresAt).getTime() - PAGE_LOAD_TIME) / 86400000;
    return days > 0 && days < 30;
  }).length;

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">KYC Review Queue</h1>
          <p className="text-sm text-slate-500 mt-0.5">Pending identity verifications and manual reviews</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4" /> Refresh</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending Verification", value: pending, icon: Clock, color: "text-amber-600" },
          { label: "Manual Review", value: manual, icon: AlertTriangle, color: "text-orange-600" },
          { label: "Expiring in 30 days", value: expiringSoon, icon: AlertTriangle, color: "text-red-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="py-4 flex items-center gap-4">
              <Icon className={`w-8 h-8 ${color}`} />
              <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search customers..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-1">
              {["all", "Pending", "Manual Review", "Rejected"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === f ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {f === "all" ? "All" : f}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Customer", "Type", "Risk", "KYC Status", "KYC Alerts", "Last Verified", "Expires", "Decision", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-400">Loading...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-400">No customers matching current filter.</td></tr>
              )}
              {filtered.map(c => {
                const res = results[c.id];
                return (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/customers/${c.id}`} className="font-medium text-blue-600 hover:underline">{c.name}</Link>
                      <p className="text-xs text-slate-400">{c.id}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{c.type}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.riskRating} /></td>
                    <td className="px-4 py-3"><StatusBadge status={c.kycStatus} /></td>
                    <td className="px-4 py-3">
                      {c._count.alerts > 0
                        ? <span className="text-xs font-semibold text-orange-600">{c._count.alerts} KYC alert{c._count.alerts > 1 ? "s" : ""}</span>
                        : <span className="text-xs text-slate-400">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{c.kycVerifiedAt ? formatDate(c.kycVerifiedAt) : "Never"}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{c.kycExpiresAt ? formatDate(c.kycExpiresAt) : "—"}</td>
                    <td className="px-4 py-3">
                      {res ? (
                        <span className={`text-xs font-semibold ${res.overallDecision === "ACCEPT" ? "text-green-600" : res.overallDecision === "REJECT" ? "text-red-600" : "text-amber-600"}`}>
                          {res.overallDecision}
                        </span>
                      ) : c.kycDecision ? (
                        <span className={`text-xs font-semibold ${c.kycDecision === "ACCEPT" ? "text-green-600" : c.kycDecision === "REJECT" ? "text-red-600" : "text-amber-600"}`}>
                          {c.kycDecision}
                        </span>
                      ) : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline" size="sm"
                        onClick={() => runVerification(c)}
                        disabled={running[c.id]}
                        className="whitespace-nowrap text-xs"
                      >
                        {running[c.id] ? (
                          <><RefreshCw className="w-3 h-3 animate-spin" /> Verifying...</>
                        ) : res ? (
                          <><CheckCircle className="w-3 h-3 text-green-500" /> Re-verify</>
                        ) : (
                          <><UserCheck className="w-3 h-3" /> Run Verification</>
                        )}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Inline results for last-run verification */}
        {Object.entries(results).map(([custId, res]) => {
          const c = customers.find(x => x.id === custId);
          if (!c) return null;
          return (
            <div key={custId} className="mx-4 mb-4 p-4 rounded-lg border border-blue-100 bg-blue-50/50">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-blue-800">{c.name} — Verification Result ({res.requestId})</p>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${res.overallDecision === "ACCEPT" ? "bg-green-100 text-green-700" : res.overallDecision === "REJECT" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                  {res.overallDecision}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center p-2 bg-white rounded border border-blue-100">
                  <p className="text-xs text-slate-400">Document</p>
                  <p className={`text-sm font-bold mt-0.5 ${res.checks.documentVerification.result === "PASSED" ? "text-green-600" : "text-red-600"}`}>{res.checks.documentVerification.result}</p>
                  <p className="text-xs text-slate-500">Score: {res.checks.documentVerification.confidence}</p>
                </div>
                <div className="text-center p-2 bg-white rounded border border-blue-100">
                  <p className="text-xs text-slate-400">Face Match</p>
                  <p className={`text-sm font-bold mt-0.5 ${res.checks.faceMatch.result === "PASSED" ? "text-green-600" : "text-red-600"}`}>{res.checks.faceMatch.result}</p>
                  <p className="text-xs text-slate-500">Score: {res.checks.faceMatch.confidence}</p>
                </div>
                <div className="text-center p-2 bg-white rounded border border-blue-100">
                  <p className="text-xs text-slate-400">Address</p>
                  <p className={`text-sm font-bold mt-0.5 ${res.checks.addressVerification.result === "PASSED" ? "text-green-600" : "text-amber-600"}`}>{res.checks.addressVerification.result}</p>
                  <p className="text-xs text-slate-500">Conf: {res.checks.addressVerification.confidence}</p>
                </div>
                <div className="text-center p-2 bg-white rounded border border-blue-100">
                  <p className="text-xs text-slate-400">Watchlist</p>
                  <p className="text-sm font-bold mt-0.5 text-green-600">{res.checks.watchlistCheck.result}</p>
                  <p className="text-xs text-slate-500">{res.checks.watchlistCheck.listsChecked.length} lists</p>
                </div>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
