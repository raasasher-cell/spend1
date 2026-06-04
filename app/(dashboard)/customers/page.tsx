"use client";
import { useState, useMemo } from "react";
import { CUSTOMERS } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, Eye } from "lucide-react";
import Link from "next/link";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterRisk, setFilterRisk] = useState("");
  const [filterKYC, setFilterKYC] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filtered = useMemo(() => {
    return CUSTOMERS.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
      const matchType = !filterType || c.type === filterType;
      const matchRisk = !filterRisk || c.riskRating === filterRisk;
      const matchKYC = !filterKYC || c.kycStatus === filterKYC;
      const matchStatus = !filterStatus || c.status === filterStatus;
      return matchSearch && matchType && matchRisk && matchKYC && matchStatus;
    });
  }, [search, filterType, filterRisk, filterKYC, filterStatus]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Customers</h1>
        <p className="text-sm text-slate-500 mt-0.5">{filtered.length} customers</p>
      </div>

      <Card>
        <div className="px-4 py-3 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 py-1.5 text-xs" />
          </div>
          <Select value={filterType} onChange={e => setFilterType(e.target.value)} className="text-xs py-1.5">
            <option value="">All Types</option>
            {["Individual", "Small Business", "Remittance", "Card Program"].map(t => <option key={t}>{t}</option>)}
          </Select>
          <Select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className="text-xs py-1.5">
            <option value="">All Risk Ratings</option>
            {["Critical", "High", "Medium", "Low"].map(r => <option key={r}>{r}</option>)}
          </Select>
          <Select value={filterKYC} onChange={e => setFilterKYC(e.target.value)} className="text-xs py-1.5">
            <option value="">All KYC Statuses</option>
            {["Approved", "Manual Review", "Pending", "Rejected"].map(k => <option key={k}>{k}</option>)}
          </Select>
          <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-xs py-1.5">
            <option value="">All Statuses</option>
            {["Active", "Suspended", "Closed", "Restricted"].map(s => <option key={s}>{s}</option>)}
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Customer", "Type", "Status", "Risk Rating", "KYC", "Screening", "Open Alerts", "Open Cases", "Total Volume", "Last Txn", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold shrink-0">
                        {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <Link href={`/customers/${c.id}`} className="font-medium text-slate-900 hover:text-blue-600">{c.name}</Link>
                        <p className="text-[10px] text-slate-400">{c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{c.type}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3"><StatusBadge status={c.riskRating} /></td>
                  <td className="px-4 py-3"><StatusBadge status={c.kycStatus} /></td>
                  <td className="px-4 py-3"><StatusBadge status={c.screeningStatus} /></td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-semibold ${c.openAlerts > 0 ? "text-red-600" : "text-slate-400"}`}>{c.openAlerts}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-semibold ${c.openCases > 0 ? "text-orange-600" : "text-slate-400"}`}>{c.openCases}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-700">{formatCurrency(c.totalVolume)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDate(c.lastTransaction)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/customers/${c.id}`}><Button variant="ghost" size="sm" className="p-1.5"><Eye className="w-3.5 h-3.5" /></Button></Link>
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
