"use client";
import { use, useState } from "react";
import { CASES, ALERTS, CUSTOMERS, TRANSACTIONS, AUDIT_LOG, SAR_REVIEWS } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge, PriorityBadge, RiskBadge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  ArrowLeft, ExternalLink, Plus, GitBranch, ClipboardList, FileText, XCircle,
  CheckCircle, Clock
} from "lucide-react";
import Link from "next/link";

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const caseData = CASES.find(c => c.id === id);
  const [noteModal, setNoteModal] = useState(false);
  const [noteText, setNoteText] = useState("");

  if (!caseData) return <div className="p-8 text-slate-500">Case not found.</div>;

  const customer = CUSTOMERS.find(c => c.id === caseData.customerId);
  const linkedAlerts = ALERTS.filter(a => caseData.alertIds.includes(a.id));
  const allCustomerAlerts = ALERTS.filter(a => a.customerId === caseData.customerId);
  const transactions = TRANSACTIONS.filter(t => t.customerId === caseData.customerId).slice(0, 8);
  const auditEntries = AUDIT_LOG.filter(e => e.entityId === id || e.entityId === caseData.customerId).slice(0, 8);
  const sarReview = SAR_REVIEWS.find(s => s.caseId === id);

  return (
    <div className="space-y-5 max-w-6xl">
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
        <div className="flex gap-2 flex-wrap justify-end">
          <Button variant="outline" size="sm" onClick={() => setNoteModal(true)}><Plus className="w-3.5 h-3.5" /> Add Note</Button>
          <Button variant="outline" size="sm"><GitBranch className="w-3.5 h-3.5" /> Escalate</Button>
          <Button variant="outline" size="sm"><ClipboardList className="w-3.5 h-3.5" /> Request EDD</Button>
          <Button variant="outline" size="sm"><FileText className="w-3.5 h-3.5" /> Recommend SAR</Button>
          {caseData.status !== "Closed" && (
            <Button variant="danger" size="sm"><XCircle className="w-3.5 h-3.5" /> Close Case</Button>
          )}
        </div>
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
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">Risk</span>
                    <StatusBadge status={customer.riskRating} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">KYC</span>
                    <StatusBadge status={customer.kycStatus} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">Screening</span>
                    <StatusBadge status={customer.screeningStatus} />
                  </div>
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
        </TabsList>

        <TabsContent value="alerts">
          <Card className="overflow-hidden">
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
                    <tr><td colSpan={8} className="px-4 py-6 text-center text-sm text-slate-400">No linked alerts. All customer alerts shown below.</td></tr>
                  )}
                  {(linkedAlerts.length > 0 ? linkedAlerts : allCustomerAlerts.slice(0, 5)).map(a => (
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
            {caseData.notes.map(note => (
              <Card key={note.id}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold shrink-0">
                      {note.author.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
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
            <Button variant="outline" onClick={() => setNoteModal(true)}><Plus className="w-4 h-4" /> Add Note</Button>
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
                  <Button variant="outline" className="mt-4">Recommend SAR Review</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={sarReview.status} />
                    <span className="text-sm text-slate-500">SAR {sarReview.id}</span>
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
                        <p className="text-xs text-slate-400">Final Decision Maker</p>
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
                  {/* SAR Workflow Steps */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Workflow Status</p>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { step: "Pending Review", icon: Clock, done: true },
                        { step: "SAR Recommended", icon: FileText, done: ["SAR Recommended", "SAR Approved", "SAR Declined", "Filed", "Continuing Review"].includes(sarReview.status) },
                        { step: "BSA Decision", icon: CheckCircle, done: ["SAR Approved", "SAR Declined", "Filed", "Continuing Review"].includes(sarReview.status) },
                        { step: "Filed", icon: CheckCircle, done: ["Filed"].includes(sarReview.status) },
                      ].map(({ step, icon: Icon, done }) => (
                        <div key={step} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${done ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
                          <Icon className="w-3.5 h-3.5" /> {step}
                        </div>
                      ))}
                    </div>
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
              {auditEntries.map(entry => (
                <div key={entry.id} className="flex gap-3 pb-3 border-b border-slate-50 last:border-0">
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 shrink-0">
                    {entry.actor.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">{entry.action}</p>
                      <span className="text-[10px] text-slate-400">{entry.entityType} {entry.entityId}</span>
                    </div>
                    <p className="text-xs text-slate-500">{entry.details}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{entry.actor} · {entry.actorRole} · {new Date(entry.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Modal isOpen={noteModal} onClose={() => setNoteModal(false)} title="Add Investigation Note">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600">Note Type</label>
            <select className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-md">
              {["Note", "Escalation", "EDD Request", "SAR Recommendation", "Status Change"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Content</label>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              rows={4}
              className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Document your findings and actions..."
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setNoteModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setNoteModal(false)}>Save Note</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
