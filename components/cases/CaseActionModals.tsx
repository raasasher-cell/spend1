"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { USERS } from "@/lib/mock-data";
import { CaseNote } from "@/lib/mock-data";

const escalationTargets = USERS.filter(u =>
  ["Senior Investigator", "Compliance Manager", "BSA Officer"].includes(u.role)
);

// ─── Add Note Modal ───────────────────────────────────────────────────────────

export function AddNoteModal({ caseId, onClose }: { caseId: string | null; onClose: () => void }) {
  const { dispatch } = useStore();
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState<CaseNote["type"]>("Note");

  if (!caseId) return null;

  function handleSubmit() {
    if (!content.trim() || !caseId) return;
    dispatch({ type: "ADD_CASE_NOTE", caseId, content: content.trim(), noteType });
    setContent("");
    setNoteType("Note");
    onClose();
  }

  return (
    <Modal isOpen={!!caseId} onClose={onClose} title="Add Investigation Note">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-600">Note Type</label>
          <Select className="mt-1 w-full" value={noteType} onChange={e => setNoteType(e.target.value as CaseNote["type"])}>
            {(["Note", "Escalation", "EDD Request", "SAR Recommendation", "Status Change"] as CaseNote["type"][]).map(t => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Content <span className="text-red-500">*</span></label>
          <textarea
            rows={4}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Document your findings, actions taken, or observations..."
            className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!content.trim()}>Save Note</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Request EDD Modal ────────────────────────────────────────────────────────

export function RequestEDDModal({ caseId, onClose }: { caseId: string | null; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const c = state.cases.find(cs => cs.id === caseId);
  const [note, setNote] = useState("");
  const [docList, setDocList] = useState<string[]>([]);

  const documentOptions = [
    "Source of funds declaration",
    "Bank statements (12 months)",
    "Business registration documents",
    "Beneficial ownership structure",
    "Tax returns",
    "Corporate resolutions",
    "Audited financial statements",
    "Customer reference letters",
  ];

  if (!caseId || !c) return null;

  function handleSubmit() {
    if (!caseId) return;
    const docNote = docList.length > 0 ? ` Documents requested: ${docList.join(", ")}.` : "";
    dispatch({ type: "REQUEST_EDD", caseId, note: (note.trim() + docNote).trim() || "EDD documentation requested." });
    setNote("");
    setDocList([]);
    onClose();
  }

  function toggleDoc(doc: string) {
    setDocList(prev => prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc]);
  }

  return (
    <Modal isOpen={!!caseId} onClose={onClose} title={`Request EDD — ${caseId}`} className="max-w-lg">
      <div className="space-y-4">
        <p className="text-xs text-slate-500">{c.customerName} · {c.customerName}</p>
        <div>
          <label className="text-xs font-medium text-slate-600">Documents to Request</label>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {documentOptions.map(doc => (
              <label key={doc} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200">
                <input
                  type="checkbox"
                  checked={docList.includes(doc)}
                  onChange={() => toggleDoc(doc)}
                  className="rounded"
                />
                {doc}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Additional Context</label>
          <textarea
            rows={2}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Reason for EDD or additional instructions..."
            className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Submit EDD Request</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Escalate Case Modal ──────────────────────────────────────────────────────

export function EscalateCaseModal({ caseId, onClose }: { caseId: string | null; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const c = state.cases.find(cs => cs.id === caseId);
  const [escalateTo, setEscalateTo] = useState(escalationTargets[0]?.name ?? "");
  const [note, setNote] = useState("");

  if (!caseId || !c) return null;

  function handleSubmit() {
    if (!escalateTo || !caseId) return;
    dispatch({ type: "ESCALATE_CASE", caseId, escalateTo, note: note.trim() || "Case escalated." });
    setNote("");
    onClose();
  }

  return (
    <Modal isOpen={!!caseId} onClose={onClose} title={`Escalate Case — ${caseId}`}>
      <div className="space-y-4">
        <p className="text-xs text-slate-500">{c.customerName} · Currently assigned to {c.assignedTo}</p>
        <div>
          <label className="text-xs font-medium text-slate-600">Escalate To <span className="text-red-500">*</span></label>
          <Select className="mt-1 w-full" value={escalateTo} onChange={e => setEscalateTo(e.target.value)}>
            {escalationTargets.map(u => (
              <option key={u.id} value={u.name}>{u.name} — {u.role}</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Escalation Reason</label>
          <textarea
            rows={3}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Explain why this case is being escalated..."
            className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Escalate Case</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Recommend SAR Modal ──────────────────────────────────────────────────────

export function RecommendSARModal({ caseId, onClose }: { caseId: string | null; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const c = state.cases.find(cs => cs.id === caseId);
  const [narrative, setNarrative] = useState("");
  const [amount, setAmount] = useState("");

  if (!caseId || !c) return null;

  function handleSubmit() {
    if (!narrative.trim() || !caseId) return;
    dispatch({
      type: "RECOMMEND_SAR",
      caseId,
      narrative: narrative.trim(),
      amount: parseFloat(amount) || 0,
    });
    setNarrative("");
    setAmount("");
    onClose();
  }

  return (
    <Modal isOpen={!!caseId} onClose={onClose} title={`Recommend SAR — ${caseId}`} className="max-w-lg">
      <div className="space-y-4">
        <div className="p-3 rounded bg-amber-50 border border-amber-200 text-xs text-amber-800">
          <strong>BSA Requirement:</strong> A SAR must be filed within 30 days of detection of suspicious activity (or 60 days if no suspect is identified). This recommendation will be forwarded to the BSA Officer for final decision.
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Suspicious Amount (USD)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">SAR Narrative <span className="text-red-500">*</span></label>
          <textarea
            rows={5}
            value={narrative}
            onChange={e => setNarrative(e.target.value)}
            placeholder="Describe the suspicious activity, why it is suspicious, who is involved, how it was conducted, and what action was taken..."
            className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <p className="text-[10px] text-slate-400 mt-1">{narrative.length} characters</p>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!narrative.trim()}>
            Submit SAR Recommendation
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Close Case Modal ─────────────────────────────────────────────────────────

export function CloseCaseModal({ caseId, onClose }: { caseId: string | null; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const c = state.cases.find(cs => cs.id === caseId);
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");

  if (!caseId || !c) return null;

  function handleSubmit() {
    if (!reason || !caseId) return;
    dispatch({ type: "CLOSE_CASE", caseId, reason: detail ? `${reason}. ${detail.trim()}` : reason });
    setReason("");
    setDetail("");
    onClose();
  }

  return (
    <Modal isOpen={!!caseId} onClose={onClose} title={`Close Case — ${caseId}`}>
      <div className="space-y-4">
        <p className="text-xs text-slate-500">{c.customerName} · {c.alertIds.length} linked alerts</p>
        <div>
          <label className="text-xs font-medium text-slate-600">Closure Reason <span className="text-red-500">*</span></label>
          <Select className="mt-1 w-full" value={reason} onChange={e => setReason(e.target.value)}>
            <option value="">Select a reason…</option>
            <option value="No suspicious activity found after investigation">No suspicious activity found after investigation</option>
            <option value="SAR filed — case closed">SAR filed — case closed</option>
            <option value="SAR declined — risk acceptable">SAR declined — risk acceptable</option>
            <option value="Customer account closed">Customer account closed</option>
            <option value="EDD received — risk mitigated">EDD received — risk mitigated</option>
            <option value="Law enforcement referral made">Law enforcement referral made</option>
            <option value="Duplicate case">Duplicate case</option>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Additional Notes</label>
          <textarea
            rows={2}
            value={detail}
            onChange={e => setDetail(e.target.value)}
            placeholder="Any additional context for the closure..."
            className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded bg-amber-50 border border-amber-200 text-xs text-amber-800">
          This will permanently close the case and all linked alerts. This action is recorded in the audit log.
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={handleSubmit} disabled={!reason}>Close Case</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── False Positive Case Modal ────────────────────────────────────────────────

export function FalsePositiveCaseModal({ caseId, onClose }: { caseId: string | null; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const c = state.cases.find(cs => cs.id === caseId);
  const [reason, setReason] = useState("");

  if (!caseId || !c) return null;

  function handleSubmit() {
    if (!reason.trim() || !caseId) return;
    dispatch({ type: "FALSE_POSITIVE_CASE", caseId, reason: reason.trim() });
    setReason("");
    onClose();
  }

  return (
    <Modal isOpen={!!caseId} onClose={onClose} title={`Mark False Positive — ${caseId}`}>
      <div className="space-y-4">
        <p className="text-xs text-slate-500">{c.customerName}</p>
        <div>
          <label className="text-xs font-medium text-slate-600">Reason <span className="text-red-500">*</span></label>
          <textarea
            rows={3}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Explain why this case is determined to be a false positive..."
            className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!reason.trim()}>Mark False Positive</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Link Alert to Case Modal ─────────────────────────────────────────────────

export function LinkAlertModal({ caseId, onClose }: { caseId: string | null; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const c = state.cases.find(cs => cs.id === caseId);
  const [selectedAlertId, setSelectedAlertId] = useState("");

  if (!caseId || !c) return null;

  const availableAlerts = state.alerts.filter(
    a => a.customerId === c.customerId && !c.alertIds.includes(a.id) && a.status !== "Closed" && a.status !== "False Positive"
  );

  function handleSubmit() {
    if (!selectedAlertId || !caseId) return;
    dispatch({ type: "LINK_ALERT_TO_CASE", alertId: selectedAlertId, caseId });
    setSelectedAlertId("");
    onClose();
  }

  return (
    <Modal isOpen={!!caseId} onClose={onClose} title={`Link Alert — ${caseId}`}>
      <div className="space-y-4">
        <p className="text-xs text-slate-500">{c.customerName} · {c.alertIds.length} alerts currently linked</p>
        {availableAlerts.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No unlinked alerts available for this customer.</p>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {availableAlerts.map(a => (
              <label key={a.id} className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${selectedAlertId === a.id ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:bg-slate-50"}`}>
                <input
                  type="radio"
                  name="linkAlert"
                  value={a.id}
                  checked={selectedAlertId === a.id}
                  onChange={() => setSelectedAlertId(a.id)}
                  className="mt-0.5"
                />
                <div>
                  <div className="text-xs font-mono text-blue-600">{a.id}</div>
                  <div className="text-xs font-medium text-slate-700">{a.type}</div>
                  <div className="text-[10px] text-slate-400">{a.source} · Risk: {a.riskScore}</div>
                </div>
              </label>
            ))}
          </div>
        )}
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!selectedAlertId}>Link Alert</Button>
        </div>
      </div>
    </Modal>
  );
}
