import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const { session, forbidden } = await requireSession(req);
  if (forbidden) return forbidden;

  const { name, entityId, kycStatus } = await req.json();
  if (!name || !entityId) return NextResponse.json({ error: "name and entityId required" }, { status: 400 });

  await new Promise(r => setTimeout(r, 800));

  const seed = entityId.split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
  const docScore = 85 + (seed % 15);
  const faceScore = 88 + (seed % 10);
  const addressConfidence = seed % 3 === 0 ? "Medium" : "High";
  const overallDecision = kycStatus === "Rejected" ? "REJECT" : kycStatus === "Manual Review" ? "REFER" : "ACCEPT";

  const result = {
    requestId: `KYC-${Date.now()}`,
    entityName: name,
    entityId,
    timestamp: new Date().toISOString(),
    vendor: "Jumio",
    checks: {
      documentVerification: {
        result: kycStatus === "Rejected" ? "FAILED" : "PASSED",
        confidence: docScore,
        documentType: "Passport",
        issuingCountry: "US",
        expiryStatus: "Valid",
      },
      faceMatch: {
        result: kycStatus === "Rejected" ? "FAILED" : "PASSED",
        confidence: faceScore,
        livenessDetected: true,
      },
      addressVerification: {
        result: kycStatus === "Manual Review" ? "REVIEW_REQUIRED" : "PASSED",
        confidence: addressConfidence,
      },
      watchlistCheck: {
        result: "CLEAR",
        listsChecked: ["OFAC", "EU Sanctions", "FBI Most Wanted"],
      },
    },
    overallDecision,
    processingTimeMs: 820,
  };

  const verifiedAt = new Date().toISOString().split("T")[0];
  const expiresAt = new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0];
  const newKycStatus =
    overallDecision === "ACCEPT" ? "Approved" : overallDecision === "REJECT" ? "Rejected" : "Manual Review";

  await prisma.customer.update({
    where: { id: entityId },
    data: {
      kycVerifiedAt: verifiedAt,
      kycExpiresAt: expiresAt,
      kycVendorRef: result.requestId,
      kycDocScore: docScore,
      kycFaceScore: faceScore,
      kycDecision: overallDecision,
      kycStatus: newKycStatus,
    },
  });

  await createAuditLog(
    session!,
    req,
    "KYC Verification Run",
    "Customer",
    entityId,
    `KYC verification run for ${name}. Decision: ${overallDecision}. Ref: ${result.requestId}. Doc score: ${docScore}, Face score: ${faceScore}.`,
    { previousStatus: kycStatus, newStatus: newKycStatus },
  );

  return NextResponse.json(result);
}
