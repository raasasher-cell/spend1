"use client";
import { use, useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge, PriorityBadge, RiskBadge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, ExternalLink, AlertTriangle } from "lucide-react";
import Link from "next/link";

type AlertRow = { id: string; type: string; source: string; riskScore: number; status: string; priority: string | null; createdDate: string; customerId: string };
type NoteRow = { id: string; content: string; author: string; authorRole: string; timestamp: string };
type CaseRow = { id: string; status: string; priority: string; assignedTo: string; createdDate: string; updatedDate: string; customerName: string; alerts: { id: string }[]; notes: NoteRow[] };
type TxRow = { id: string; type: string; amount: number; counterparty: string; date: string; channel: string; status: string; flagged: boolean };
type CustomerDetail = {
  id: string; name: string; type: string; status: string; riskRating: string; kycStatus: string; screeningStatus: string;
  totalVolume: number; lastTransaction: string; email: string; phone: string; address: string;
  dateOnboarded: string; country: string; dob: string | null; ein: string | null;
  alerts: AlertRow[];
  cases: CaseRow[];
  transactions: TxRow[];
};

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<CustomerDetail | null | "not_found">(null);
  const { state } = useStore();

  useEffect(() => {
    fetch(`/api/customers/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setCustomer(data ?? "not_found"))
      .catch(() => setCustomer("not_found"));
  }, [id]);

  if (customer === null) return <div className="p-8 text-slate-500">Loading...</div>;
  if (customer === "not_found") return <div className="p-8 text-slate-500">Customer not found.</div>;

  const alerts = customer.alerts ?? [];
  const cases = customer.cases ?? [];
  const transactions = customer.transactions ?? [];

  const openAlerts = alerts.filter(a => ["Open", "In Review", "Escalated"].includes(a.status)).length;
  const openCases = cases.filter(c => c.status !== "Closed").length;

  const alertIds = new Set(alerts.map(a => a.id));
  const caseIds = new Set(cases.map(c => c.id));
  const auditEntries = state.auditLog
    .filter(e => e.entityId === id || alertIds.has(e.entityId) || caseIds.has(e.entityId))
    .slice(0, 10);

  const initials = customer.name.split(" ").map(n => n[0]).join("").slice(0, 2);

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center gap-3">
        <Link href="/customers"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /> Back</Button></Link>
      </div>

      <Card>
        <CardContent className="py-5">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{customer.name}</h1>
                  <p className="text-sm text-slate-500">{customer.id} · {customer.type}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={customer.status} />
                    <StatusBadge status={customer.riskRating} />
                    <StatusBadge status={customer.kycStatus} />
                    <StatusBadge status={customer.screeningStatus} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Request EDD</Button>
                  <Button variant="outline" size="sm">Restrict Account</Button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-6 mt-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-400">Open Alerts</p>
                  <p className={`text-2xl font-bold mt-0.5 ${openAlerts > 0 ? "text-red-600" : "text-slate-400"}`}>{openAlerts}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Open Cases</p>
                  <p className={`text-2xl font-bold mt-0.5 ${openCases > 0 ? "text-orange-600" : "text-slate-400"}`}>{openCases}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total Volume</p>
                  <p className="text-xl font-bold mt-0.5 text-slate-900">{formatCurrency(customer.totalVolume)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Last Transaction</p>
                  <p className="text-base font-semibold mt-0.5 text-slate-700">{formatDate(customer.lastTransaction)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="kyc">KYC</TabsTrigger>
          <TabsTrigger value="screening">Screening</TabsTrigger>
          <TabsTrigger value="transactions">Transactions ({transactions.length})</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({alerts.length})</TabsTrigger>
          <TabsTrigger value="cases">Cases ({cases.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400" /> {customer.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400" /> {customer.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400" /> {customer.address}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Calendar className="w-4 h-4 text-slate-400" /> Onboarded {formatDate(customer.dateOnboarded)}
                </div>
                {customer.dob && (
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Calendar className="w-4 h-4 text-slate-400" /> DOB: {customer.dob}
                  </div>
                )}
                {customer.ein && (
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-slate-400 text-xs font-mono">EIN</span> {customer.ein}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Risk Profile</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "Risk Rating", value: <StatusBadge status={customer.riskRating} /> },
                    { label: "KYC Status", value: <StatusBadge status={customer.kycStatus} /> },
                    { label: "Screening Status", value: <StatusBadge status={customer.screeningStatus} /> },
                    { label: "Account Status", value: <StatusBadge status={customer.status} /> },
                    { label: "Country", value: <span className="text-sm text-slate-700">{customer.country}</span> },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{label}</span>
                      {value}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="kyc">
          <Card>
            <CardHeader><CardTitle>KYC Verification Results</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { check: "Identity Verification", status: customer.kycStatus === "Rejected" ? "Failed" : customer.kycStatus === "Pending" ? "Pending" : "Passed", detail: "Government ID, Selfie match" },
                  { check: "Address Verification", status: customer.kycStatus === "Rejected" ? "Failed" : "Passed", detail: "Utility bill, Bank statement" },
                  { check: "Document Authenticity", status: customer.kycStatus === "Rejected" ? "Failed" : customer.kycStatus === "Manual Review" ? "Review Required" : "Passed", detail: "AI-assisted document review" },
                  { check: "Database Check", status: customer.kycStatus === "Approved" ? "Passed" : "Review Required", detail: "DMV, USPS, Credit Bureau" },
                  { check: "Watchlist Screening", status: customer.screeningStatus === "Clear" ? "Clear" : "Hit", detail: "OFAC, EU, UN Lists" },
                  { check: "Beneficial Ownership", status: customer.type === "Individual" ? "N/A" : customer.kycStatus === "Manual Review" ? "Incomplete" : "Verified", detail: "25%+ threshold" },
                ].map(({ check, status, detail }) => (
                  <div key={check} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{check}</p>
                      <p className="text-xs text-slate-400">{detail}</p>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screening">
          <Card>
            <CardHeader><CardTitle>Screening Results</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { list: "OFAC SDN List", result: customer.screeningStatus === "Hit" || customer.screeningStatus === "Escalated" ? "Potential Hit" : "Clear", confidence: customer.screeningStatus === "Hit" ? "85%" : "N/A" },
                  { list: "EU Financial Sanctions", result: customer.screeningStatus === "Escalated" ? "Confirmed Hit" : "Clear", confidence: customer.screeningStatus === "Escalated" ? "97%" : "N/A" },
                  { list: "UN Consolidated Sanctions", result: customer.screeningStatus === "Escalated" ? "Confirmed Hit" : "Clear", confidence: customer.screeningStatus === "Escalated" ? "92%" : "N/A" },
                  { list: "PEP Database", result: customer.riskRating === "Critical" ? "PEP Match" : customer.riskRating === "High" ? "PEP Associate" : "Clear", confidence: "N/A" },
                  { list: "Adverse Media", result: customer.riskRating === "Critical" ? "Multiple Articles" : customer.riskRating === "High" ? "1 Article" : "Clear", confidence: "N/A" },
                  { list: "FinCEN 314(a)", result: "Clear", confidence: "N/A" },
                ].map(({ list, result, confidence }) => (
                  <div key={list} className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">{list}</p>
                      {confidence !== "N/A" && <p className="text-xs text-slate-400">Confidence: {confidence}</p>}
                    </div>
                    <StatusBadge status={result === "Clear" ? "Clear" : "Hit"} />
                    <span className="ml-3 text-sm text-slate-600">{result}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["ID", "Type", "Amount", "Counterparty", "Date", "Channel", "Status", "Flag"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.map(t => (
                    <tr key={t.id} className={t.flagged ? "bg-red-50/40" : "hover:bg-slate-50"}>
                      <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{t.id}</td>
                      <td className="px-4 py-2.5 text-slate-700">{t.type}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-900">{formatCurrency(t.amount)}</td>
                      <td className="px-4 py-2.5 text-slate-600">{t.counterparty}</td>
                      <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">{formatDate(t.date)}</td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">{t.channel}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={t.status} /></td>
                      <td className="px-4 py-2.5">
                        {t.flagged && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

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
                  {alerts.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs text-blue-600 font-medium">{a.id}</td>
                      <td className="px-4 py-3 text-slate-700">{a.type}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{a.source}</td>
                      <td className="px-4 py-3"><RiskBadge score={a.riskScore} /></td>
                      <td className="px-4 py-3"><PriorityBadge priority={a.priority ?? "Low"} /></td>
                      <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDate(a.createdDate)}</td>
                      <td className="px-4 py-3">
                        <Link href={`/alerts/${a.id}`}><Button variant="ghost" size="sm" className="p-1.5"><ExternalLink className="w-3.5 h-3.5" /></Button></Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="cases">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Case ID", "Status", "Priority", "Assigned To", "Alerts", "Created", "Updated", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {cases.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs text-blue-600 font-medium">{c.id}</td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                      <td className="px-4 py-3 text-xs text-slate-600">{c.assignedTo}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-700">{c.alerts?.length ?? 0}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDate(c.createdDate)}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDate(c.updatedDate)}</td>
                      <td className="px-4 py-3">
                        <Link href={`/cases/${c.id}`}><Button variant="ghost" size="sm" className="p-1.5"><ExternalLink className="w-3.5 h-3.5" /></Button></Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { name: "Government ID (Passport)", uploaded: "2024-03-15", status: "Verified" },
                  { name: "Proof of Address", uploaded: "2024-03-15", status: "Verified" },
                  { name: "Source of Funds Declaration", uploaded: "2024-06-01", status: customer.kycStatus === "Manual Review" ? "Under Review" : "Verified" },
                  { name: "Beneficial Ownership Form", uploaded: customer.type === "Individual" ? "N/A" : "2024-03-15", status: customer.type === "Individual" ? "N/A" : "Verified" },
                ].map(doc => (
                  <div key={doc.name} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{doc.name}</p>
                      <p className="text-xs text-slate-400">Uploaded {doc.uploaded}</p>
                    </div>
                    <StatusBadge status={doc.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader><CardTitle>Audit Trail</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {auditEntries.length === 0 && <p className="text-sm text-slate-400">No audit entries found.</p>}
              {auditEntries.map(entry => (
                <div key={entry.id} className="flex gap-3 pb-3 border-b border-slate-50 last:border-0">
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 shrink-0">
                    {entry.actor.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{entry.action}</p>
                    <p className="text-xs text-slate-500">{entry.details}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{entry.actor} · {entry.actorRole} · {new Date(entry.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
