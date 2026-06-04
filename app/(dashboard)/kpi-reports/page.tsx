"use client";
import { KPI_DATA } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid
} from "recharts";

const COLORS = ["#3b82f6", "#f97316", "#eab308", "#22c55e", "#ef4444", "#8b5cf6"];

export default function KPIReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">KPI Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">Compliance performance metrics · June 2026</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Alerts by Source */}
        <Card>
          <CardHeader><CardTitle>Alerts by Source</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={KPI_DATA.alertsBySource} margin={{ left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alerts by Priority */}
        <Card>
          <CardHeader><CardTitle>Alerts by Priority</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={KPI_DATA.alertsByPriority} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value">
                  {KPI_DATA.alertsByPriority.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend iconSize={10} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cases by Status */}
        <Card>
          <CardHeader><CardTitle>Cases by Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={KPI_DATA.casesByStatus} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {KPI_DATA.casesByStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* KYC Rates */}
        <Card>
          <CardHeader><CardTitle>KYC Approval / Review / Rejection Rate</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={KPI_DATA.kycRates} cx="50%" cy="50%" outerRadius={85} dataKey="value">
                  {KPI_DATA.kycRates.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend iconSize={10} />
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Average Alert Closure Time */}
        <Card>
          <CardHeader><CardTitle>Average Alert Closure Time (Days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={KPI_DATA.avgClosureTime} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="days" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* SAR by Month */}
        <Card>
          <CardHeader><CardTitle>SAR Recommendations by Month</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={KPI_DATA.sarByMonth} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="recommended" fill="#f97316" radius={[3, 3, 0, 0]} name="Recommended" />
                <Bar dataKey="filed" fill="#22c55e" radius={[3, 3, 0, 0]} name="Filed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* SLA Breach Rate by Analyst */}
        <Card>
          <CardHeader><CardTitle>SLA Breach Rate by Analyst (%)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={KPI_DATA.slaByAnalyst} layout="vertical" margin={{ left: 30, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 20]} unit="%" />
                <YAxis type="category" dataKey="analyst" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="breachRate" fill="#ef4444" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Screening False Positive Rate */}
        <Card>
          <CardHeader><CardTitle>Screening False Positive Rate by Source (%)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={KPI_DATA.falsePositiveRate} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="source" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="rate" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
