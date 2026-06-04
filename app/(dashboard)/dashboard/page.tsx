"use client";
import { useStore, computeKPIs } from "@/lib/store";
import { KPI_DATA } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, PriorityBadge } from "@/components/ui/badge";
import { formatDate, isOverdue } from "@/lib/utils";
import {
  Bell, Briefcase, Clock, UserCheck, ShieldAlert, FileText, Timer, TrendingUp, AlertTriangle, ArrowRight
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import Link from "next/link";

const COLORS = ["#3b82f6", "#f97316", "#eab308", "#22c55e", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function DashboardPage() {
  const { state } = useStore();
  const kpis = computeKPIs(state);

  const kpiCards = [
    { label: "Open Alerts", value: kpis.openAlerts, icon: Bell, color: "text-blue-600", bg: "bg-blue-50", href: "/alerts" },
    { label: "Open Cases", value: kpis.openCases, icon: Briefcase, color: "text-purple-600", bg: "bg-purple-50", href: "/cases" },
    { label: "Past Due SLAs", value: kpis.pastDueSLAs, icon: Clock, color: "text-red-600", bg: "bg-red-50", href: "/alerts" },
    { label: "KYC Manual Reviews", value: kpis.kycManualReviews, icon: UserCheck, color: "text-amber-600", bg: "bg-amber-50", href: "/alerts" },
    { label: "Screening Hits", value: KPI_DATA.screeningHits, icon: ShieldAlert, color: "text-orange-600", bg: "bg-orange-50", href: "/customers" },
    { label: "SAR Reviews Due", value: kpis.sarReviewsDue, icon: FileText, color: "text-rose-600", bg: "bg-rose-50", href: "/sar-reviews" },
    { label: "Avg Case Age", value: `${kpis.avgCaseAgeDays}d`, icon: Timer, color: "text-teal-600", bg: "bg-teal-50", href: "/kpi-reports" },
    { label: "False Positive Rate", value: `${kpis.fpRate}%`, icon: TrendingUp, color: "text-slate-600", bg: "bg-slate-100", href: "/kpi-reports" },
  ];

  const recentAlerts = state.alerts
    .filter(a => a.status === "Open" || a.status === "In Review")
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 5);

  const criticalCases = state.cases
    .filter(c => c.priority === "Critical" && c.status !== "Closed")
    .slice(0, 5);

  // Live charts — rebuild from state
  const alertsBySource = [
    "Transaction Monitoring", "KYC", "Sanctions Screening", "PEP Screening",
    "Adverse Media", "Fraud", "Chargeback", "Manual Review",
  ].map(src => ({
    name: src.replace(" Screening", "").replace(" Monitoring", " Mon."),
    value: state.alerts.filter(a => a.source === src && (a.status === "Open" || a.status === "In Review")).length,
  })).filter(d => d.value > 0);

  const casesByStatus = ["Open", "In Review", "Pending EDD", "Escalated", "SAR Review", "Closed"].map(s => ({
    name: s,
    value: state.cases.filter(c => c.status === s).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Executive Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Compliance operations overview · As of June 4, 2026</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Link key={kpi.label} href={kpi.href}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">{kpi.label}</p>
                    <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${kpi.bg}`}>
                    <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Open Alerts by Source</CardTitle></CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={alertsBySource} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Alerts by Priority</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center pt-2">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={KPI_DATA.alertsByPriority}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={80}
                  dataKey="value" nameKey="name"
                >
                  {KPI_DATA.alertsByPriority.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Legend iconSize={10} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts + Critical Cases */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Open Alerts</CardTitle>
            <Link href="/alerts" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {recentAlerts.length === 0 && (
                <p className="px-6 py-4 text-sm text-slate-400">No open alerts.</p>
              )}
              {recentAlerts.map(alert => (
                <Link key={alert.id} href={`/alerts/${alert.id}`} className="flex items-start gap-3 px-6 py-3 hover:bg-slate-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">{alert.id}</span>
                      <PriorityBadge priority={alert.priority ?? "Low"} />
                      {isOverdue(alert.slaDue) && (
                        <span className="flex items-center gap-0.5 text-[10px] text-red-600 font-medium">
                          <AlertTriangle className="w-2.5 h-2.5" /> SLA
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-900 mt-0.5 truncate">{alert.type}</p>
                    <p className="text-xs text-slate-500">{alert.customerName} · {alert.source}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge status={alert.status} />
                    <p className="text-[10px] text-slate-400 mt-1">{formatDate(alert.createdDate)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Critical Active Cases</CardTitle>
            <Link href="/cases" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {criticalCases.length === 0 && (
                <p className="px-6 py-4 text-sm text-slate-400">No critical active cases.</p>
              )}
              {criticalCases.map(c => (
                <Link key={c.id} href={`/cases/${c.id}`} className="flex items-start gap-3 px-6 py-3 hover:bg-slate-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">{c.id}</span>
                      <PriorityBadge priority={c.priority} />
                    </div>
                    <p className="text-sm font-medium text-slate-900 mt-0.5 truncate">{c.customerName}</p>
                    <p className="text-xs text-slate-500">{c.alertIds.length} alerts · {c.assignedTo}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge status={c.status} />
                    <p className="text-[10px] text-slate-400 mt-1">{formatDate(c.updatedDate)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cases by Status */}
      <Card>
        <CardHeader><CardTitle>Cases by Status (Live)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={casesByStatus} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {casesByStatus.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
