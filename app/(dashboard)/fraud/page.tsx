"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, PriorityBadge, RiskBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { AlertTriangle, CreditCard, ShieldAlert, CheckCircle, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";

type AlertRow = {
  id: string; customerId: string; customerName: string; type: string; source: string;
  riskScore: number; status: string; priority: string | null; assignedTo: string | null;
  createdDate: string; slaDue: string; description: string; caseId: string | null;
};

type Kpis = { openFraud: number; openChargebacks: number; criticalFraud: number; resolvedTotal: number };

export default function FraudPage() {
  const [tab, setTab] = useState<"fraud" | "chargeback">("fraud");
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [kpis, setKpis] = useState<Kpis>({ openFraud: 0, openChargebacks: 0, criticalFraud: 0, resolvedTotal: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  function load() { setReload(n => n + 1); }

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/fraud?tab=${tab}`)
      .then(r => r.ok ? r.json() : { alerts: [], kpis: {} })
      .then(data => {
        if (cancelled) return;
        setAlerts(data.alerts ?? []);
        if (data.kpis) setKpis(data.kpis);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [tab, reload]);

  const filtered = alerts.filter(a => statusFilter === "all" || a.status === statusFilter);
  const openCount = alerts.filter(a => ["Open", "In Review", "Escalated"].includes(a.status)).length;

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Fraud &amp; Chargeback</h1>
          <p className="text-sm text-slate-500 mt-0.5">Fraud alerts, account takeover indicators, and chargeback disputes</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4" /> Refresh</Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Open Fraud Alerts", value: kpis.openFraud, icon: ShieldAlert, color: "text-red-600", bg: "bg-red-50" },
          { label: "Open Chargebacks", value: kpis.openChargebacks, icon: CreditCard, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Critical Fraud", value: kpis.criticalFraud, icon: AlertTriangle, color: "text-red-700", bg: "bg-red-50" },
          { label: "Resolved (All Time)", value: kpis.resolvedTotal, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tab toggle */}
      <div className="flex items-center gap-2">
        {(["fraud", "chargeback"] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setStatusFilter("all"); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {t === "fraud" ? <ShieldAlert className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
            {t === "fraud" ? "Fraud Alerts" : "Chargebacks"}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
              {t === "fraud" ? kpis.openFraud : kpis.openChargebacks}
            </span>
          </button>
        ))}
        <div className="ml-auto flex gap-1">
          {["all", "Open", "In Review", "Escalated", "Closed"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${statusFilter === s ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {tab === "fraud" ? (
        <Card className="overflow-hidden">
          <CardHeader className="py-3 flex flex-row items-center justify-between">
            <CardTitle>Fraud Alerts ({openCount} open)</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Alert ID", "Customer", "Type", "Risk", "Priority", "Status", "SLA Due", "Linked Case", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading && (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-400">Loading...</td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-400">No fraud alerts.</td></tr>
                )}
                {filtered.map(a => (
                  <>
                    <tr key={a.id} className={`hover:bg-slate-50 cursor-pointer ${expanded === a.id ? "bg-blue-50/30" : ""}`}
                      onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
                      <td className="px-4 py-3">
                        <Link href={`/alerts/${a.id}`} className="font-mono text-xs text-blue-600 font-medium hover:underline" onClick={e => e.stopPropagation()}>{a.id}</Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/customers/${a.customerId}`} className="text-sm text-slate-700 hover:underline" onClick={e => e.stopPropagation()}>{a.customerName}</Link>
                      </td>
                      <td className="px-4 py-3 text-slate-700 text-sm">{a.type}</td>
                      <td className="px-4 py-3"><RiskBadge score={a.riskScore} /></td>
                      <td className="px-4 py-3"><PriorityBadge priority={a.priority ?? "Low"} /></td>
                      <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDate(a.slaDue)}</td>
                      <td className="px-4 py-3">
                        {a.caseId
                          ? <Link href={`/cases/${a.caseId}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1" onClick={e => e.stopPropagation()}>{a.caseId} <ExternalLink className="w-3 h-3" /></Link>
                          : <span className="text-xs text-slate-400">—</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/alerts/${a.id}`}><Button variant="ghost" size="sm" className="p-1.5"><ExternalLink className="w-3.5 h-3.5" /></Button></Link>
                      </td>
                    </tr>
                    {expanded === a.id && (
                      <tr key={`${a.id}-exp`}>
                        <td colSpan={9} className="px-6 py-3 bg-blue-50/30 border-b border-slate-100">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Description</p>
                              <p className="text-sm text-slate-700 leading-relaxed">{a.description}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Investigation Signals</p>
                              <div className="space-y-1">
                                {[
                                  { label: "Device Fingerprint", value: a.type.includes("Ring") ? "Matched known fraud ring" : "Clean" },
                                  { label: "IP Reputation", value: a.type.includes("Login") ? "Flagged — TOR exit node" : "Clean" },
                                  { label: "Velocity Check", value: a.riskScore > 80 ? "High velocity detected" : "Normal" },
                                  { label: "Assigned To", value: a.assignedTo ?? "Unassigned" },
                                ].map(({ label, value }) => (
                                  <div key={label} className="flex justify-between text-xs">
                                    <span className="text-slate-400">{label}</span>
                                    <span className={`font-medium ${value.includes("Flagged") || value.includes("detected") || value.includes("fraud") ? "text-red-600" : "text-slate-700"}`}>{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader className="py-3 flex flex-row items-center justify-between">
            <CardTitle>Chargeback Disputes ({openCount} open)</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Alert ID", "Customer", "Type", "Risk Score", "Priority", "Status", "SLA Due", "Assigned", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading && (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-400">Loading...</td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-400">No chargeback alerts.</td></tr>
                )}
                {filtered.map(a => (
                  <>
                    <tr key={a.id} className={`hover:bg-slate-50 cursor-pointer ${expanded === a.id ? "bg-orange-50/30" : ""}`}
                      onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
                      <td className="px-4 py-3">
                        <Link href={`/alerts/${a.id}`} className="font-mono text-xs text-blue-600 font-medium hover:underline" onClick={e => e.stopPropagation()}>{a.id}</Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/customers/${a.customerId}`} className="text-sm text-slate-700 hover:underline" onClick={e => e.stopPropagation()}>{a.customerName}</Link>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{a.type}</td>
                      <td className="px-4 py-3"><RiskBadge score={a.riskScore} /></td>
                      <td className="px-4 py-3"><PriorityBadge priority={a.priority ?? "Low"} /></td>
                      <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDate(a.slaDue)}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{a.assignedTo ?? <span className="text-slate-400 italic">Unassigned</span>}</td>
                      <td className="px-4 py-3">
                        <Link href={`/alerts/${a.id}`}><Button variant="ghost" size="sm" className="p-1.5"><ExternalLink className="w-3.5 h-3.5" /></Button></Link>
                      </td>
                    </tr>
                    {expanded === a.id && (
                      <tr key={`${a.id}-exp`}>
                        <td colSpan={9} className="px-6 py-3 bg-orange-50/30 border-b border-slate-100">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Description</p>
                              <p className="text-sm text-slate-700 leading-relaxed">{a.description}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Dispute Info</p>
                              <div className="space-y-1">
                                {[
                                  { label: "Dispute Stage", value: a.status === "Escalated" ? "Pre-arbitration" : a.status === "In Review" ? "Under Review" : "Initial Filing" },
                                  { label: "Evidence Deadline", value: formatDate(a.slaDue) },
                                  { label: "Network", value: a.type.includes("Spike") ? "Visa / MC" : "ACH" },
                                ].map(({ label, value }) => (
                                  <div key={label} className="flex justify-between text-xs">
                                    <span className="text-slate-400">{label}</span>
                                    <span className="font-medium text-slate-700">{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
