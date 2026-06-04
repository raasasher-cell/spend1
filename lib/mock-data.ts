export type CustomerType = "Individual" | "Small Business" | "Remittance" | "Card Program";
export type RiskRating = "Low" | "Medium" | "High" | "Critical";
export type KYCStatus = "Approved" | "Pending" | "Manual Review" | "Rejected";
export type ScreeningStatus = "Clear" | "Hit" | "Pending" | "Escalated";
export type CustomerStatus = "Active" | "Suspended" | "Closed" | "Restricted";

export type AlertSource = "KYC" | "Transaction Monitoring" | "Sanctions Screening" | "PEP Screening" | "Adverse Media" | "Fraud" | "Chargeback" | "Manual Review";
export type AlertStatus = "Open" | "In Review" | "Escalated" | "Closed" | "False Positive";
export type Priority = "Low" | "Medium" | "High" | "Critical";

export type CaseStatus = "Open" | "In Review" | "Pending EDD" | "Escalated" | "SAR Review" | "Closed";
export type SARStatus = "Pending Review" | "SAR Recommended" | "SAR Approved" | "SAR Declined" | "Filed" | "Continuing Review";

export type UserRole = "Analyst" | "Senior Investigator" | "Compliance Manager" | "BSA Officer" | "Auditor" | "Bank Partner Read-Only" | "Admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  status: CustomerStatus;
  riskRating: RiskRating;
  kycStatus: KYCStatus;
  screeningStatus: ScreeningStatus;
  openAlerts: number;
  openCases: number;
  totalVolume: number;
  lastTransaction: string;
  email: string;
  phone: string;
  address: string;
  dateOnboarded: string;
  country: string;
  ssn?: string;
  ein?: string;
  dob?: string;
}

export interface Alert {
  id: string;
  customerId: string;
  customerName: string;
  type: string;
  source: AlertSource;
  riskScore: number;
  status: AlertStatus;
  priority?: Priority;
  assignedTo?: string;
  createdDate: string;
  slaDue: string;
  description: string;
  caseId?: string;
}

export interface Case {
  id: string;
  customerId: string;
  customerName: string;
  status: CaseStatus;
  priority: Priority;
  assignedTo: string;
  createdDate: string;
  updatedDate: string;
  alertIds: string[];
  description: string;
  sarStatus?: SARStatus;
  closedDate?: string;
  notes: CaseNote[];
}

export interface CaseNote {
  id: string;
  caseId: string;
  author: string;
  content: string;
  timestamp: string;
  type: "Note" | "Escalation" | "EDD Request" | "SAR Recommendation" | "Status Change";
}

export interface SARReview {
  id: string;
  caseId: string;
  customerId: string;
  customerName: string;
  detectionDate: string;
  sarDeadline: string;
  status: SARStatus;
  recommendedBy: string;
  finalDecisionMaker?: string;
  filingStatus?: string;
  continuingSarDue?: string;
  amount: number;
  narrative?: string;
}

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  counterparty: string;
  date: string;
  channel: string;
  flagged: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  entityType: "Alert" | "Case" | "Customer" | "SAR" | "User" | "System";
  entityId: string;
  details: string;
  ipAddress: string;
  previousStatus?: string;
  newStatus?: string;
  reason?: string;
}

export const USERS: User[] = [
  { id: "u1", name: "Sarah Chen", email: "s.chen@riskops.io", role: "BSA Officer" },
  { id: "u2", name: "Marcus Johnson", email: "m.johnson@riskops.io", role: "Compliance Manager" },
  { id: "u3", name: "Priya Patel", email: "p.patel@riskops.io", role: "Senior Investigator" },
  { id: "u4", name: "Devon Williams", email: "d.williams@riskops.io", role: "Analyst" },
  { id: "u5", name: "Elena Rodriguez", email: "e.rodriguez@riskops.io", role: "Analyst" },
  { id: "u6", name: "James Kim", email: "j.kim@riskops.io", role: "Analyst" },
  { id: "u7", name: "Audrey Thompson", email: "a.thompson@riskops.io", role: "Auditor" },
  { id: "u8", name: "Robert Okafor", email: "r.okafor@riskops.io", role: "Senior Investigator" },
  { id: "u9", name: "Lisa Park", email: "l.park@bank.partner", role: "Bank Partner Read-Only" },
  { id: "u10", name: "Admin User", email: "admin@riskops.io", role: "Admin" },
];

export const CUSTOMERS: Customer[] = [
  { id: "c001", name: "Alex Rivera", type: "Individual", status: "Active", riskRating: "High", kycStatus: "Approved", screeningStatus: "Hit", openAlerts: 3, openCases: 1, totalVolume: 284500, lastTransaction: "2026-06-03", email: "a.rivera@gmail.com", phone: "+1-415-555-0101", address: "123 Market St, San Francisco, CA 94102", dateOnboarded: "2024-03-15", country: "US", dob: "1988-07-22" },
  { id: "c002", name: "Sunrise Remittance LLC", type: "Small Business", status: "Active", riskRating: "Medium", kycStatus: "Manual Review", screeningStatus: "Clear", openAlerts: 2, openCases: 0, totalVolume: 1250000, lastTransaction: "2026-06-03", email: "ops@sunriseremit.com", phone: "+1-212-555-0102", address: "456 Broadway, New York, NY 10013", dateOnboarded: "2023-11-08", country: "US", ein: "82-1234567" },
  { id: "c003", name: "Maria Santos", type: "Remittance", status: "Active", riskRating: "Low", kycStatus: "Approved", screeningStatus: "Clear", openAlerts: 0, openCases: 0, totalVolume: 45200, lastTransaction: "2026-06-02", email: "m.santos@yahoo.com", phone: "+1-305-555-0103", address: "789 Brickell Ave, Miami, FL 33131", dateOnboarded: "2025-01-20", country: "US", dob: "1975-03-10" },
  { id: "c004", name: "TechPay Solutions Inc", type: "Card Program", status: "Active", riskRating: "Medium", kycStatus: "Approved", screeningStatus: "Clear", openAlerts: 1, openCases: 0, totalVolume: 5800000, lastTransaction: "2026-06-03", email: "compliance@techpay.io", phone: "+1-650-555-0104", address: "321 Innovation Way, Palo Alto, CA 94301", dateOnboarded: "2023-06-01", country: "US", ein: "47-9876543" },
  { id: "c005", name: "David Okonkwo", type: "Individual", status: "Suspended", riskRating: "Critical", kycStatus: "Rejected", screeningStatus: "Escalated", openAlerts: 5, openCases: 2, totalVolume: 98700, lastTransaction: "2026-05-28", email: "d.okonkwo@hotmail.com", phone: "+1-713-555-0105", address: "555 Main St, Houston, TX 77002", dateOnboarded: "2024-09-12", country: "US", dob: "1992-11-05" },
  { id: "c006", name: "Global Wire Partners", type: "Remittance", status: "Active", riskRating: "High", kycStatus: "Approved", screeningStatus: "Hit", openAlerts: 4, openCases: 2, totalVolume: 3200000, lastTransaction: "2026-06-03", email: "ops@globalwire.net", phone: "+1-202-555-0106", address: "100 K St NW, Washington DC 20001", dateOnboarded: "2022-08-15", country: "US", ein: "55-1122334" },
  { id: "c007", name: "Yuki Tanaka", type: "Individual", status: "Active", riskRating: "Low", kycStatus: "Approved", screeningStatus: "Clear", openAlerts: 0, openCases: 0, totalVolume: 22800, lastTransaction: "2026-05-30", email: "y.tanaka@gmail.com", phone: "+1-503-555-0107", address: "222 Pearl St, Portland, OR 97201", dateOnboarded: "2025-02-14", country: "US", dob: "1995-06-18" },
  { id: "c008", name: "FastCash Kiosks Inc", type: "Card Program", status: "Active", riskRating: "High", kycStatus: "Manual Review", screeningStatus: "Pending", openAlerts: 3, openCases: 1, totalVolume: 890000, lastTransaction: "2026-06-02", email: "legal@fastcash.biz", phone: "+1-702-555-0108", address: "3600 Las Vegas Blvd, Las Vegas, NV 89109", dateOnboarded: "2024-05-30", country: "US", ein: "88-4455667" },
  { id: "c009", name: "Amara Diallo", type: "Remittance", status: "Active", riskRating: "Medium", kycStatus: "Approved", screeningStatus: "Clear", openAlerts: 1, openCases: 0, totalVolume: 67400, lastTransaction: "2026-06-01", email: "a.diallo@gmail.com", phone: "+1-617-555-0109", address: "44 Beacon St, Boston, MA 02108", dateOnboarded: "2024-12-03", country: "US", dob: "1983-09-27" },
  { id: "c010", name: "Pacific Rim Trading Co", type: "Small Business", status: "Active", riskRating: "Medium", kycStatus: "Approved", screeningStatus: "Clear", openAlerts: 0, openCases: 0, totalVolume: 720000, lastTransaction: "2026-05-29", email: "finance@pacificrimtrade.com", phone: "+1-206-555-0110", address: "1200 Alaskan Way, Seattle, WA 98101", dateOnboarded: "2023-04-22", country: "US", ein: "91-3344556" },
  { id: "c011", name: "Carlos Mendez", type: "Individual", status: "Active", riskRating: "High", kycStatus: "Approved", screeningStatus: "Hit", openAlerts: 2, openCases: 1, totalVolume: 156000, lastTransaction: "2026-06-03", email: "c.mendez@outlook.com", phone: "+1-480-555-0111", address: "789 Camelback Rd, Phoenix, AZ 85013", dateOnboarded: "2024-07-19", country: "US", dob: "1979-12-30" },
  { id: "c012", name: "Blue Horizon Payments", type: "Card Program", status: "Restricted", riskRating: "High", kycStatus: "Approved", screeningStatus: "Hit", openAlerts: 3, openCases: 1, totalVolume: 2100000, lastTransaction: "2026-05-31", email: "risk@bluehorizon.io", phone: "+1-312-555-0112", address: "233 S Wacker Dr, Chicago, IL 60606", dateOnboarded: "2023-02-07", country: "US", ein: "36-7788990" },
  { id: "c013", name: "Fatima Al-Hassan", type: "Individual", status: "Active", riskRating: "Critical", kycStatus: "Approved", screeningStatus: "Escalated", openAlerts: 4, openCases: 2, totalVolume: 445000, lastTransaction: "2026-06-02", email: "f.alhassan@gmail.com", phone: "+1-214-555-0113", address: "500 Commerce St, Dallas, TX 75201", dateOnboarded: "2024-01-08", country: "US", dob: "1986-04-14" },
  { id: "c014", name: "Nexus Money Services", type: "Remittance", status: "Active", riskRating: "Medium", kycStatus: "Approved", screeningStatus: "Clear", openAlerts: 1, openCases: 0, totalVolume: 980000, lastTransaction: "2026-06-03", email: "ops@nexusmoney.net", phone: "+1-404-555-0114", address: "191 Peachtree St, Atlanta, GA 30303", dateOnboarded: "2023-09-11", country: "US", ein: "58-2233445" },
  { id: "c015", name: "Omar Bashir", type: "Individual", status: "Active", riskRating: "Medium", kycStatus: "Pending", screeningStatus: "Pending", openAlerts: 1, openCases: 0, totalVolume: 12500, lastTransaction: "2026-05-25", email: "o.bashir@gmail.com", phone: "+1-612-555-0115", address: "100 S 5th St, Minneapolis, MN 55402", dateOnboarded: "2026-05-20", country: "US", dob: "1998-02-17" },
  { id: "c016", name: "Swift Card Corp", type: "Card Program", status: "Active", riskRating: "Low", kycStatus: "Approved", screeningStatus: "Clear", openAlerts: 0, openCases: 0, totalVolume: 4500000, lastTransaction: "2026-06-03", email: "compliance@swiftcard.com", phone: "+1-737-555-0116", address: "801 Barton Springs Rd, Austin, TX 78704", dateOnboarded: "2022-05-18", country: "US", ein: "74-5566778" },
  { id: "c017", name: "Ingrid Larsen", type: "Individual", status: "Active", riskRating: "Low", kycStatus: "Approved", screeningStatus: "Clear", openAlerts: 0, openCases: 0, totalVolume: 34900, lastTransaction: "2026-05-28", email: "i.larsen@gmail.com", phone: "+1-720-555-0117", address: "1600 Glenarm Pl, Denver, CO 80202", dateOnboarded: "2025-03-05", country: "US", dob: "1991-08-23" },
  { id: "c018", name: "CashLink Transfers", type: "Remittance", status: "Active", riskRating: "High", kycStatus: "Manual Review", screeningStatus: "Hit", openAlerts: 5, openCases: 2, totalVolume: 2750000, lastTransaction: "2026-06-03", email: "admin@cashlink.io", phone: "+1-305-555-0118", address: "900 Biscayne Blvd, Miami, FL 33132", dateOnboarded: "2023-07-29", country: "US", ein: "65-8899001" },
  { id: "c019", name: "Jin-Ho Park", type: "Individual", status: "Active", riskRating: "Medium", kycStatus: "Approved", screeningStatus: "Clear", openAlerts: 1, openCases: 0, totalVolume: 88200, lastTransaction: "2026-06-01", email: "j.park@gmail.com", phone: "+1-213-555-0119", address: "350 S Grand Ave, Los Angeles, CA 90071", dateOnboarded: "2024-10-14", country: "US", dob: "1987-05-09" },
  { id: "c020", name: "Horizon Micro Finance", type: "Small Business", status: "Active", riskRating: "Medium", kycStatus: "Approved", screeningStatus: "Clear", openAlerts: 0, openCases: 0, totalVolume: 340000, lastTransaction: "2026-05-31", email: "ops@horizonmf.org", phone: "+1-602-555-0120", address: "2200 E Camelback Rd, Phoenix, AZ 85016", dateOnboarded: "2024-04-02", country: "US", ein: "86-0011223" },
  { id: "c021", name: "Kwame Asante", type: "Individual", status: "Active", riskRating: "High", kycStatus: "Approved", screeningStatus: "Hit", openAlerts: 2, openCases: 1, totalVolume: 210000, lastTransaction: "2026-06-02", email: "k.asante@gmail.com", phone: "+1-404-555-0121", address: "75 5th St NW, Atlanta, GA 30308", dateOnboarded: "2024-06-11", country: "US", dob: "1981-10-04" },
  { id: "c022", name: "Velocity Pay Inc", type: "Card Program", status: "Active", riskRating: "Medium", kycStatus: "Approved", screeningStatus: "Clear", openAlerts: 1, openCases: 0, totalVolume: 1800000, lastTransaction: "2026-06-03", email: "legal@velocitypay.com", phone: "+1-646-555-0122", address: "7 World Trade Center, New York, NY 10007", dateOnboarded: "2023-12-01", country: "US", ein: "20-3344556" },
  { id: "c023", name: "Nadia Volkov", type: "Individual", status: "Suspended", riskRating: "Critical", kycStatus: "Approved", screeningStatus: "Escalated", openAlerts: 6, openCases: 3, totalVolume: 567000, lastTransaction: "2026-05-20", email: "n.volkov@proton.me", phone: "+1-917-555-0123", address: "250 W 57th St, New York, NY 10107", dateOnboarded: "2023-10-30", country: "US", dob: "1985-01-19" },
  { id: "c024", name: "RedRock Financial", type: "Small Business", status: "Active", riskRating: "Low", kycStatus: "Approved", screeningStatus: "Clear", openAlerts: 0, openCases: 0, totalVolume: 580000, lastTransaction: "2026-06-02", email: "accounts@redrock.biz", phone: "+1-801-555-0124", address: "400 S Main St, Salt Lake City, UT 84111", dateOnboarded: "2024-02-28", country: "US", ein: "87-1122334" },
  { id: "c025", name: "Ping Chen", type: "Individual", status: "Active", riskRating: "Medium", kycStatus: "Approved", screeningStatus: "Clear", openAlerts: 1, openCases: 0, totalVolume: 142000, lastTransaction: "2026-06-03", email: "p.chen@gmail.com", phone: "+1-415-555-0125", address: "888 Kearny St, San Francisco, CA 94108", dateOnboarded: "2024-08-07", country: "US", dob: "1990-12-25" },
];

