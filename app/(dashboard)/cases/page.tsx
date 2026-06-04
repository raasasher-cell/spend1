"use client";
import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { StatusBadge, PriorityBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Search, Eye } from "lucide-react";
import Link from "next/link";

export default function CasesPage() {
  const { state } = useStore();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const filtered = useMemo(() => state.cases.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.id.toLowerCase().includes(q) || c.customerName.toLowerCase().includes(q);
    const matchStatus = !filterStatus || c.status === filterStatus;
    const matchPriority = !filterPriority || c.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  }), [state.cases, search, filterStatus, filterPriority]);

  const activeCount = state.cases.filter(c => c.status !== "Closed").length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Cases</h1>
        <p className="text-sm text-slate-500 mt-0.5">{filtered.length} cases · {activeCount} active</p>
      </div>
      <Card>
        <div className="px-4 py-3 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input placeholder="Search cases..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 py-1.5 text-xs" />
          </div>
          <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-xs py-1.5">
            <option value="">All Statuses</option>
            {["Open", "In Review", "Pending EDD", "Escalated", "SAR Review", "Closed"].map(s => <option key={s}>{s}</option>)}
          </Select>
          <Select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="text-xs py-1.5">
            <option value="">All Priorities</option>
            {["Critical", "High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
          </Select>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Case ID", "Customer", "Status", "Priority", "Assigned To", "Alerts", "SAR Status", "Created", "Updated", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/cases/${c.id}`} className="font-mono text-xs text-blue-600 font-medium hover:underline">{c.id}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/customers/${c.customerId}`} className="font-medium text-slate-900 hover:text-blue-600 text-sm">{c.customerName}</Link>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                  <td className="px-4 py-3 text-xs text-slate-600">{c.assignedTo}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-700">{c.alertIds.length}</td>
                  <td className="px-4 py-3">{c.sarStatus ? <StatusBadge status={c.sarStatus} /> : <span className="text-xs text-slate-400">—</span>}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(c.createdDate)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(c.updatedDate)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/cases/${c.id}`}><Button variant="ghost" size="sm" className="p-1.5"><Eye className="w-3.5 h-3.5" /></Button></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
