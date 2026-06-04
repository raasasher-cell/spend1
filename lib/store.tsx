"use client";

import React, {
  createContext, useContext, useReducer, useEffect, useRef, useCallback, ReactNode,
} from "react";
import {
  Alert, Case, SARReview, AuditLogEntry, User, CaseNote,
  AlertStatus, Priority,
  ALERTS as INITIAL_ALERTS,
  CASES as INITIAL_CASES,
  SAR_REVIEWS as INITIAL_SAR_REVIEWS,
  AUDIT_LOG as INITIAL_AUDIT_LOG,
  USERS,
} from "./mock-data";

// ─── Toast ────────────────────────────────────────────────────────────────────

export interface AppToast {
  id: string;
  message: string;
  variant: "success" | "error" | "warning" | "info";
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface AppState {
  alerts: Alert[];
  cases: Case[];
  sarReviews: SARReview[];
  auditLog: AuditLogEntry[];
  toasts: AppToast[];
  currentUser: User;
  loading: boolean;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export type AppAction =
  // Initialization
  | { type: "INITIALIZE"; alerts: Alert[]; cases: Case[]; sarReviews: SARReview[]; auditLog: AuditLogEntry[] }
  // Alert actions
  | { type: "ASSIGN_ALERT"; alertId: string; assignee: string }
  | { type: "CHANGE_ALERT_STATUS"; alertId: string; status: AlertStatus }
  | { type: "CLOSE_ALERT"; alertId: string; reason: string }
  | { type: "FALSE_POSITIVE_ALERT"; alertId: string; reason: string }
  | { type: "ESCALATE_ALERT_TO_CASE"; alertId: string; description: string; priority: Priority; assignedTo: string }
  // Case actions
  | { type: "ADD_CASE_NOTE"; caseId: string; content: string; noteType: CaseNote["type"] }
  | { type: "REQUEST_EDD"; caseId: string; note: string }
  | { type: "ESCALATE_CASE"; caseId: string; escalateTo: string; note: string }
  | { type: "RECOMMEND_SAR"; caseId: string; narrative: string; amount: number }
  | { type: "CLOSE_CASE"; caseId: string; reason: string }
  | { type: "FALSE_POSITIVE_CASE"; caseId: string; reason: string }
  | { type: "LINK_ALERT_TO_CASE"; alertId: string; caseId: string }
  // SAR actions
  | { type: "ADVANCE_SAR"; sarId: string }
  | { type: "APPROVE_SAR"; sarId: string; rationale: string }
  | { type: "DECLINE_SAR"; sarId: string; rationale: string }
  | { type: "FILE_SAR"; sarId: string; filingRef: string; continuingSarDate?: string }
  // UI
  | { type: "ADD_TOAST"; toast: Omit<AppToast, "id"> }
  | { type: "REMOVE_TOAST"; toastId: string }
  | { type: "SET_CURRENT_USER"; user: User };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function today(): string { return "2026-06-04"; }
function nowIso(): string { return new Date().toISOString(); }
function auditId(): string { return `AUD-${Date.now()}-${Math.floor(Math.random() * 999)}`; }
function toastId(): string { return `toast-${Date.now()}-${Math.floor(Math.random() * 999)}`; }
function noteId(): string { return `n-${Date.now()}-${Math.floor(Math.random() * 999)}`; }

function makeAudit(
  user: User, action: string, entityType: AuditLogEntry["entityType"],
  entityId: string, details: string,
  extras?: { previousStatus?: string; newStatus?: string; reason?: string }
): AuditLogEntry {
  return { id: auditId(), timestamp: nowIso(), actor: user.name, actorRole: user.role, action, entityType, entityId, details, ipAddress: "10.0.1.10", ...extras };
}

function makeToast(message: string, variant: AppToast["variant"] = "success"): AppToast {
  return { id: toastId(), message, variant };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: AppAction): AppState {
  const { currentUser } = state;
  const td = today();

  switch (action.type) {

    case "INITIALIZE":
      return { ...state, alerts: action.alerts, cases: action.cases, sarReviews: action.sarReviews, auditLog: action.auditLog, loading: false };

    // ── ALERT ACTIONS ────────────────────────────────────────────────────────

    case "ASSIGN_ALERT": {
      const alert = state.alerts.find(a => a.id === action.alertId);
      if (!alert) return state;
      const prev = alert.assignedTo ?? "Unassigned";
      return {
        ...state,
        alerts: state.alerts.map(a => a.id === action.alertId ? { ...a, assignedTo: action.assignee, status: a.status === "Open" ? "In Review" : a.status } : a),
        auditLog: [makeAudit(currentUser, "Alert Assigned", "Alert", action.alertId, `Alert assigned from ${prev} to ${action.assignee}.`), ...state.auditLog],
        toasts: [...state.toasts, makeToast(`${action.alertId} assigned to ${action.assignee}`)],
      };
    }

    case "CHANGE_ALERT_STATUS": {
      const alert = state.alerts.find(a => a.id === action.alertId);
      if (!alert) return state;
      return {
        ...state,
        alerts: state.alerts.map(a => a.id === action.alertId ? { ...a, status: action.status } : a),
        auditLog: [makeAudit(currentUser, "Alert Status Changed", "Alert", action.alertId, `Status changed from ${alert.status} to ${action.status}.`, { previousStatus: alert.status, newStatus: action.status }), ...state.auditLog],
        toasts: [...state.toasts, makeToast(`Alert status updated to ${action.status}`)],
      };
    }

    case "CLOSE_ALERT": {
      const alert = state.alerts.find(a => a.id === action.alertId);
      if (!alert) return state;
      return {
        ...state,
        alerts: state.alerts.map(a => a.id === action.alertId ? { ...a, status: "Closed" } : a),
        auditLog: [makeAudit(currentUser, "Alert Closed", "Alert", action.alertId, `Alert closed. Reason: ${action.reason}`, { previousStatus: alert.status, newStatus: "Closed", reason: action.reason }), ...state.auditLog],
        toasts: [...state.toasts, makeToast(`${action.alertId} closed`)],
      };
    }

    case "FALSE_POSITIVE_ALERT": {
      const alert = state.alerts.find(a => a.id === action.alertId);
      if (!alert) return state;
      return {
        ...state,
        alerts: state.alerts.map(a => a.id === action.alertId ? { ...a, status: "False Positive" } : a),
        auditLog: [makeAudit(currentUser, "Alert Marked False Positive", "Alert", action.alertId, `Alert marked as false positive. Reason: ${action.reason}`, { previousStatus: alert.status, newStatus: "False Positive", reason: action.reason }), ...state.auditLog],
        toasts: [...state.toasts, makeToast(`${action.alertId} marked as false positive`)],
      };
    }

    case "ESCALATE_ALERT_TO_CASE": {
      const alert = state.alerts.find(a => a.id === action.alertId);
      if (!alert) return state;
      const newCaseId = `CASE-${String(state.cases.length + 1).padStart(3, "0")}`;
      const newCase: Case = {
        id: newCaseId, customerId: alert.customerId, customerName: alert.customerName,
        status: "Open", priority: action.priority, assignedTo: action.assignedTo,
        createdDate: td, updatedDate: td, alertIds: [action.alertId], description: action.description,
        notes: [{ id: noteId(), caseId: newCaseId, author: currentUser.name, content: `Case opened from alert ${action.alertId}. ${action.description}`, timestamp: nowIso(), type: "Escalation" }],
      };
      return {
        ...state,
        alerts: state.alerts.map(a => a.id === action.alertId ? { ...a, status: "Escalated", caseId: newCaseId } : a),
        cases: [newCase, ...state.cases],
        auditLog: [
          makeAudit(currentUser, "Alert Escalated to Case", "Alert", action.alertId, `Alert escalated — new case ${newCaseId} created.`, { previousStatus: alert.status, newStatus: "Escalated" }),
          makeAudit(currentUser, "Case Created", "Case", newCaseId, `Case created from alert ${action.alertId}. Assigned to ${action.assignedTo}.`),
          ...state.auditLog,
        ],
        toasts: [...state.toasts, makeToast(`Alert escalated → ${newCaseId} created`)],
      };
    }

    // ── CASE ACTIONS ─────────────────────────────────────────────────────────

    case "ADD_CASE_NOTE": {
      const c = state.cases.find(c => c.id === action.caseId);
      if (!c) return state;
      const newNote: CaseNote = { id: noteId(), caseId: action.caseId, author: currentUser.name, content: action.content, timestamp: nowIso(), type: action.noteType };
      return {
        ...state,
        cases: state.cases.map(cs => cs.id === action.caseId ? { ...cs, notes: [...cs.notes, newNote], updatedDate: td } : cs),
        auditLog: [makeAudit(currentUser, "Case Note Added", "Case", action.caseId, `${action.noteType} added to case.`), ...state.auditLog],
        toasts: [...state.toasts, makeToast("Note added successfully")],
      };
    }

    case "REQUEST_EDD": {
      const c = state.cases.find(c => c.id === action.caseId);
      if (!c) return state;
      const newNote: CaseNote = { id: noteId(), caseId: action.caseId, author: currentUser.name, content: `EDD requested. ${action.note}`, timestamp: nowIso(), type: "EDD Request" };
      return {
        ...state,
        cases: state.cases.map(cs => cs.id === action.caseId ? { ...cs, status: "Pending EDD", notes: [...cs.notes, newNote], updatedDate: td } : cs),
        auditLog: [makeAudit(currentUser, "EDD Requested", "Case", action.caseId, `Enhanced due diligence requested. ${action.note}`, { previousStatus: c.status, newStatus: "Pending EDD" }), ...state.auditLog],
        toasts: [...state.toasts, makeToast("EDD request submitted — customer notified")],
      };
    }

    case "ESCALATE_CASE": {
      const c = state.cases.find(c => c.id === action.caseId);
      if (!c) return state;
      const newNote: CaseNote = { id: noteId(), caseId: action.caseId, author: currentUser.name, content: `Case escalated to ${action.escalateTo}. ${action.note}`, timestamp: nowIso(), type: "Escalation" };
      return {
        ...state,
        cases: state.cases.map(cs => cs.id === action.caseId ? { ...cs, status: "Escalated", assignedTo: action.escalateTo, notes: [...cs.notes, newNote], updatedDate: td } : cs),
        auditLog: [makeAudit(currentUser, "Case Escalated", "Case", action.caseId, `Case escalated to ${action.escalateTo}. Note: ${action.note}`, { previousStatus: c.status, newStatus: "Escalated" }), ...state.auditLog],
        toasts: [...state.toasts, makeToast(`Case escalated to ${action.escalateTo}`)],
      };
    }

    case "RECOMMEND_SAR": {
      const c = state.cases.find(c => c.id === action.caseId);
      if (!c) return state;
      const newSarId = `SAR-${String(state.sarReviews.length + 1).padStart(3, "0")}`;
      const deadline = new Date("2026-06-04");
      deadline.setDate(deadline.getDate() + 30);
      const newSAR: SARReview = { id: newSarId, caseId: action.caseId, customerId: c.customerId, customerName: c.customerName, detectionDate: td, sarDeadline: deadline.toISOString().slice(0, 10), status: "SAR Recommended", recommendedBy: currentUser.name, amount: action.amount, narrative: action.narrative };
      const newNote: CaseNote = { id: noteId(), caseId: action.caseId, author: currentUser.name, content: `SAR review recommended. ${action.narrative}`, timestamp: nowIso(), type: "SAR Recommendation" };
      return {
        ...state,
        cases: state.cases.map(cs => cs.id === action.caseId ? { ...cs, status: "SAR Review", sarStatus: "SAR Recommended", notes: [...cs.notes, newNote], updatedDate: td } : cs),
        sarReviews: [newSAR, ...state.sarReviews],
        auditLog: [
          makeAudit(currentUser, "SAR Recommended", "Case", action.caseId, `SAR review recommended for ${c.customerName}. Narrative: ${action.narrative.slice(0, 80)}…`, { previousStatus: c.status, newStatus: "SAR Review" }),
          makeAudit(currentUser, "SAR Review Created", "SAR", newSarId, `New SAR review ${newSarId} created for ${c.customerName}.`),
          ...state.auditLog,
        ],
        toasts: [...state.toasts, makeToast(`SAR ${newSarId} created — forwarded to BSA Officer`)],
      };
    }

    case "CLOSE_CASE": {
      const c = state.cases.find(c => c.id === action.caseId);
      if (!c) return state;
      const newNote: CaseNote = { id: noteId(), caseId: action.caseId, author: currentUser.name, content: `Case closed. Reason: ${action.reason}`, timestamp: nowIso(), type: "Status Change" };
      return {
        ...state,
        cases: state.cases.map(cs => cs.id === action.caseId ? { ...cs, status: "Closed", closedDate: td, notes: [...cs.notes, newNote], updatedDate: td } : cs),
        auditLog: [makeAudit(currentUser, "Case Closed", "Case", action.caseId, `Case closed. Reason: ${action.reason}`, { previousStatus: c.status, newStatus: "Closed", reason: action.reason }), ...state.auditLog],
        toasts: [...state.toasts, makeToast("Case closed")],
      };
    }

    case "FALSE_POSITIVE_CASE": {
      const c = state.cases.find(c => c.id === action.caseId);
      if (!c) return state;
      const newNote: CaseNote = { id: noteId(), caseId: action.caseId, author: currentUser.name, content: `Case marked as false positive and closed. Reason: ${action.reason}`, timestamp: nowIso(), type: "Status Change" };
      return {
        ...state,
        cases: state.cases.map(cs => cs.id === action.caseId ? { ...cs, status: "Closed", closedDate: td, notes: [...cs.notes, newNote], updatedDate: td } : cs),
        auditLog: [makeAudit(currentUser, "Case Marked False Positive", "Case", action.caseId, `Case closed as false positive. Reason: ${action.reason}`, { previousStatus: c.status, newStatus: "Closed (False Positive)", reason: action.reason }), ...state.auditLog],
        toasts: [...state.toasts, makeToast("Case marked as false positive and closed")],
      };
    }

    case "LINK_ALERT_TO_CASE": {
      const alert = state.alerts.find(a => a.id === action.alertId);
      const c = state.cases.find(c => c.id === action.caseId);
      if (!alert || !c) return state;
      if (c.alertIds.includes(action.alertId)) {
        return { ...state, toasts: [...state.toasts, makeToast("Alert already linked to this case", "warning")] };
      }
      return {
        ...state,
        alerts: state.alerts.map(a => a.id === action.alertId ? { ...a, caseId: action.caseId, status: "Escalated" } : a),
        cases: state.cases.map(cs => cs.id === action.caseId ? { ...cs, alertIds: [...cs.alertIds, action.alertId], updatedDate: td } : cs),
        auditLog: [makeAudit(currentUser, "Alert Linked to Case", "Case", action.caseId, `Alert ${action.alertId} linked to case ${action.caseId}.`), ...state.auditLog],
        toasts: [...state.toasts, makeToast(`Alert ${action.alertId} linked to ${action.caseId}`)],
      };
    }

    // ── SAR ACTIONS ──────────────────────────────────────────────────────────

    case "ADVANCE_SAR": {
      const sar = state.sarReviews.find(s => s.id === action.sarId);
      if (!sar) return state;
      return {
        ...state,
        sarReviews: state.sarReviews.map(s => s.id === action.sarId ? { ...s, status: "SAR Recommended" } : s),
        auditLog: [makeAudit(currentUser, "SAR Advanced to Recommended", "SAR", action.sarId, `SAR moved from Pending Review to SAR Recommended.`, { previousStatus: sar.status, newStatus: "SAR Recommended" }), ...state.auditLog],
        toasts: [...state.toasts, makeToast("SAR recommended — awaiting BSA Officer decision")],
      };
    }

    case "APPROVE_SAR": {
      const sar = state.sarReviews.find(s => s.id === action.sarId);
      if (!sar) return state;
      return {
        ...state,
        sarReviews: state.sarReviews.map(s => s.id === action.sarId ? { ...s, status: "SAR Approved", finalDecisionMaker: currentUser.name, filingStatus: "Pending Filing" } : s),
        cases: state.cases.map(c => c.id === sar.caseId ? { ...c, sarStatus: "SAR Approved", updatedDate: td } : c),
        auditLog: [makeAudit(currentUser, "SAR Approved", "SAR", action.sarId, `SAR approved by ${currentUser.name}. Rationale: ${action.rationale}`, { previousStatus: sar.status, newStatus: "SAR Approved" }), ...state.auditLog],
        toasts: [...state.toasts, makeToast("SAR approved — ready for FinCEN filing")],
      };
    }

    case "DECLINE_SAR": {
      const sar = state.sarReviews.find(s => s.id === action.sarId);
      if (!sar) return state;
      return {
        ...state,
        sarReviews: state.sarReviews.map(s => s.id === action.sarId ? { ...s, status: "SAR Declined", finalDecisionMaker: currentUser.name } : s),
        cases: state.cases.map(c => c.id === sar.caseId ? { ...c, sarStatus: "SAR Declined", updatedDate: td } : c),
        auditLog: [makeAudit(currentUser, "SAR Declined", "SAR", action.sarId, `SAR declined by ${currentUser.name}. Rationale: ${action.rationale}`, { previousStatus: sar.status, newStatus: "SAR Declined" }), ...state.auditLog],
        toasts: [...state.toasts, makeToast("SAR declined — case returned for further review", "warning")],
      };
    }

    case "FILE_SAR": {
      const sar = state.sarReviews.find(s => s.id === action.sarId);
      if (!sar) return state;
      return {
        ...state,
        sarReviews: state.sarReviews.map(s => s.id === action.sarId ? { ...s, status: "Filed", filingStatus: `Filed with FinCEN — Ref: ${action.filingRef}`, continuingSarDue: action.continuingSarDate } : s),
        cases: state.cases.map(c => c.id === sar.caseId ? { ...c, sarStatus: "Filed", updatedDate: td } : c),
        auditLog: [makeAudit(currentUser, "SAR Filed", "SAR", action.sarId, `SAR filed with FinCEN. Reference: ${action.filingRef}.${action.continuingSarDate ? ` Continuing SAR due: ${action.continuingSarDate}.` : ""}`, { previousStatus: sar.status, newStatus: "Filed" }), ...state.auditLog],
        toasts: [...state.toasts, makeToast(`SAR filed — FinCEN Ref: ${action.filingRef}`)],
      };
    }

    // ── UI ────────────────────────────────────────────────────────────────────

    case "ADD_TOAST":
      return { ...state, toasts: [...state.toasts, { ...action.toast, id: toastId() }] };
    case "REMOVE_TOAST":
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.toastId) };
    case "SET_CURRENT_USER":
      return { ...state, currentUser: action.user };
    default:
      return state;
  }
}