export const ALERTS: Alert[] = [
  { id: "ALT-001", customerId: "c001", customerName: "Alex Rivera", type: "Structuring", source: "Transaction Monitoring", riskScore: 87, status: "Open", priority: "High", assignedTo: "Devon Williams", createdDate: "2026-06-01", slaDue: "2026-06-05", description: "Multiple cash deposits just below $10,000 threshold detected over 5-day period." },
  { id: "ALT-002", customerId: "c001", customerName: "Alex Rivera", type: "Sanctions Match", source: "Sanctions Screening", riskScore: 95, status: "Escalated", priority: "Critical", assignedTo: "Priya Patel", createdDate: "2026-05-29", slaDue: "2026-06-01", description: "Partial name match on OFAC SDN list. Customer name and DOB require manual verification.", caseId: "CASE-001" },
  { id: "ALT-003", customerId: "c001", customerName: "Alex Rivera", type: "Rapid Fund Movement", source: "Transaction Monitoring", riskScore: 78, status: "In Review", priority: "High", assignedTo: "Elena Rodriguez", createdDate: "2026-06-02", slaDue: "2026-06-07", description: "Funds received and moved out to different accounts within 24-hour window totaling $45,000." },
  { id: "ALT-004", customerId: "c002", customerName: "Sunrise Remittance LLC", type: "KYC Documentation Gap", source: "KYC", riskScore: 65, status: "Open", priority: "Medium", assignedTo: "James Kim", createdDate: "2026-06-02", slaDue: "2026-06-09", description: "Beneficial ownership documents expired. Renewal request sent 30 days ago with no response." },
  { id: "ALT-005", customerId: "c002", customerName: "Sunrise Remittance LLC", type: "High Volume Remittance", source: "Transaction Monitoring", riskScore: 72, status: "In Review", priority: "High", assignedTo: "Robert Okafor", createdDate: "2026-05-30", slaDue: "2026-06-04", description: "200% volume increase to high-risk jurisdictions compared to prior 90-day baseline." },
  { id: "ALT-006", customerId: "c004", customerName: "TechPay Solutions Inc", type: "Chargeback Spike", source: "Chargeback", riskScore: 58, status: "Open", priority: "Medium", assignedTo: "Devon Williams", createdDate: "2026-06-03", slaDue: "2026-06-10", description: "Chargeback rate exceeded 1.5% threshold for second consecutive month." },
  { id: "ALT-007", customerId: "c005", customerName: "David Okonkwo", type: "PEP Match", source: "PEP Screening", riskScore: 92, status: "Escalated", priority: "Critical", assignedTo: "Priya Patel", createdDate: "2026-05-25", slaDue: "2026-05-29", description: "Customer matched as Politically Exposed Person - government official in Nigeria.", caseId: "CASE-002" },
  { id: "ALT-008", customerId: "c005", customerName: "David Okonkwo", type: "Adverse Media", source: "Adverse Media", riskScore: 88, status: "Escalated", priority: "Critical", assignedTo: "Priya Patel", createdDate: "2026-05-26", slaDue: "2026-05-30", description: "News articles linking customer to corruption investigation in home country.", caseId: "CASE-002" },
  { id: "ALT-009", customerId: "c005", customerName: "David Okonkwo", type: "KYC Rejection", source: "KYC", riskScore: 91, status: "Closed", priority: "High", assignedTo: "James Kim", createdDate: "2026-05-20", slaDue: "2026-05-24", description: "Identity documents could not be verified. Documents suspected forgery." },
  { id: "ALT-010", customerId: "c005", customerName: "David Okonkwo", type: "Fraud Indicator", source: "Fraud", riskScore: 89, status: "Escalated", priority: "Critical", assignedTo: "Robert Okafor", createdDate: "2026-05-27", slaDue: "2026-05-31", description: "Account login from 3 different countries in 6-hour period. Possible account takeover.", caseId: "CASE-002" },
  { id: "ALT-011", customerId: "c005", customerName: "David Okonkwo", type: "Manual Review Flag", source: "Manual Review", riskScore: 93, status: "Open", priority: "Critical", assignedTo: "Priya Patel", createdDate: "2026-06-01", slaDue: "2026-06-03", description: "Senior investigator flagged account for comprehensive review based on cumulative risk indicators." },
  { id: "ALT-012", customerId: "c006", customerName: "Global Wire Partners", type: "Sanctions Hit", source: "Sanctions Screening", riskScore: 94, status: "Escalated", priority: "Critical", assignedTo: "Priya Patel", createdDate: "2026-05-28", slaDue: "2026-06-01", description: "Transaction counterparty matched on OFAC Specially Designated Nationals list.", caseId: "CASE-003" },
  { id: "ALT-013", customerId: "c006", customerName: "Global Wire Partners", type: "Bulk Cash Structuring", source: "Transaction Monitoring", riskScore: 85, status: "Open", priority: "High", assignedTo: "Elena Rodriguez", createdDate: "2026-06-01", slaDue: "2026-06-05", description: "Pattern of bulk cash deposits across multiple locations consistent with structuring behavior." },
  { id: "ALT-014", customerId: "c006", customerName: "Global Wire Partners", type: "Adverse Media", source: "Adverse Media", riskScore: 77, status: "In Review", priority: "High", assignedTo: "Devon Williams", createdDate: "2026-05-31", slaDue: "2026-06-05", description: "Recent news reports suggesting connection to money service business operating without license." },
  { id: "ALT-015", customerId: "c006", customerName: "Global Wire Partners", type: "Geographic Concentration Risk", source: "Transaction Monitoring", riskScore: 71, status: "Open", priority: "High", assignedTo: "James Kim", createdDate: "2026-06-02", slaDue: "2026-06-07", description: "85% of wire transfers concentrated to high-risk FATF-listed jurisdictions." },
  { id: "ALT-016", customerId: "c008", customerName: "FastCash Kiosks Inc", type: "KYC Manual Review", source: "KYC", riskScore: 63, status: "Open", priority: "Medium", assignedTo: "Devon Williams", createdDate: "2026-06-01", slaDue: "2026-06-08", description: "Beneficial owner identity verification pending. Enhanced due diligence required." },
  { id: "ALT-017", customerId: "c008", customerName: "FastCash Kiosks Inc", type: "Unusual Transaction Pattern", source: "Transaction Monitoring", riskScore: 74, status: "In Review", priority: "High", assignedTo: "Robert Okafor", createdDate: "2026-05-29", slaDue: "2026-06-03", description: "ATM cash dispensing volume increased 300% week-over-week with no business justification.", caseId: "CASE-006" },
  { id: "ALT-018", customerId: "c008", customerName: "FastCash Kiosks Inc", type: "Suspicious Login Activity", source: "Fraud", riskScore: 68, status: "Open", priority: "Medium", assignedTo: "Elena Rodriguez", createdDate: "2026-06-02", slaDue: "2026-06-07", description: "Multiple failed authentication attempts followed by successful login from unrecognized IP." },
  { id: "ALT-019", customerId: "c009", customerName: "Amara Diallo", type: "Dormant Account Activity", source: "Transaction Monitoring", riskScore: 55, status: "Open", priority: "Low", assignedTo: "James Kim", createdDate: "2026-06-03", slaDue: "2026-06-12", description: "Account dormant for 6 months suddenly received $25,000 wire from unknown source." },
  { id: "ALT-020", customerId: "c011", customerName: "Carlos Mendez", type: "PEP Screening Hit", source: "PEP Screening", riskScore: 83, status: "In Review", priority: "High", assignedTo: "Priya Patel", createdDate: "2026-05-30", slaDue: "2026-06-04", description: "Family member identified as PEP - close associate of municipal government official.", caseId: "CASE-007" },
  { id: "ALT-021", customerId: "c011", customerName: "Carlos Mendez", type: "High-Risk Transaction", source: "Transaction Monitoring", riskScore: 76, status: "Open", priority: "High", assignedTo: "Devon Williams", createdDate: "2026-06-01", slaDue: "2026-06-05", description: "Large wire transfer to correspondent bank in jurisdiction lacking AML standards." },
  { id: "ALT-022", customerId: "c012", customerName: "Blue Horizon Payments", type: "Sanctions Screening Hit", source: "Sanctions Screening", riskScore: 91, status: "Escalated", priority: "Critical", assignedTo: "Robert Okafor", createdDate: "2026-05-27", slaDue: "2026-05-31", description: "Business entity name match in EU financial sanctions database.", caseId: "CASE-008" },
  { id: "ALT-023", customerId: "c012", customerName: "Blue Horizon Payments", type: "Chargeback Fraud", source: "Chargeback", riskScore: 69, status: "Open", priority: "Medium", assignedTo: "Elena Rodriguez", createdDate: "2026-06-02", slaDue: "2026-06-09", description: "Systematic chargeback pattern detected across merchant portfolio suggesting organized fraud." },
  { id: "ALT-024", customerId: "c012", customerName: "Blue Horizon Payments", type: "Transaction Velocity", source: "Transaction Monitoring", riskScore: 73, status: "In Review", priority: "High", assignedTo: "Devon Williams", createdDate: "2026-06-01", slaDue: "2026-06-05", description: "Transaction velocity exceeded model threshold by 250%. Potential layering activity." },
  { id: "ALT-025", customerId: "c013", customerName: "Fatima Al-Hassan", type: "Sanctions Match", source: "Sanctions Screening", riskScore: 96, status: "Escalated", priority: "Critical", assignedTo: "Priya Patel", createdDate: "2026-05-26", slaDue: "2026-05-30", description: "Strong name match on UN Security Council consolidated sanctions list.", caseId: "CASE-009" },
  { id: "ALT-026", customerId: "c013", customerName: "Fatima Al-Hassan", type: "Adverse Media", source: "Adverse Media", riskScore: 82, status: "Escalated", priority: "Critical", assignedTo: "Robert Okafor", createdDate: "2026-05-27", slaDue: "2026-05-31", description: "Multiple credible news sources reporting customer involvement in financial crimes.", caseId: "CASE-009" },
  { id: "ALT-027", customerId: "c013", customerName: "Fatima Al-Hassan", type: "Wire Layering", source: "Transaction Monitoring", riskScore: 88, status: "In Review", priority: "Critical", assignedTo: "Priya Patel", createdDate: "2026-05-28", slaDue: "2026-06-02", description: "Complex layering structure involving 8 intermediate accounts before funds exit ecosystem.", caseId: "CASE-009" },
  { id: "ALT-028", customerId: "c013", customerName: "Fatima Al-Hassan", type: "Manual Review", source: "Manual Review", riskScore: 94, status: "Open", priority: "Critical", assignedTo: "Priya Patel", createdDate: "2026-06-01", slaDue: "2026-06-03", description: "BSA Officer initiated comprehensive review of all account activity." },
  { id: "ALT-029", customerId: "c014", customerName: "Nexus Money Services", type: "High Transaction Volume", source: "Transaction Monitoring", riskScore: 58, status: "Open", priority: "Medium", assignedTo: "James Kim", createdDate: "2026-06-02", slaDue: "2026-06-09", description: "Monthly transaction volume exceeded contractual limit by 30% for the third consecutive month." },
  { id: "ALT-030", customerId: "c015", customerName: "Omar Bashir", type: "KYC Pending Review", source: "KYC", riskScore: 45, status: "Open", priority: "Low", assignedTo: "Devon Williams", createdDate: "2026-05-20", slaDue: "2026-06-03", description: "New customer KYC review in progress. ID documents submitted for verification." },
  { id: "ALT-031", customerId: "c018", customerName: "CashLink Transfers", type: "Bulk Structuring", source: "Transaction Monitoring", riskScore: 86, status: "Escalated", priority: "Critical", assignedTo: "Priya Patel", createdDate: "2026-05-25", slaDue: "2026-05-29", description: "Coordinated structuring activity across multiple MSB agents totaling $480,000.", caseId: "CASE-010" },
  { id: "ALT-032", customerId: "c018", customerName: "CashLink Transfers", type: "Sanctions Exposure", source: "Sanctions Screening", riskScore: 89, status: "Escalated", priority: "Critical", assignedTo: "Robert Okafor", createdDate: "2026-05-26", slaDue: "2026-05-30", description: "Wire transfer counterparty matched on OFAC SDN list. Transaction blocked and under review.", caseId: "CASE-010" },
  { id: "ALT-033", customerId: "c018", customerName: "CashLink Transfers", type: "KYC Document Issues", source: "KYC", riskScore: 71, status: "In Review", priority: "High", assignedTo: "Elena Rodriguez", createdDate: "2026-05-28", slaDue: "2026-06-02", description: "Inconsistencies found in business registration documents. EDD triggered.", caseId: "CASE-010" },
  { id: "ALT-034", customerId: "c018", customerName: "CashLink Transfers", type: "Adverse Media Hit", source: "Adverse Media", riskScore: 84, status: "Open", priority: "High", assignedTo: "Devon Williams", createdDate: "2026-06-01", slaDue: "2026-06-05", description: "Media report linking CashLink Transfers to investigation by FinCEN." },
  { id: "ALT-035", customerId: "c018", customerName: "CashLink Transfers", type: "Transaction Monitoring Alert", source: "Transaction Monitoring", riskScore: 79, status: "Open", priority: "High", assignedTo: "James Kim", createdDate: "2026-06-02", slaDue: "2026-06-06", description: "Unusual concentration of transactions to cryptocurrency exchanges beyond expected business profile." },
  { id: "ALT-036", customerId: "c019", customerName: "Jin-Ho Park", type: "Unusual Wire Activity", source: "Transaction Monitoring", riskScore: 62, status: "Open", priority: "Medium", assignedTo: "Devon Williams", createdDate: "2026-06-01", slaDue: "2026-06-08", description: "First international wire transfer to an unfamiliar jurisdiction flagged for review." },
  { id: "ALT-037", customerId: "c021", customerName: "Kwame Asante", type: "PEP Hit", source: "PEP Screening", riskScore: 81, status: "In Review", priority: "High", assignedTo: "Priya Patel", createdDate: "2026-05-31", slaDue: "2026-06-05", description: "Customer identified as immediate family member of head of state.", caseId: "CASE-011" },
  { id: "ALT-038", customerId: "c021", customerName: "Kwame Asante", type: "High Value Transaction", source: "Transaction Monitoring", riskScore: 75, status: "Open", priority: "High", assignedTo: "Robert Okafor", createdDate: "2026-06-02", slaDue: "2026-06-06", description: "Single transaction of $180,000 inconsistent with stated source of funds." },
  { id: "ALT-039", customerId: "c022", customerName: "Velocity Pay Inc", type: "Chargeback Rate", source: "Chargeback", riskScore: 54, status: "Open", priority: "Low", assignedTo: "Elena Rodriguez", createdDate: "2026-06-03", slaDue: "2026-06-12", description: "Chargeback rate approaching threshold. Trending upward over 60 days." },
  { id: "ALT-040", customerId: "c023", customerName: "Nadia Volkov", type: "Sanctions Hit", source: "Sanctions Screening", riskScore: 97, status: "Escalated", priority: "Critical", assignedTo: "Priya Patel", createdDate: "2026-05-18", slaDue: "2026-05-22", description: "Exact name match on OFAC SDN list for Russian national under executive order sanctions.", caseId: "CASE-012" },
  { id: "ALT-041", customerId: "c023", customerName: "Nadia Volkov", type: "PEP Match", source: "PEP Screening", riskScore: 93, status: "Escalated", priority: "Critical", assignedTo: "Robert Okafor", createdDate: "2026-05-18", slaDue: "2026-05-22", description: "Customer identified as senior official of state-owned enterprise.", caseId: "CASE-012" },
  { id: "ALT-042", customerId: "c023", customerName: "Nadia Volkov", type: "Adverse Media", source: "Adverse Media", riskScore: 91, status: "Escalated", priority: "Critical", assignedTo: "Priya Patel", createdDate: "2026-05-19", slaDue: "2026-05-23", description: "Significant global media coverage linking customer to oligarch network.", caseId: "CASE-012" },
  { id: "ALT-043", customerId: "c023", customerName: "Nadia Volkov", type: "Fraud Ring Indicator", source: "Fraud", riskScore: 89, status: "Escalated", priority: "Critical", assignedTo: "Robert Okafor", createdDate: "2026-05-20", slaDue: "2026-05-24", description: "Device and network fingerprint associated with known fraud ring.", caseId: "CASE-012" },
  { id: "ALT-044", customerId: "c023", customerName: "Nadia Volkov", type: "High Risk Wires", source: "Transaction Monitoring", riskScore: 94, status: "Escalated", priority: "Critical", assignedTo: "Priya Patel", createdDate: "2026-05-19", slaDue: "2026-05-23", description: "Wire transfers to offshore accounts in jurisdictions with no US AML cooperation.", caseId: "CASE-012" },
  { id: "ALT-045", customerId: "c023", customerName: "Nadia Volkov", type: "Manual Review", source: "Manual Review", riskScore: 96, status: "Escalated", priority: "Critical", assignedTo: "Priya Patel", createdDate: "2026-05-21", slaDue: "2026-05-25", description: "BSA Officer directed immediate review and account freeze consideration.", caseId: "CASE-012" },
  { id: "ALT-046", customerId: "c025", customerName: "Ping Chen", type: "Transaction Monitoring", source: "Transaction Monitoring", riskScore: 61, status: "Open", priority: "Medium", assignedTo: "James Kim", createdDate: "2026-06-03", slaDue: "2026-06-10", description: "Unusual pattern of P2P transfers to multiple unrelated recipients." },
  { id: "ALT-047", customerId: "c003", customerName: "Maria Santos", type: "False Positive Review", source: "Sanctions Screening", riskScore: 30, status: "False Positive", assignedTo: "Devon Williams", createdDate: "2026-05-15", slaDue: "2026-05-19", description: "Initial name match on sanctions list confirmed as false positive after manual review." },
  { id: "ALT-048", customerId: "c007", customerName: "Yuki Tanaka", type: "Routine Review", source: "KYC", riskScore: 20, status: "Closed", assignedTo: "James Kim", createdDate: "2026-05-10", slaDue: "2026-05-14", description: "Annual KYC refresh completed successfully. No issues found." },
  { id: "ALT-049", customerId: "c010", customerName: "Pacific Rim Trading Co", type: "Annual EDD", source: "KYC", riskScore: 42, status: "Closed", assignedTo: "Elena Rodriguez", createdDate: "2026-04-15", slaDue: "2026-04-22", description: "Enhanced due diligence review completed. Business activities consistent with profile." },
  { id: "ALT-050", customerId: "c016", customerName: "Swift Card Corp", type: "Periodic Review", source: "KYC", riskScore: 18, status: "Closed", assignedTo: "Devon Williams", createdDate: "2026-04-01", slaDue: "2026-04-08", description: "Quarterly compliance review completed. No adverse findings." },
  // More alerts for variety
  { id: "ALT-051", customerId: "c002", customerName: "Sunrise Remittance LLC", type: "Volume Spike", source: "Transaction Monitoring", riskScore: 68, status: "False Positive", assignedTo: "James Kim", createdDate: "2026-05-12", slaDue: "2026-05-16", description: "Volume spike explained by legitimate seasonal business increase. Closed as false positive." },
  { id: "ALT-052", customerId: "c004", customerName: "TechPay Solutions Inc", type: "Fraud Model Alert", source: "Fraud", riskScore: 55, status: "False Positive", assignedTo: "Elena Rodriguez", createdDate: "2026-05-05", slaDue: "2026-05-09", description: "Model fired on normal behavior pattern. False positive confirmed." },
  { id: "ALT-053", customerId: "c009", customerName: "Amara Diallo", type: "ID Verification", source: "KYC", riskScore: 38, status: "Closed", assignedTo: "Devon Williams", createdDate: "2026-05-22", slaDue: "2026-05-26", description: "Supplemental ID document reviewed and verified. KYC refresh complete." },
  { id: "ALT-054", customerId: "c017", customerName: "Ingrid Larsen", type: "Address Change", source: "KYC", riskScore: 25, status: "Closed", assignedTo: "James Kim", createdDate: "2026-05-18", slaDue: "2026-05-22", description: "Customer submitted new address verification. Updated in system." },
  { id: "ALT-055", customerId: "c020", customerName: "Horizon Micro Finance", type: "Document Expiry", source: "KYC", riskScore: 32, status: "Closed", assignedTo: "Elena Rodriguez", createdDate: "2026-05-25", slaDue: "2026-05-29", description: "License renewal documents received and verified. Compliance record updated." },
  { id: "ALT-056", customerId: "c024", customerName: "RedRock Financial", type: "Annual Review", source: "KYC", riskScore: 22, status: "Closed", assignedTo: "Devon Williams", createdDate: "2026-05-08", slaDue: "2026-05-15", description: "Annual compliance review completed with satisfactory results." },
  { id: "ALT-057", customerId: "c006", customerName: "Global Wire Partners", type: "New Director Addition", source: "KYC", riskScore: 61, status: "In Review", priority: "Medium", assignedTo: "Robert Okafor", createdDate: "2026-06-01", slaDue: "2026-06-08", description: "New beneficial owner added to corporate structure. Identity verification in progress.", caseId: "CASE-003" },
  { id: "ALT-058", customerId: "c011", customerName: "Carlos Mendez", type: "Source of Funds", source: "Manual Review", riskScore: 71, status: "In Review", priority: "High", assignedTo: "Priya Patel", createdDate: "2026-05-28", slaDue: "2026-06-03", description: "Customer unable to adequately explain source of large wire transfer. Investigation ongoing.", caseId: "CASE-007" },
  { id: "ALT-059", customerId: "c013", customerName: "Fatima Al-Hassan", type: "Periodic Review", source: "KYC", riskScore: 85, status: "Escalated", priority: "Critical", assignedTo: "Priya Patel", createdDate: "2026-05-29", slaDue: "2026-06-02", description: "Periodic review triggered enhanced due diligence. Multiple risk factors identified.", caseId: "CASE-009" },
  { id: "ALT-060", customerId: "c023", customerName: "Nadia Volkov", type: "Account Freeze Review", source: "Manual Review", riskScore: 98, status: "Closed", assignedTo: "Priya Patel", createdDate: "2026-05-22", slaDue: "2026-05-23", description: "Account freeze initiated per BSA Officer directive. All pending transactions halted.", caseId: "CASE-012" },
  // More filler alerts
  { id: "ALT-061", customerId: "c004", customerName: "TechPay Solutions Inc", type: "Compliance Check", source: "Manual Review", riskScore: 40, status: "Closed", assignedTo: "Elena Rodriguez", createdDate: "2026-04-20", slaDue: "2026-04-27", description: "Routine compliance check completed." },
  { id: "ALT-062", customerId: "c016", customerName: "Swift Card Corp", type: "Risk Review", source: "Manual Review", riskScore: 28, status: "Closed", assignedTo: "James Kim", createdDate: "2026-04-10", slaDue: "2026-04-17", description: "Annual risk review with favorable outcome." },
  { id: "ALT-063", customerId: "c022", customerName: "Velocity Pay Inc", type: "KYB Refresh", source: "KYC", riskScore: 45, status: "Closed", assignedTo: "Devon Williams", createdDate: "2026-03-15", slaDue: "2026-03-22", description: "Business verification refresh completed. No changes to risk profile." },
  { id: "ALT-064", customerId: "c025", customerName: "Ping Chen", type: "Unusual Activity", source: "Transaction Monitoring", riskScore: 56, status: "False Positive", assignedTo: "Robert Okafor", createdDate: "2026-05-20", slaDue: "2026-05-24", description: "Flagged activity confirmed as normal peer-to-peer transfers with known contacts." },
  { id: "ALT-065", customerId: "c019", customerName: "Jin-Ho Park", type: "Periodic Review", source: "KYC", riskScore: 38, status: "Closed", assignedTo: "Devon Williams", createdDate: "2026-04-05", slaDue: "2026-04-12", description: "Semi-annual KYC review completed successfully." },
  { id: "ALT-066", customerId: "c003", customerName: "Maria Santos", type: "Remittance Review", source: "Transaction Monitoring", riskScore: 33, status: "Closed", assignedTo: "James Kim", createdDate: "2026-05-01", slaDue: "2026-05-05", description: "Remittance volume within expected parameters. No action required." },
  { id: "ALT-067", customerId: "c017", customerName: "Ingrid Larsen", type: "Fraud Alert", source: "Fraud", riskScore: 22, status: "False Positive", assignedTo: "Elena Rodriguez", createdDate: "2026-05-02", slaDue: "2026-05-06", description: "Transaction flagged but confirmed as customer-initiated purchase." },
  { id: "ALT-068", customerId: "c024", customerName: "RedRock Financial", type: "ACH Review", source: "Transaction Monitoring", riskScore: 30, status: "Closed", assignedTo: "Devon Williams", createdDate: "2026-04-28", slaDue: "2026-05-02", description: "ACH debit pattern reviewed. Normal payroll processing." },
  { id: "ALT-069", customerId: "c020", customerName: "Horizon Micro Finance", type: "Screening Review", source: "Sanctions Screening", riskScore: 27, status: "False Positive", assignedTo: "James Kim", createdDate: "2026-04-22", slaDue: "2026-04-26", description: "Business name similar to listed entity. Confirmed different organization." },
  { id: "ALT-070", customerId: "c010", customerName: "Pacific Rim Trading Co", type: "Trade Finance Review", source: "Transaction Monitoring", riskScore: 48, status: "Closed", assignedTo: "Robert Okafor", createdDate: "2026-05-12", slaDue: "2026-05-16", description: "Trade finance transactions reviewed and documented. No issues." },
  { id: "ALT-071", customerId: "c014", customerName: "Nexus Money Services", type: "Compliance Exam", source: "KYC", riskScore: 52, status: "Closed", assignedTo: "Elena Rodriguez", createdDate: "2026-04-18", slaDue: "2026-04-25", description: "Regulatory compliance exam review completed." },
  { id: "ALT-072", customerId: "c022", customerName: "Velocity Pay Inc", type: "Chargeback Review", source: "Chargeback", riskScore: 49, status: "Closed", assignedTo: "Devon Williams", createdDate: "2026-05-06", slaDue: "2026-05-10", description: "Isolated chargeback spike attributed to technical issue. Resolved." },
  { id: "ALT-073", customerId: "c019", customerName: "Jin-Ho Park", type: "Wire Transfer Review", source: "Transaction Monitoring", riskScore: 55, status: "False Positive", assignedTo: "James Kim", createdDate: "2026-05-15", slaDue: "2026-05-19", description: "International wire reviewed. Purpose confirmed as business investment." },
  { id: "ALT-074", customerId: "c009", customerName: "Amara Diallo", type: "Remittance Pattern", source: "Transaction Monitoring", riskScore: 44, status: "Closed", assignedTo: "Elena Rodriguez", createdDate: "2026-04-30", slaDue: "2026-05-04", description: "Remittance patterns reviewed. Consistent with stated family support purpose." },
  { id: "ALT-075", customerId: "c003", customerName: "Maria Santos", type: "Account Review", source: "Manual Review", riskScore: 18, status: "Closed", assignedTo: "Devon Williams", createdDate: "2026-05-08", slaDue: "2026-05-12", description: "Routine account review. Customer in good standing." },
];

