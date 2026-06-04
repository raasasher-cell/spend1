"use client";
import { useState, useMemo } from "react";
import { ALERTS, USERS, Alert } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { PriorityBadge, StatusBadge, RiskBadge } from "@/components/ui/badge";
import { formatDate, isOverdue, getDaysUntilDue } from "@/lib/utils";
import { Search, AlertTriangle, ChevronUp, ChevronDown, Eye, GitBranch, XCircle, UserPlus } from "lucide-react";
import Link from "next/link";

type SortKey = keyof Alert | null;

export default function AlertsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterAssigned, setFilterAssigned] = useState("");
  const [filterSLABreached, setFilterSLABreached] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const analysts = USERS.filter(u => ["Analyst", "Senior Investigator"].includes(u.role));

  const filtered = useMemo(() => {
    let results = ALERTS.filter(a => {
      const q = search.toLowerCase();
      const matchSearch = !q || a.id.toLowerCase().includes(q) || a.customerName.toLowerCase().includes(q) || a.type.toLowerCase().includes(q);
      const matchStatus = !filterStatus || a.status === filterStatus;
      const matchPriority = !filterPriority || a.priority === filterPriority;
      const matchSource = !filterSource || a.source === filterSource;
      const matchAssigned = !filterAssigned || a.assignedTo === filterAssigned;
      const matchSLA = filterSLABreached === "" ? true : filterSLABreached === "yes" ? isOverdue(a.slaDue) : !isOverdue(a.slaDue);
      return matchSearch && matchStatus && matchPriority && matchSource && matchAssigned && matchSLA;
    });
    if (sortKey) {
      results = [...results].sort((a, b) => {
        const av = a[sortKey] ?? "";
        const bv = b[sortKey] ?? "";
        const cmp = String(av).localeCompare(String(bv));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return results;
  }, [search, filterStatus, filterPriority, filterSource, filterAssigned, filterSLABreached, sortKey, sortDir]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp className="w-3 h-3 opacity-20" />;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-blue-600" /> : <ChevronDown className="w-3 h-3 text-blue-600" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Alert Queue</h1>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} alerts · {ALERTS.filter(a => a.status === "Open").length} open</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input placeholder="Search alerts..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-8 py-1.5 text-xs" />
          </div>
          <Select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="text-xs py-1.5">
            <option value="">All Statuses</option>
            {["Open", "In Review", "Escalated", "Closed", "False Positive"].map(s => <option key={s}>{s}</option>)}
          </Select>
          <Select value={filterPriority} onChange={e => { setFilterPriority(e.target.value); setPage(1); }} className="text-xs py-1.5">
            <option value="">All Priorities</option>
            {["Critical", "High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
          </Select>
          <Select value={filterSource} onChange={e => { setFilterSource(e.target.value); setPage(1); }} className="text-xs py-1.5">
            <option value="">All Sources</option>
            {["KYC", "Transaction Monitoring", "Sanctions Screening", "PEP Screening", "Adverse Media", "Fraud", "Chargeback", "Manual Review"].map(s => <option key={s}>{s}</option>)}
          </Select>
          <Select value={filterAssigned} onChange={e => { setFilterAssigned(e.target.value); setPage(1); }} className="text-xs py-1.5">
            <option value="">All Analysts</option>
            {analysts.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
          </Select>
          <Select value={filterSLABreached} onChange={e => { setFilterSLABreached(e.target.value); setPage(1); }} className="text-xs py-1.5">
            <option value="">All SLA</option>
            <option value="yes">SLA Breached</option>
            <option value="no">On Track</option>
          </Select>
          {(search || filterStatus || filterPriority || filterSource || filterAssigned || filterSLABreached) && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setFilterStatus(""); setFilterPriority(""); setFilterSource(""); setFilterAssigned(""); setFilterSLABreached(""); }}>
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {([
                  ["priority", "Priority"],
                  ["id", "Alert ID"],
                  ["customerName", "Customer"],
                  ["type", "Alert Type"],
                  ["source", "Source"],
                  ["riskScore", "Risk Score"],
                  ["status", "Status"],
                  ["assignedTo", "Assigned To"],
                  ["createdDate", "Created"],
                  ["slaDue", "SLA Due"],
                  [null, "Actions"],
                ] as [SortKey, string][]).map(([key, label]) => (
                  <th
                    key={label}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                    onClick={() => key && toggleSort(key)}
                  >
                    <div className={`flex items-center gap-1 ${key ? "cursor-pointer hover:text-slate-700" : ""}`}>
                      {label}
                      {key && <SortIcon k={key} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.map(alert => {
                const overdue = isOverdue(alert.slaDue);
                const daysLeft = getDaysUntilDue(alert.slaDue);
                return (
                  <tr key={alert.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3"><PriorityBadge priority={alert.priority ?? "Low"} /></td>
                    <td className="px-4 py-3">
                      <Link href={`/alerts/${alert.id}`} className="font-mono text-xs text-blue-600 hover:underline font-medium">{alert.id}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/customers/${alert.customerId}`} className="text-slate-900 hover:text-blue-600 font-medium whitespace-nowrap">{alert.customerName}</Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-[160px] truncate">{alert.type}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-600 whitespace-nowrap">{alert.source}</span>
                    </td>
                    <td className="px-4 py-3"><RiskBadge score={alert.riskScore} /></td>
                    <td className="px-4 py-3"><StatusBadge status={alert.status} /></td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-600 whitespace-nowrap">{alert.assignedTo ?? "Unassigned"}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(alert.createdDate)}</td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-1 text-xs whitespace-nowrap ${overdue ? "text-red-600 font-semibold" : daysLeft <= 2 ? "text-amber-600 font-medium" : "text-slate-500"}`}>
                        {overdue && <AlertTriangle className="w-3 h-3" />}
                        {formatDate(alert.slaDue)}
                        {overdue && <span>(overdue)</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/alerts/${alert.id}`}>
                          <Button variant="ghost" size="sm" className="p-1.5"><Eye className="w-3.5 h-3.5" /></Button>
                        </Link>
                        {alert.status === "Open" && (
                          <>
                            <Button variant="ghost" size="sm" className="p-1.5" title="Assign"><UserPlus className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="sm" className="p-1.5" title="Escalate to Case"><GitBranch className="w-3.5 h-3.5 text-orange-500" /></Button>
                            <Button variant="ghost" size="sm" className="p-1.5" title="Close Alert"><XCircle className="w-3.5 h-3.5 text-slate-400" /></Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
            {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
              const p = i + 1;
              return (
                <Button key={p} variant={page === p ? "primary" : "outline"} size="sm" onClick={() => setPage(p)}>{p}</Button>
              );
            })}
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount}>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
