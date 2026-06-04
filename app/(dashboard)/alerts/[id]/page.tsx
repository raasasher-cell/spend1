"use client";
import { use, useState } from "react";
import { useStore } from "@/lib/store";
import { CUSTOMERS, TRANSACTIONS } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriorityBadge, StatusBadge, RiskBadge } from "@/components/ui/badge";
import { formatDate, formatCurrency, isOverdue } from "@/lib/utils";
import {
  AssignAlertModal, CloseAlertModal, FalsePositiveAlertModal,
  EscalateToCaseModal, ChangeStatusModal,
} from "@/components/alerts/AlertActionModals";
import { ArrowLeft, AlertTriangle, GitBranch, XCircle, UserPlus, ExternalLink, ThumbsDown, RefreshCw } from "lucide-react";
import Link from "next/link";

type ModalType = "assign" | "close" | "falsepositive" | "escalate" | "status" | null;

export default function AlertDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state } = useStore();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const alert = state.alerts.find(a => a.id === id);
  if (!alert) return <div className="p-8 text-slate-500">Alert not found.</div>;

  const customer = CUSTOMERS.find(c => c.id === alert.customerId);
  const linkedCase = alert.caseId ? state.cases.find(c => c.id === alert.caseId) : null;
  const relatedTransactions = TRANSACTIONS.filter(t => t.customerId === alert.customerId).slice(0, 5);
  const relatedAudit = state.auditLog.filter(e => e.entityId === alert.id).slice(0, 6);
  const overdue = isOverdue(alert.slaDue);
  const isActive = alert.status === "Open" || alert.status === "In Review";

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Modals */}
      <AssignAlertModal alertId={activeModal === "assign" ? id : null} onClose={() => setActiveModal(null)} />
      <CloseAlertModal alertId={activeModal === "close" ? id : null} onClose={() => setActiveModal(null)} />
      <FalsePositiveAlertModal alertId={activeModal === "falsepositive" ? id : null} onClose={() => setActiveModal(null)} />
      <EscalateToCaseModal alertId={activeModal === "escalate" ? id : null} onClose={() => setActiveModal(null)} />
      <ChangeStatusModal alertId={activeModal === "status" ? id : null} onClose={() => setActiveModal(null)} />

      <div className="flex items-center gap-3">
        <Link href="/alerts"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /> Back</Button></Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">{alert.id}</h1>
            <PriorityBadge priority={alert.priority ?? "Low"} />
            <StatusBadge status={alert.status} />
            {overdue && <span className="flex items-center gap-1 text-xs text-red-600 font-semibold"><AlertTriangle className="w-3 h-3" /> SLA Breached</span>}
          </div>
          <p className="text-sm text-slate-600 mt-0.5">{alert.type} · {alert.source}</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {isActive && (
            <>
              <Button variant="outline" size="sm" onClick={() => setActiveModal("assign")}><UserPlus className="w-4 h-4" /> Assign</Button>
              <Button variant="outline" size="sm" onClick={() => setActiveModal("status")}><RefreshCw className="w-4 h-4" /> Status</Button>
              <Button variant="outline" size="sm" onClick={() => setActiveModal("escalate")}><GitBranch className="w-4 h-4" /> Escalate to Case</Button>
              <Button variant="outline" size="sm" onClick={() => setActiveModal("falsepositive")}><ThumbsDown className="w-4 h-4" /> False Positive</Button>
              <Button variant="danger" size="sm" onClick={() => setActiveModal("close")}><XCircle className="w-4 h-4" /> Close Alert</Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader><CardTitle>Alert Details</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 leading-relaxed">{alert.description}</p>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-400">Risk Score</p>
                <div className="mt-1"><RiskBadge score={alert.riskScore} /></div>
              </div>
              <div>
                <p className="text-xs text-slate-400">Created</p>
                <p className="text-sm font-medium text-slate-700 mt-1">{formatDate(alert.createdDate)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">SLA Due</p>
                <p className={`text-sm font-medium mt-1 ${overdue ? "text-red-600" : "text-slate-700"}`}>{formatDate(alert.slaDue)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Source</p>
                <p className="text-sm font-medium text-slate-700 mt-1">{alert.source}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Assigned To</p>
                <button className="text-sm font-medium text-blue-600 hover:underline mt-1" onClick={() => setActiveModal("assign")}>
                  {alert.assignedTo ?? <span className="text-slate-400 italic text-xs">Unassigned — click to assign</span>}
                </button>
              </div>
              {alert.caseId && (
                <div>
                  <p className="text-xs text-slate-400">Linked Case</p>
                  <Link href={`/cases/${alert.caseId}`} className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1 mt-1">
                    {alert.caseId} <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
          <CardContent>
            {customer && (
              <div className="space-y-3">
                <div>
                  <Link href={`/customers/${customer.id}`} className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                    {customer.name} <ExternalLink className="w-3 h-3" />
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5">{customer.type}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><p className="text-[10px] text-slate-400">Risk Rating</p><StatusBadge status={customer.riskRating} /></div>
                  <div><p className="text-[10px] text-slate-400">KYC</p><StatusBadge status={customer.kycStatus} /></div>
                  <div><p className="text-[10px] text-slate-400">Screening</p><StatusBadge status={customer.screeningStatus} /></div>
                  <div><p className="text-[10px] text-slate-400">Status</p><StatusBadge status={customer.status} /></div>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400">Total Volume</p>
                  <p className="text-sm font-semibold text-slate-900">{formatCurrency(customer.totalVolume)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {linkedCase && (
        <Card>
          <CardHeader><CardTitle>Linked Case</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Link href={`/cases/${linkedCase.id}`} className="text-sm font-semibold text-blue-600 hover:underline">{linkedCase.id}</Link>
                <p className="text-sm text-slate-700 mt-1 max-w-xl">{linkedCase.description}</p>
              </div>
              <div className="flex gap-2 shrink-0 ml-4">
                <StatusBadge status={linkedCase.status} />
                <PriorityBadge priority={linkedCase.priority} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["ID", "Type", "Amount", "Counterparty", "Date", "Status"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {relatedTransactions.map(t => (
                <tr key={t.id} className={t.flagged ? "bg-red-50/30" : ""}>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{t.id}</td>
                  <td className="px-4 py-2.5 text-slate-700">{t.type}</td>
                  <td className="px-4 py-2.5 font-semibold text-slate-900">{formatCurrency(t.amount)}</td>
                  <td className="px-4 py-2.5 text-slate-600">{t.counterparty}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{formatDate(t.date)}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {relatedAudit.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Audit Trail for this Alert</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {relatedAudit.map(entry => (
              <div key={entry.id} className="flex gap-3 pb-3 border-b border-slate-50 last:border-0">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500 shrink-0">
                  {entry.actor.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900">{entry.action}</p>
                    {entry.previousStatus && entry.newStatus && (
                      <span className="text-[10px] text-slate-400">{entry.previousStatus} → {entry.newStatus}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{entry.details}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{entry.actor} · {new Date(entry.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