export const CASES: Case[] = [
  {
    id: "CASE-001", customerId: "c001", customerName: "Alex Rivera", status: "SAR Review", priority: "Critical", assignedTo: "Priya Patel", createdDate: "2026-05-29", updatedDate: "2026-06-03", alertIds: ["ALT-002"], description: "Sanctions match and rapid fund movement investigation. Multiple indicators of potential money laundering activity requiring SAR review.", sarStatus: "SAR Recommended",
    notes: [
      { id: "n1", caseId: "CASE-001", author: "Priya Patel", content: "Initiated investigation following OFAC SDN partial match. Coordinating with legal.", timestamp: "2026-05-29T10:30:00Z", type: "Note" },
      { id: "n2", caseId: "CASE-001", author: "Priya Patel", content: "Customer contacted for clarification. No response after 48 hours.", timestamp: "2026-05-31T14:15:00Z", type: "EDD Request" },
      { id: "n3", caseId: "CASE-001", author: "Marcus Johnson", content: "Escalated to SAR review given non-cooperation and risk level.", timestamp: "2026-06-02T09:00:00Z", type: "SAR Recommendation" },
    ]
  },
  {
    id: "CASE-002", customerId: "c005", customerName: "David Okonkwo", status: "Escalated", priority: "Critical", assignedTo: "Priya Patel", createdDate: "2026-05-25", updatedDate: "2026-06-01", alertIds: ["ALT-007", "ALT-008", "ALT-010"], description: "Multiple critical alerts including PEP match, adverse media, and fraud indicators. Account suspended pending investigation.",
    notes: [
      { id: "n4", caseId: "CASE-002", author: "Priya Patel", content: "PEP match confirmed. Initiating enhanced due diligence process.", timestamp: "2026-05-25T11:00:00Z", type: "EDD Request" },
      { id: "n5", caseId: "CASE-002", author: "Robert Okafor", content: "Adverse media corroborates PEP concerns. Recommend account restriction.", timestamp: "2026-05-27T16:30:00Z", type: "Escalation" },
      { id: "n6", caseId: "CASE-002", author: "Marcus Johnson", content: "Account suspended. Legal team notified.", timestamp: "2026-05-28T08:45:00Z", type: "Status Change" },
    ]
  },
  {
    id: "CASE-003", customerId: "c006", customerName: "Global Wire Partners", status: "SAR Review", priority: "Critical", assignedTo: "Priya Patel", createdDate: "2026-05-28", updatedDate: "2026-06-02", alertIds: ["ALT-012", "ALT-057"], description: "OFAC SDN counterparty match and new director adding risk. Comprehensive investigation of wire transfer network.", sarStatus: "SAR Recommended",
    notes: [
      { id: "n7", caseId: "CASE-003", author: "Robert Okafor", content: "OFAC match confirmed. Transaction blocked. Investigating full transaction history.", timestamp: "2026-05-28T13:00:00Z", type: "Note" },
      { id: "n8", caseId: "CASE-003", author: "Priya Patel", content: "New director KYC indicates potential exposure to sanctioned individuals. SAR recommended.", timestamp: "2026-06-01T10:00:00Z", type: "SAR Recommendation" },
    ]
  },
  {
    id: "CASE-004", customerId: "c002", customerName: "Sunrise Remittance LLC", status: "Pending EDD", priority: "High", assignedTo: "Robert Okafor", createdDate: "2026-05-30", updatedDate: "2026-06-02", alertIds: ["ALT-005"], description: "High volume remittance spikes to high-risk jurisdictions. EDD documentation requested.",
    notes: [
      { id: "n9", caseId: "CASE-004", author: "Robert Okafor", content: "Volume analysis complete. EDD documentation request sent to customer.", timestamp: "2026-05-30T14:00:00Z", type: "EDD Request" },
    ]
  },
  {
    id: "CASE-005", customerId: "c013", customerName: "Fatima Al-Hassan", status: "Open", priority: "Medium", assignedTo: "Elena Rodriguez", createdDate: "2026-05-10", updatedDate: "2026-05-25", alertIds: [], description: "Periodic review case. Annual EDD review for high-risk customer.",
    notes: []
  },
  {
    id: "CASE-006", customerId: "c008", customerName: "FastCash Kiosks Inc", status: "In Review", priority: "High", assignedTo: "Robert Okafor", createdDate: "2026-05-29", updatedDate: "2026-06-02", alertIds: ["ALT-017"], description: "Unusual ATM volume spike investigation. Business justification being evaluated.",
    notes: [
      { id: "n10", caseId: "CASE-006", author: "Robert Okafor", content: "Contacted customer for ATM volume explanation. Awaiting response.", timestamp: "2026-05-30T09:30:00Z", type: "Note" },
    ]
  },
  {
    id: "CASE-007", customerId: "c011", customerName: "Carlos Mendez", status: "In Review", priority: "High", assignedTo: "Priya Patel", createdDate: "2026-05-30", updatedDate: "2026-06-02", alertIds: ["ALT-020", "ALT-058"], description: "PEP family member connection and unexplained high-value wire transfer. EDD in progress.",
    notes: [
      { id: "n11", caseId: "CASE-007", author: "Priya Patel", content: "PEP connection confirmed. Requesting additional documentation on source of funds.", timestamp: "2026-05-31T11:00:00Z", type: "EDD Request" },
    ]
  },
  {
    id: "CASE-008", customerId: "c012", customerName: "Blue Horizon Payments", status: "SAR Review", priority: "Critical", assignedTo: "Robert Okafor", createdDate: "2026-05-27", updatedDate: "2026-06-02", alertIds: ["ALT-022"], description: "EU financial sanctions match. Transaction patterns suggest potential circumvention of sanctions.", sarStatus: "SAR Approved",
    notes: [
      { id: "n12", caseId: "CASE-008", author: "Robert Okafor", content: "EU sanctions match confirmed. Full transaction history exported for analysis.", timestamp: "2026-05-27T15:00:00Z", type: "Note" },
      { id: "n13", caseId: "CASE-008", author: "Marcus Johnson", content: "Analysis complete. SAR recommended based on sanctions exposure and transaction patterns.", timestamp: "2026-05-30T10:00:00Z", type: "SAR Recommendation" },
      { id: "n14", caseId: "CASE-008", author: "Sarah Chen", content: "SAR approved. Proceeding with filing.", timestamp: "2026-06-01T09:00:00Z", type: "Status Change" },
    ]
  },
  {
    id: "CASE-009", customerId: "c013", customerName: "Fatima Al-Hassan", status: "SAR Review", priority: "Critical", assignedTo: "Priya Patel", createdDate: "2026-05-26", updatedDate: "2026-06-03", alertIds: ["ALT-025", "ALT-026", "ALT-027", "ALT-059"], description: "UN sanctions match, adverse media, and complex wire layering. Highest-priority SAR case.", sarStatus: "SAR Approved",
    notes: [
      { id: "n15", caseId: "CASE-009", author: "Priya Patel", content: "UN sanctions match and multiple supporting risk factors. Initiating SAR process.", timestamp: "2026-05-26T09:00:00Z", type: "SAR Recommendation" },
      { id: "n16", caseId: "CASE-009", author: "Sarah Chen", content: "Reviewed all evidence. SAR approved. Legal filing in progress.", timestamp: "2026-05-31T14:00:00Z", type: "Status Change" },
    ]
  },
  {
    id: "CASE-010", customerId: "c018", customerName: "CashLink Transfers", status: "Escalated", priority: "Critical", assignedTo: "Priya Patel", createdDate: "2026-05-25", updatedDate: "2026-06-03", alertIds: ["ALT-031", "ALT-032", "ALT-033"], description: "Coordinated structuring across MSB network plus OFAC hit. Potential organized financial crime operation.", sarStatus: "SAR Recommended",
    notes: [
      { id: "n17", caseId: "CASE-010", author: "Priya Patel", content: "Structuring pattern identified across 12 agent locations. OFAC hit confirmed.", timestamp: "2026-05-25T14:00:00Z", type: "Escalation" },
      { id: "n18", caseId: "CASE-010", author: "Robert Okafor", content: "Document inconsistencies confirmed. EDD triggered across entire network.", timestamp: "2026-05-28T11:00:00Z", type: "EDD Request" },
      { id: "n19", caseId: "CASE-010", author: "Marcus Johnson", content: "Pattern analysis complete. Recommending SAR and law enforcement referral.", timestamp: "2026-06-01T10:00:00Z", type: "SAR Recommendation" },
    ]
  },
  {
    id: "CASE-011", customerId: "c021", customerName: "Kwame Asante", status: "In Review", priority: "High", assignedTo: "Priya Patel", createdDate: "2026-05-31", updatedDate: "2026-06-02", alertIds: ["ALT-037"], description: "Close PEP relative - immediate family of head of state. Enhanced monitoring and EDD required.",
    notes: [
      { id: "n20", caseId: "CASE-011", author: "Priya Patel", content: "PEP connection verified through open source research. Enhanced monitoring activated.", timestamp: "2026-05-31T13:00:00Z", type: "Note" },
    ]
  },
  {
    id: "CASE-012", customerId: "c023", customerName: "Nadia Volkov", status: "Closed", priority: "Critical", assignedTo: "Priya Patel", createdDate: "2026-05-18", updatedDate: "2026-05-28", alertIds: ["ALT-040", "ALT-041", "ALT-042", "ALT-043", "ALT-044", "ALT-045"], description: "OFAC exact match with supporting PEP, adverse media, and fraud indicators. Account terminated. SAR filed.", sarStatus: "Filed", closedDate: "2026-05-28",
    notes: [
      { id: "n21", caseId: "CASE-012", author: "Priya Patel", content: "OFAC exact match confirmed. Emergency account freeze initiated.", timestamp: "2026-05-18T08:00:00Z", type: "Escalation" },
      { id: "n22", caseId: "CASE-012", author: "Sarah Chen", content: "SAR filed with FinCEN. Account terminated. Law enforcement referral under consideration.", timestamp: "2026-05-25T10:00:00Z", type: "Status Change" },
      { id: "n23", caseId: "CASE-012", author: "Sarah Chen", content: "Case closed following SAR filing and account termination.", timestamp: "2026-05-28T16:00:00Z", type: "Status Change" },
    ]
  },
  {
    id: "CASE-013", customerId: "c004", customerName: "TechPay Solutions Inc", status: "Closed", priority: "Low", assignedTo: "Elena Rodriguez", createdDate: "2026-04-20", updatedDate: "2026-05-01", alertIds: [], description: "Chargeback threshold investigation. Resolved with enhanced monitoring agreement.",
    notes: [
      { id: "n24", caseId: "CASE-013", author: "Elena Rodriguez", content: "Investigated chargeback pattern. Technical issue identified and remediated by merchant.", timestamp: "2026-04-25T10:00:00Z", type: "Note" },
      { id: "n25", caseId: "CASE-013", author: "Elena Rodriguez", content: "Enhanced monitoring agreement signed. Case closed.", timestamp: "2026-05-01T14:00:00Z", type: "Status Change" },
    ]
  },
  {
    id: "CASE-014", customerId: "c006", customerName: "Global Wire Partners", status: "Pending EDD", priority: "High", assignedTo: "Robert Okafor", createdDate: "2026-05-15", updatedDate: "2026-05-31", alertIds: ["ALT-014"], description: "Adverse media investigation and geographic concentration risk. EDD package submitted, under review.",
    notes: [
      { id: "n26", caseId: "CASE-014", author: "Robert Okafor", content: "Adverse media confirmed. EDD documentation requested.", timestamp: "2026-05-15T11:00:00Z", type: "EDD Request" },
      { id: "n27", caseId: "CASE-014", author: "Robert Okafor", content: "EDD package received from customer. Under review.", timestamp: "2026-05-28T09:00:00Z", type: "Note" },
    ]
  },
  {
    id: "CASE-015", customerId: "c003", customerName: "Maria Santos", status: "Closed", priority: "Low", assignedTo: "Devon Williams", createdDate: "2026-03-10", updatedDate: "2026-03-18", alertIds: [], description: "Routine annual review case. All checks passed.",
    notes: []
  },
  {
    id: "CASE-016", customerId: "c007", customerName: "Yuki Tanaka", status: "Closed", priority: "Low", assignedTo: "James Kim", createdDate: "2026-02-15", updatedDate: "2026-02-22", alertIds: [], description: "KYC refresh case. Documents updated.",
    notes: []
  },
  {
    id: "CASE-017", customerId: "c019", customerName: "Jin-Ho Park", status: "Open", priority: "Medium", assignedTo: "Devon Williams", createdDate: "2026-06-01", updatedDate: "2026-06-01", alertIds: ["ALT-036"], description: "First international wire requiring enhanced review per policy.",
    notes: []
  },
  {
    id: "CASE-018", customerId: "c025", customerName: "Ping Chen", status: "Open", priority: "Medium", assignedTo: "James Kim", createdDate: "2026-06-03", updatedDate: "2026-06-03", alertIds: ["ALT-046"], description: "P2P transfer pattern review. Initial investigation stage.",
    notes: []
  },
  {
    id: "CASE-019", customerId: "c018", customerName: "CashLink Transfers", status: "SAR Review", priority: "Critical", assignedTo: "Marcus Johnson", createdDate: "2026-06-01", updatedDate: "2026-06-03", alertIds: ["ALT-034", "ALT-035"], description: "FinCEN media report and crypto exchange concentration. Supplemental investigation to CASE-010.", sarStatus: "Pending Review",
    notes: [
      { id: "n28", caseId: "CASE-019", author: "Marcus Johnson", content: "FinCEN investigation report corroborates internal findings. Opening supplemental SAR investigation.", timestamp: "2026-06-01T11:00:00Z", type: "SAR Recommendation" },
    ]
  },
  {
    id: "CASE-020", customerId: "c021", customerName: "Kwame Asante", status: "Open", priority: "High", assignedTo: "Robert Okafor", createdDate: "2026-06-02", updatedDate: "2026-06-02", alertIds: ["ALT-038"], description: "High-value transaction inconsistent with source of funds documentation.",
    notes: []
  },
];

