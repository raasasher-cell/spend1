"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Lock, User, Key } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader><CardTitle><User className="w-4 h-4 inline mr-2" />Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600">First Name</label>
              <Input className="mt-1" defaultValue="Sarah" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Last Name</label>
              <Input className="mt-1" defaultValue="Chen" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Email</label>
            <Input className="mt-1" defaultValue="s.chen@riskops.io" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Role</label>
            <Input className="mt-1" defaultValue="BSA Officer" disabled />
          </div>
          <Button variant="primary" size="sm">Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle><Bell className="w-4 h-4 inline mr-2" />Notifications</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: "Critical alert assigned to me", enabled: true },
              { label: "SAR review action required", enabled: true },
              { label: "SLA breach warnings", enabled: true },
              { label: "Case status changes", enabled: false },
              { label: "Weekly KPI summary email", enabled: true },
              { label: "System maintenance notices", enabled: false },
            ].map(({ label, enabled }) => (
              <div key={label} className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-700">{label}</span>
                <div className={`w-10 h-5 rounded-full ${enabled ? "bg-blue-600" : "bg-slate-200"} relative cursor-pointer`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle><Lock className="w-4 h-4 inline mr-2" />Security</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600">Current Password</label>
            <Input type="password" className="mt-1" placeholder="••••••••" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">New Password</label>
            <Input type="password" className="mt-1" placeholder="••••••••" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Confirm New Password</label>
            <Input type="password" className="mt-1" placeholder="••••••••" />
          </div>
          <Button variant="primary" size="sm">Update Password</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle><Key className="w-4 h-4 inline mr-2" />API Access</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-500">API keys for read-only data access by authorized bank partners.</p>
          <div className="p-3 bg-slate-50 rounded-lg font-mono text-xs text-slate-600 border border-slate-200">
            riskops_live_sk_••••••••••••••••••••••••4a2f
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Reveal Key</Button>
            <Button variant="outline" size="sm">Regenerate</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
