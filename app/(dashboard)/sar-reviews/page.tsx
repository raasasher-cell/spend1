"use client";
import { useState, useMemo } from "react";
import { SAR_REVIEWS } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { AlertTriangle, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function SARReviewsPage() {
  const [filterStatus, setFilterStatus] = useState("");

  const filtered = useMemo(() => SAR_REVIEWS.filter(s => !filterStatus || s.status === filterStatus), [filterStatus]);

  const dueCount = SAR_REVIEWS.filter(s => ["Pending Review", "SAR Recommended", "SAR Approved"].includes(s.status)).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">SAR Review Tracker</h1>
          <p className="text-sm text-slate-500 mt-0.5">{dueCount} reviews pending · {filtered.length} total</p>
        </div>
      </div>

      {dueCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-amber-800 font-medium">{dueCount} SAR reviews require action. FinCEN filing deadline: 30 days from detection date.</span>
        </div>
      )}

      <Card>
        <div className="px-4 py-3 flex gap-3">
          <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-xs py-1.5">
            <option value="">All Statuses</option>
            {["Pending Review", "SAR Recommended", "SAR Approved", "SAR Declined", "Filed", "Continuing Review"].map(s => <option key={s}>{s}</option>)}
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["SAR ID", "Case ID", "Customer", "Detection Date", "SAR Deadline", "Status", "Amount", "Recommended By", "Final Decision", "Filing Status", "Cont. SAR Due", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(sar => {
                const deadlineDate = new Date(sar.sarDeadline);
                const now = new Date("2026-06-04");
                const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysLeft <= 7 && !["Filed", "SAR Declined"].includes(sar.status);
                return (
                  <tr key={sar.id} className={`hover:bg-slate-50 transition-colors ${isUrgent ? "bg-red-50/30" : ""}`}>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{sar.id}</td>
                    <td className="px-4 py-3">
                      <Link href={`/cases/${sar.caseId}`} className="font-mono text-xs text-blue-600 hover:underline font-medium">{sar.caseId}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/customers/${sar.customerId}`} className="text-sm font-medium text-slate-900 hover:text-blue-600 whitespace-nowrap">{sar.customerName}</Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(sar.detectionDate)}</td>
                    <td className="px-4 py-3">
                      <div className={`text-xs font-semibold whitespace-nowrap flex items-center gap-1 ${isUrgent ? "text-red-600" : "text-slate-600"}`}>
                        {isUrgent && <AlertTriangle className="w-3 h-3" />}
                        {formatDate(sar.sarDeadline)}
                        {!["Filed", "SAR Declined"].includes(sar.status) && (
                          <span className="font-normal text-slate-400">({daysLeft}d)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={sar.status} /></td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{formatCurrency(sar.amount)}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{sar.recommendedBy}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{sar.finalDecisionMaker ?? <span className="text-slate-400">Pending</span>}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{sar.filingStatus ?? <span className="text-slate-400">—</span>}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{sar.continuingSarDue ? formatDate(sar.continuingSarDue) : <span className="text-slate-400">—</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Link href={`/cases/${sar.caseId}`}><Button variant="ghost" size="sm" className="p-1.5" title="View Case"><ExternalLink className="w-3.5 h-3.5" /></Button></Link>
                        {["Pending Review", "SAR Recommended"].includes(sar.status) && (
                          <Button variant="primary" size="sm">Review</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