export const SAR_REVIEWS: SARReview[] = [
  { id: "SAR-001", caseId: "CASE-001", customerId: "c001", customerName: "Alex Rivera", detectionDate: "2026-05-29", sarDeadline: "2026-06-28", status: "SAR Recommended", recommendedBy: "Marcus Johnson", amount: 284500, narrative: "Customer engaged in multiple structuring transactions and has partial OFAC match requiring SAR filing." },
  { id: "SAR-002", caseId: "CASE-003", customerId: "c006", customerName: "Global Wire Partners", detectionDate: "2026-05-28", sarDeadline: "2026-06-27", status: "SAR Recommended", recommendedBy: "Priya Patel", amount: 1200000, narrative: "OFAC SDN counterparty transaction and wire network consistent with sanctions circumvention." },
  { id: "SAR-003", caseId: "CASE-008", customerId: "c012", customerName: "Blue Horizon Payments", detectionDate: "2026-05-27", sarDeadline: "2026-06-26", status: "SAR Approved", recommendedBy: "Marcus Johnson", finalDecisionMaker: "Sarah Chen", filingStatus: "Pending Filing", amount: 875000, narrative: "EU sanctions match with transaction patterns indicating potential sanctions circumvention via correspondent banking." },
  { id: "SAR-004", caseId: "CASE-009", customerId: "c013", customerName: "Fatima Al-Hassan", detectionDate: "2026-05-26", sarDeadline: "2026-06-25", status: "SAR Approved", recommendedBy: "Priya Patel", finalDecisionMaker: "Sarah Chen", filingStatus: "In Filing", amount: 445000, narrative: "UN Security Council sanctions match with complex wire layering indicative of money laundering and sanctions evasion." },
  { id: "SAR-005", caseId: "CASE-010", customerId: "c018", customerName: "CashLink Transfers", detectionDate: "2026-05-25", sarDeadline: "2026-06-24", status: "SAR Recommended", recommendedBy: "Marcus Johnson", amount: 2750000, narrative: "Coordinated structuring across MSB network with OFAC exposure. Potential large-scale money laundering operation." },
  { id: "SAR-006", caseId: "CASE-012", customerId: "c023", customerName: "Nadia Volkov", detectionDate: "2026-05-18", sarDeadline: "2026-06-17", status: "Filed", recommendedBy: "Priya Patel", finalDecisionMaker: "Sarah Chen", filingStatus: "Filed with FinCEN", continuingSarDue: "2026-08-17", amount: 567000, narrative: "OFAC exact match. Account terminated. SAR filed under 31 CFR 1020.320. Continuing SAR monitoring period initiated." },
  { id: "SAR-007", caseId: "CASE-019", customerId: "c018", customerName: "CashLink Transfers", detectionDate: "2026-06-01", sarDeadline: "2026-06-30", status: "Pending Review", recommendedBy: "Marcus Johnson", amount: 340000, narrative: "Supplemental investigation related to FinCEN media reports and cryptocurrency concentration." },
  { id: "SAR-008", caseId: "CASE-002", customerId: "c005", customerName: "David Okonkwo", detectionDate: "2026-05-25", sarDeadline: "2026-06-24", status: "SAR Declined", recommendedBy: "Elena Rodriguez", finalDecisionMaker: "Sarah Chen", amount: 98700, narrative: "PEP match and adverse media reviewed. BSA Officer determined insufficient evidence for SAR at this time. Enhanced monitoring required." },
  { id: "SAR-009", caseId: "CASE-007", customerId: "c011", customerName: "Carlos Mendez", detectionDate: "2026-05-30", sarDeadline: "2026-06-29", status: "Pending Review", recommendedBy: "Priya Patel", amount: 156000, narrative: "PEP family connection and unexplained high-value wire. EDD documentation pending before SAR determination." },
  { id: "SAR-010", caseId: "CASE-014", customerId: "c006", customerName: "Global Wire Partners", detectionDate: "2026-05-15", sarDeadline: "2026-06-14", status: "Continuing Review", recommendedBy: "Robert Okafor", continuingSarDue: "2026-08-14", amount: 890000, narrative: "Geographic concentration risk with adverse media. Continuing review period while EDD documentation is evaluated." },
];

