"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle, XCircle, FileText } from "lucide-react";

// ─── Advance SAR (Pending → Recommended) ─────────────────────────────────────

export function AdvanceSARModal({ sarId, onClose }: { sarId: string | null; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const sar = state.sarReviews.find(s => s.id === sarId);

  if (!sarId || !sar) return null;

  function handleSubmit() {
    if (!sarId) return;
    dispatch({ type: "ADVANCE_SAR", sarId });
    onClose();
  }

  return (
    <Modal isOpen={!!sarId} onClose={onClose} title={`Advance SAR — ${sarId}`}>
      <div className="space-y-4">
        <div className="p-3 rounded bg-slate-50 border border-slate-100 text-sm space-y-1">
          <div className="font-medium text-slate-900">{sar.customerName}</div>
          <div className="text-xs text-slate-500">Amount: {formatCurrency(sar.amount)} · Deadline: {formatDate(sar.sarDeadline)}</div>
          {sar.narrative && <div className="text-xs text-slate-600 mt-2 italic">&ldquo;{sar.narrative.slice(0, 120)}&hellip;&rdquo;</div>}
        </div>
        <p className="text-sm text-slate-700">Move this SAR from <strong>Pending Review</strong> to <strong>SAR Recommended</strong> and forward to the BSA Officer for final decision?</p>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Recommend SAR</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Approve SAR ──────────────────────────────────────────────────────────────

export function ApproveSARModal({ sarId, onClose }: { sarId: string | null; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const sar = state.sarReviews.find(s => s.id === sarId);
  const [rationale, setRationale] = useState("");

  if (!sarId || !sar) return null;

  function handleSubmit() {
    if (!rationale.trim() || !sarId) return;
    dispatch({ type: "APPROVE_SAR", sarId, rationale: rationale.trim() });
    setRationale("");
    onClose();
  }

  return (
    <Modal isOpen={!!sarId} onClose={onClose} title={`Approve SAR — ${sarId}`} className="max-w-lg">
      <div className="space-y-4">
        <div className="flex gap-3 p-3 rounded bg-green-50 border border-green-200">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-green-900">{sar.customerName}</div>
            <div className="text-green-700 text-xs mt-0.5">Amount: {formatCurrency(sar.amount)} · Deadline: {formatDate(sar.sarDeadline)}</div>
            <div className="text-green-700 text-xs">Recommended by: {sar.recommendedBy}</div>
          </div>
        </div>
        {sar.narrative && (
          <div className="p-3 rounded bg-slate-50 border border-slate-100 text-xs text-slate-700 italic">
            &ldquo;{sar.narrative}&rdquo;
          </div>
        )}
        <div>
          <label className="text-xs font-medium text-slate-600">BSA Officer Rationale <span className="text-red-500">*</span></label>
          <textarea
            rows={3}
            value={rationale}
            onChange={e => setRationale(e.target.value)}
            placeholder="Provide the basis for approving this SAR recommendation..."
            className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-xs text-blue-800">
          Approving this SAR will authorize FinCEN filing. As BSA Officer, your decision is recorded in the audit log.
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!rationale.trim()}>
            <CheckCircle className="w-3.5 h-3.5" /> Approve SAR
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Decline SAR ──────────────────────────────────────────────────────────────

export function DeclineSARModal({ sarId, onClose }: { sarId: string | null; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const sar = state.sarReviews.find(s => s.id === sarId);
  const [rationale, setRationale] = useState("");

  if (!sarId || !sar) return null;

  function handleSubmit() {
    if (!rationale.trim() || !sarId) return;
    dispatch({ type: "DECLINE_SAR", sarId, rationale: rationale.trim() });
    setRationale("");
    onClose();
  }

  return (
    <Modal isOpen={!!sarId} onClose={onClose} title={`Decline SAR — ${sarId}`}>
      <div className="space-y-4">
        <div className="flex gap-3 p-3 rounded bg-red-50 border border-red-200">
          <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-red-900">{sar.customerName}</div>
            <div className="text-red-700 text-xs mt-0.5">Recommended by: {sar.recommendedBy}</div>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Rationale for Declining <span className="text-red-500">*</span></label>
          <textarea
            rows={3}
            value={rationale}
            onChange={e => setRationale(e.target.value)}
            placeholder="Explain why this SAR recommendation is being declined..."
            className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <p className="text-xs text-slate-500">The case will be returned for further investigation or closure.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={handleSubmit} disabled={!rationale.trim()}>
            <XCircle className="w-3.5 h-3.5" /> Decline SAR
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── File SAR ─────────────────────────────────────────────────────────────────

export function FileSARModal({ sarId, onClose }: { sarId: string | null; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const sar = state.sarReviews.find(s => s.id === sarId);
  const [filingRef, setFilingRef] = useState(() => `FinCEN-2026-${Math.floor(10000 + Math.random() * 90000)}`);
  const [continuingSar, setContinuingSar] = useState(false);
  const [continuingSarDate, setContinuingSarDate] = useState("");

  if (!sarId || !sar) return null;

  function handleSubmit() {
    if (!filingRef.trim() || !sarId) return;
    dispatch({
      type: "FILE_SAR",
      sarId,
      filingRef: filingRef.trim(),
      continuingSarDate: continuingSar ? continuingSarDate : undefined,
    });
    onClose();
  }

  return (
    <Modal isOpen={!!sarId} onClose={onClose} title={`File SAR with FinCEN — ${sarId}`} className="max-w-lg">
      <div className="space-y-4">
        <div className="flex gap-3 p-3 rounded bg-blue-50 border border-blue-200">
          <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-blue-900">{sar.customerName}</div>
            <div className="text-blue-700 text-xs mt-0.5">Amount: {formatCurrency(sar.amount)}</div>
            <div className="text-blue-700 text-xs">Approved by: {sar.finalDecisionMaker}</div>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">FinCEN BSA-E Filing Reference <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={filingRef}
            onChange={e => setFilingRef(e.target.value)}
            className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={continuingSar}
              onChange={e => setContinuingSar(e.target.checked)}
              className="rounded"
            />
            This is a continuing activity SAR (90-day review required)
          </label>
        </div>
        {continuingSar && (
          <div>
            <label className="text-xs font-medium text-slate-600">Continuing SAR Review Date</label>
            <input
              type="date"
              value={continuingSarDate}
              onChange={e => setContinuingSarDate(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-xs text-amber-800">
          This will mark the SAR as <strong>Filed</strong> in RiskOps OS. Ensure the filing reference matches the FinCEN BSA-E system.
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!filingRef.trim()}>
            <FileText className="w-3.5 h-3.5" /> Confirm Filed
          </Button>
        </div>
      </div>
    </Modal>
  );
}
