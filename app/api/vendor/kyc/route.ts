import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, entityId, kycStatus } = await req.json();
  if (!name || !entityId) return NextResponse.json({ error: "name and entityId required" }, { status: 400 });

  await new Promise(r => setTimeout(r, 800));

  const seed = entityId.split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
  const docScore = 85 + (seed % 15);
  const faceScore = 88 + (seed % 10);
  const addressConfidence = seed % 3 === 0 ? "Medium" : "High";

  return NextResponse.json({
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
    overallDecision: kycStatus === "Rejected" ? "REJECT" : kycStatus === "Manual Review" ? "REFER" : "ACCEPT",
    processingTimeMs: 820,
  });
}