export const TRANSACTIONS: Transaction[] = [
  { id: "TXN-001", customerId: "c001", customerName: "Alex Rivera", type: "Cash Deposit", amount: 9800, currency: "USD", status: "Completed", counterparty: "Branch ATM", date: "2026-06-01", channel: "Branch", flagged: true },
  { id: "TXN-002", customerId: "c001", customerName: "Alex Rivera", type: "Cash Deposit", amount: 9500, currency: "USD", status: "Completed", counterparty: "Branch ATM", date: "2026-05-31", channel: "Branch", flagged: true },
  { id: "TXN-003", customerId: "c001", customerName: "Alex Rivera", type: "Wire Transfer Out", amount: 45000, currency: "USD", status: "Completed", counterparty: "Cayman Holdings Ltd", date: "2026-05-30", channel: "Online", flagged: true },
  { id: "TXN-004", customerId: "c001", customerName: "Alex Rivera", type: "Cash Deposit", amount: 9700, currency: "USD", status: "Completed", counterparty: "Branch ATM", date: "2026-05-29", channel: "Branch", flagged: true },
  { id: "TXN-005", customerId: "c001", customerName: "Alex Rivera", type: "Wire Transfer In", amount: 75000, currency: "USD", status: "Completed", counterparty: "Unknown Entity", date: "2026-05-28", channel: "Wire", flagged: true },
  { id: "TXN-006", customerId: "c002", customerName: "Sunrise Remittance LLC", type: "Wire Transfer Out", amount: 125000, currency: "USD", status: "Completed", counterparty: "Dubai Exchange", date: "2026-06-03", channel: "Wire", flagged: false },
  { id: "TXN-007", customerId: "c002", customerName: "Sunrise Remittance LLC", type: "Wire Transfer Out", amount: 87000, currency: "USD", status: "Completed", counterparty: "Karachi Finance", date: "2026-06-02", channel: "Wire", flagged: true },
  { id: "TXN-008", customerId: "c003", customerName: "Maria Santos", type: "Remittance", amount: 2500, currency: "USD", status: "Completed", counterparty: "Western Union", date: "2026-06-02", channel: "Online", flagged: false },
  { id: "TXN-009", customerId: "c003", customerName: "Maria Santos", type: "Remittance", amount: 1800, currency: "USD", status: "Completed", counterparty: "Western Union", date: "2026-05-15", channel: "Online", flagged: false },
  { id: "TXN-010", customerId: "c004", customerName: "TechPay Solutions Inc", type: "ACH Batch", amount: 450000, currency: "USD", status: "Completed", counterparty: "Merchant Portfolio", date: "2026-06-03", channel: "ACH", flagged: false },
  { id: "TXN-011", customerId: "c005", customerName: "David Okonkwo", type: "Wire Transfer In", amount: 35000, currency: "USD", status: "Blocked", counterparty: "Lagos Trust Bank", date: "2026-05-28", channel: "Wire", flagged: true },
  { id: "TXN-012", customerId: "c005", customerName: "David Okonkwo", type: "Cash Withdrawal", amount: 15000, currency: "USD", status: "Completed", counterparty: "ATM", date: "2026-05-25", channel: "ATM", flagged: true },
  { id: "TXN-013", customerId: "c006", customerName: "Global Wire Partners", type: "Wire Transfer Out", amount: 250000, currency: "USD", status: "Blocked", counterparty: "Al-Rashid Exchange", date: "2026-05-28", channel: "Wire", flagged: true },
  { id: "TXN-014", customerId: "c006", customerName: "Global Wire Partners", type: "Wire Transfer Out", amount: 180000, currency: "USD", status: "Completed", counterparty: "Tehran Finance Co", date: "2026-06-01", channel: "Wire", flagged: true },
  { id: "TXN-015", customerId: "c008", customerName: "FastCash Kiosks Inc", type: "ATM Cash Dispense", amount: 95000, currency: "USD", status: "Completed", counterparty: "Kiosk Network", date: "2026-06-02", channel: "ATM", flagged: true },
  { id: "TXN-016", customerId: "c008", customerName: "FastCash Kiosks Inc", type: "ATM Cash Dispense", amount: 110000, currency: "USD", status: "Completed", counterparty: "Kiosk Network", date: "2026-06-01", channel: "ATM", flagged: true },
  { id: "TXN-017", customerId: "c009", customerName: "Amara Diallo", type: "Wire Transfer In", amount: 25000, currency: "USD", status: "Completed", counterparty: "Unknown Sender", date: "2026-06-01", channel: "Wire", flagged: true },
  { id: "TXN-018", customerId: "c011", customerName: "Carlos Mendez", type: "Wire Transfer Out", amount: 180000, currency: "USD", status: "Pending Review", counterparty: "Offshore Holdings", date: "2026-06-01", channel: "Wire", flagged: true },
  { id: "TXN-019", customerId: "c012", customerName: "Blue Horizon Payments", type: "ACH Transfer", amount: 320000, currency: "USD", status: "Blocked", counterparty: "EU Entity", date: "2026-05-27", channel: "ACH", flagged: true },
  { id: "TXN-020", customerId: "c013", customerName: "Fatima Al-Hassan", type: "Wire Transfer Out", amount: 85000, currency: "USD", status: "Blocked", counterparty: "Swiss Account", date: "2026-05-26", channel: "Wire", flagged: true },
  { id: "TXN-021", customerId: "c013", customerName: "Fatima Al-Hassan", type: "Wire Transfer Out", amount: 120000, currency: "USD", status: "Completed", counterparty: "Cyprus Entity", date: "2026-05-20", channel: "Wire", flagged: true },
  { id: "TXN-022", customerId: "c013", customerName: "Fatima Al-Hassan", type: "Wire Transfer Out", amount: 95000, currency: "USD", status: "Completed", counterparty: "Shell Co BVI", date: "2026-05-15", channel: "Wire", flagged: true },
  { id: "TXN-023", customerId: "c018", customerName: "CashLink Transfers", type: "Wire Transfer Out", amount: 480000, currency: "USD", status: "Blocked", counterparty: "SDN Listed Entity", date: "2026-05-26", channel: "Wire", flagged: true },
  { id: "TXN-024", customerId: "c023", customerName: "Nadia Volkov", type: "Wire Transfer Out", amount: 200000, currency: "USD", status: "Blocked", counterparty: "Moscow Investbank", date: "2026-05-18", channel: "Wire", flagged: true },
  { id: "TXN-025", customerId: "c023", customerName: "Nadia Volkov", type: "Wire Transfer In", amount: 350000, currency: "USD", status: "Reversed", counterparty: "Cyprus Offshore Ltd", date: "2026-05-17", channel: "Wire", flagged: true },
  // Normal transactions
  { id: "TXN-026", customerId: "c007", customerName: "Yuki Tanaka", type: "P2P Transfer", amount: 500, currency: "USD", status: "Completed", counterparty: "Friend", date: "2026-05-30", channel: "App", flagged: false },
  { id: "TXN-027", customerId: "c010", customerName: "Pacific Rim Trading Co", type: "ACH", amount: 45000, currency: "USD", status: "Completed", counterparty: "Supplier", date: "2026-05-29", channel: "ACH", flagged: false },
  { id: "TXN-028", customerId: "c016", customerName: "Swift Card Corp", type: "Card Settlement", amount: 125000, currency: "USD", status: "Completed", counterparty: "Merchant Network", date: "2026-06-03", channel: "Card", flagged: false },
  { id: "TXN-029", customerId: "c017", customerName: "Ingrid Larsen", type: "Direct Deposit", amount: 4200, currency: "USD", status: "Completed", counterparty: "Employer", date: "2026-05-28", channel: "ACH", flagged: false },
  { id: "TXN-030", customerId: "c019", customerName: "Jin-Ho Park", type: "Wire Transfer Out", amount: 15000, currency: "USD", status: "Pending Review", counterparty: "Korea Investment Corp", date: "2026-06-01", channel: "Wire", flagged: true },
  { id: "TXN-031", customerId: "c020", customerName: "Horizon Micro Finance", type: "ACH Batch", amount: 28000, currency: "USD", status: "Completed", counterparty: "Loan Recipients", date: "2026-05-31", channel: "ACH", flagged: false },
  { id: "TXN-032", customerId: "c021", customerName: "Kwame Asante", type: "Wire Transfer In", amount: 180000, currency: "USD", status: "Pending Review", counterparty: "Accra Holdings", date: "2026-06-02", channel: "Wire", flagged: true },
  { id: "TXN-033", customerId: "c022", customerName: "Velocity Pay Inc", type: "Card Settlement", amount: 89000, currency: "USD", status: "Completed", counterparty: "Merchant Portfolio", date: "2026-06-03", channel: "Card", flagged: false },
  { id: "TXN-034", customerId: "c024", customerName: "RedRock Financial", type: "ACH", amount: 32000, currency: "USD", status: "Completed", counterparty: "Business Account", date: "2026-06-02", channel: "ACH", flagged: false },
  { id: "TXN-035", customerId: "c025", customerName: "Ping Chen", type: "P2P Transfer", amount: 800, currency: "USD", status: "Completed", counterparty: "Family Member", date: "2026-06-03", channel: "App", flagged: false },
  { id: "TXN-036", customerId: "c001", customerName: "Alex Rivera", type: "Cash Deposit", amount: 9900, currency: "USD", status: "Completed", counterparty: "Branch", date: "2026-05-27", channel: "Branch", flagged: true },
  { id: "TXN-037", customerId: "c002", customerName: "Sunrise Remittance LLC", type: "Wire Transfer Out", amount: 210000, currency: "USD", status: "Completed", counterparty: "UAE Exchange", date: "2026-05-28", channel: "Wire", flagged: true },
  { id: "TXN-038", customerId: "c006", customerName: "Global Wire Partners", type: "Wire Transfer Out", amount: 340000, currency: "USD", status: "Completed", counterparty: "Havana Partners", date: "2026-05-25", channel: "Wire", flagged: true },
  { id: "TXN-039", customerId: "c018", customerName: "CashLink Transfers", type: "Crypto Exchange", amount: 95000, currency: "USD", status: "Completed", counterparty: "Binance", date: "2026-06-02", channel: "Online", flagged: true },
  { id: "TXN-040", customerId: "c018", customerName: "CashLink Transfers", type: "Crypto Exchange", amount: 87000, currency: "USD", status: "Completed", counterparty: "Coinbase", date: "2026-06-01", channel: "Online", flagged: true },
  // Additional transactions to reach 100
  { id: "TXN-041", customerId: "c003", customerName: "Maria Santos", type: "Remittance", amount: 3000, currency: "USD", status: "Completed", counterparty: "MoneyGram", date: "2026-04-30", channel: "Online", flagged: false },
  { id: "TXN-042", customerId: "c004", customerName: "TechPay Solutions Inc", type: "Card Settlement", amount: 520000, currency: "USD", status: "Completed", counterparty: "Merchant Portfolio", date: "2026-05-31", channel: "Card", flagged: false },
  { id: "TXN-043", customerId: "c007", customerName: "Yuki Tanaka", type: "Bill Pay", amount: 1200, currency: "USD", status: "Completed", counterparty: "Utility Co", date: "2026-05-28", channel: "App", flagged: false },
  { id: "TXN-044", customerId: "c009", customerName: "Amara Diallo", type: "Remittance", amount: 4500, currency: "USD", status: "Completed", counterparty: "Senegal Transfer", date: "2026-05-28", channel: "Online", flagged: false },
  { id: "TXN-045", customerId: "c010", customerName: "Pacific Rim Trading Co", type: "Wire Transfer In", amount: 120000, currency: "USD", status: "Completed", counterparty: "Singapore Trade", date: "2026-05-25", channel: "Wire", flagged: false },
  { id: "TXN-046", customerId: "c014", customerName: "Nexus Money Services", type: "Wire Transfer Out", amount: 185000, currency: "USD", status: "Completed", counterparty: "Mexico Remittance", date: "2026-06-03", channel: "Wire", flagged: false },
  { id: "TXN-047", customerId: "c015", customerName: "Omar Bashir", type: "Direct Deposit", amount: 3800, currency: "USD", status: "Completed", counterparty: "Employer", date: "2026-05-25", channel: "ACH", flagged: false },
  { id: "TXN-048", customerId: "c016", customerName: "Swift Card Corp", type: "ACH Settlement", amount: 280000, currency: "USD", status: "Completed", counterparty: "Partner Banks", date: "2026-06-02", channel: "ACH", flagged: false },
  { id: "TXN-049", customerId: "c017", customerName: "Ingrid Larsen", type: "Card Purchase", amount: 850, currency: "USD", status: "Completed", counterparty: "Amazon", date: "2026-05-27", channel: "Card", flagged: false },
  { id: "TXN-050", customerId: "c020", customerName: "Horizon Micro Finance", type: "Loan Disbursement", amount: 15000, currency: "USD", status: "Completed", counterparty: "Borrower", date: "2026-05-30", channel: "ACH", flagged: false },
  { id: "TXN-051", customerId: "c001", customerName: "Alex Rivera", type: "Wire Transfer In", amount: 18000, currency: "USD", status: "Completed", counterparty: "Shell LLC", date: "2026-05-20", channel: "Wire", flagged: true },
  { id: "TXN-052", customerId: "c002", customerName: "Sunrise Remittance LLC", type: "Wire Transfer Out", amount: 95000, currency: "USD", status: "Completed", counterparty: "Colombo Partners", date: "2026-05-22", channel: "Wire", flagged: false },
  { id: "TXN-053", customerId: "c005", customerName: "David Okonkwo", type: "Wire Transfer In", amount: 48000, currency: "USD", status: "Reversed", counterparty: "PEP Entity", date: "2026-05-22", channel: "Wire", flagged: true },
  { id: "TXN-054", customerId: "c011", customerName: "Carlos Mendez", type: "Cash Deposit", amount: 8500, currency: "USD", status: "Completed", counterparty: "Branch", date: "2026-05-28", channel: "Branch", flagged: false },
  { id: "TXN-055", customerId: "c013", customerName: "Fatima Al-Hassan", type: "Wire Transfer In", amount: 200000, currency: "USD", status: "Blocked", counterparty: "Sanctioned Entity", date: "2026-05-14", channel: "Wire", flagged: true },
  { id: "TXN-056", customerId: "c021", customerName: "Kwame Asante", type: "Wire Transfer Out", amount: 75000, currency: "USD", status: "Completed", counterparty: "Ghana Investments", date: "2026-06-01", channel: "Wire", flagged: true },
  { id: "TXN-057", customerId: "c022", customerName: "Velocity Pay Inc", type: "Chargeback", amount: 12000, currency: "USD", status: "Completed", counterparty: "Merchant Dispute", date: "2026-05-30", channel: "Card", flagged: true },
  { id: "TXN-058", customerId: "c025", customerName: "Ping Chen", type: "P2P Transfer", amount: 2200, currency: "USD", status: "Completed", counterparty: "Unknown", date: "2026-06-02", channel: "App", flagged: true },
  { id: "TXN-059", customerId: "c024", customerName: "RedRock Financial", type: "Wire Transfer In", amount: 75000, currency: "USD", status: "Completed", counterparty: "Investment Account", date: "2026-05-30", channel: "Wire", flagged: false },
  { id: "TXN-060", customerId: "c019", customerName: "Jin-Ho Park", type: "Card Purchase", amount: 5400, currency: "USD", status: "Completed", counterparty: "Electronics Store", date: "2026-05-28", channel: "Card", flagged: false },
  { id: "TXN-061", customerId: "c003", customerName: "Maria Santos", type: "Remittance", amount: 2000, currency: "USD", status: "Completed", counterparty: "Western Union", date: "2026-04-01", channel: "Online", flagged: false },
  { id: "TXN-062", customerId: "c007", customerName: "Yuki Tanaka", type: "Direct Deposit", amount: 5500, currency: "USD", status: "Completed", counterparty: "Employer", date: "2026-05-15", channel: "ACH", flagged: false },
  { id: "TXN-063", customerId: "c010", customerName: "Pacific Rim Trading Co", type: "Wire Transfer Out", amount: 65000, currency: "USD", status: "Completed", counterparty: "Taiwan Supplier", date: "2026-05-18", channel: "Wire", flagged: false },
  { id: "TXN-064", customerId: "c014", customerName: "Nexus Money Services", type: "Remittance", amount: 48000, currency: "USD", status: "Completed", counterparty: "Guatemala Corridor", date: "2026-05-31", channel: "Online", flagged: false },
  { id: "TXN-065", customerId: "c015", customerName: "Omar Bashir", type: "ATM Withdrawal", amount: 400, currency: "USD", status: "Completed", counterparty: "ATM", date: "2026-05-23", channel: "ATM", flagged: false },
  { id: "TXN-066", customerId: "c017", customerName: "Ingrid Larsen", type: "Rent Payment", amount: 2400, currency: "USD", status: "Completed", counterparty: "Landlord ACH", date: "2026-06-01", channel: "ACH", flagged: false },
  { id: "TXN-067", customerId: "c020", customerName: "Horizon Micro Finance", type: "Loan Repayment", amount: 8200, currency: "USD", status: "Completed", counterparty: "Borrowers", date: "2026-05-28", channel: "ACH", flagged: false },
  { id: "TXN-068", customerId: "c016", customerName: "Swift Card Corp", type: "Card Settlement", amount: 190000, currency: "USD", status: "Completed", counterparty: "Merchants", date: "2026-06-01", channel: "Card", flagged: false },
  { id: "TXN-069", customerId: "c022", customerName: "Velocity Pay Inc", type: "ACH Settlement", amount: 145000, currency: "USD", status: "Completed", counterparty: "Bank Partners", date: "2026-06-02", channel: "ACH", flagged: false },
  { id: "TXN-070", customerId: "c024", customerName: "RedRock Financial", type: "Business ACH", amount: 42000, currency: "USD", status: "Completed", counterparty: "Vendor", date: "2026-05-29", channel: "ACH", flagged: false },
  { id: "TXN-071", customerId: "c006", customerName: "Global Wire Partners", type: "Wire Transfer Out", amount: 155000, currency: "USD", status: "Completed", counterparty: "Pakistan Exchange", date: "2026-05-20", channel: "Wire", flagged: true },
  { id: "TXN-072", customerId: "c008", customerName: "FastCash Kiosks Inc", type: "Cash Load", amount: 250000, currency: "USD", status: "Completed", counterparty: "Armored Car", date: "2026-05-31", channel: "Branch", flagged: false },
  { id: "TXN-073", customerId: "c012", customerName: "Blue Horizon Payments", type: "Wire Transfer Out", amount: 420000, currency: "USD", status: "Blocked", counterparty: "EU Entity", date: "2026-05-26", channel: "Wire", flagged: true },
  { id: "TXN-074", customerId: "c018", customerName: "CashLink Transfers", type: "Wire Transfer Out", amount: 130000, currency: "USD", status: "Completed", counterparty: "West Africa Corridor", date: "2026-05-30", channel: "Wire", flagged: true },
  { id: "TXN-075", customerId: "c023", customerName: "Nadia Volkov", type: "Wire Transfer Out", amount: 175000, currency: "USD", status: "Blocked", counterparty: "Panama Holdings", date: "2026-05-16", channel: "Wire", flagged: true },
  { id: "TXN-076", customerId: "c001", customerName: "Alex Rivera", type: "P2P Transfer", amount: 4500, currency: "USD", status: "Completed", counterparty: "Friend Account", date: "2026-05-15", channel: "App", flagged: false },
  { id: "TXN-077", customerId: "c009", customerName: "Amara Diallo", type: "Remittance", amount: 6000, currency: "USD", status: "Completed", counterparty: "Dakar Transfer", date: "2026-04-28", channel: "Online", flagged: false },
  { id: "TXN-078", customerId: "c011", customerName: "Carlos Mendez", type: "Wire Transfer In", amount: 90000, currency: "USD", status: "Completed", counterparty: "Mexico Entity", date: "2026-05-20", channel: "Wire", flagged: true },
  { id: "TXN-079", customerId: "c013", customerName: "Fatima Al-Hassan", type: "Cash Withdrawal", amount: 9800, currency: "USD", status: "Completed", counterparty: "Branch", date: "2026-05-10", channel: "Branch", flagged: true },
  { id: "TXN-080", customerId: "c021", customerName: "Kwame Asante", type: "Wire Transfer In", amount: 120000, currency: "USD", status: "Completed", counterparty: "Offshore Ltd", date: "2026-05-25", channel: "Wire", flagged: true },
  { id: "TXN-081", customerId: "c025", customerName: "Ping Chen", type: "Wire Transfer Out", amount: 35000, currency: "USD", status: "Completed", counterparty: "Shanghai Partners", date: "2026-06-01", channel: "Wire", flagged: false },
  { id: "TXN-082", customerId: "c002", customerName: "Sunrise Remittance LLC", type: "Wire Transfer Out", amount: 175000, currency: "USD", status: "Completed", counterparty: "Baghdad Exchange", date: "2026-06-01", channel: "Wire", flagged: true },
  { id: "TXN-083", customerId: "c014", customerName: "Nexus Money Services", type: "Wire Transfer Out", amount: 220000, currency: "USD", status: "Completed", counterparty: "Honduras Corridor", date: "2026-05-28", channel: "Wire", flagged: false },
  { id: "TXN-084", customerId: "c016", customerName: "Swift Card Corp", type: "Card Settlement", amount: 310000, currency: "USD", status: "Completed", counterparty: "Merchants", date: "2026-05-30", channel: "Card", flagged: false },
  { id: "TXN-085", customerId: "c019", customerName: "Jin-Ho Park", type: "Wire Transfer In", amount: 45000, currency: "USD", status: "Completed", counterparty: "Korea Wire", date: "2026-05-20", channel: "Wire", flagged: false },
  { id: "TXN-086", customerId: "c005", customerName: "David Okonkwo", type: "Wire Transfer Out", amount: 22000, currency: "USD", status: "Blocked", counterparty: "Dubai Account", date: "2026-05-24", channel: "Wire", flagged: true },
  { id: "TXN-087", customerId: "c023", customerName: "Nadia Volkov", type: "Crypto Exchange", amount: 95000, currency: "USD", status: "Blocked", counterparty: "Crypto Platform", date: "2026-05-15", channel: "Online", flagged: true },
  { id: "TXN-088", customerId: "c018", customerName: "CashLink Transfers", type: "Crypto Exchange", amount: 72000, currency: "USD", status: "Completed", counterparty: "Kraken", date: "2026-05-30", channel: "Online", flagged: true },
  { id: "TXN-089", customerId: "c006", customerName: "Global Wire Partners", type: "Wire Transfer Out", amount: 220000, currency: "USD", status: "Completed", counterparty: "Syria Exchange", date: "2026-05-15", channel: "Wire", flagged: true },
  { id: "TXN-090", customerId: "c012", customerName: "Blue Horizon Payments", type: "ACH Transfer", amount: 175000, currency: "USD", status: "Completed", counterparty: "EU Partner", date: "2026-05-22", channel: "ACH", flagged: true },
  { id: "TXN-091", customerId: "c003", customerName: "Maria Santos", type: "Remittance", amount: 1500, currency: "USD", status: "Completed", counterparty: "MoneyGram", date: "2026-03-15", channel: "Online", flagged: false },
  { id: "TXN-092", customerId: "c007", customerName: "Yuki Tanaka", type: "P2P Transfer", amount: 300, currency: "USD", status: "Completed", counterparty: "Friend", date: "2026-04-20", channel: "App", flagged: false },
  { id: "TXN-093", customerId: "c010", customerName: "Pacific Rim Trading Co", type: "Wire Transfer In", amount: 95000, currency: "USD", status: "Completed", counterparty: "Hong Kong Trade", date: "2026-04-15", channel: "Wire", flagged: false },
  { id: "TXN-094", customerId: "c017", customerName: "Ingrid Larsen", type: "Bill Pay", amount: 850, currency: "USD", status: "Completed", counterparty: "ISP", date: "2026-05-05", channel: "App", flagged: false },
  { id: "TXN-095", customerId: "c015", customerName: "Omar Bashir", type: "Card Purchase", amount: 250, currency: "USD", status: "Completed", counterparty: "Grocery Store", date: "2026-05-24", channel: "Card", flagged: false },
  { id: "TXN-096", customerId: "c020", customerName: "Horizon Micro Finance", type: "Loan Disbursement", amount: 22000, currency: "USD", status: "Completed", counterparty: "Borrower", date: "2026-05-20", channel: "ACH", flagged: false },
  { id: "TXN-097", customerId: "c024", customerName: "RedRock Financial", type: "ACH Payroll", amount: 85000, currency: "USD", status: "Completed", counterparty: "Employees", date: "2026-05-22", channel: "ACH", flagged: false },
  { id: "TXN-098", customerId: "c022", customerName: "Velocity Pay Inc", type: "Card Settlement", amount: 210000, currency: "USD", status: "Completed", counterparty: "Merchants", date: "2026-05-25", channel: "Card", flagged: false },
  { id: "TXN-099", customerId: "c025", customerName: "Ping Chen", type: "Wire Transfer In", amount: 45000, currency: "USD", status: "Completed", counterparty: "Shanghai Wire", date: "2026-05-28", channel: "Wire", flagged: false },
  { id: "TXN-100", customerId: "c009", customerName: "Amara Diallo", type: "Wire Transfer In", amount: 12000, currency: "USD", status: "Completed", counterparty: "Family Support", date: "2026-05-10", channel: "Wire", flagged: false },
];