// ─── API sync (fire-and-forget after optimistic update) ───────────────────────

async function syncActionToApi(action: AppAction, state: AppState): Promise<void> {
  const h = { "Content-Type": "application/json" };
  const patch = (url: string, body: object) => fetch(url, { method: "PATCH", headers: h, body: JSON.stringify(body) });
  const post = (url: string, body: object) => fetch(url, { method: "POST", headers: h, body: JSON.stringify(body) });

  switch (action.type) {
    case "ASSIGN_ALERT": {
      const alert = state.alerts.find(a => a.id === action.alertId);
      await patch(`/api/alerts/${action.alertId}`, { assignedTo: action.assignee, status: alert?.status === "Open" ? "In Review" : alert?.status });
      break;
    }
    case "CHANGE_ALERT_STATUS":
      await patch(`/api/alerts/${action.alertId}`, { status: action.status });
      break;
    case "CLOSE_ALERT":
      await patch(`/api/alerts/${action.alertId}`, { status: "Closed", _reason: action.reason });
      break;
    case "FALSE_POSITIVE_ALERT":
      await patch(`/api/alerts/${action.alertId}`, { status: "False Positive", _reason: action.reason });
      break;
    case "ESCALATE_ALERT_TO_CASE": {
      const alert = state.alerts.find(a => a.id === action.alertId);
      if (!alert) break;
      const newCaseId = `CASE-${String(state.cases.length + 1).padStart(3, "0")}`;
      await post("/api/cases", {
        id: newCaseId, customerId: alert.customerId, customerName: alert.customerName,
        status: "Open", priority: action.priority, assignedTo: action.assignedTo,
        createdDate: today(), updatedDate: today(), description: action.description,
      });
      await patch(`/api/alerts/${action.alertId}`, { status: "Escalated", caseId: newCaseId });
      break;
    }
    case "ADD_CASE_NOTE":
      await post(`/api/cases/${action.caseId}/notes`, {
        id: noteId(), caseId: action.caseId, author: state.currentUser.name,
        content: action.content, timestamp: nowIso(), type: action.noteType,
      });
      break;
    case "REQUEST_EDD":
      await patch(`/api/cases/${action.caseId}`, { status: "Pending EDD", _reason: action.note });
      break;
    case "ESCALATE_CASE":
      await patch(`/api/cases/${action.caseId}`, { status: "Escalated", assignedTo: action.escalateTo, _reason: action.note });
      break;
    case "RECOMMEND_SAR": {
      const c = state.cases.find(c => c.id === action.caseId);
      if (!c) break;
      const newSarId = `SAR-${String(state.sarReviews.length + 1).padStart(3, "0")}`;
      const deadline = new Date("2026-06-04");
      deadline.setDate(deadline.getDate() + 30);
      await post("/api/sar-reviews", {
        id: newSarId, caseId: action.caseId, customerId: c.customerId, customerName: c.customerName,
        detectionDate: today(), sarDeadline: deadline.toISOString().slice(0, 10),
        status: "SAR Recommended", recommendedBy: state.currentUser.name,
        amount: action.amount, narrative: action.narrative,
      });
      await patch(`/api/cases/${action.caseId}`, { status: "SAR Review", sarStatus: "SAR Recommended" });
      break;
    }
    case "CLOSE_CASE":
      await patch(`/api/cases/${action.caseId}`, { status: "Closed", closedDate: today(), _reason: action.reason });
      break;
    case "FALSE_POSITIVE_CASE":
      await patch(`/api/cases/${action.caseId}`, { status: "Closed", closedDate: today(), _reason: action.reason, _closeType: "false_positive" });
      break;
    case "LINK_ALERT_TO_CASE":
      await patch(`/api/alerts/${action.alertId}`, { caseId: action.caseId, status: "Escalated" });
      break;
    case "ADVANCE_SAR":
      await patch(`/api/sar-reviews/${action.sarId}`, { status: "SAR Recommended" });
      break;
    case "APPROVE_SAR":
      await patch(`/api/sar-reviews/${action.sarId}`, { status: "SAR Approved", finalDecisionMaker: state.currentUser.name, filingStatus: "Pending Filing", _reason: action.rationale });
      break;
    case "DECLINE_SAR":
      await patch(`/api/sar-reviews/${action.sarId}`, { status: "SAR Declined", finalDecisionMaker: state.currentUser.name, _reason: action.rationale });
      break;
    case "FILE_SAR":
      await patch(`/api/sar-reviews/${action.sarId}`, {
        status: "Filed",
        filingStatus: `Filed with FinCEN — Ref: ${action.filingRef}`,
        _reason: action.filingRef,
        ...(action.continuingSarDate && { continuingSarDue: action.continuingSarDate }),
      });
      break;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CURRENT_USER: User = USERS.find(u => u.role === "BSA Officer") ?? USERS[0];

const initialState: AppState = {
  alerts: INITIAL_ALERTS,
  cases: INITIAL_CASES,
  sarReviews: INITIAL_SAR_REVIEWS,
  auditLog: INITIAL_AUDIT_LOG,
  toasts: [],
  currentUser: CURRENT_USER,
  loading: true,
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  });

  // Wrap dispatch: optimistic update first, then background API sync
  const dispatch: React.Dispatch<AppAction> = useCallback((action: AppAction) => {
    rawDispatch(action);
    if (action.type !== "ADD_TOAST" && action.type !== "REMOVE_TOAST" && action.type !== "INITIALIZE" && action.type !== "SET_CURRENT_USER") {
      syncActionToApi(action, stateRef.current).catch(console.error);
    }
  }, []);

  // Seed store from DB on mount, keeping mock data as instant initial state
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const [alertsRes, casesRes, sarRes, auditRes, meRes] = await Promise.all([
          fetch("/api/alerts?pageSize=100").then(r => r.json()),
          fetch("/api/cases?pageSize=50").then(r => r.json()),
          fetch("/api/sar-reviews").then(r => r.json()),
          fetch("/api/audit-log?pageSize=100").then(r => r.json()),
          fetch("/api/auth/me").then(r => r.ok ? r.json() : null),
        ]);
        if (cancelled) return;

        // Map DB Case shape → frontend Case type (alerts relation → alertIds array)
        const cases: Case[] = (casesRes.cases ?? []).map((c: Case & { alerts?: { id: string }[] }) => ({
          ...c,
          alertIds: c.alerts?.map((a: { id: string }) => a.id) ?? c.alertIds ?? [],
          alerts: undefined,
        }));

        rawDispatch({
          type: "INITIALIZE",
          alerts: alertsRes.alerts ?? [],
          cases,
          sarReviews: sarRes ?? [],
          auditLog: auditRes.entries ?? [],
        });
        if (meRes) {
          const sessionUser: User = { id: meRes.userId, name: meRes.name, email: meRes.email, role: meRes.role };
          rawDispatch({ type: "SET_CURRENT_USER", user: sessionUser });
        }
      } catch {
        // DB unavailable — stay on mock data, mark loading done
        rawDispatch({ type: "INITIALIZE", alerts: INITIAL_ALERTS, cases: INITIAL_CASES, sarReviews: INITIAL_SAR_REVIEWS, auditLog: INITIAL_AUDIT_LOG });
      }
    }
    init();
    return () => { cancelled = true; };
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useStore(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useStore must be used within AppProvider");
  return ctx;
}

