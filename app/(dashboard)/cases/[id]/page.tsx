"use client";
import { use, useState } from "react";
import { useStore } from "@/lib/store";
import { CUSTOMERS, TRANSACTIONS } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge, PriorityBadge, RiskBadge } from "@/components/ui/badge";
import {
  AddNoteModal, RequestEDDModal, EscalateCaseModal,
  RecommendSARModal, CloseCaseModal, FalsePositiveCaseModal, LinkAlertModal,
} from "@/components/cases/CaseActionModals";
import { formatDate, formatCurrency } from "@/lib/utils";
import { CaseSummaryPanel } from "@/components/cases/CaseSummaryPanel";
import {
  ArrowLeft, ExternalLink, Plus, GitBranch, ClipboardList, FileText, XCircle,
  CheckCircle, Clock, AlertTriangle, Link2,
} from "lucide-react";
import Link from "next/link";

type ModalType = "note" | "edd" | "escalate" | "sar" | "close" | "falsepositive" | "link" | null;

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state } = useStore();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const caseData = state.cases.find(c => c.id === id);
  if (!caseData) return <div className="p-8 text-slate-500">Case not found.</div>;

  const customer = CUSTOMERS.find(c => c.id === caseData.customerId);
  const linkedAlerts = state.alerts.filter(a => caseData.alertIds.includes(a.id));
  const allCustomerAlerts = state.alerts.filter(a => a.customerId === caseData.customerId);
  const transactions = TRANSACTIONS.filter(t => t.customerId === caseData.customerId).slice(0, 8);
  const auditEntries = state.auditLog.filter(e => e.entityId === id || e.entityId === caseData.customerId).slice(0, 10);
  const sarReview = state.sarReviews.find(s => s.caseId === id);
  const isClosed = caseData.status === "Closed";

  function open(m: ModalType) { setActiveModal(m); }
  function close() { setActiveModal(null); }

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Modals */}
      <AddNoteModal caseId={activeModal === "note" ? id : null} onClose={close} />
      <RequestEDDModal caseId={activeModal === "edd" ? id : null} onClose={close} />
      <EscalateCaseModal caseId={activeModal === "escalate" ? id : null} onClose={close} />
      <RecommendSARModal caseId={activeModal === "sar" ? id : null} onClose={close} />
      <CloseCaseModal caseId={activeModal === "close" ? id : null} onClose={close} />
      <FalsePositiveCaseModal caseId={activeModal === "falsepositive" ? id : null} onClose={close} />
      <LinkAlertModal caseId={activeModal === "link" ? id : null} onClose={close} />

      <div className="flex items-center gap-3">
        <Link href="/cases"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /> Back</Button></Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">{caseData.id}</h1>
            <PriorityBadge priority={caseData.priority} />
            <StatusBadge status={caseData.status} />
            {caseData.sarStatus && <StatusBadge status={caseData.sarStatus} />}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{caseData.customerName} · Assigned to {caseData.assignedTo}</p>
        </div>
        {!isClosed && (
          <div className="flex gap-2 flex-wrap justify-end">
            <Button variant="outline" size="sm" onClick={() => open("note")}><Plus className="w-3.5 h-3.5" /> Add Note</Button>
            <Button variant="outline" size="sm" onClick={() => open("link")}><Link2 className="w-3.5 h-3.5" /> Link Alert</Button>
            <Button variant="outline" size="sm" onClick={() => open("edd")}><ClipboardList className="w-3.5 h-3.5" /> Request EDD</Button>
            <Button variant="outline" size="sm" onClick={() => open("escalate")}><GitBranch className="w-3.5 h-3.5" /> Escalate</Button>
            {!caseData.sarStatus && (
              <Button variant="outline" size="sm" onClick={() => open("sar")}><FileText className="w-3.5 h-3.5" /> Recommend SAR</Button>
            )}
            <Button variant="outline" size="sm" onClick={() => open("falsepositive")}><AlertTriangle className="w-3.5 h-3.5" /> False Positive</Button>
            <Button variant="danger" size="sm" onClick={() => open("close")}><XCircle className="w-3.5 h-3.5" /> Close Case</Button>
          </div>
        )}
        {isClosed && (
          <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs text-slate-500 font-medium">
            Case closed {caseData.closedDate ? formatDate(caseData.closedDate) : ""}
          </div>
        )}
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader><CardTitle>Case Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 leading-relaxed">{caseData.description}</p>
            <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-400">Created</p>
                <p className="text-sm font-medium text-slate-700 mt-0.5">{formatDate(caseData.createdDate)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Last Updated</p>
                <p className="text-sm font-medium text-slate-700 mt-0.5">{formatDate(caseData.updatedDate)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Linked Alerts</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{caseData.alertIds.length}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Notes</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{caseData.notes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
          <CardContent>
            {customer && (
              <div className="space-y-2">
                <Link href={`/customers/${customer.id}`} className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                  {customer.name} <ExternalLink className="w-3 h-3" />
                </Link>
                <p className="text-xs text-slate-500">{customer.type}</p>
                <div className="space-y-1.5 mt-2">
                  {[
                    { label: "Risk", value: customer.riskRating },
                    { label: "KYC", value: customer.kycStatus },
                    { label: "Screening", value: customer.screeningStatus },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400">{label}</span>
                      <StatusBadge status={value} />
                    </div>
                  ))}
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">Volume</span>
                    <span className="text-xs font-semibold text-slate-700">{formatCurrency(customer.totalVolume)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts">
        <TabsList>
          <TabsTrigger value="alerts">Linked Alerts ({linkedAlerts.length})</TabsTrigger>
          <TabsTrigger value="transactions">Transactions ({transactions.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes ({caseData.notes.length})</TabsTrigger>
          <TabsTrigger value="sar">SAR Decision</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="ai-summary">✦ AI Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle>Linked Alerts</CardTitle>
              {!isClosed && <Button variant="outline" size="sm" onClick={() => open("link")}><Link2 className="w-3.5 h-3.5" /> Link Alert</Button>}
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Alert ID", "Type", "Source", "Risk Score", "Priority", "Status", "Created", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {linkedAlerts.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-6 text-center text-sm text-slate-400">No linked alerts yet.</td></tr>
                  )}
                  {(linkedAlerts.length > 0 ? linkedAlerts : allCustomerAlerts.slice(0, 3)).map(a => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3"><Link href={`/alerts/${a.id}`} className="font-mono text-xs text-blue-600 font-medium">{a.id}</Link></td>
                      <td className="px-4 py-3 text-slate-700">{a.type}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{a.source}</td>
                      <td className="px-4 py-3"><RiskBadge score={a.riskScore} /></td>
                      <td className="px-4 py-3"><PriorityBadge priority={a.priority ?? "Low"} /></td>
                      <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDate(a.createdDate)}</td>
                      <td className="px-4 py-3"><Link href={`/alerts/${a.id}`}><Button variant="ghost" size="sm" className="p-1.5"><ExternalLink className="w-3.5 h-3.5" /></Button></Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["ID", "Type", "Amount", "Counterparty", "Date", "Channel", "Status"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.map(t => (
                    <tr key={t.id} className={t.flagged ? "bg-red-50/30" : "hover:bg-slate-50"}>
                      <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{t.id}</td>
                      <td className="px-4 py-2.5 text-slate-700">{t.type}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-900">{formatCurrency(t.amount)}</td>
                      <td className="px-4 py-2.5 text-slate-600">{t.counterparty}</td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">{formatDate(t.date)}</td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">{t.channel}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={t.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <div className="space-y-3">
            {caseData.notes.length === 0 && (
              <Card><CardContent className="py-8 text-center text-sm text-slate-400">No notes yet. Add a note to document your investigation.</CardContent></Card>
            )}
            {[...caseData.notes].reverse().map(note => (
              <Card key={note.id}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold shrink-0">
                      {note.author.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-900">{note.author}</span>
                        <StatusBadge status={note.type} />
                        <span className="text-xs text-slate-400 ml-auto">{new Date(note.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">{note.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!isClosed && (
              <Button variant="outline" onClick={() => open("note")}><Plus className="w-4 h-4" /> Add Note</Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sar">
          <Card>
            <CardHeader><CardTitle>SAR Decision Tracker</CardTitle></CardHeader>
            <CardContent>
              {!sarReview ? (
                <div className="text-center py-8">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No SAR review initiated for this case.</p>
                  {!isClosed && (
                    <Button variant="outline" className="mt-4" onClick={() => open("sar")}>Recommend SAR Review</Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={sarReview.status} />
                    <span className="text-sm text-slate-500">{sarReview.id}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">Detection Date</p>
                      <p className="text-sm font-medium text-slate-700 mt-0.5">{formatDate(sarReview.detectionDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">SAR Deadline</p>
                      <p className="text-sm font-semibold text-red-600 mt-0.5">{formatDate(sarReview.sarDeadline)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Amount</p>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">{formatCurrency(sarReview.amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Recommended By</p>
                      <p className="text-sm font-medium text-slate-700 mt-0.5">{sarReview.recommendedBy}</p>
                    </div>
                    {sarReview.finalDecisionMaker && (
                      <div>
                        <p className="text-xs text-slate-400">Decision Maker</p>
                        <p className="text-sm font-medium text-slate-700 mt-0.5">{sarReview.finalDecisionMaker}</p>
                      </div>
                    )}
                    {sarReview.filingStatus && (
                      <div>
                        <p className="text-xs text-slate-400">Filing Status</p>
                        <p className="text-sm font-medium text-slate-700 mt-0.5">{sarReview.filingStatus}</p>
                      </div>
                    )}
                  </div>
                  {sarReview.narrative && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-400 mb-1">SAR Narrative</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{sarReview.narrative}</p>
                    </div>
                  )}
                  {/* Workflow */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Workflow Status</p>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { step: "Pending Review", icon: Clock, done: true },
                        { step: "SAR Recommended", icon: FileText, done: ["SAR Recommended", "SAR Approved", "SAR Declined", "Filed"].includes(sarReview.status) },
                        { step: "BSA Decision", icon: CheckCircle, done: ["SAR Approved", "SAR Declined", "Filed"].includes(sarReview.status) },
                        { step: "Filed", icon: CheckCircle, done: sarReview.status === "Filed" },
                      ].map(({ step, icon: Icon, done }) => (
                        <div key={step} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${done ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
                          <Icon className="w-3.5 h-3.5" /> {step}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Link href="/sar-reviews"><Button variant="outline" size="sm"><ExternalLink className="w-3.5 h-3.5" /> View in SAR Tracker</Button></Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader><CardTitle>Audit Log</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {auditEntries.length === 0 && <p className="text-sm text-slate-400">No audit entries found.</p>}
              {auditEntries.map(entry => (
                <div key={entry.id} className="flex gap-3 pb-3 border-b border-slate-50 last:border-0">
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 shrink-0">
                    {entry.actor.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-slate-900">{entry.action}</p>
                      {entry.previousStatus && entry.newStatus && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                          {entry.previousStatus} → {entry.newStatus}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{entry.details}</p>
                    {entry.reason && <p className="text-xs text-slate-400 italic">Reason: {entry.reason}</p>}
                    <p className="text-[10px] text-slate-400 mt-0.5">{entry.actor} · {entry.actorRole} · {new Date(entry.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-summary">
          <CaseSummaryPanel caseId={caseData.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