export const AUDIT_LOG: AuditLogEntry[] = [
  { id: "AUD-001", timestamp: "2026-06-03T14:32:00Z", actor: "Priya Patel", actorRole: "Senior Investigator", action: "Alert Status Updated", entityType: "Alert", entityId: "ALT-002", details: "Status changed from Open to Escalated. Reason: OFAC match confirmed.", ipAddress: "10.0.1.45" },
  { id: "AUD-002", timestamp: "2026-06-03T14:15:00Z", actor: "Marcus Johnson", actorRole: "Compliance Manager", action: "SAR Recommendation", entityType: "Case", entityId: "CASE-001", details: "SAR recommended based on investigation findings. Forwarded to BSA Officer.", ipAddress: "10.0.1.22" },
  { id: "AUD-003", timestamp: "2026-06-03T13:50:00Z", actor: "Sarah Chen", actorRole: "BSA Officer", action: "SAR Decision", entityType: "SAR", entityId: "SAR-004", details: "SAR approved. Proceeding with FinCEN filing. Case CASE-009.", ipAddress: "10.0.1.10" },
  { id: "AUD-004", timestamp: "2026-06-03T11:20:00Z", actor: "Devon Williams", actorRole: "Analyst", action: "Alert Assigned", entityType: "Alert", entityId: "ALT-006", details: "Alert assigned from unassigned queue.", ipAddress: "10.0.1.67" },
  { id: "AUD-005", timestamp: "2026-06-03T10:05:00Z", actor: "Robert Okafor", actorRole: "Senior Investigator", action: "Case Note Added", entityType: "Case", entityId: "CASE-006", details: "Added investigation note: Customer contact initiated.", ipAddress: "10.0.1.38" },
  { id: "AUD-006", timestamp: "2026-06-02T16:45:00Z", actor: "Elena Rodriguez", actorRole: "Analyst", action: "Alert Closed as False Positive", entityType: "Alert", entityId: "ALT-051", details: "Volume spike reviewed and confirmed as seasonal business activity.", ipAddress: "10.0.1.55" },
  { id: "AUD-007", timestamp: "2026-06-02T15:30:00Z", actor: "James Kim", actorRole: "Analyst", action: "Case Created", entityType: "Case", entityId: "CASE-018", details: "New case opened from alert ALT-046. P2P transfer pattern investigation.", ipAddress: "10.0.1.72" },
  { id: "AUD-008", timestamp: "2026-06-02T14:00:00Z", actor: "Marcus Johnson", actorRole: "Compliance Manager", action: "EDD Requested", entityType: "Case", entityId: "CASE-004", details: "Enhanced due diligence documentation package sent to Sunrise Remittance LLC.", ipAddress: "10.0.1.22" },
  { id: "AUD-009", timestamp: "2026-06-02T11:15:00Z", actor: "Priya Patel", actorRole: "Senior Investigator", action: "Alert Escalated to Case", entityType: "Alert", entityId: "ALT-037", details: "Alert escalated to Case CASE-011. PEP match confirmed.", ipAddress: "10.0.1.45" },
  { id: "AUD-010", timestamp: "2026-06-02T09:00:00Z", actor: "Sarah Chen", actorRole: "BSA Officer", action: "SAR Decision", entityType: "SAR", entityId: "SAR-003", details: "SAR approved for Blue Horizon Payments. Filing coordinator notified.", ipAddress: "10.0.1.10" },
  { id: "AUD-011", timestamp: "2026-06-01T17:20:00Z", actor: "Devon Williams", actorRole: "Analyst", action: "Alert Review Started", entityType: "Alert", entityId: "ALT-013", details: "Alert moved to In Review status. Initial analysis begun.", ipAddress: "10.0.1.67" },
  { id: "AUD-012", timestamp: "2026-06-01T16:00:00Z", actor: "Robert Okafor", actorRole: "Senior Investigator", action: "Case Status Updated", entityType: "Case", entityId: "CASE-014", details: "EDD package received from Global Wire Partners. Status updated to Pending EDD review.", ipAddress: "10.0.1.38" },
  { id: "AUD-013", timestamp: "2026-06-01T14:30:00Z", actor: "James Kim", actorRole: "Analyst", action: "Alert Assigned", entityType: "Alert", entityId: "ALT-015", details: "Alert self-assigned from queue.", ipAddress: "10.0.1.72" },
  { id: "AUD-014", timestamp: "2026-06-01T12:00:00Z", actor: "Marcus Johnson", actorRole: "Compliance Manager", action: "SAR Recommendation", entityType: "Case", entityId: "CASE-019", details: "Supplemental SAR recommended for CashLink Transfers based on FinCEN media report.", ipAddress: "10.0.1.22" },
  { id: "AUD-015", timestamp: "2026-05-31T15:45:00Z", actor: "Sarah Chen", actorRole: "BSA Officer", action: "SAR Filed", entityType: "SAR", entityId: "SAR-006", details: "SAR filed with FinCEN for Nadia Volkov. BSA-Track filing reference: 2026-BSA-10492.", ipAddress: "10.0.1.10" },
  { id: "AUD-016", timestamp: "2026-05-31T11:00:00Z", actor: "Priya Patel", actorRole: "Senior Investigator", action: "Case Note Added", entityType: "Case", entityId: "CASE-011", details: "PEP verification completed via open source research. Enhanced monitoring activated.", ipAddress: "10.0.1.45" },
  { id: "AUD-017", timestamp: "2026-05-30T16:20:00Z", actor: "Elena Rodriguez", actorRole: "Analyst", action: "Alert Reviewed", entityType: "Alert", entityId: "ALT-049", details: "Annual EDD review completed for Pacific Rim Trading. No issues found. Alert closed.", ipAddress: "10.0.1.55" },
  { id: "AUD-018", timestamp: "2026-05-30T14:00:00Z", actor: "Robert Okafor", actorRole: "Senior Investigator", action: "EDD Requested", entityType: "Case", entityId: "CASE-004", details: "EDD documentation request sent. Deadline: June 6, 2026.", ipAddress: "10.0.1.38" },
  { id: "AUD-019", timestamp: "2026-05-29T10:30:00Z", actor: "Priya Patel", actorRole: "Senior Investigator", action: "Case Created", entityType: "Case", entityId: "CASE-001", details: "Case opened from ALT-002. OFAC match investigation initiated.", ipAddress: "10.0.1.45" },
  { id: "AUD-020", timestamp: "2026-05-28T16:00:00Z", actor: "Sarah Chen", actorRole: "BSA Officer", action: "Account Action", entityType: "Customer", entityId: "c023", details: "Account freeze initiated for Nadia Volkov. OFAC exact match confirmed.", ipAddress: "10.0.1.10" },
];

