"use client";
import { useState, useEffect } from "react";
import { User } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/badge";
import { Plus, Clock, Shield, Database, Archive, FileSearch } from "lucide-react";

const slaSettings = [
  { alertType: "Sanctions Screening", priority: "Critical", slaDays: 1 },
  { alertType: "Sanctions Screening", priority: "High", slaDays: 2 },
  { alertType: "PEP Screening", priority: "Critical", slaDays: 2 },
  { alertType: "Transaction Monitoring", priority: "Critical", slaDays: 3 },
  { alertType: "Transaction Monitoring", priority: "High", slaDays: 5 },
  { alertType: "KYC", priority: "High", slaDays: 7 },
  { alertType: "KYC", priority: "Medium", slaDays: 14 },
  { alertType: "Adverse Media", priority: "High", slaDays: 5 },
  { alertType: "Fraud", priority: "Critical", slaDays: 1 },
  { alertType: "Fraud", priority: "High", slaDays: 2 },
];

const riskScoreRules = [
  { rule: "OFAC SDN Exact Match", scoreImpact: "+95", category: "Sanctions" },
  { rule: "OFAC SDN Partial Match (>85%)", scoreImpact: "+80", category: "Sanctions" },
  { rule: "UN Sanctions List Match", scoreImpact: "+90", category: "Sanctions" },
  { rule: "PEP Head of State", scoreImpact: "+70", category: "PEP" },
  { rule: "PEP Family Member", scoreImpact: "+50", category: "PEP" },
  { rule: "Adverse Media - Financial Crime", scoreImpact: "+60", category: "Adverse Media" },
  { rule: "Structuring Pattern Detected", scoreImpact: "+65", category: "Transaction" },
  { rule: "Rapid Fund Movement", scoreImpact: "+55", category: "Transaction" },
  { rule: "High-Risk Jurisdiction Wire", scoreImpact: "+40", category: "Transaction" },
  { rule: "KYC Document Failure", scoreImpact: "+45", category: "KYC" },
];

const vendors = [
  { name: "Jumio", type: "KYC/Identity", status: "Connected", lastSync: "2026-06-04" },
  { name: "Lexis Nexis Risk Solutions", type: "Sanctions/PEP Screening", status: "Connected", lastSync: "2026-06-04" },
  { name: "World-Check (LSEG)", type: "PEP/Adverse Media", status: "Connected", lastSync: "2026-06-04" },
  { name: "Dow Jones Factiva", type: "Adverse Media", status: "Connected", lastSync: "2026-06-04" },
  { name: "Sardine", type: "Fraud/Risk Signals", status: "Pending Setup", lastSync: "—" },
  { name: "Unit21", type: "Transaction Monitoring", status: "Connected", lastSync: "2026-06-03" },
  { name: "AWS S3", type: "Document Storage", status: "Connected", lastSync: "2026-06-04" },
  { name: "FinCEN BSA-Track", type: "SAR Filing", status: "Connected", lastSync: "2026-06-01" },
];

