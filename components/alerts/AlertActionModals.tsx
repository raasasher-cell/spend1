"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { USERS } from "@/lib/mock-data";
import { Priority } from "@/lib/mock-data";

const analysts = USERS.filter(u => ["Analyst", "Senior Investigator", "Compliance Manager"].includes(u.role));

// ─── Assign Alert ─────────────────────────────────────────────────────────────

interface AssignAlertModalProps {
  alertId: string | null;
  onClose: () => void;
}

export function AssignAlertModal({ alertId, onClose }: AssignAlertModalProps) {
  const { state, dispatch } = useStore();
  const alert = state.alerts.find(a => a.id === alertId);
  const [assignee, setAssignee] = useState(alert?.assignedTo ?? "");

  if (!alertId || !alert) return null;

  function handleSubmit() {
    if (!assignee || !alertId) return;
    dispatch({ type: "ASSIGN_ALERT", alertId, assignee });
    onClose();
  }

  return (
    <Modal isOpen={!!alertId} onClose={onClose} title={`Assign Alert — ${alertId}`}>
      <div className="space-y-4">
        <div>
          <p className="text-xs text-slate-500 mb-3">{alert.type} · {alert.customerName}</p>
          <label className="text-xs font-medium text-slate-600">Assign To</label>
          <Select className="mt-1 w-full" value={assignee} onChange={e => setAssignee(e.target.value)}>
            <option value="">Select analyst…</option>
            {analysts.map(u => (
              <option key={u.id} value={u.name}>{u.name} — {u.role}</option>
            ))}
          </Select>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!assignee}>Assign</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Close Alert ──────────────────────────────────────────────────────────────

interface CloseAlertModalProps {
  alertId: string | null;
  onClose: () => void;
}

export function CloseAlertModal({ alertId, onClose }: CloseAlertModalProps) {
  const { state, dispatch } = useStore();
  const alert = state.alerts.find(a => a.id === alertId);
  const [reason, setReason] = useState("");

  if (!alertId || !alert) return null;

  function handleSubmit() {
    if (!reason.trim() || !alertId) return;
    dispatch({ type: "CLOSE_ALERT", alertId, reason: reason.trim() });
    onClose();
    setReason("");
  }

  return (
    <Modal isOpen={!!alertId} onClose={onClose} title={`Close Alert — ${alertId}`}>
      <div className="space-y-4">
        <p className="text-xs text-slate-500">{alert.type} · {alert.customerName}</p>
        <div>
          <label className="text-xs font-medium text-slate-600">Closure Reason <span className="text-red-500">*</span></label>
          <Select className="mt-1 w-full" value={reason} onChange={e => setReason(e.target.value)}>
            <option value="">Select a reason…</option>
            <option value="Risk acceptable after review">Risk acceptable after review</option>
            <option value="Customer explanation verified">Customer explanation verified</option>
            <option value="Duplicate alert">Duplicate alert</option>
            <option value="No suspicious activity found">No suspicious activity found</option>
            <option value="Escalated to case — closing alert">Escalated to case — closing alert</option>
            <option value="Account closed — no further action required">Account closed — no further action required</option>
            <option value="Other — see notes">Other — see notes</option>
          </Select>
        </div>
        <div className="flex items-center gap-2 p-3 rounded bg-amber-50 border border-amber-200 text-xs text-amber-800">
          This action is permanent and will be recorded in the audit log.
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!reason}>Close Alert</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── False Positive Alert ─────────────────────────────────────────────────────

interface FalsePositiveAlertModalProps {
  alertId: string | null;
  onClose: () => void;
}

export function FalsePositiveAlertModal({ alertId, onClose }: FalsePositiveAlertModalProps) {
  const { state, dispatch } = useStore();
  const alert = state.alerts.find(a => a.id === alertId);
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");

  if (!alertId || !alert) return null;

  function handleSubmit() {
    if (!reason || !alertId) return;
    dispatch({
      type: "FALSE_POSITIVE_ALERT",
      alertId,
      reason: detail ? `${reason}. ${detail}` : reason,
    });
    onClose();
    setReason("");
    setDetail("");
  }

  return (
    <Modal isOpen={!!alertId} onClose={onClose} title={`Mark False Positive — ${alertId}`}>
      <div className="space-y-4">
        <p className="text-xs text-slate-500">{alert.type} · {alert.customerName} · Risk Score: {alert.riskScore}</p>
        <div>
          <label className="text-xs font-medium text-slate-600">Reason <span className="text-red-500">*</span></label>
          <Select className="mt-1 w-full" value={reason} onChange={e => setReason(e.target.value)}>
            <option value="">Select a reason…</option>
            <option value="Name match — different individual confirmed">Name match — different individual confirmed</option>
            <option value="Model calibration error">Model calibration error</option>
            <option value="Expected business activity">Expected business activity</option>
            <option value="Customer provided satisfactory explanation">Customer provided satisfactory explanation</option>
            <option value="Transaction volume within expected range">Transaction volume within expected range</option>
            <option value="Screening match confirmed as different entity">Screening match confirmed as different entity</option>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Additional Detail (optional)</label>
          <textarea
            rows={2}
            value={detail}
            onChange={e => setDetail(e.target.value)}
            placeholder="Any supporting notes..."
            className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!reason}>Mark False Positive</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Escalate Alert to Case ───────────────────────────────────────────────────

interface EscalateToCaseModalProps {
  alertId: string | null;
  onClose: () => void;
}

export function EscalateToCaseModal({ alertId, onClose }: EscalateToCaseModalProps) {
  const { state, dispatch } = useStore();
  const alert = state.alerts.find(a => a.id === alertId);
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>(alert?.priority ?? "High");
  const [assignedTo, setAssignedTo] = useState(alert?.assignedTo ?? analysts[0]?.name ?? "");

  if (!alertId || !alert) return null;

  function handleSubmit() {
    if (!description.trim() || !assignedTo || !alertId) return;
    dispatch({
      type: "ESCALATE_ALERT_TO_CASE",
      alertId,
      description: description.trim(),
      priority,
      assignedTo,
    });
    onClose();
    setDescription("");
  }

  return (
    <Modal isOpen={!!alertId} onClose={onClose} title={`Escalate to Case — ${alertId}`} className="max-w-lg">
      <div className="space-y-4">
        <div className="p-3 rounded bg-slate-50 border border-slate-100 text-xs">
          <div className="font-medium text-slate-700">{alert.type}</div>
          <div className="text-slate-500 mt-0.5">{alert.customerName} · {alert.source} · Risk Score: {alert.riskScore}</div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Case Description <span className="text-red-500">*</span></label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the investigation scope and reason for escalation..."
            className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600">Priority</label>
            <Select className="mt-1 w-full" value={priority} onChange={e => setPriority(e.target.value as Priority)}>
              {(["Critical", "High", "Medium", "Low"] as Priority[]).map(p => (
                <option key={p}>{p}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Assign To</label>
            <Select className="mt-1 w-full" value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
              {analysts.map(u => (
                <option key={u.id} value={u.name}>{u.name}</option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!description.trim() || !assignedTo}>
            Create Case
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Change Status Modal ──────────────────────────────────────────────────────

interface ChangeStatusModalProps {
  alertId: string | null;
  onClose: () => void;
}

export function ChangeStatusModal({ alertId, onClose }: ChangeStatusModalProps) {
  const { state, dispatch } = useStore();
  const alert = state.alerts.find(a => a.id === alertId);
  const [status, setStatus] = useState(alert?.status ?? "Open");

  if (!alertId || !alert) return null;

  function handleSubmit() {
    if (!alertId) return;
    dispatch({ type: "CHANGE_ALERT_STATUS", alertId, status: status as Parameters<typeof dispatch>[0] extends { type: "CHANGE_ALERT_STATUS" } ? Parameters<typeof dispatch>[0]["status"] : never });
    onClose();
  }

  return (
    <Modal isOpen={!!alertId} onClose={onClose} title={`Change Status — ${alertId}`}>
      <div className="space-y-4">
        <p className="text-xs text-slate-500">{alert.type} · {alert.customerName}</p>
        <div>
          <label className="text-xs font-medium text-slate-600">New Status</label>
          <Select className="mt-1 w-full" value={status} onChange={e => setStatus(e.target.value as typeof status)}>
            {["Open", "In Review", "Escalated"].map(s => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Update Status</Button>
        </div>
      </div>
    </Modal>
  );
}