export const KPI_DATA = {
  openAlerts: ALERTS.filter(a => a.status === "Open" || a.status === "In Review").length,
  openCases: CASES.filter(c => c.status !== "Closed").length,
  pastDueSLAs: ALERTS.filter(a => {
    const due = new Date(a.slaDue);
    const now = new Date("2026-06-04");
    return due < now && (a.status === "Open" || a.status === "In Review");
  }).length,
  kycManualReviews: ALERTS.filter(a => a.source === "KYC" && (a.status === "Open" || a.status === "In Review")).length,
  screeningHits: CUSTOMERS.filter(c => c.screeningStatus === "Hit" || c.screeningStatus === "Escalated").length,
  sarReviewsDue: SAR_REVIEWS.filter(s => ["Pending Review", "SAR Recommended", "SAR Approved"].includes(s.status)).length,
  avgCaseAgeDays: 14,
  slaBreach: 18,

  alertsBySource: [
    { name: "Transaction Monitoring", value: 24 },
    { name: "KYC", value: 16 },
    { name: "Sanctions Screening", value: 12 },
    { name: "PEP Screening", value: 8 },
    { name: "Adverse Media", value: 7 },
    { name: "Fraud", value: 5 },
    { name: "Chargeback", value: 3 },
  ],

  alertsByPriority: [
    { name: "Critical", value: 22, color: "#ef4444" },
    { name: "High", value: 28, color: "#f97316" },
    { name: "Medium", value: 15, color: "#eab308" },
    { name: "Low", value: 10, color: "#22c55e" },
  ],

  casesByStatus: [
    { name: "Open", value: 5 },
    { name: "In Review", value: 4 },
    { name: "Pending EDD", value: 2 },
    { name: "Escalated", value: 3 },
    { name: "SAR Review", value: 4 },
    { name: "Closed", value: 2 },
  ],

  kycRates: [
    { name: "Approved", value: 68, color: "#22c55e" },
    { name: "Manual Review", value: 18, color: "#eab308" },
    { name: "Rejected", value: 8, color: "#ef4444" },
    { name: "Pending", value: 6, color: "#94a3b8" },
  ],

  sarByMonth: [
    { month: "Jan", recommended: 2, filed: 1 },
    { month: "Feb", recommended: 1, filed: 2 },
    { month: "Mar", recommended: 3, filed: 1 },
    { month: "Apr", recommended: 2, filed: 3 },
    { month: "May", recommended: 5, filed: 2 },
    { month: "Jun", recommended: 4, filed: 1 },
  ],

  slaByAnalyst: [
    { analyst: "Devon W.", breachRate: 12 },
    { analyst: "Elena R.", breachRate: 8 },
    { analyst: "James K.", breachRate: 15 },
    { analyst: "Robert O.", breachRate: 6 },
    { analyst: "Priya P.", breachRate: 4 },
  ],

  avgClosureTime: [
    { month: "Jan", days: 18 },
    { month: "Feb", days: 15 },
    { month: "Mar", days: 16 },
    { month: "Apr", days: 12 },
    { month: "May", days: 14 },
    { month: "Jun", days: 11 },
  ],

  falsePositiveRate: [
    { source: "Sanctions", rate: 42 },
    { source: "PEP", rate: 35 },
    { source: "Adverse Media", rate: 28 },
    { source: "TM", rate: 22 },
    { source: "Fraud", rate: 18 },
    { source: "KYC", rate: 12 },
  ],
};