type VendorPingResult = { latencyMs: number; version: string; status: string } | null;

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [vendorPing, setVendorPing] = useState<Record<string, VendorPingResult | "loading">>({});

  useEffect(() => {
    fetch("/api/users")
      .then(r => r.json())
      .then(data => setUsers(Array.isArray(data) ? data : []));
  }, []);

  async function pingVendor(name: string) {
    setVendorPing(p => ({ ...p, [name]: "loading" }));
    try {
      const res = await fetch("/api/vendor/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendor: name }),
      });
      const data = await res.json();
      setVendorPing(p => ({ ...p, [name]: data }));
    } catch {
      setVendorPing(p => ({ ...p, [name]: null }));
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Admin Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">System configuration and management</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">User Roles</TabsTrigger>
          <TabsTrigger value="sla">SLA Settings</TabsTrigger>
          <TabsTrigger value="risk">Risk Scoring</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Integrations</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="audit">Audit Log Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>User Management</CardTitle>
              <Button variant="primary" size="sm"><Plus className="w-4 h-4" /> Add User</Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["User", "Email", "Role", "Status", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold">
                            {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <span className="font-medium text-slate-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{user.email}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={user.role === "BSA Officer" || user.role === "Compliance Manager" ? "Hit" : user.role === "Admin" ? "Escalated" : "Approved"} />
                        <span className="ml-2 text-xs text-slate-600">{user.role}</span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status="Active" /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">Edit</Button>
                          {user.name !== "Admin User" && <Button variant="ghost" size="sm" className="text-red-500">Deactivate</Button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader><CardTitle>Role Permissions Matrix</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2 pr-4 text-slate-500 font-semibold">Permission</th>
                      {["Analyst", "Sr. Investigator", "Compliance Mgr", "BSA Officer", "Auditor", "Bank Partner"].map(r => (
                        <th key={r} className="text-center py-2 px-2 text-slate-500 font-semibold whitespace-nowrap">{r}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      ["View Alerts", true, true, true, true, true, true],
                      ["Close Alerts", true, true, true, true, false, false],
                      ["Escalate to Case", true, true, true, true, false, false],
                      ["Recommend SAR", false, true, true, true, false, false],
                      ["Approve SAR", false, false, false, true, false, false],
                      ["File SAR", false, false, false, true, false, false],
                      ["View Audit Log", false, false, true, true, true, false],
                      ["Export Reports", false, true, true, true, true, false],
                      ["Manage Users", false, false, false, false, false, false],
                    ].map(([perm, ...perms]) => (
                      <tr key={String(perm)} className="hover:bg-slate-50">
                        <td className="py-2 pr-4 font-medium text-slate-700">{perm}</td>
                        {(perms as boolean[]).map((has, i) => (
                          <td key={i} className="py-2 px-2 text-center">
                            {has ? <span className="text-green-600">✓</span> : <span className="text-slate-300">—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>SLA Configuration</CardTitle>
              <Button variant="primary" size="sm"><Plus className="w-4 h-4" /> Add Rule</Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Alert Type", "Priority", "SLA (Days)", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {slaSettings.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-700 font-medium">{s.alertType}</td>
                      <td className="px-4 py-3"><StatusBadge status={s.priority} /></td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold text-lg ${s.slaDays <= 2 ? "text-red-600" : s.slaDays <= 5 ? "text-amber-600" : "text-slate-700"}`}>{s.slaDays}</span>
                        <span className="text-xs text-slate-400 ml-1">days</span>
                      </td>
                      <td className="px-4 py-3"><Button variant="ghost" size="sm">Edit</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Risk Scoring Rules</CardTitle>
              <Button variant="primary" size="sm"><Plus className="w-4 h-4" /> Add Rule</Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Rule", "Category", "Score Impact", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {riskScoreRules.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-700">{r.rule}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{r.category}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-red-600">{r.scoreImpact}</span>
                      </td>
                      <td className="px-4 py-3"><Button variant="ghost" size="sm">Edit</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Vendor Integrations</CardTitle>
              <Button variant="primary" size="sm"><Plus className="w-4 h-4" /> Add Integration</Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Vendor", "Type", "Status", "Last Sync", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {vendors.map((v, i) => {
                    const ping = vendorPing[v.name];
                    return (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-700">{v.name}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{v.type}</td>
                      <td className="px-4 py-3"><StatusBadge status={v.status === "Connected" ? "Active" : "Pending"} /></td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {ping && ping !== "loading" ? (
                          <span className="text-green-600 font-medium">{ping.latencyMs}ms</span>
                        ) : v.lastSync}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 items-center">
                          <Button variant="ghost" size="sm">Configure</Button>
                          {v.status === "Connected" && (
                            <Button variant="ghost" size="sm" onClick={() => pingVendor(v.name)} disabled={ping === "loading"}>
                              {ping === "loading" ? "Testing..." : "Test"}
                            </Button>
                          )}
                          {ping && ping !== "loading" && (
                            <span className="text-[10px] text-green-600 font-semibold">✓ OK</span>
                          )}
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention">
          <Card>
            <CardHeader><CardTitle>Data Retention Settings</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "Transaction Records", current: "7 years", required: "5 years (BSA)", icon: Database },
                  { label: "KYC Documents", current: "5 years after account closure", required: "5 years (BSA)", icon: FileSearch },
                  { label: "SAR Reports", current: "5 years after filing", required: "5 years (31 CFR 1020.320)", icon: Archive },
                  { label: "Audit Logs", current: "7 years", required: "5 years", icon: Clock },
                  { label: "Case Records", current: "7 years", required: "5 years", icon: Archive },
                  { label: "Alert Records", current: "5 years", required: "5 years", icon: Shield },
                ].map(({ label, current, required, icon: Icon }) => (
                  <div key={label} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg"><Icon className="w-4 h-4 text-slate-600" /></div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{label}</p>
                        <p className="text-xs text-slate-400">Regulatory minimum: {required}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-700">{current}</span>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader><CardTitle>Audit Log Configuration</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-slate-500">Configure what actions are logged and audit log export settings.</p>
                {[
                  { event: "User Login/Logout", enabled: true },
                  { event: "Alert Status Changes", enabled: true },
                  { event: "Case Creation/Updates", enabled: true },
                  { event: "SAR Recommendations", enabled: true },
                  { event: "SAR Approvals/Denials", enabled: true },
                  { event: "Customer Record Changes", enabled: true },
                  { event: "User Permission Changes", enabled: true },
                  { event: "Data Exports", enabled: true },
                  { event: "System Configuration Changes", enabled: true },
                  { event: "Failed Login Attempts", enabled: true },
                ].map(({ event, enabled }) => (
                  <div key={event} className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                    <span className="text-sm font-medium text-slate-700">{event}</span>
                    <div className={`w-10 h-5 rounded-full ${enabled ? "bg-blue-600" : "bg-slate-200"} relative cursor-pointer transition-colors`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
