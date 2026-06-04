"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
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
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export type AppAction =
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
  | { type: "REMOVE_TOAST"; toastId: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function today(): string {
  return "2026-06-04";
}

function nowIso(): string {
  return new Date().toISOString();
}

function auditId(): string {
  return `AUD-${Date.now()}-${Math.floor(Math.random() * 999)}`;
}

function toastId(): string {
  return `toast-${Date.now()}-${Math.floor(Math.random() * 999)}`;
}

function makeAudit(
  user: User,
  action: string,
  entityType: AuditLogEntry["entityType"],
  entityId: string,
  details: string,
  extras?: { previousStatus?: string; newStatus?: string; reason?: string }
): AuditLogEntry {
  return {
    id: auditId(),
    timestamp: nowIso(),
    actor: user.name,
    actorRole: user.role,
    action,
    entityType,
    entityId,
    details,
    ipAddress: "10.0.1.10",
    ...extras,
  };
}

function makeToast(message: string, variant: AppToast["variant"] = "success"): AppToast {
  return { id: toastId(), message, variant };
}

function noteId(): string {
  return `n-${Date.now()}-${Math.floor(Math.random() * 999)}`;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: AppAction): AppState {
  const { currentUser } = state;
  const td = today();

  switch (action.type) {
    // ── ALERT ACTIONS ────────────────────────────────────────────────────────

    case "ASSIGN_ALERT": {
      const alert = state.alerts.find(a => a.id === action.alertId);
      if (!alert) return state;
      const prev = alert.assignedTo ?? "Unassigned";
      return {
        ...state,
        alerts: state.alerts.map(a =>
          a.id === action.alertId ? { ...a, assignedTo: action.assignee, status: a.status === "Open" ? "In Review" : a.status } : a
        ),
        auditLog: [
          makeAudit(currentUser, "Alert Assigned", "Alert", action.alertId,
            `Alert assigned from ${prev} to ${action.assignee}.`),
          ...state.auditLog,
        ],
        toasts: [...state.toasts, makeToast(`${action.alertId} assigned to ${action.assignee}`)],
      };
    }

    case "CHANGE_ALERT_STATUS": {
      const alert = state.alerts.find(a => a.id === action.alertId);
      if (!alert) return state;
      return {
        ...state,
        alerts: state.alerts.map(a => a.id === action.alertId ? { ...a, status: action.status } : a),
        auditLog: [
          makeAudit(currentUser, "Alert Status Changed", "Alert", action.alertId,
            `Status changed from ${alert.status} to ${action.status}.`,
            { previousStatus: alert.status, newStatus: action.status }),
          ...state.auditLog,
        ],
        toasts: [...state.toasts, makeToast(`Alert status updated to ${action.status}`)],
      };
    }

    case "CLOSE_ALERT": {
      const alert = state.alerts.find(a => a.id === action.alertId);
      if (!alert) return state;
      return {
        ...state,
        alerts: state.alerts.map(a => a.id === action.alertId ? { ...a, status: "Closed" } : a),
        auditLog: [
          makeAudit(currentUser, "Alert Closed", "Alert", action.alertId,
            `Alert closed. Reason: ${action.reason}`,
            { previousStatus: alert.status, newStatus: "Closed", reason: action.reason }),
          ...state.auditLog,
        ],
        toasts: [...state.toasts, makeToast(`${action.alertId} closed`)],
      };
    }

    case "FALSE_POSITIVE_ALERT": {
      const alert = state.alerts.find(a => a.id === action.alertId);
      if (!alert) return state;
      return {
        ...state,
        alerts: state.alerts.map(a => a.id === action.alertId ? { ...a, status: "False Positive" } : a),
        auditLog: [
          makeAudit(currentUser, "Alert Marked False Positive", "Alert", action.alertId,
            `Alert marked as false positive. Reason: ${action.reason}`,
            { previousStatus: alert.status, newStatus: "False Positive", reason: action.reason }),
          ...state.auditLog,
        ],
        toasts: [...state.toasts, makeToast(`${action.alertId} marked as false positive`)],
      };
    }

    case "ESCALATE_ALERT_TO_CASE": {
      const alert = state.alerts.find(a => a.id === action.alertId);
      if (!alert) return state;
      const newCaseId = `CASE-${String(state.cases.length + 1).padStart(3, "0")}`;
      const newCase: Case = {
        id: newCaseId,
        customerId: alert.customerId,
        customerName: alert.customerName,
        status: "Open",
        priority: action.priority,
        assignedTo: action.assignedTo,
        createdDate: td,
        updatedDate: td,
        alertIds: [action.alertId],
        description: action.description,
        notes: [{
          id: noteId(),
          caseId: newCaseId,
          author: currentUser.name,
          content: `Case opened from alert ${action.alertId}. ${action.description}`,
          timestamp: nowIso(),
          type: "Escalation",
        }],
      };
      return {
        ...state,
        alerts: state.alerts.map(a =>
          a.id === action.alertId ? { ...a, status: "Escalated", caseId: newCaseId } : a
        ),
        cases: [newCase, ...state.cases],
        auditLog: [
          makeAudit(currentUser, "Alert Escalated to Case", "Alert", action.alertId,
            `Alert escalated — new case ${newCaseId} created.`,
            { previousStatus: alert.status, newStatus: "Escalated" }),
          makeAudit(currentUser, "Case Created", "Case", newCaseId,
            `Case created from alert ${action.alertId}. Assigned to ${action.assignedTo}.`),
          ...state.auditLog,
        ],
        toasts: [...state.toasts, makeToast(`Alert escalated → ${newCaseId} created`)],
      };
    }

    // ── CASE ACTIONS ─────────────────────────────────────────────────────────

    case "ADD_CASE_NOTE": {
      const c = state.cases.find(c => c.id === action.caseId);
      if (!c) return state;
      const newNote: CaseNote = {
        id: noteId(),
        caseId: action.caseId,
        author: currentUser.name,
        content: action.content,
        timestamp: nowIso(),
        type: action.noteType,
      };
      return {
        ...state,
        cases: state.cases.map(cs =>
          cs.id === action.caseId ? { ...cs, notes: [...cs.notes, newNote], updatedDate: td } : cs
        ),
        auditLog: [
          makeAudit(currentUser, "Case Note Added", "Case", action.caseId,
            `${action.noteType} added to case.`),
          ...state.auditLog,
        ],
        toasts: [...state.toasts, makeToast("Note added successfully")],
      };
    }

    case "REQUEST_EDD": {
      const c = state.cases.find(c => c.id === action.caseId);
      if (!c) return state;
      const newNote: CaseNote = {
        id: noteId(),
        caseId: action.caseId,
        author: currentUser.name,
        content: `EDD requested. ${action.note}`,
        timestamp: nowIso(),
        type: "EDD Request",
      };
      return {
        ...state,
        cases: state.cases.map(cs =>
          cs.id === action.caseId
            ? { ...cs, status: "Pending EDD", notes: [...cs.notes, newNote], updatedDate: td }
            : cs
        ),
        auditLog: [
          makeAudit(currentUser, "EDD Requested", "Case", action.caseId,
            `Enhanced due diligence requested. ${action.note}`,
            { previousStatus: c.status, newStatus: "Pending EDD" }),
          ...state.auditLog,
        ],
        toasts: [...state.toasts, makeToast("EDD request submitted — customer notified")],
      };
    }

    case "ESCALATE_CASE": {
      const c = state.cases.find(c => c.id === action.caseId);
      if (!c) return state;
      const newNote: CaseNote = {
        id: noteId(),
        caseId: action.caseId,
        author: currentUser.name,
        content: `Case escalated to ${action.escalateTo}. ${action.note}`,
        timestamp: nowIso(),
        type: "Escalation",
      };
      return {
        ...state,
        cases: state.cases.map(cs =>
          cs.id === action.caseId
            ? { ...cs, status: "Escalated", assignedTo: action.escalateTo, notes: [...cs.notes, newNote], updatedDate: td }
            : cs
        ),
        auditLog: [
          makeAudit(currentUser, "Case Escalated", "Case", action.caseId,
            `Case escalated to ${action.escalateTo}. Note: ${action.note}`,
            { previousStatus: c.status, newStatus: "Escalated" }),
          ...state.auditLog,
        ],
        toasts: [...state.toasts, makeToast(`Case escalated to ${action.escalateTo}`)],
      };
    }

    case "RECOMMEND_SAR": {
      const c = state.cases.find(c => c.id === action.caseId);
      if (!c) return state;
      const newSarId = `SAR-${String(state.sarReviews.length + 1).padStart(3, "0")}`;
      const deadline = new Date("2026-06-04");
      deadline.setDate(deadline.getDate() + 30);
      const newSAR: SARReview = {
        id: newSarId,
        caseId: action.caseId,
        customerId: c.customerId,
        customerName: c.customerName,
        detectionDate: td,
        sarDeadline: deadline.toISOString().slice(0, 10),
        status: "SAR Recommended",
        recommendedBy: currentUser.name,
        amount: action.amount,
        narrative: action.narrative,
      };
      const newNote: CaseNote = {
        id: noteId(),
        caseId: action.caseId,
        author: currentUser.name,
        content: `SAR review recommended. ${action.narrative}`,
        timestamp: nowIso(),
        type: "SAR Recommendation",
      };
      return {
        ...state,
        cases: state.cases.map(cs =>
          cs.id === action.caseId
            ? { ...cs, status: "SAR Review", sarStatus: "SAR Recommended", notes: [...cs.notes, newNote], updatedDate: td }
            : cs
        ),
        sarReviews: [newSAR, ...state.sarReviews],
        auditLog: [
          makeAudit(currentUser, "SAR Recommended", "Case", action.caseId,
            `SAR review recommended for ${c.customerName}. Narrative: ${action.narrative.slice(0, 80)}…`,
            { previousStatus: c.status, newStatus: "SAR Review" }),
          makeAudit(currentUser, "SAR Review Created", "SAR", newSarId,
            `New SAR review ${newSarId} created for ${c.customerName}.`),
          ...state.auditLog,
        ],
        toasts: [...state.toasts, makeToast(`SAR ${newSarId} created — forwarded to BSA Officer`)],
      };
    }

    case "CLOSE_CASE": {
      const c = state.cases.find(c => c.id === action.caseId);
      if (!c) return state;
      const newNote: CaseNote = {
        id: noteId(),
        caseId: action.caseId,
        author: currentUser.name,
        content: `Case closed. Reason: ${action.reason}`,
        timestamp: nowIso(),
        type: "Status Change",
      };
      return {
        ...state,
        cases: state.cases.map(cs =>
          cs.id === action.caseId
            ? { ...cs, status: "Closed", closedDate: td, notes: [...cs.notes, newNote], updatedDate: td }
            : cs
        ),
        auditLog: [
          makeAudit(currentUser, "Case Closed", "Case", action.caseId,
            `Case closed. Reason: ${action.reason}`,
            { previousStatus: c.status, newStatus: "Closed", reason: action.reason }),
          ...state.auditLog,
        ],
        toasts: [...state.toasts, makeToast("Case closed")],
      };
    }

    case "FALSE_POSITIVE_CASE": {
      const c = state.cases.find(c => c.id === action.caseId);
      if (!c) return state;
      const newNote: CaseNote = {
        id: noteId(),
        caseId: action.caseId,
        author: currentUser.name,
        content: `Case marked as false positive and closed. Reason: ${action.reason}`,
        timestamp: nowIso(),
        type: "Status Change",
      };
      return {
        ...state,
        cases: state.cases.map(cs =>
          cs.id === action.caseId
            ? { ...cs, status: "Closed", closedDate: td, notes: [...cs.notes, newNote], updatedDate: td }
            : cs
        ),
        auditLog: [
          makeAudit(currentUser, "Case Marked False Positive", "Case", action.caseId,
            `Case closed as false positive. Reason: ${action.reason}`,
            { previousStatus: c.status, newStatus: "Closed (False Positive)", reason: action.reason }),
          ...state.auditLog,
        ],
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
        alerts: state.alerts.map(a =>
          a.id === action.alertId ? { ...a, caseId: action.caseId, status: "Escalated" } : a
        ),
        cases: state.cases.map(cs =>
          cs.id === action.caseId
            ? { ...cs, alertIds: [...cs.alertIds, action.alertId], updatedDate: td }
            : cs
        ),
        auditLog: [
          makeAudit(currentUser, "Alert Linked to Case", "Case", action.caseId,
            `Alert ${action.alertId} linked to case ${action.caseId}.`),
          ...state.auditLog,
        ],
        toasts: [...state.toasts, makeToast(`Alert ${action.alertId} linked to ${action.caseId}`)],
      };
    }

    // ── SAR ACTIONS ──────────────────────────────────────────────────────────

    case "ADVANCE_SAR": {
      const sar = state.sarReviews.find(s => s.id === action.sarId);
      if (!sar) return state;
      return {
        ...state,
        sarReviews: state.sarReviews.map(s =>
          s.id === action.sarId ? { ...s, status: "SAR Recommended" } : s
        ),
        auditLog: [
          makeAudit(currentUser, "SAR Advanced to Recommended", "SAR", action.sarId,
            `SAR moved from Pending Review to SAR Recommended.`,
            { previousStatus: sar.status, newStatus: "SAR Recommended" }),
          ...state.auditLog,
        ],
        toasts: [...state.toasts, makeToast("SAR recommended — awaiting BSA Officer decision")],
      };
    }

    case "APPROVE_SAR": {
      const sar = state.sarReviews.find(s => s.id === action.sarId);
      if (!sar) return state;
      return {
        ...state,
        sarReviews: state.sarReviews.map(s =>
          s.id === action.sarId
            ? { ...s, status: "SAR Approved", finalDecisionMaker: currentUser.name, filingStatus: "Pending Filing" }
            : s
        ),
        cases: state.cases.map(c =>
          c.id === sar.caseId ? { ...c, sarStatus: "SAR Approved", updatedDate: td } : c
        ),
        auditLog: [
          makeAudit(currentUser, "SAR Approved", "SAR", action.sarId,
            `SAR approved by ${currentUser.name}. Rationale: ${action.rationale}`,
            { previousStatus: sar.status, newStatus: "SAR Approved" }),
          ...state.auditLog,
        ],
        toasts: [...state.toasts, makeToast("SAR approved — ready for FinCEN filing")],
      };
    }

    case "DECLINE_SAR": {
      const sar = state.sarReviews.find(s => s.id === action.sarId);
      if (!sar) return state;
      return {
        ...state,
        sarReviews: state.sarReviews.map(s =>
          s.id === action.sarId
            ? { ...s, status: "SAR Declined", finalDecisionMaker: currentUser.name }
            : s
        ),
        cases: state.cases.map(c =>
          c.id === sar.caseId ? { ...c, sarStatus: "SAR Declined", updatedDate: td } : c
        ),
        auditLog: [
          makeAudit(currentUser, "SAR Declined", "SAR", action.sarId,
            `SAR declined by ${currentUser.name}. Rationale: ${action.rationale}`,
            { previousStatus: sar.status, newStatus: "SAR Declined" }),
          ...state.auditLog,
        ],
        toasts: [...state.toasts, makeToast("SAR declined — case returned for further review", "warning")],
      };
    }

    case "FILE_SAR": {
      const sar = state.sarReviews.find(s => s.id === action.sarId);
      if (!sar) return state;
      return {
        ...state,
        sarReviews: state.sarReviews.map(s =>
          s.id === action.sarId
            ? { ...s, status: "Filed", filingStatus: `Filed with FinCEN — Ref: ${action.filingRef}`, continuingSarDue: action.continuingSarDate }
            : s
        ),
        cases: state.cases.map(c =>
          c.id === sar.caseId ? { ...c, sarStatus: "Filed", updatedDate: td } : c
        ),
        auditLog: [
          makeAudit(currentUser, "SAR Filed", "SAR", action.sarId,
            `SAR filed with FinCEN. Reference: ${action.filingRef}.${action.continuingSarDate ? ` Continuing SAR due: ${action.continuingSarDate}.` : ""}`,
            { previousStatus: sar.status, newStatus: "Filed" }),
          ...state.auditLog,
        ],
        toasts: [...state.toasts, makeToast(`SAR filed — FinCEN Ref: ${action.filingRef}`)],
      };
    }

    // ── UI ────────────────────────────────────────────────────────────────────

    case "ADD_TOAST":
      return { ...state, toasts: [...state.toasts, { ...action.toast, id: toastId() }] };

    case "REMOVE_TOAST":
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.toastId) };

    default:
      return state;
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
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
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
  const pastDueSLAs = state.alerts.filter(a => {
    const due = new Date(a.slaDue);
    const now = new Date("2026-06-04");
    return due < now && active(a);
  }).length;
  const kycManualReviews = state.alerts.filter(a => a.source === "KYC" && active(a)).length;
  const sarReviewsDue = state.sarReviews.filter(s =>
    ["Pending Review", "SAR Recommended", "SAR Approved"].includes(s.status)
  ).length;
  const closedAlerts = state.alerts.filter(a => a.status === "Closed").length;
  const fpAlerts = state.alerts.filter(a => a.status === "False Positive").length;
  const resolvedAlerts = closedAlerts + fpAlerts;
  const fpRate = resolvedAlerts > 0 ? Math.round((fpAlerts / resolvedAlerts) * 100) : 0;

  const closedCases = state.cases.filter(c => c.status === "Closed" && c.closedDate);
  const avgCaseAgeDays = closedCases.length > 0
    ? Math.round(
        closedCases.reduce((sum, c) => {
          const created = new Date(c.createdDate).getTime();
          const closed = new Date(c.closedDate!).getTime();
          return sum + (closed - created) / (1000 * 60 * 60 * 24);
        }, 0) / closedCases.length
      )
    : 14;

  return { openAlerts, openCases, pastDueSLAs, kycManualReviews, sarReviewsDue, closedAlerts, fpRate, avgCaseAgeDays };
}