// ─── Derived KPIs (computed from live state) ──────────────────────────────────

export function computeKPIs(state: AppState) {
  const active = (a: Alert) => a.status === "Open" || a.status === "In Review";
  const openAlerts = state.alerts.filter(active).length;
  const openCases = state.cases.filter(c => c.status !== "Closed").length;
  const pastDueSLAs = state.alerts.filter(a => new Date(a.slaDue) < new Date("2026-06-04") && active(a)).length;
  const kycManualReviews = state.alerts.filter(a => a.source === "KYC" && active(a)).length;
  const sarReviewsDue = state.sarReviews.filter(s => ["Pending Review", "SAR Recommended", "SAR Approved"].includes(s.status)).length;
  const closedAlerts = state.alerts.filter(a => a.status === "Closed").length;
  const fpAlerts = state.alerts.filter(a => a.status === "False Positive").length;
  const resolvedAlerts = closedAlerts + fpAlerts;
  const fpRate = resolvedAlerts > 0 ? Math.round((fpAlerts / resolvedAlerts) * 100) : 0;
  const closedCases = state.cases.filter(c => c.status === "Closed" && c.closedDate);
  const avgCaseAgeDays = closedCases.length > 0
    ? Math.round(closedCases.reduce((sum, c) => { const created = new Date(c.createdDate).getTime(); const closed = new Date(c.closedDate!).getTime(); return sum + (closed - created) / (1000 * 60 * 60 * 24); }, 0) / closedCases.length)
    : 14;
  return { openAlerts, openCases, pastDueSLAs, kycManualReviews, sarReviewsDue, closedAlerts, fpRate, avgCaseAgeDays };
}
