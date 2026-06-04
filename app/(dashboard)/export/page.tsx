"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Download, FileText, Shield, AlertTriangle, BookOpen, ClipboardList } from "lucide-react";

type ExportItem = {
  id: string;
  label: string;
  description: string;
  endpoint: string;
  icon: React.ElementType;
  color: string;
};

const EXPORTS: ExportItem[] = [
  { id: "alerts", label: "Alert Queue Export", description: "All alerts with status, priority, SLA, and assignment", endpoint: "/api/export/alerts", icon: AlertTriangle, color: "text-orange-600 bg-orange-50" },
  { id: "cases", label: "Case List Export", description: "Open and closed cases with linked alerts and SAR status", endpoint: "/api/export/cases", icon: FileText, color: "text-blue-600 bg-blue-50" },
  { id: "sar", label: "SAR Review Register", description: "All SAR recommendations, approvals, and filings", endpoint: "/api/export/sar-reviews", icon: Shield, color: "text-purple-600 bg-purple-50" },
  { id: "audit", label: "Audit Log Export", description: "Complete system audit trail — all actions, actors, timestamps", endpoint: "/api/export/audit-log", icon: BookOpen, color: "text-slate-600 bg-slate-100" },
];

function ExportCard({ item }: { item: ExportItem }) {
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const Icon = item.icon;

  async function handleExport() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const url = `${item.endpoint}${params.toString() ? "?" + params : ""}`;
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = res.headers.get("content-disposition")?.match(/filename="(.+)"/)?.[1] ?? `${item.id}-export.csv`;
      a.click();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start gap-4">
          <div className={`p-2.5 rounded-lg shrink-0 ${item.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900">{item.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
            {(item.id === "alerts" || item.id === "cases") && (
              <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-xs py-1 mt-2 w-40">
                <option value="">All Statuses</option>
                {item.id === "alerts"
                  ? ["Open", "In Review", "Escalated", "Closed", "False Positive"].map(s => <option key={s}>{s}</option>)
                  : ["Open", "In Review", "Pending EDD", "Escalated", "SAR Review", "Closed"].map(s => <option key={s}>{s}</option>)
                }
              </Select>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={loading} className="shrink-0">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            {loading ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ExportPage() {
  const [caseId, setCaseId] = useState("");
  const [exporting, setExporting] = useState(false);

  async function exportCasePackage() {
    if (!caseId.trim()) return;
    setExporting(true);
    try {
      const res = await fetch(`/api/export/cases?id=${encodeURIComponent(caseId.trim())}`);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `case-${caseId.trim()}-export.csv`;
      a.click();
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Export & Examination Package</h1>
        <p className="text-sm text-slate-500 mt-0.5">Download data exports for regulator review, audit, or examination</p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">Standard Exports</h2>
        <div className="space-y-3">
          {EXPORTS.map(item => <ExportCard key={item.id} item={item} />)}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">Case Package Export</h2>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Export Individual Case</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Case ID (e.g. CASE-001)"
                value={caseId}
                onChange={e => setCaseId(e.target.value)}
                className="text-sm"
                onKeyDown={e => e.key === "Enter" && exportCasePackage()}
              />
              <Button variant="primary" onClick={exportCasePackage} disabled={!caseId.trim() || exporting}>
                <Download className="w-3.5 h-3.5 mr-1.5" />
                {exporting ? "Exporting..." : "Export"}
              </Button>
            </div>
            <p className="text-xs text-slate-400 mt-2">Exports case details, linked alerts, notes, and SAR review status as CSV.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-100 bg-blue-50/50">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900">Examination Readiness</p>
              <p className="text-xs text-blue-700 mt-1">
                All exports include a complete audit trail. Records are maintained per BSA/AML retention requirements (5-7 years).
                For full examination packages including SAR narratives and case documentation, use the SAR Review Register export.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
