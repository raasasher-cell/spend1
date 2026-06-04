export type Permission =
  | "close_alert" | "assign_alert" | "escalate_alert" | "mark_fp_alert" | "escalate_to_case"
  | "add_note" | "request_edd" | "escalate_case" | "recommend_sar" | "close_case" | "mark_fp_case" | "link_alert"
  | "approve_sar" | "decline_sar" | "file_sar"
  | "view_audit" | "export_data" | "import_data" | "manage_users";

const ROLE_MAP: Record<string, Permission[]> = {
  "Analyst": [
    "close_alert", "assign_alert", "escalate_alert", "mark_fp_alert", "escalate_to_case",
    "add_note", "link_alert",
  ],
  "Senior Investigator": [
    "close_alert", "assign_alert", "escalate_alert", "mark_fp_alert", "escalate_to_case",
    "add_note", "request_edd", "escalate_case", "recommend_sar", "close_case", "mark_fp_case", "link_alert",
    "export_data",
  ],
  "Compliance Manager": [
    "close_alert", "assign_alert", "escalate_alert", "mark_fp_alert", "escalate_to_case",
    "add_note", "request_edd", "escalate_case", "recommend_sar", "close_case", "mark_fp_case", "link_alert",
    "view_audit", "export_data",
  ],
  "BSA Officer": [
    "close_alert", "assign_alert", "escalate_alert", "mark_fp_alert", "escalate_to_case",
    "add_note", "request_edd", "escalate_case", "recommend_sar", "close_case", "mark_fp_case", "link_alert",
    "approve_sar", "decline_sar", "file_sar",
    "view_audit", "export_data",
  ],
  "Auditor": ["view_audit", "export_data"],
  "Bank Partner Read-Only": [],
  "Admin": [
    "close_alert", "assign_alert", "escalate_alert", "mark_fp_alert", "escalate_to_case",
    "add_note", "request_edd", "escalate_case", "recommend_sar", "close_case", "mark_fp_case", "link_alert",
    "approve_sar", "decline_sar", "file_sar",
    "view_audit", "export_data", "import_data", "manage_users",
  ],
};

export function hasPermission(role: string | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_MAP[role]?.includes(permission) ?? false;
}
